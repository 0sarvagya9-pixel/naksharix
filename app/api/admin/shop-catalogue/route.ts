import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { getShopCatalogue, SHOP_CATALOGUE_ID } from "@/lib/shop/catalogue-store";

const text = z.string().max(1200);
const localized = z.object({
  en: text,
  hi: text,
  hinglish: text
}).strict();
const product = z.object({
  id: z.string().min(1).max(128),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,100}$/),
  category: z.string().min(1).max(70),
  purpose: z.string().max(100),
  name: localized,
  shortDescription: localized,
  longDescription: localized,
  imageUrl: z.string().max(1500).refine((s) =>
    !s || (s.startsWith("/") && !s.startsWith("//") && !s.includes("\\")) || /^https:\/\//i.test(s),
    "Use an HTTPS image URL, a local path, or leave blank"
  ),
  imageAlt: localized,
  galleryImages: z.array(z.object({
    url: z.string().min(1).max(1500).refine(s => (s.startsWith("/") && !s.startsWith("//") && !s.includes("\\")) || /^https:\/\//i.test(s), "Local or HTTPS images only"),
    alt: z.string().min(3).max(180),
    imageRights: z.enum(["OWNED", "LICENSED", "SUPPLIER_AUTHORIZED"]),
    evidenceUrl: z.string().max(500)
  }).strict()).max(8).optional(),
  imageRights: z.enum(["OWNED", "LICENSED", "SUPPLIER_AUTHORIZED"]).optional(),
  imageEvidenceUrl: z.string().url().max(500).optional(),
  priceLabel: localized,
  unitPricePaise: z.number().int().min(100).max(100000000).nullable().optional(),
  status: z.enum(["active", "inactive"]),
  featured: z.boolean(),
  tags: z.array(z.string().max(100)).max(24),
  howToUse: localized,
  careNote: localized,
  disclaimer: localized,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
}).strict();
const bodySchema = z.object({
  expectedVersion: z.number().int().nonnegative(),
  products: z.array(product).max(150)
}).strict();

export async function GET() {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Forbidden", 403);
    const state = await getShopCatalogue();
    if (!state.storageReady) return fail("Shop catalogue database migration is required before admin editing.", 503);
    return ok({ products: state.products, version: state.version });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Forbidden", 403);
    const raw = await request.text();
    if (raw.length > 300_000) return fail("Shop catalogue payload is too large", 413);
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return fail("Invalid JSON payload", 400); }
    const result = bodySchema.safeParse(parsed);
    if (!result.success) return fail("Invalid shop catalogue data", 422);
    const { expectedVersion, products } = result.data;
    // A third-party HTTPS image must carry an administrator-confirmed license
    // reference. Do not import competitor photographs without rights evidence.
    for (const item of products) {
      if (!/^https:\/\//i.test(item.imageUrl)) continue;
      if (!item.imageRights || !item.imageEvidenceUrl) {
        return fail("External product image requires documented image-use rights.", 422);
      }
      const evidence = new URL(item.imageEvidenceUrl);
      if (evidence.protocol !== "https:" || evidence.username || evidence.password ||
          evidence.port || !evidence.hostname.includes(".") ||
          evidence.hostname.endsWith(".local")) {
        return fail("External photo rights evidence must be a public HTTPS reference.", 422);
      }
    }
    for (const item of products) {
      for (const image of item.galleryImages || []) {
        if (!/^https:\/\//i.test(image.url)) continue;
        if (!image.imageRights || !/^https:\/\//i.test(image.evidenceUrl)) return fail("Each external gallery image requires rights evidence.", 422);
        const proof = new URL(image.evidenceUrl);
        if (proof.protocol !== "https:" || proof.username || proof.password || proof.port ||
            !proof.hostname.includes(".") || proof.hostname.endsWith(".local"))
          return fail("Gallery rights proof must be publicly verifiable HTTPS.", 422);
      }
    }
    const ids = new Set(products.map((p) => p.id));
    const slugs = new Set(products.map((p) => p.slug));
    if (ids.size !== products.length || slugs.size !== products.length) return fail("Duplicate product ID or slug", 422);

    const state = await getShopCatalogue();
    if (!state.storageReady) return fail("Shop catalogue storage is not migrated", 503);
    if (state.version !== expectedVersion) return fail("Catalogue changed in another session. Reload before saving.", 409);

    const next = await prisma.$transaction(async (tx) => {
      if (expectedVersion === 0) {
        await tx.shopCatalogueSnapshot.create({
          data: { id: SHOP_CATALOGUE_ID, products: products as Prisma.InputJsonValue, version: 1, updatedBy: admin.id }
        });
      } else {
        const updated = await tx.shopCatalogueSnapshot.updateMany({
          where: { id: SHOP_CATALOGUE_ID, version: expectedVersion },
          data: { products: products as Prisma.InputJsonValue, version: { increment: 1 }, updatedBy: admin.id }
        });
        if (updated.count !== 1) throw new Error("CATALOGUE_VERSION_CONFLICT");
      }
      await tx.adminActionLog.create({
        data: {
          adminId: admin.id,
          action: "shop.catalogue.save",
          targetType: "ShopCatalogueSnapshot",
          targetId: SHOP_CATALOGUE_ID,
          metadata: { version: expectedVersion + 1, productCount: products.length }
        }
      });
      return expectedVersion + 1;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return ok({ products, version: next });
  } catch (error) {
    if (error instanceof Error && error.message === "CATALOGUE_VERSION_CONFLICT") {
      return fail("Catalogue was updated in another session. Reload and retry.", 409);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2034"].includes(error.code)) {
      return fail("Concurrent catalogue update detected. Reload and retry.", 409);
    }
    return handleApiError(error);
  }
}

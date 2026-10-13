import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { shopProducts, type ShopProduct } from "@/lib/manual-catalogue";

export const SHOP_CATALOGUE_ID = "default";

export type ShopCatalogueState = {
  products: ShopProduct[];
  version: number;
  storageReady: boolean;
};

export async function getShopCatalogue(): Promise<ShopCatalogueState> {
  try {
    const snapshot = await prisma.shopCatalogueSnapshot.findUnique({
      where: { id: SHOP_CATALOGUE_ID }
    });
    if (!snapshot) return { products: shopProducts, version: 0, storageReady: true };
    if (!Array.isArray(snapshot.products)) throw new Error("Invalid saved shop catalogue shape");
    return { products: snapshot.products as unknown as ShopProduct[], version: snapshot.version, storageReady: true };
  } catch (error) {
    // Preserve existing public seed catalogue until the production DB migration is approved.
    // Admin writes fail closed while storage is not provisioned; never fall back to localStorage.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return { products: shopProducts, version: 0, storageReady: false };
    }
    throw error;
  }
}

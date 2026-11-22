import type { ShopProduct } from "@/lib/manual-catalogue";
import { referencePhotoForProduct } from "@/lib/shop/real-photo-seeds";

/** Only exact-item images with seller-owned/supplier-authorized rights can be
 * represented as product imagery to search engines. Category reference photos,
 * placeholders and generative illustrations are never promoted as the SKU.
 *
 * These checks validate declared metadata, NOT physical authenticity or actual
 * current stock. They do not claim availability, reviews or certifications.
 */
export function eligibleProductImage(product: ShopProduct, canonicalOrigin: string): string | null {
  const preferred = product.galleryImages?.[0];
  const image = preferred?.url || product.imageUrl;
  const rights = preferred?.imageRights || product.imageRights;
  const evidence = preferred?.evidenceUrl || product.imageEvidenceUrl || "";
  if (product.status !== "active" || !product.unitPricePaise || !Number.isSafeInteger(product.unitPricePaise)) return null;
  if (rights !== "OWNED" && rights !== "SUPPLIER_AUTHORIZED") return null;
  if (!/^https:\/\//i.test(evidence)) return null;
  if (!image || image === referencePhotoForProduct(product.id)?.url ||
    /(?:placeholder|illustration|fallback|reference)/i.test(image)) return null;
  if (/^https:\/\//i.test(image)) {
    try {
      const url = new URL(image);
      if (url.protocol !== "https:" || url.username || url.password || url.hash) return null;
      return url.toString();
    } catch { return null; }
  }
  if (image.startsWith("/") && !image.startsWith("//") && !image.includes("\\") &&
    !image.includes("..")) {
    return new URL(image, canonicalOrigin).toString();
  }
  return null;
}

export function productDiscoverySchema(product: ShopProduct, canonicalOrigin: string): Record<string, unknown> | null {
  const image = eligibleProductImage(product, canonicalOrigin);
  if (!image) return null;
  const url = new URL("/shop/" + encodeURIComponent(product.slug), canonicalOrigin).toString();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name.en,
    description: product.longDescription.en,
    sku: product.id,
    image: [image],
    brand: { "@type": "Brand", name: "Naksharix" },
    offers: {
      "@type": "Offer",
      url,
      price: (product.unitPricePaise! / 100).toFixed(2),
      priceCurrency: "INR",
      seller: { "@type": "Organization", name: "Naksharix" }
      // No invented in-stock, condition, rating, GTIN, delivery ETA or test claim.
    }
  };
}

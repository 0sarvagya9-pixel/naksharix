import type { Metadata } from "next";
import { ShopComingSoonContent } from "@/components/shop-coming-soon-content";
import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { referencePhotoForProduct } from "@/lib/shop/real-photo-seeds";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Spiritual Catalogue | Rudraksha, Yantra, Mala and Symbolic Remedy Items",
    description: "Explore Naksharix catalogue information for rudraksha, bracelets, yantras, malas, and symbolic remedy items. Availability and fulfilment are confirmed separately; no automatic product checkout is active.",
    path: "/shop",
    keywords: ["Spiritual Catalogue", "Rudraksha", "Yantra", "Mala", "Astrology Remedy Items"]
  }),
  robots: { index: true, follow: true }
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const catalogue = await getShopCatalogue();
  return <><EditorialServiceBanner eyebrow="SPIRITUAL DISCOVERY"
    headline="Objects of tradition and intention"
    caption="Explore the Naksharix catalogue and enquire about availability. Product checkout and guaranteed delivery are not active."
    image={referencePhotoForProduct("rudraksha-mala")?.url || "/shop/rudraksha-mala-illustration.svg"} imageAlt="Licensed representative Rudraksha prayer bead photograph"
    link="/contact" linkLabel="Ask about an item" />
    {referencePhotoForProduct("rudraksha-mala") ? <p className="mx-auto max-w-7xl px-5 py-2 text-xs text-[#674957]">
      Banner shows a licensed reference photograph, not a verified Naksharix SKU. Photo: <a href={referencePhotoForProduct("rudraksha-mala")!.evidenceUrl} target="_blank" rel="noopener noreferrer" className="underline">{referencePhotoForProduct("rudraksha-mala")!.credit} · {referencePhotoForProduct("rudraksha-mala")!.licenseName}</a>.
    </p> : null}
    <ShopComingSoonContent initialProducts={catalogue.products} /></>;
}

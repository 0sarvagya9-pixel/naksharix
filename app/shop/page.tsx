import type { Metadata } from "next";
import { ShopComingSoonContent } from "@/components/shop-coming-soon-content";
import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
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
    image="/naksharix/ganesh-hero-light-saffron.jpg" imageAlt="Traditional devotional illustration"
    link="/contact" linkLabel="Ask about an item" />
    <ShopComingSoonContent initialProducts={catalogue.products} /></>;
}

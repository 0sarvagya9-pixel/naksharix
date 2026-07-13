import type { Metadata } from "next";
import { ShopComingSoonContent } from "@/components/shop-coming-soon-content";
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

export default function ShopPage() {
  return <ShopComingSoonContent />;
}

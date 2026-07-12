import type { Metadata } from "next";
import { ShopComingSoonContent } from "@/components/shop-coming-soon-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Shop Coming Soon",
    description: "The Naksharix Shop is being prepared. No public catalogue, cart, product checkout, or physical-order service is available yet.",
    path: "/shop",
    keywords: ["Naksharix Shop Coming Soon", "Spiritual Shop Coming Soon"]
  }),
  robots: { index: false, follow: true }
};

export default function ShopPage() {
  return <ShopComingSoonContent />;
}

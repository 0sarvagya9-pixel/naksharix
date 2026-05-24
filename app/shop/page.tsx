import type { Metadata } from "next";
import { ShopComingSoonContent } from "@/components/shop-coming-soon-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Shop Coming Soon | Naksharix Spiritual Products",
  description: "Naksharix spiritual shop with rudraksha, gemstones, yantras, malas, bracelets, and remedy-based products is coming soon.",
  path: "/shop",
  keywords: ["Naksharix Shop", "Rudraksha", "Gemstones", "Yantras", "Spiritual Products"]
});

export default function ShopPage() {
  return <ShopComingSoonContent />;
}

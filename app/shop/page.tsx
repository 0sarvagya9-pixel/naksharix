import type { Metadata } from "next";
import { ShopContent } from "@/components/shop-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Naksharix Spiritual Shop | Rudraksha, Gemstones, Yantras & Remedy Products",
  description: "Explore curated spiritual products including rudraksha, gemstones, bracelets, yantras, malas, and remedy-based items from Naksharix.",
  path: "/shop",
  keywords: ["Naksharix Shop", "Rudraksha", "Gemstones", "Yantras", "Spiritual Products"]
});

export default function ShopPage() {
  return <ShopContent />;
}

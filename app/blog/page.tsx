import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { BlogListContent } from "@/components/blog-list-content";

export const metadata: Metadata = seo({
  title: "Astrology Blog - Horoscope, Kundli, Numerology and Tarot",
  description: "Read Naksharix astrology articles about horoscope personalization, kundli matching, numerology, tarot reading, panchang, and AI astrology.",
  path: "/blog",
  keywords: ["Astrology Blog", "Horoscope Blog", "Kundli Articles", "Tarot Reading Guide"]
});

export default function BlogPage() {
  return <BlogListContent />;
}

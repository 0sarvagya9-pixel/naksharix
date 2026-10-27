import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
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
  return <><EditorialServiceBanner eyebrow="THE NAKSHARIX JOURNAL"
    headline="Stories behind the signs and traditions"
    caption="Read explainers about traditional charts, numerology, rituals and responsible interpretations."
    image="/naksharix/editorial-learning.svg" imageAlt="Original learning and reading illustration"
    link="/learn" linkLabel="Browse free lessons" /><BlogListContent /></>;
}

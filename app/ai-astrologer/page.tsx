import type { Metadata } from "next";
import { AiComingSoonContent } from "@/components/ai-coming-soon-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "AI Astrologer - Naksharix",
  description: "Ask Naksharix AI Astrologer about Kundli, dasha, numerology, Lo Shu, matching, relationships, career, and practical guidance.",
  path: "/ai-astrologer",
  keywords: ["AI Astrologer", "Kundli AI", "Vedic Astrology Chat", "Naksharix AI"]
});

export default function AiAstrologerPage() {
  return <AiComingSoonContent />;
}

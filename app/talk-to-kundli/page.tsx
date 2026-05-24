import type { Metadata } from "next";
import { AiComingSoonContent } from "@/components/ai-coming-soon-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Talk to Your Kundli with AI - Naksharix",
  description: "Use Gemini-powered Naksharix AI to talk to your Kundli, ask about planets, houses, dasha, transit, dosha, remedies, career, marriage, finance, and health.",
  path: "/talk-to-kundli",
  keywords: ["Talk to Kundli", "AI Kundli", "Gemini Astrology", "Kundli Chat"]
});

export default function TalkToKundliPage() {
  return <AiComingSoonContent />;
}

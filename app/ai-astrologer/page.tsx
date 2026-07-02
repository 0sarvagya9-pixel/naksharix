import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AiChatbot } from "@/components/ai-chatbot";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "AI Astrologer - Naksharix",
    description: "Ask Naksharix AI Astrologer about Kundli, dasha, numerology, Lo Shu, matching, relationships, career, and practical guidance.",
    path: "/ai-astrologer",
    keywords: ["AI Astrologer", "Kundli AI", "Vedic Astrology Chat", "Naksharix AI"]
  }),
  robots: { index: false, follow: true }
};

export default function AiAstrologerPage() {
  if (!isGeminiConfigured()) {
    redirect("/");
  }
  return <AiChatbot />;
}

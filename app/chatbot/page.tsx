import type { Metadata } from "next";
import { AiComingSoonContent } from "@/components/ai-coming-soon-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "AI Astrology Chatbot - Naksharix",
  description: "Chat with Naksharix AI astrologer for horoscope, kundli, numerology, tarot reading, panchang timing, and personalized remedies.",
  path: "/chatbot",
  keywords: ["AI Astrology Chatbot", "Astrology AI", "Horoscope Chat", "Kundli AI"]
});

export default function ChatbotPage() {
  return <AiComingSoonContent />;
}

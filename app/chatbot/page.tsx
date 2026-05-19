import type { Metadata } from "next";
import { AiChatbot } from "@/components/ai-chatbot";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "AI Astrology Chatbot - Naksharix",
  description: "Chat with Naksharix AI astrologer for horoscope, kundli, numerology, tarot reading, panchang timing, and personalized remedies.",
  path: "/chatbot",
  keywords: ["AI Astrology Chatbot", "Astrology AI", "Horoscope Chat", "Kundli AI"]
});

export default function ChatbotPage() {
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">AI Guidance</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Ask the Naksharix AI Astrologer</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">
          Get context-aware astrology guidance for horoscope, kundli, tarot, numerology, panchang, remedies, and premium report planning.
        </p>
        <div className="mt-8">
          <AiChatbot />
        </div>
      </Section>
    </main>
  );
}

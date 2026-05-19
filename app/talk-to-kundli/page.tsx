import type { Metadata } from "next";
import Link from "next/link";
import { AiChatbot } from "@/components/ai-chatbot";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Talk to Your Kundli with AI - Naksharix",
  description: "Use Gemini-powered Naksharix AI to talk to your Kundli, ask about planets, houses, dasha, transit, dosha, remedies, career, marriage, finance, and health.",
  path: "/talk-to-kundli",
  keywords: ["Talk to Kundli", "AI Kundli", "Gemini Astrology", "Kundli Chat"]
});

export default function TalkToKundliPage() {
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">AI Talk to Kundli</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Ask Your Kundli Questions</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">Paste your birth details or Kundli summary into the memory box and ask about planets, houses, dasha, transit, manglik, sade sati, dosha, remedies, career, marriage, finance, or health.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild><Link href="/kundli">Generate Kundli First</Link></Button>
          <Button variant="outline" asChild><Link href="/reports/kundli-pro">Unlock Premium Report</Link></Button>
        </div>
        <div className="mt-8"><AiChatbot /></div>
      </Section>
    </main>
  );
}

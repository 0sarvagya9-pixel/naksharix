import type { Metadata } from "next";
import Link from "next/link";
import { Bot, HeartHandshake, MoonStar, ScrollText, Sparkles } from "lucide-react";
import { AiAstrologerChat } from "@/components/ai-astrologer-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { isAiAstrologerReady } from "@/lib/ai/feature-status";
import { seo } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const ready = isAiAstrologerReady();
  return {
    ...seo({
      title: ready ? "AI Astrologer | Personalized Reflective Guidance" : "AI Astrologer - Temporarily Unavailable",
      description: ready
        ? "Chat with Naksharix AI Astrologer for careful, non-fatalistic guidance using the details you choose to share."
        : "Naksharix AI Astrologer is temporarily unavailable. Kundli, Panchang, horoscope, numerology, tarot, reports, and consultations remain available.",
      path: "/ai-astrologer",
      keywords: ready
        ? ["AI Astrologer", "Vedic Astrology Guidance", "Kundli Guidance", "Naksharix AI"]
        : ["AI Astrologer", "Kundli Tools", "Vedic Astrology Tools", "Naksharix"]
    }),
    robots: { index: ready, follow: true }
  };
}

export default function AiAstrologerPage() {
  return isAiAstrologerReady() ? <AiAstrologerChat /> : <AiUnavailablePage />;
}

const ctaClassName = "mt-auto w-full bg-[#006b50] text-white hover:bg-[#00583f]";

function AiUnavailablePage() {
  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section first>
        <div className="inner-section rounded-3xl border border-[#263957] bg-[#0a1224]/85 p-6 text-center md:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#dca956]/35 bg-[#142647] text-[#f3d382] shadow-[0_0_34px_rgba(0,245,160,0.14)]">
            <Bot className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#00f5a0]">Temporarily Unavailable</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">AI Astrologer</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#cbd5e1]">
            AI guidance is currently offline. Kundli, Panchang, horoscope, numerology, tarot, reports, and consultation booking remain available.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <AlternativeCard icon={MoonStar} title="Explore Kundli" copy="Start with a free Kundli experience from complete birth details." href="/kundli" cta="Open Kundli" />
          <AlternativeCard icon={HeartHandshake} title="Try Match Making" copy="Review compatibility guidance from bride and groom details." href="/matchmaking" cta="Open Matching" />
          <AlternativeCard icon={Sparkles} title="Explore Numerology" copy="Review name, DOB, mobile, vehicle, and Lo Shu insights." href="/numerology" cta="Open Numerology" />
          <AlternativeCard icon={ScrollText} title="View Reports" copy="Explore available report workflows and saved Kundli reports." href="/reports" cta="Open Reports" />
        </div>
      </Section>
    </main>
  );
}

function AlternativeCard({ icon: Icon, title, copy, href, cta }: { icon: typeof Bot; title: string; copy: string; href: string; cta: string }) {
  return (
    <Card className="inner-card bg-[#0f1c3a]/78 transition hover:-translate-y-1 hover:border-[#dca956]/45">
      <CardContent className="flex h-full flex-col p-5">
        <Icon className="h-6 w-6 text-[#00f5a0]" />
        <h2 className="mt-4 font-cinzel text-xl font-bold text-[#f3d382]">{title}</h2>
        <p className="mb-5 mt-2 text-sm leading-6 text-[#cbd5e1]">{copy}</p>
        <Button className={ctaClassName} asChild><Link href={href}>{cta}</Link></Button>
      </CardContent>
    </Card>
  );
}

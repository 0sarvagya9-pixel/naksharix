import type { Metadata } from "next";
import Link from "next/link";
import { Bot, MoonStar, HeartHandshake, Sparkles, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "AI Astrologer - Upgrading",
    description: "Naksharix AI Astrologer is temporarily unavailable while reliability and safety improvements are completed. Kundli, Panchang, horoscope, numerology, tarot, reports, and consultations remain available.",
    path: "/ai-astrologer",
    keywords: ["AI Astrologer Coming Soon", "Kundli Tools", "Vedic Astrology Tools", "Naksharix AI"]
  }),
  robots: { index: false, follow: true }
};

export default function AiAstrologerPage() {
  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section first>
        <div className="inner-section rounded-3xl border border-[#263957] p-6 text-center md:p-10 bg-[#0a1224]/85">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#dca956]/35 bg-[#142647] text-[#f3d382] shadow-[0_0_34px_rgba(0,245,160,0.14)]">
            <Bot className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#00f5a0]">Temporarily Parked</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">AI Astrologer Upgrading</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#cbd5e1]">
            We are improving reliability and safety before reopening AI guidance. Kundli, Panchang, horoscope, numerology, tarot, reports, and consultation booking remain available.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card className="inner-card transition hover:-translate-y-1 hover:border-[#dca956]/45 bg-[#0f1c3a]/78">
            <CardContent className="flex h-full flex-col p-5">
              <MoonStar className="h-6 w-6 text-[#00f5a0]" />
              <h2 className="mt-4 font-cinzel text-xl font-bold text-[#f3d382]">Explore Kundli</h2>
              <p className="mt-2 text-sm leading-6 text-[#cbd5e1] mb-5">Start with a free Kundli experience from complete birth details.</p>
              <Button className="mt-auto w-full bg-[#009b72] text-white hover:bg-[#008766]" asChild>
                <Link href="/kundli">Open Kundli</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="inner-card transition hover:-translate-y-1 hover:border-[#dca956]/45 bg-[#0f1c3a]/78">
            <CardContent className="flex h-full flex-col p-5">
              <HeartHandshake className="h-6 w-6 text-[#00f5a0]" />
              <h2 className="mt-4 font-cinzel text-xl font-bold text-[#f3d382]">Try Match Making</h2>
              <p className="mt-2 text-sm leading-6 text-[#cbd5e1] mb-5">Review compatibility guidance from bride and groom details.</p>
              <Button className="mt-auto w-full bg-[#009b72] text-white hover:bg-[#008766]" asChild>
                <Link href="/matchmaking">Open Matching</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="inner-card transition hover:-translate-y-1 hover:border-[#dca956]/45 bg-[#0f1c3a]/78">
            <CardContent className="flex h-full flex-col p-5">
              <Sparkles className="h-6 w-6 text-[#00f5a0]" />
              <h2 className="mt-4 font-cinzel text-xl font-bold text-[#f3d382]">Explore Numerology</h2>
              <p className="mt-2 text-sm leading-6 text-[#cbd5e1] mb-5">Review name, DOB, mobile, vehicle, and Lo Shu insights.</p>
              <Button className="mt-auto w-full bg-[#009b72] text-white hover:bg-[#008766]" asChild>
                <Link href="/numerology">Open Numerology</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="inner-card transition hover:-translate-y-1 hover:border-[#dca956]/45 bg-[#0f1c3a]/78">
            <CardContent className="flex h-full flex-col p-5">
              <ScrollText className="h-6 w-6 text-[#00f5a0]" />
              <h2 className="mt-4 font-cinzel text-xl font-bold text-[#f3d382]">View Reports</h2>
              <p className="mt-2 text-sm leading-6 text-[#cbd5e1] mb-5">Explore available digital reports and save completed Kundli reports to your account.</p>
              <Button className="mt-auto w-full bg-[#009b72] text-white hover:bg-[#008766]" asChild>
                <Link href="/reports">Open Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Section>
    </main>
  );
}

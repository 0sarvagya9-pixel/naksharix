import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";
import { zodiacSigns } from "@/lib/zodiac";

export const metadata: Metadata = seo({
  title: "Zodiac Signs - Astrology Meanings and Horoscope Pages",
  description: "Explore all zodiac signs on Naksharix with astrology meanings, horoscope themes, lucky guidance, kundli context, tarot, numerology, and panchang insights.",
  path: "/zodiac",
  keywords: ["Zodiac Signs", "Astrology", "Horoscope", "Daily Horoscope"]
});

export default function ZodiacPage() {
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Zodiac SEO Hub</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Explore Zodiac Signs</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zodiacSigns.map((sign) => (
            <Link key={sign.slug} href={`/zodiac/${sign.slug}`}>
              <Card className="glass h-full transition hover:border-[#D4AF37]/55">
                <CardHeader>
                  <CardTitle className="font-cinzel">{sign.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-start gap-3 text-sm naksh-muted-text">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[#FFD700]" />
                  {sign.element} sign focused on {sign.focus}.
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}

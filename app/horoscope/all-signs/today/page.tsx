import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoInternalLinks } from "@/components/seo/internal-links";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";
import { zodiacSigns } from "@/lib/zodiac";

export const metadata: Metadata = seo({
  title: "Today Horoscope for All Zodiac Signs - Naksharix",
  description: "Read today's horoscope for Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces on Naksharix.",
  path: "/horoscope/all-signs/today",
  keywords: ["Today Horoscope", "All Zodiac Signs", "Daily Horoscope", "Aaj Ka Rashifal"]
});

export default function AllSignsTodayHoroscopePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Today Horoscope for All Zodiac Signs",
    url: `${env.NEXT_PUBLIC_APP_URL}/horoscope/all-signs/today`,
    about: ["Astrology", "Daily Horoscope", "Zodiac Signs"]
  };

  return (
    <main className="star-field">
      <Section>
        <JsonLd id="all-signs-today-schema" data={schema} />
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Daily Horoscope</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Today Horoscope for All Zodiac Signs</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">Choose your zodiac sign for today&apos;s love, career, finance, health, lucky color, and cosmic timing guidance from Naksharix.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zodiacSigns.map((sign) => (
            <Link key={sign.slug} href={`/horoscope/${sign.slug}/today`}>
              <Card className="glass h-full transition hover:border-amber-200/45">
                <CardHeader><CardTitle className="font-cinzel">{sign.name} Today</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{sign.element} energy for {sign.focus}.</CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <SeoInternalLinks title="Popular astrology tools" />
      </Section>
    </main>
  );
}


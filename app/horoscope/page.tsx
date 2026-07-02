import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Compass, Moon, Shield, Star, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";
import { zodiacSigns } from "@/lib/zodiac";

export const metadata: Metadata = seo({
  title: "Vedic Horoscope Hub - Daily, Weekly & Yearly Predictions | Naksharix",
  description: "Explore daily, weekly, and yearly horoscope guidance. Find alignment and deep cosmic insights with Naksharix.",
  path: "/horoscope",
  keywords: ["Daily Horoscope", "Weekly Horoscope", "Yearly Horoscope", "Zodiac Signs", "Astrology Hub"]
});

export default function HoroscopeHubPage() {
  const hubs = [
    { title: "Daily Horoscope", icon: Sun, path: "/daily-horoscope", desc: "Read today's sign-level guidance and transit influences." },
    { title: "Weekly Horoscope", icon: Moon, path: "/weekly-horoscope", desc: "Understand weekly themes and relationship compatibility rhythms." },
    { title: "Yearly Horoscope", icon: Calendar, path: "/yearly-horoscope", desc: "Review quarterly highlights and annual transit cycles." }
  ];

  return (
    <main className="star-field">
      <Section first>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Cosmic Insights</p>
          <h1 className="mt-3 font-cinzel text-5xl font-black text-white">Vedic Horoscope Hub</h1>
          <p className="mt-4 text-base naksh-muted-text">
            Gain reflective clarity on love, career, wellbeing, and professional momentum. Select a timeframe or click on your zodiac sign below.
          </p>
        </div>

        {/* Timeframe Hubs */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {hubs.map(({ title, icon: Icon, path, desc }) => (
            <Card key={title} className="glass hover:border-[#D4AF37]/50 transition duration-300">
              <CardHeader className="space-y-2">
                <Icon className="h-6 w-6 text-[#FFD700]" />
                <CardTitle className="font-cinzel text-xl font-bold">{title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm naksh-muted-text">{desc}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={path}>Explore</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Zodiac grid */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Compass className="h-5 w-5 text-[#FFD700]" />
            <h2 className="font-cinzel text-2xl font-black">Choose Your Zodiac Sign</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {zodiacSigns.map((sign) => (
              <Card key={sign.slug} className="glass hover:border-[#D4AF37]/40 transition duration-300">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="mx-auto h-8 w-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-xs font-bold text-[#FFD700]">
                    {sign.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-cinzel text-sm font-bold text-[#fffaf0]">{sign.name}</p>
                    <p className="text-[10px] text-[#FFD700]/70 uppercase tracking-widest">{sign.element}</p>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="w-full text-xs">
                    <Link href={`/horoscope/${sign.slug}`}>Read Sign</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Generate Kundli CTA */}
        <Card className="glass overflow-hidden border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/5 via-[#0C152B]/20 to-[#D4AF37]/5 mb-12">
          <CardContent className="p-8 text-center space-y-4 max-w-2xl mx-auto">
            <Star className="mx-auto h-8 w-8 text-[#FFD700] animate-pulse" />
            <h3 className="font-cinzel text-2xl font-bold">Looking for Deeper Personalization?</h3>
            <p className="text-sm naksh-muted-text">
              Zodiac signs provide general sign-level themes. A personalized Kundli calculates exact planetary degrees, ascendant temperament, and mahadasha timelines for your precise place and second of birth.
            </p>
            <Button asChild className="bg-[#D4AF37] hover:bg-[#B38F2E] text-slate-900 font-bold">
              <Link href="/kundli">Generate Free Kundli</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-4 text-xs naksh-muted-text leading-5">
          <Shield className="h-4 w-4 text-blue-400 mr-2 inline" />
          <strong>Disclaimer:</strong> All astrological details are for self-reflection and personal insight. They do not constitute formal medical, legal, or financial advice. We do not make guaranteed predictions.
        </div>
      </Section>
    </main>
  );
}

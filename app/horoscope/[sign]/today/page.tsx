import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Gem, Heart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoInternalLinks } from "@/components/seo/internal-links";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";
import { getZodiacSign, zodiacSigns } from "@/lib/zodiac";

type PageProps = { params: Promise<{ sign: string }> };

export function generateStaticParams() {
  return zodiacSigns.map((sign) => ({ sign: sign.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign: slug } = await params;
  const sign = getZodiacSign(slug);
  if (!sign) return {};
  return seo({
    title: `${sign.name} Today Horoscope - Love, Career, Finance and Health`,
    description: `Read ${sign.name} today horoscope on Naksharix with love, career, finance, health, lucky color, lucky number, and personalized astrology guidance.`,
    path: `/horoscope/${sign.slug}/today`,
    keywords: [`${sign.name} Today Horoscope`, `${sign.name} Horoscope`, "Daily Horoscope", "Astrology"]
  });
}

export default async function TodayHoroscopePage({ params }: PageProps) {
  const { sign: slug } = await params;
  const sign = getZodiacSign(slug);
  if (!sign) notFound();
  const date = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const sections = [
    { title: "Love", icon: Heart, copy: `${sign.name} relationships benefit from calm honesty and attentive listening today.` },
    { title: "Career", icon: CalendarDays, copy: `Professional momentum improves when you apply ${sign.focus} with practical discipline.` },
    { title: "Finance", icon: Wallet, copy: "Review commitments before spending and keep one decision focused on long-term value." },
    { title: "Remedy", icon: Gem, copy: "Wear warm gold or violet tones, pause before major choices, and use Naksharix kundli context for personalization." }
  ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${sign.name} Today Horoscope`,
    url: `${env.NEXT_PUBLIC_APP_URL}/horoscope/${sign.slug}/today`,
    description: `${sign.name} daily horoscope for love, career, finance, health, lucky guidance, and remedies.`,
    about: ["Astrology", "Daily Horoscope", sign.name]
  };

  return (
    <main className="star-field">
      <Section>
        <JsonLd id={`${sign.slug}-today-horoscope-schema`} data={schema} />
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{date}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{sign.name} Today Horoscope</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">Today highlights {sign.focus}. Read your sign-level guidance below, then generate a free kundli for birth-chart personalization.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {sections.map(({ title, icon: Icon, copy }) => (
            <Card key={title} className="glass">
              <CardContent className="space-y-3 pt-6">
                <Icon className="h-5 w-5 text-[#FFD700]" />
                <h2 className="font-cinzel text-lg font-bold">{title}</h2>
                <p className="text-sm naksh-muted-text">{copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild><Link href="/horoscope/all-signs/today">All signs today</Link></Button>
          <Button variant="outline" asChild><Link href="/kundli">Personalize with Kundli</Link></Button>
        </div>
        <SeoInternalLinks title={`More for ${sign.name}`} />
      </Section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Gem, Heart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getZodiacSign, zodiacSigns } from "@/lib/zodiac";
import { seo } from "@/lib/seo";

type PageProps = {
  params: Promise<{ sign: string }>;
};

export function generateStaticParams() {
  return zodiacSigns.map((sign) => ({ sign: sign.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign: slug } = await params;
  const sign = getZodiacSign(slug);
  if (!sign) return {};
  return seo({
    title: `${sign.name} Horoscope, Zodiac Meaning and Astrology - Naksharix`,
    description: `Read ${sign.name} zodiac astrology insights for love, career, finance, health, kundli context, tarot reading, numerology, and panchang timing.`,
    path: `/zodiac/${sign.slug}`,
    keywords: [`${sign.name} Horoscope`, `${sign.name} Zodiac`, "Astrology", "Kundli", "Tarot Reading"]
  });
}

export default async function ZodiacSignPage({ params }: PageProps) {
  const { sign: slug } = await params;
  const sign = getZodiacSign(slug);
  if (!sign) notFound();

  const sections = [
    { icon: Heart, title: "Love", copy: `${sign.name} love energy favors honest timing, emotional clarity, and balanced expectations.` },
    { icon: CalendarDays, title: "Career", copy: `Career choices improve when ${sign.name} leans into ${sign.focus}.` },
    { icon: Wallet, title: "Finance", copy: `Financial guidance for ${sign.name} blends discipline, timing, and a practical review of current commitments.` },
    { icon: Gem, title: "Remedy", copy: `Naksharix can personalize gemstones, mantras, and puja recommendations from DOB and kundli context.` }
  ];

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">{sign.element} Zodiac Sign</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{sign.name} Horoscope and Astrology</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">
          {sign.name} is associated with {sign.focus}. Use this page as a starting point for daily horoscope, kundli reading, tarot reflection, numerology, and panchang-aware timing.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {sections.map(({ icon: Icon, title, copy }) => (
            <Card key={title} className="glass">
              <CardContent className="space-y-3 pt-6">
                <Icon className="h-5 w-5 text-[#FFD36A]" />
                <h2 className="font-cinzel text-lg font-bold">{title}</h2>
                <p className="text-sm naksh-muted-text">{copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/horoscope">Read Horoscope</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/kundli">Generate Kundli</Link>
          </Button>
        </div>
      </Section>
    </main>
  );
}

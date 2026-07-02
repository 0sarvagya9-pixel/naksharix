import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Gem, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getZodiacSign, zodiacSigns } from "@/lib/zodiac";
import { seo } from "@/lib/seo";

type PageProps = {
  params: Promise<{ sign: string }>;
};

const signMetadata: Record<string, { modality: string; ruler: string }> = {
  aries: { modality: "Cardinal", ruler: "Mars" },
  taurus: { modality: "Fixed", ruler: "Venus" },
  gemini: { modality: "Mutable", ruler: "Mercury" },
  cancer: { modality: "Cardinal", ruler: "Moon" },
  leo: { modality: "Fixed", ruler: "Sun" },
  virgo: { modality: "Mutable", ruler: "Mercury" },
  libra: { modality: "Cardinal", ruler: "Venus" },
  scorpio: { modality: "Fixed", ruler: "Mars" },
  sagittarius: { modality: "Mutable", ruler: "Jupiter" },
  capricorn: { modality: "Cardinal", ruler: "Saturn" },
  aquarius: { modality: "Fixed", ruler: "Saturn" },
  pisces: { modality: "Mutable", ruler: "Jupiter" }
};

export function generateStaticParams() {
  return zodiacSigns.map((sign) => ({ sign: sign.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign: slug } = await params;
  const sign = getZodiacSign(slug);
  if (!sign) return {};
  return seo({
    title: `${sign.name} Daily & Weekly Horoscope, Zodiac Insights - Naksharix`,
    description: `Read premium daily, weekly, and yearly horoscope guidance for ${sign.name}. Explore love, career, wellbeing, and spiritual alignment.`,
    path: `/horoscope/${sign.slug}`,
    keywords: [`${sign.name} Horoscope`, `${sign.name} Zodiac`, "Astrology", "Daily Horoscope"]
  });
}

export default async function ZodiacDetailPage({ params }: PageProps) {
  const { sign: slug } = await params;
  const sign = getZodiacSign(slug);
  if (!sign) notFound();

  const meta = signMetadata[sign.slug] || { modality: "Cardinal", ruler: "Unknown" };

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">
          {sign.element} Sign • {meta.modality} • Ruled by {meta.ruler}
        </p>
        <h1 className="mt-3 font-cinzel text-4xl font-black text-white">{sign.name} Horoscope & Zodiac Overview</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">
          {sign.name} is centered on {sign.focus}. Reflect on your current alignment below, and verify details with a personalized chart.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="glass">
            <CardContent className="pt-6 space-y-3">
              <Sparkles className="h-5 w-5 text-[#FFD700]" />
              <h2 className="font-cinzel text-lg font-bold text-white">Daily Insight</h2>
              <p className="text-sm naksh-muted-text">
                Focus on grounding today. Small, practical actions will support your natural drive and create steady progress.
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-6 space-y-3">
              <CalendarDays className="h-5 w-5 text-[#FFD700]" />
              <h2 className="font-cinzel text-lg font-bold text-white">Weekly Theme</h2>
              <p className="text-sm naksh-muted-text">
                This week emphasizes building consistency. Refine active plans rather than launching raw, unchecked concepts.
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-6 space-y-3">
              <Gem className="h-5 w-5 text-[#FFD700]" />
              <h2 className="font-cinzel text-lg font-bold text-white">Yearly Overview</h2>
              <p className="text-sm naksh-muted-text">
                2026 demands patient planning and structural growth. Consolidate your resources to secure professional stability.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[rgba(255,255,255,0.15)] bg-[rgba(10,14,26,0.64)] p-6">
              <h3 className="font-cinzel text-xl font-bold text-[#fffaf0] mb-3">Love & Relationships</h3>
              <p className="text-sm naksh-muted-text leading-6">
                Leaning on emotional clarity and realistic expectations keeps bonds stable. Avoid rushing responses or testing connections.
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(255,255,255,0.15)] bg-[rgba(10,14,26,0.64)] p-6">
              <h3 className="font-cinzel text-xl font-bold text-[#fffaf0] mb-3">Career & Finance</h3>
              <p className="text-sm naksh-muted-text leading-6">
                Leaning on structure and slow diligence gets recognized. Impulsive money choices are best avoided; keep records detailed.
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(255,255,255,0.15)] bg-[rgba(10,14,26,0.64)] p-6">
              <h3 className="font-cinzel text-xl font-bold text-[#fffaf0] mb-3">Wellbeing & Routine</h3>
              <p className="text-sm naksh-muted-text leading-6">
                Hydration, steady rest, and mindful movement build resilience. This serves as a reminder for physical check-ins.
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(255,255,255,0.15)] bg-[rgba(10,14,26,0.64)] p-6">
              <h3 className="font-cinzel text-xl font-bold text-[#fffaf0] mb-3">Spiritual Guidance</h3>
              <p className="text-sm naksh-muted-text leading-6">
                Take three quiet minutes before important choices. Self-observation offers more clarity than external advice.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/kundli">Generate Free Kundli Report</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/horoscope">Back to Horoscope Hub</Link>
          </Button>
        </div>

        <div className="mt-8 rounded-xl border border-blue-500/25 bg-blue-500/5 p-4 text-xs naksh-muted-text leading-5">
          <Shield className="h-4 w-4 text-blue-400 mr-2 inline" />
          <strong>Disclaimer:</strong> Astrology suggestions are meant for self-reflection and spiritual guidance. They do not constitute legal, medical, or financial advice. We do not make guaranteed predictions.
        </div>
      </Section>
    </main>
  );
}

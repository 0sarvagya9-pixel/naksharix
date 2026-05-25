import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { seo } from "@/lib/seo";
import { zodiacSigns } from "@/lib/zodiac";

type Params = Promise<{ sign: string }>;

export function generateStaticParams() {
  return zodiacSigns.map((sign) => ({ sign: sign.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { sign } = await params;
  const zodiac = zodiacSigns.find((item) => item.slug === sign);
  if (!zodiac) return {};
  return seo({
    title: `${zodiac.name} Yearly Horoscope 2026 - Naksharix`,
    description: `${zodiac.name} yearly horoscope 2026 for career, love, finance, health, family, remedies, lucky dates, and premium report guidance.`,
    path: `/yearly-horoscope-2026/${zodiac.slug}`,
    keywords: [`${zodiac.name} Yearly Horoscope 2026`, "Yearly Horoscope 2026"]
  });
}

export default async function YearlySignPage({ params }: { params: Params }) {
  const { sign } = await params;
  const zodiac = zodiacSigns.find((item) => item.slug === sign);
  if (!zodiac) notFound();
  const faqs = [
    { question: `What is the ${zodiac.name} horoscope for 2026?`, answer: `${zodiac.name} horoscope 2026 highlights planning, relationships, money discipline, health routines, and calmer decision-making.` },
    { question: "Can I get a personalized 2026 report?", answer: "Yes. Use the Yearly Prediction Report for a birth-detail based report with monthly themes and remedies." }
  ];

  return (
    <main className="star-field">
      <JsonLd id={`${zodiac.slug}-2026-faq`} data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }} />
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Yearly Horoscope 2026</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{zodiac.name} Yearly Horoscope 2026</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 naksh-muted-text">
          2026 asks {zodiac.name} natives to combine ambition with steadiness. Use this yearly horoscope for broad planning, then generate a personalized kundli or yearly report for deeper timing.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild><Link href="/horoscope">Horoscope Coming Soon</Link></Button>
          <Button variant="outline" asChild><Link href="/reports/yearly-horoscope-report">View Yearly Report</Link></Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {["Career", "Love", "Finance", "Health"].map((topic) => (
            <Card key={topic} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
              <CardContent className="p-5">
                <h2 className="font-cinzel text-lg font-bold">{topic}</h2>
                <p className="mt-3 text-sm leading-6 naksh-muted-text">{topic} themes favor thoughtful planning, patient communication, and practical routines for {zodiac.name} in 2026.</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
              <CardContent className="p-5">
                <h2 className="font-cinzel text-lg font-bold">{faq.question}</h2>
                <p className="mt-3 text-sm leading-6 naksh-muted-text">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

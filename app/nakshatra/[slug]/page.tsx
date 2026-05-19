import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { nakshatras, titleFromSlug } from "@/lib/growth-pages";
import { seo } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return nakshatras.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  if (!nakshatras.includes(slug)) return {};
  const name = titleFromSlug(slug);
  return seo({
    title: `${name} Nakshatra Meaning - Naksharix`,
    description: `Learn ${name} Nakshatra meaning, personality themes, remedies, and how to connect it with Naksharix Kundli and horoscope tools.`,
    path: `/nakshatra/${slug}`,
    keywords: [`${name} Nakshatra`, "Nakshatra Meaning"]
  });
}

export default async function NakshatraPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!nakshatras.includes(slug)) notFound();
  const name = titleFromSlug(slug);
  const faqs = [
    { question: `What is ${name} Nakshatra?`, answer: `${name} is one of the 27 lunar mansions used in Vedic astrology to understand temperament, instincts, timing, and emotional patterns.` },
    { question: "How can I use this in Naksharix?", answer: "Generate your Kundli to connect nakshatra themes with birth chart context, then ask the AI astrologer for practical guidance." }
  ];

  return (
    <main className="star-field">
      <JsonLd id={`${slug}-faq`} data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }} />
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Nakshatra Guide</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{name} Nakshatra</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 naksh-muted-text">
          {name} Nakshatra reflects lunar themes connected with personality, emotional rhythm, instinctive choices, and spiritual remedies. Use it as a reflective lens alongside your full Kundli.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild><Link href="/kundli">Generate Free Kundli</Link></Button>
          <Button variant="outline" asChild><Link href="/chatbot">Ask AI Astrologer</Link></Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {["Personality themes", "Timing patterns", "Suggested remedies"].map((title) => (
            <Card key={title} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
              <CardContent className="p-5">
                <h2 className="font-cinzel text-lg font-bold">{title}</h2>
                <p className="mt-3 text-sm leading-6 naksh-muted-text">Review this section with chart context for balanced guidance.</p>
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

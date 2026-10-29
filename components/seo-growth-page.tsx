import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GrowthPage } from "@/lib/growth-pages";
import { EducationalAd } from "@/components/adsense/educational-ad";

export function SeoGrowthPage({ page }: { page: GrowthPage }) {
  return (
    <main className="star-field">
      <JsonLd
        id={`${page.slug}-faq-schema`}
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer }
          }))
        }}
      />
      <Section>
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Naksharix SEO Guide</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black sm:text-5xl">{page.h1}</h1>
          <p className="mt-5 text-lg leading-8 naksh-muted-text">{page.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {page.ctas.map((cta) => (
              <Button key={cta.href} asChild>
                <Link href={cta.href}>{cta.label}<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="glass">
            <CardContent className="p-6">
              <h2 className="font-cinzel text-2xl font-black">{page.h2}</h2>
              <p className="mt-4 leading-7 naksh-muted-text">{page.description}</p>
              {page.highlights?.length ? (
                <div className="mt-5 grid gap-3">
                  {page.highlights.map((item) => (
                    <p key={item} className="flex gap-2 rounded-md border border-[#D4AF37]/20 bg-[#02112C]/60 p-3 text-sm naksh-muted-text">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FFD700]" />{item}
                    </p>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
          <div className="grid gap-4">
            {page.faqs.map((faq) => (
              <Card key={faq.question} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
                <CardContent className="p-5">
                  <h2 className="font-cinzel text-lg font-bold">{faq.question}</h2>
                  <p className="mt-3 text-sm leading-6 naksh-muted-text">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {page.sections?.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {page.sections.map((section) => (
              <section key={section.heading} className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/75 p-6">
                <h2 className="text-xl font-bold">{section.heading}</h2>
                <p className="mt-4 text-sm leading-7 naksh-muted-text">{section.body}</p>
              </section>
            ))}
          </div>
        ) : null}
        {page.sections?.length && page.sections.length >= 2 && page.slug === "free-kundli" ? (
          <EducationalAd placement="kundli-learning" />
        ) : null}
      </Section>
    </main>
  );
}

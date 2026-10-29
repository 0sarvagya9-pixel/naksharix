import Link from "next/link";
import { Section } from "@/components/section";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { canonicalSeoOrigin } from "@/lib/seo-origin";
import { kundliEducation, kundliGuideLanguages, kundliGuidePath, indexableKundliGuideLanguages, isIndexableKundliGuideLanguage, type KundliGuideLanguage } from "@/lib/kundli-education";

export function KundliEducationPage({ locale }: { locale: KundliGuideLanguage }) {
  const page = kundliEducation[locale];
  const isIndexable = isIndexableKundliGuideLanguage(locale);
  const navigationLanguages = isIndexable ? indexableKundliGuideLanguages : kundliGuideLanguages;
  const url = canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL) + kundliGuidePath(locale);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", name: "Naksharix", url: canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL) }
  };
  return (
    <main className="star-field">
      <JsonLd id={"kundli-education-"+locale} data={schema} />
      <Section>
        <article className="mx-auto max-w-5xl" lang={locale}>
          <nav aria-label="Language versions" className="mb-8 flex flex-wrap gap-2">
            {navigationLanguages.map((code) => (
              <a key={code} href={kundliGuidePath(code)} hrefLang={code}
                aria-current={code === locale ? "page" : undefined}
                className={"rounded-md border px-3 py-2 text-sm "+(code === locale ? "border-[#FFD700] bg-[#FFD700]/10" : "border-[#D4AF37]/30 hover:border-[#FFD700]")}>
                {kundliEducation[code].label}
              </a>
            ))}
          </nav>
          {!isIndexable ? <p role="note" className="mb-6 rounded-lg border p-4 text-sm">Translation preview; native editorial review is pending.</p> : null}
          <header>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#FFD700]">NAKSHARIX · Kundli learning</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">{page.heading}</h1>
            <p className="mt-5 max-w-4xl text-lg leading-8 naksh-muted-text">{page.intro}</p>
          </header>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild><Link href="/kundli">{page.cta}</Link></Button>
            <Button asChild variant="outline"><Link href="/kundli-matching">{page.matching}</Link></Button>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {page.sections.map(([heading, body]) => (
              <section key={heading} className="rounded-xl border border-[#D4AF37]/25 bg-[#061D3C]/70 p-6">
                <h2 className="text-xl font-semibold">{heading}</h2>
                <p className="mt-4 text-sm leading-7 naksh-muted-text">{body}</p>
              </section>
            ))}
          </div>
          <section className="mt-12">
            <h2 className="text-2xl font-bold">FAQ</h2>
            <div className="mt-5 grid gap-4">
              {page.faq.map(([question, answer]) => (
                <div key={question} className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-5">
                  <h3 className="font-semibold">{question}</h3>
                  <p className="mt-2 text-sm leading-7 naksh-muted-text">{answer}</p>
                </div>
              ))}
            </div>
          </section>
          <p className="mt-10 border-l-2 border-[#FFD700] pl-4 text-sm leading-7 naksh-muted-text">{page.caution}</p>
        </article>
      </Section>
    </main>
  );
}

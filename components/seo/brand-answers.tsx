import Link from "next/link";
import { brandAnswers, brandToolLinks } from "@/lib/seo-brand";

/** Real visible server-rendered answers, not hidden search-only content. */
export function BrandAnswers({ locale }: { locale: "en" | "hi" }) {
  const hindi = locale === "hi";
  return (
    <section lang={locale} aria-labelledby="brand-answers-heading" className="mx-auto mt-8 rounded-3xl border border-[#e4cbaa] bg-[#fffdf8] p-6 text-[#35242b] md:p-9">
      <h2 id="brand-answers-heading" className="font-cinzel text-2xl font-bold text-[#70283d]">{hindi ? "Naksharix से जुड़े सामान्य प्रश्न" : "Questions about Naksharix"}</h2>
      <dl className="mt-5 grid gap-5 md:grid-cols-2">
        {brandAnswers[locale].map(({ question, answer }) => (
          <div key={question} className="rounded-xl border border-[#e6d5bf] p-4">
            <dt className="font-semibold">{question}</dt>
            <dd className="mt-2 text-sm leading-7 text-[#525866]">{answer}</dd>
          </div>
        ))}
      </dl>
      <nav aria-label={hindi ? "आधिकारिक सेवाएँ और सहायता" : "Official tools and support"} className="mt-7 flex flex-wrap gap-3">
        {brandToolLinks.map(link => <Link key={link.english} href={hindi ? link.hindi : link.english} className="rounded-lg border border-[#dcc1a8] px-4 py-3 text-sm font-semibold text-[#70283d] hover:underline">{hindi ? link.hi : link.en}</Link>)}
        <Link href={hindi ? "/about" : "/hi/about"} hrefLang={hindi ? "en" : "hi"} className="rounded-lg border border-[#dcc1a8] px-4 py-3 text-sm font-semibold text-[#70283d] hover:underline">{hindi ? "Read in English" : "हिंदी में पढ़ें"}</Link>
      </nav>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Guna Milan Calculator: Eight Kootas Explained",
  description: "Calculate the traditional Ashtakoota compatibility score and understand the eight factors, 36-point maximum, birth-data assumptions and important limitations.",
  path: "/free-calculators/guna-milan-calculator",
  keywords: ["Guna Milan Calculator", "Ashtakoota", "Kundli Matching"]
});

const kootas = [
  ["Varna", 1, "Traditional classification used within Ashtakoota."],
  ["Vashya", 2, "A traditional comparison associated with influence."],
  ["Tara", 3, "A comparison based on the partners' Nakshatras."],
  ["Yoni", 4, "A symbolic comparison in the traditional system."],
  ["Graha Maitri", 5, "A comparison associated with sign-lord relationships."],
  ["Gana", 6, "A traditional Nakshatra-group comparison."],
  ["Bhakoot", 7, "A traditional Moon-sign relationship comparison."],
  ["Nadi", 8, "A traditional Nakshatra-group comparison."]
] as const;

export default function GunaMilanCalculatorPage() {
  return (
    <>
      <FocusedCalculatorContent kind="guna-milan" />
      <section aria-labelledby="guna-method" className="mx-auto mb-12 max-w-6xl rounded-3xl border border-[rgba(216,154,43,0.22)] bg-white/85 p-6 text-[#17181d] md:p-9">
        <h2 id="guna-method" className="font-cinzel text-2xl font-bold">What does a Guna Milan score out of 36 mean?</h2>
        <p className="mt-4 leading-8 text-[#525866]">
          Ashtakoota Guna Milan is a traditional birth-chart comparison that
          assigns points across eight factors. Each factor has a different
          maximum. The sum is a maximum of 36 points, rather than a scientific
          compatibility percentage. Different schools may apply different
          conventions, exclusions or interpretations.
        </p>
        <h3 className="mt-7 text-xl font-bold">The eight factors and their maximum points</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {kootas.map(([name, maximum, explanation]) => (
            <div key={name} className="rounded-xl border border-[#e7cda3] bg-[#fff8ec] p-4">
              <h4 className="font-bold">{name} — up to {maximum} {maximum === 1 ? "point" : "points"}</h4>
              <p className="mt-2 text-sm leading-7 text-[#525866]">{explanation}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 leading-8 text-[#525866]">
          The maximum is 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 = 36.
          For example, a hypothetical set of scores 1, 1, 2, 3, 4, 5, 7 and 8
          adds up to 31 out of 36. That arithmetic example is not a prediction
          for any real couple and does not establish relationship quality.
        </p>
        <h3 className="mt-8 text-xl font-bold">Why accurate birth details matter</h3>
        <p className="mt-3 leading-8 text-[#525866]">
          The traditional comparison usually depends on the Moon&apos;s position
          and Nakshatra for each person. A wrong date, time zone, selected
          birthplace or astronomical convention can change inputs, especially
          close to a sign or Nakshatra boundary. Review the factors rather than
          trusting a total without its calculation assumptions.
        </p>
        <h3 className="mt-8 text-xl font-bold">Important limitations</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-8 text-[#525866]">
          <li>A high traditional score cannot guarantee a safe, respectful or happy marriage; a low score cannot rule one out.</li>
          <li>Consent, shared goals, communication, respect, safety and family circumstances require conversations between real people.</li>
          <li>Manglik or other chart considerations are not interchangeable with the eight-factor point total.</li>
          <li>Keep another person's private birth details confidential, and only use them with permission.</li>
        </ul>
        <nav aria-label="Related matching resources" className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/blog/kundli-matching-score" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Read the Guna Milan explanation</Link>
          <Link href="/kundli-matching" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Explore matching tools</Link>
          <Link href="/learn/kundli-explained" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Learn about birth charts</Link>
        </nav>
      </section>
    </>
  );
}

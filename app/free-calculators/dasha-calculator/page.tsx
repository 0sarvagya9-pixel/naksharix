import type { Metadata } from "next";
import Link from "next/link";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Free Vimshottari Dasha Calculator and Method",
  description: "Explore Vimshottari Mahadasha and Antardasha timelines, the traditional 120-year period sequence, a worked sub-period example, and birth-data limitations.",
  path: "/free-calculators/dasha-calculator",
  keywords: ["Dasha Calculator", "Vimshottari Dasha", "Mahadasha", "Antardasha"]
});

const periods = [
  ["Ketu", 7], ["Venus (Shukra)", 20], ["Sun (Surya)", 6],
  ["Moon (Chandra)", 10], ["Mars (Mangal)", 7], ["Rahu", 18],
  ["Jupiter (Guru)", 16], ["Saturn (Shani)", 19], ["Mercury (Budha)", 17]
] as const;

export default function DashaCalculatorPage() {
  return (
    <>
      <FocusedCalculatorContent kind="dasha" />
      <section aria-labelledby="dasha-method" className="mx-auto mb-12 max-w-6xl rounded-3xl border border-[rgba(216,154,43,0.22)] bg-white/85 p-6 text-[#17181d] md:p-9">
        <h2 id="dasha-method" className="font-cinzel text-2xl font-bold">Understand the Vimshottari Dasha timeline</h2>
        <p className="mt-4 leading-8 text-[#525866]">
          Vimshottari Dasha is a traditional Vedic astrology timing system built around a
          repeating sequence of nine planetary periods, whose standard lengths add up to
          120 years. The birth Moon&apos;s Nakshatra is used to establish the starting
          period and how much of it remains at birth. This is a cultural interpretation
          method, not a scientific forecast of personal events.
        </p>
        <h3 className="mt-7 text-xl font-bold">Traditional Mahadasha sequence</h3>
        <p className="mt-2 text-sm leading-7 text-[#525866]">
          The sequence is cyclic; it does not start with Ketu for every person.
          The initial period depends on the entered birth details.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {periods.map(([name, years]) => (
            <div key={name} className="flex items-center justify-between rounded-xl border border-[#e7cda3] bg-[#fff8ec] px-4 py-3 text-sm">
              <span className="font-semibold">{name}</span>
              <span>{years} years</span>
            </div>
          ))}
        </div>
        <h3 className="mt-8 text-xl font-bold">How an Antardasha fits inside a Mahadasha</h3>
        <p className="mt-3 leading-8 text-[#525866]">
          Antardasha is a sub-period within the larger Mahadasha. In the traditional
          proportional scheme, a sub-period&apos;s nominal length is the Mahadasha
          length multiplied by the sub-period ruler&apos;s allotted years, divided
          by 120. For example, a Moon sub-period inside a Sun Mahadasha is
          6 × 10 ÷ 120 = 0.5 traditional year. Exact start and end dates also depend
          on the calendar and astronomical conventions used by the calculation engine.
        </p>
        <h3 className="mt-8 text-xl font-bold">Why birth information matters</h3>
        <ul className="mt-3 list-disc space-y-3 pl-6 leading-8 text-[#525866]">
          <li>A wrong birth time or time zone can change the calculated Moon position and the balance of a period.</li>
          <li>Birth places with similar names are not interchangeable. Confirm the selected city and country.</li>
          <li>Ayanamsa and ephemeris conventions can cause differences between tools near a Nakshatra boundary.</li>
          <li>The calculated dates describe traditional periods, not guaranteed marriage, career, medical or financial outcomes.</li>
        </ul>
        <nav aria-label="Related free Dasha resources" className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/blog/vimshottari-dasha-timeline" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Read the complete Dasha guide</Link>
          <Link href="/free-calculators/nakshatra-calculator" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Find your birth Nakshatra</Link>
          <Link href="/free-kundli" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Explore your free Kundli</Link>
        </nav>
      </section>
    </>
  );
}

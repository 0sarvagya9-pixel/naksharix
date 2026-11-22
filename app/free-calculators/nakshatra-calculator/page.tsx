import type { Metadata } from "next";
import Link from "next/link";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Birth Nakshatra Calculator: Method and Pada Guide",
  description: "Find a traditional birth Nakshatra and Pada. Learn why 27 lunar divisions use 13°20′ each, how the four Padas are formed, and why accurate birth details matter.",
  path: "/free-calculators/nakshatra-calculator",
  keywords: ["Birth Nakshatra Calculator", "Nakshatra Pada", "Moon Sign"]
});

export default function NakshatraCalculatorPage() {
  return (
    <>
      <FocusedCalculatorContent kind="nakshatra" />
      <section aria-labelledby="nakshatra-method" className="mx-auto mb-12 max-w-6xl rounded-3xl border border-[rgba(216,154,43,0.22)] bg-white/85 p-6 text-[#17181d] md:p-9">
        <h2 id="nakshatra-method" className="font-cinzel text-2xl font-bold">How a birth Nakshatra is determined</h2>
        <p className="mt-4 leading-8 text-[#525866]">
          In the common 27-Nakshatra system of Vedic astrology, the sidereal
          zodiac is divided into 27 equal sections. A birth Nakshatra is based
          on the calculated position of the Moon at the entered birth time.
          This is a description of a traditional chart convention; its symbolic
          personality meanings are not experimentally established predictions.
        </p>
        <h3 className="mt-7 text-xl font-bold">Why each Nakshatra has four Padas</h3>
        <p className="mt-3 leading-8 text-[#525866]">
          A circle has 360 degrees. Divide it by 27 and each Nakshatra spans
          13 degrees 20 minutes of longitude. Each is then divided into four
          Padas, or quarters, measuring 3 degrees 20 minutes each. A Moon
          position near a quarter boundary can yield a different Pada if the
          birth time or astronomical convention changes.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#e7cda3] bg-[#fff8ec] p-4">
            <strong>One Nakshatra</strong>
            <p className="mt-2 text-sm leading-7 text-[#525866]">360° ÷ 27 = 13°20′</p>
          </div>
          <div className="rounded-xl border border-[#e7cda3] bg-[#fff8ec] p-4">
            <strong>One Pada</strong>
            <p className="mt-2 text-sm leading-7 text-[#525866]">13°20′ ÷ 4 = 3°20′</p>
          </div>
        </div>
        <h3 className="mt-8 text-xl font-bold">Nakshatra and Rashi are not the same</h3>
        <p className="mt-3 leading-8 text-[#525866]">
          A Moon Rashi places the Moon within one of twelve zodiac signs,
          while Nakshatra uses 27 smaller divisions. A person can therefore
          have a Moon sign and a birth Nakshatra without those being two
          different answers to the same question. Check which system a
          calculator labels before comparing its output with other sites.
        </p>
        <h3 className="mt-8 text-xl font-bold">Checking the birth inputs</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-8 text-[#525866]">
          <li>Use the recorded birth time, not an approximate guess if an accurate record is available.</li>
          <li>Check the birthplace, country and time zone; an incorrect offset changes the Moon&apos;s calculated position.</li>
          <li>Ayanamsa and ephemeris conventions matter near sign, Nakshatra and Pada boundaries.</li>
          <li>Do not treat a Nakshatra label as a medical, career or relationship guarantee.</li>
        </ul>
        <nav aria-label="Related moon and Nakshatra resources" className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/free-calculators/moon-sign-calculator" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Calculate your Moon Sign</Link>
          <Link href="/free-calculators/dasha-calculator" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Understand Dasha timing</Link>
          <Link href="/learn/kundli-explained" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Read the Kundli guide</Link>
        </nav>
      </section>
    </>
  );
}

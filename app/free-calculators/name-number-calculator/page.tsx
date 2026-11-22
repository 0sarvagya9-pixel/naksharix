import type { Metadata } from "next";
import Link from "next/link";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Name Number Calculator: Naamank Method and Example",
  description: "Calculate Naamank from a name and birth date. Understand the A-to-Z 1–9 letter values, a worked name-number example, spelling differences and limitations.",
  path: "/free-calculators/name-number-calculator",
  keywords: ["Naamank Calculator", "Name Numerology", "Name Number"]
});

const rows = [
  ["1", "A, J, S"], ["2", "B, K, T"], ["3", "C, L, U"],
  ["4", "D, M, V"], ["5", "E, N, W"], ["6", "F, O, X"],
  ["7", "G, P, Y"], ["8", "H, Q, Z"], ["9", "I, R"]
] as const;

export default function NameNumberCalculatorPage() {
  return (
    <>
      <FocusedCalculatorContent kind="name-number" />
      <section aria-labelledby="naamank-method" className="mx-auto mb-12 max-w-6xl rounded-3xl border border-[rgba(216,154,43,0.22)] bg-white/85 p-6 text-[#17181d] md:p-9">
        <h2 id="naamank-method" className="font-cinzel text-2xl font-bold">How Naksharix calculates a Name Number</h2>
        <p className="mt-4 leading-8 text-[#525866]">
          Name Number, also called Naamank, is a numerology convention that assigns
          numbers to the letters of a written name. This calculator uses a repeating
          1-to-9 Latin-alphabet mapping. It is a transparent arithmetic exercise
          within a traditional interpretation system, not evidence that a name
          determines health, success, relationships or personality.
        </p>
        <h3 className="mt-7 text-xl font-bold">Letter values used by this calculator</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {rows.map(([value, letters]) => (
            <div key={value} className="flex justify-between gap-4 rounded-xl border border-[#e7cda3] bg-[#fff8ec] px-4 py-3 text-sm">
              <strong>Value {value}</strong><span>{letters}</span>
            </div>
          ))}
        </div>
        <h3 className="mt-8 text-xl font-bold">Worked example: the name RAM</h3>
        <p className="mt-3 leading-8 text-[#525866]">
          The letters in RAM receive R = 9, A = 1 and M = 4. Add the values:
          9 + 1 + 4 = 14. Then add the digits 1 + 4 = 5, giving a Name Number
          of 5 under this mapping. Another spelling can produce a different
          number even when both spellings refer to the same person.
        </p>
        <h3 className="mt-8 text-xl font-bold">Name Number vs birth-date numbers</h3>
        <p className="mt-3 leading-8 text-[#525866]">
          Moolank commonly reduces the birth day, while Bhagyank or Life Path
          reduces digits across the full birth date. They are not interchangeable
          with a number calculated from the letters of a name. The form above uses
          your chosen name and birth date to show related numerology fields.
          It does not verify a person&apos;s real-world character.
        </p>
        <h3 className="mt-8 text-xl font-bold">What to check before comparing results</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-8 text-[#525866]">
          <li>Enter the name spelling you actually want to examine; initials and alternate spellings change the total.</li>
          <li>The letter mapping shown here differs from other numerology systems, so results may legitimately differ across websites.</li>
          <li>Check the full birth date before comparing Moolank, Bhagyank and Lo Shu values.</li>
          <li>Do not change a legal name or make financial decisions solely because a calculated number appears favorable.</li>
        </ul>
        <nav aria-label="Related free numerology resources" className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/numerology" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Numerology overview</Link>
          <Link href="/free-calculators/lo-shu-grid-calculator" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Try the birth-date Lo Shu grid</Link>
          <Link href="/blog/lo-shu-grid-beginners" className="rounded-lg border border-[#dca956]/35 px-4 py-2 text-[#8c571a] underline">Read the beginner&apos;s guide</Link>
        </nav>
      </section>
    </>
  );
}

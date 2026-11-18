import type { Metadata } from "next";
import Link from "next/link";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Lo Shu Grid Calculator - Birth Date Guide",
  description: "Create a Lo Shu grid from your date of birth. See present, missing and repeated digits, a worked example and a clear explanation of this numerology method.",
  path: "/free-calculators/lo-shu-grid-calculator",
  keywords: ["Lo Shu Grid Calculator", "Lo Shu Numerology", "Missing Numbers", "Birth Date Numerology"]
});

export default function LoShuGridCalculatorPage() {
  return (
    <>
      <FocusedCalculatorContent kind="lo-shu" />
      <section aria-labelledby="lo-shu-method" className="mx-auto mb-12 max-w-6xl rounded-3xl border border-[rgba(216,154,43,0.22)] bg-white/80 p-6 text-[#17181d] md:p-9">
        <h2 id="lo-shu-method" className="font-cinzel text-2xl font-bold">How the Lo Shu Grid Calculator works</h2>
        <p className="mt-4 leading-8 text-[#525866]">
          Enter a date of birth into the free calculator above. Naksharix reads the
          digits from that date, counts numbers 1 through 9, and places them in the
          traditional 3-by-3 Lo Shu arrangement. Zero is not placed in the grid.
          This method uses a date of birth; a name or birth time is not required.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold">Standard Lo Shu number layout</h3>
            <div aria-label="Lo Shu grid rows: 4 9 2; 3 5 7; 8 1 6" className="mt-4 grid max-w-xs grid-cols-3 gap-2">
              {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((digit) => (
                <span key={digit} className="rounded-xl border border-[#dca956]/25 bg-[#fff5df] p-3 text-center text-xl font-bold">{digit}</span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-7 text-[#525866]">
              The numbers stay in these positions. The output indicates how many
              times each number occurs in the entered birth date.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Worked example: 19 October 1992</h3>
            <p className="mt-3 text-sm leading-7 text-[#525866]">
              The date 19-10-1992 contains three 1s, one 2 and three 9s.
              The zero is excluded. In this example, numbers 3, 4, 5, 6, 7 and 8
              are absent. Repeated digits appear with their counts; the grid
              does not create extra numbers that were not in the date.
            </p>
            <p className="mt-3 text-sm leading-7 text-[#525866]">
              The calculator shows missing, present and repeated numbers to support
              reflective numerology reading. Those interpretations are cultural
              traditions, not evidence-based predictions about personality or life events.
            </p>
          </div>
        </div>
        <h3 className="mt-8 text-lg font-semibold">Frequently asked questions</h3>
        <dl className="mt-3 space-y-4 text-sm leading-7 text-[#525866]">
          <div>
            <dt className="font-semibold text-[#17181d]">What do missing numbers mean?</dt>
            <dd>A missing number simply means that digit does not appear in the entered date of birth. Traditional numerology may assign a reflective meaning, but it does not identify a medical or personal deficiency.</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#17181d]">Why are some numbers repeated?</dt>
            <dd>The digit occurs more than once in the date. For example, the worked birth date above contains the digit 9 three times.</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#17181d]">Is Lo Shu the same as Name Numerology?</dt>
            <dd>No. This grid counts birth-date digits. The separate Name Number Calculator uses a name along with a birth date for its own numerology interpretation.</dd>
          </div>
        </dl>
        <nav aria-label="Related numerology calculators" className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/free-calculators/name-number-calculator" className="rounded-lg border border-[#dca956]/30 px-4 py-2 text-[#8c571a] hover:underline">Name Number Calculator</Link>
          <Link href="/free-calculators/destiny-number-calculator" className="rounded-lg border border-[#dca956]/30 px-4 py-2 text-[#8c571a] hover:underline">Life Path and Destiny Number</Link>
          <Link href="/numerology" className="rounded-lg border border-[#dca956]/30 px-4 py-2 text-[#8c571a] hover:underline">Numerology overview</Link>
        </nav>
      </section>
    </>
  );
}

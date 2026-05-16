import type { Metadata } from "next";
import { CalculatorSuite } from "@/components/calculator-suite";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Astrology Calculators - Moon Sign, Sun Sign, Ascendant and Nakshatra",
  description: "Use Naksharix calculators for Moon Sign, Sun Sign, Ascendant, Nakshatra, Ayanamsa, Love, Friendship, and Numerology.",
  path: "/calculators",
  keywords: ["Moon Sign Calculator", "Sun Sign Calculator", "Ascendant Calculator", "Nakshatra Calculator", "Ayanamsa Calculator"]
});

export default function CalculatorsPage() {
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Astrology Calculators</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Moon Sign, Sun Sign, Ascendant, Nakshatra and More</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">Quick calculators for sign, nakshatra, ayanamsa, love, friendship, and numerology. For deeper detail, generate a full Kundli after this quick check.</p>
        <div className="mt-8"><CalculatorSuite /></div>
      </Section>
    </main>
  );
}

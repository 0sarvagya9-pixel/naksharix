import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Free Nakshatra Calculator | Find Your Birth Nakshatra & Pada | Naksharix",
  description: "Find your birth Nakshatra, Pada, Moon sign, Nakshatra lord, and focused personality guidance using Naksharix.",
  path: "/free-calculators/nakshatra-calculator",
  keywords: ["Nakshatra Calculator", "Birth Nakshatra", "Nakshatra Pada", "Moon Sign", "Naksharix"]
});

export default function NakshatraCalculatorPage() {
  return <FocusedCalculatorContent kind="nakshatra" />;
}

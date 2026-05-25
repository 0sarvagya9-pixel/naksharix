import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Personality Number Calculator | Name Numerology | Naksharix", description: "Calculate personality number from full name with focused expression guidance.", path: "/free-calculators/personality-number-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="personality" />; }

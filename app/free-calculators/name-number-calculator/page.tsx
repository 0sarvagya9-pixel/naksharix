import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Name Number Calculator | Naamank Numerology | Naksharix", description: "Calculate Name Number or Naamank and review compatibility with date of birth.", path: "/free-calculators/name-number-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="name-number" />; }

import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Destiny Number Calculator | Bhagyank / Life Path | Naksharix", description: "Calculate Destiny Number, Bhagyank, or Life Path number from date of birth.", path: "/free-calculators/destiny-number-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="destiny" />; }

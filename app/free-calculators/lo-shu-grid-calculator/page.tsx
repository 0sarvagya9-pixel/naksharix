import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Lo Shu Grid Calculator | Missing & Repeated Numbers | Naksharix", description: "Calculate Lo Shu Grid missing, present, and repeated numbers from date of birth.", path: "/free-calculators/lo-shu-grid-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="lo-shu" />; }

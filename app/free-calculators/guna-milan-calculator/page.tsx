import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Guna Milan Calculator | Ashtakoot Score | Naksharix", description: "Calculate focused Guna Milan and Ashtakoot score from bride and groom birth details.", path: "/free-calculators/guna-milan-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="guna-milan" />; }

import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Nadi Dosha Calculator | Kundli Matching | Naksharix", description: "Check focused Nadi score and Nadi Dosha guidance from bride and groom birth details.", path: "/free-calculators/nadi-dosha-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="nadi-dosha" />; }

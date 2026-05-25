import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Bhakoot Calculator | Kundli Matching | Naksharix", description: "Check focused Bhakoot score and Moon-sign distance guidance for Kundli matching.", path: "/free-calculators/bhakoot-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="bhakoot" />; }

import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Marriage Suitability Calculator | Kundli Matching Guidance | Naksharix", description: "Review focused marriage suitability guidance from existing Naksharix Kundli matching calculations.", path: "/free-calculators/marriage-suitability-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="marriage-suitability" />; }

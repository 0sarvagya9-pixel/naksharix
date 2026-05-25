import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Free Yoga Calculator | Vedic Kundli Yogas | Naksharix", description: "Review focused Vedic Kundli yoga indicators from complete birth details without exaggerated claims.", path: "/free-calculators/yoga-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="yoga" />; }

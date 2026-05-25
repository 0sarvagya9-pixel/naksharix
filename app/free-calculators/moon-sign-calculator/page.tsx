import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Free Moon Sign Calculator | Find Your Chandra Rashi | Naksharix", description: "Find your Moon Sign or Chandra Rashi from complete birth details with focused emotional guidance.", path: "/free-calculators/moon-sign-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="moon-sign" />; }

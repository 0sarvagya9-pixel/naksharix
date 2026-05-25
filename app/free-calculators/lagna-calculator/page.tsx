import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Free Lagna Calculator | Find Your Ascendant | Naksharix", description: "Find your Vedic Lagna or Ascendant from complete birth details with focused personality guidance.", path: "/free-calculators/lagna-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="lagna" />; }

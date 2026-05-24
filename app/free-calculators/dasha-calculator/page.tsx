import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Free Dasha Calculator | Vimshottari Mahadasha & Antardasha | Naksharix",
  description: "Calculate your current Vimshottari Mahadasha and Antardasha using birth details and get focused Dasha guidance from Naksharix.",
  path: "/free-calculators/dasha-calculator",
  keywords: ["Dasha Calculator", "Vimshottari Dasha", "Mahadasha", "Antardasha", "Naksharix"]
});

export default function DashaCalculatorPage() {
  return <FocusedCalculatorContent kind="dasha" />;
}

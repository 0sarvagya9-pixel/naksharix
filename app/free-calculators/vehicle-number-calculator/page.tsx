import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Vehicle Number Numerology Calculator | Naksharix",
  description: "Check vehicle number numerology compatibility with your name, date of birth, Moolank, Bhagyank, and Lo Shu pattern.",
  path: "/free-calculators/vehicle-number-calculator",
  keywords: ["Vehicle Number Numerology", "Vehicle Number Calculator", "Lo Shu", "Naksharix"]
});

export default function VehicleNumberCalculatorPage() {
  return <FocusedCalculatorContent kind="vehicle" />;
}

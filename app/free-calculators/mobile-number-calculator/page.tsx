import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Mobile Number Numerology Calculator | Naksharix",
  description: "Check mobile number numerology compatibility with your name, date of birth, Moolank, Bhagyank, Name Number, and Lo Shu pattern.",
  path: "/free-calculators/mobile-number-calculator",
  keywords: ["Mobile Number Numerology", "Mobile Number Calculator", "Name Number", "Lo Shu", "Naksharix"]
});

export default function MobileNumberCalculatorPage() {
  return <FocusedCalculatorContent kind="mobile" />;
}

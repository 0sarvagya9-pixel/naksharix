import type { Metadata } from "next";
import { FreeCalculatorsContent } from "@/components/free-calculators-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Free Astrology Calculators | Kundli, Numerology, Lo Shu, Match Making | Naksharix",
  description: "Use Naksharix free astrology calculators for Kundli, Match Making, Numerology, Lo Shu Grid, Name Number, Mobile Number, Vehicle Number, Tarot, and more.",
  path: "/free-calculators",
  keywords: ["Free Astrology Calculators", "Kundli Calculator", "Numerology Calculator", "Lo Shu Grid", "Match Making"]
});

export default function FreeCalculatorsPage() {
  return <FreeCalculatorsContent />;
}

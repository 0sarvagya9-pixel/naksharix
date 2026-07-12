import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { LegalCurrentPage } from "@/components/legal-current-page";

export const metadata: Metadata = seo({
  title: "About Naksharix - Vedic Astrology Platform",
  description: "Learn about Naksharix, a digital Vedic astrology platform for Kundli, Panchang, horoscope, numerology, tarot, reports, and consultations.",
  path: "/about",
  keywords: ["About Naksharix", "Vedic Astrology Platform", "Digital Astrology Reports"]
});

export default function AboutPage() {
  return <LegalCurrentPage page="about" />;
}

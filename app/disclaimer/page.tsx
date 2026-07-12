import type { Metadata } from "next";
import { LegalCurrentPage } from "@/components/legal-current-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Disclaimer - Naksharix",
  description: "Naksharix astrology, numerology, tarot, reports, remedies, and consultations are for reflection and general guidance, not professional advice.",
  path: "/disclaimer",
  keywords: ["Naksharix Disclaimer", "Astrology Disclaimer", "Consultation Disclaimer"]
});

export default function DisclaimerPage() {
  return <LegalCurrentPage page="disclaimer" />;
}

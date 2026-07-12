import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal-policy-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Disclaimer - Naksharix",
  description:
    "Naksharix astrology, numerology, tarot, reports, and consultations are for spiritual reflection and general guidance, not professional or emergency advice.",
  path: "/disclaimer",
  keywords: ["Naksharix Disclaimer", "Astrology Disclaimer", "Tarot Disclaimer", "Consultation Disclaimer"],
});

export default function DisclaimerPage() {
  return <LegalPolicyPage page="disclaimer" />;
}

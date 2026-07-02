import type { Metadata } from "next";
import { LegalTrustPage } from "@/components/legal-trust-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Terms & Conditions - Naksharix",
    description: "Read the Naksharix terms for responsible use of astrology, numerology, tarot, matching, reports, and AI guidance.",
    path: "/terms-and-conditions",
    keywords: ["Naksharix Terms", "Astrology Terms", "AI Guidance Terms"]
  }),
  robots: { index: true, follow: true }
};

export default function TermsAndConditionsPage() {
  return <LegalTrustPage page="terms" />;
}

import type { Metadata } from "next";
import { LegalTrustPage } from "@/components/legal-trust-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Terms and Conditions - Naksharix",
  description: "Read the Naksharix terms for responsible use of astrology, numerology, tarot, matching, reports, and reflective guidance.",
  path: "/terms",
  keywords: ["Naksharix Terms", "Astrology Terms"]
});

export default function TermsPage() {
  return <LegalTrustPage page="terms" />;
}

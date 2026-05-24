import type { Metadata } from "next";
import { LegalTrustPage } from "@/components/legal-trust-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Disclaimer - Naksharix",
  description: "Naksharix astrology, numerology, tarot, and AI guidance are for reflection and general guidance, not professional advice.",
  path: "/disclaimer",
  keywords: ["Naksharix Disclaimer", "Astrology Disclaimer", "AI Astrology Safety"]
});

export default function DisclaimerPage() {
  return <LegalTrustPage page="disclaimer" />;
}

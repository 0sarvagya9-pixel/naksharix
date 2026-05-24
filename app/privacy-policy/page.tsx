import type { Metadata } from "next";
import { LegalTrustPage } from "@/components/legal-trust-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Privacy Policy - Naksharix",
  description: "Read how Naksharix handles birth details, AI questions, local preferences, support data, and privacy contact requests.",
  path: "/privacy-policy",
  keywords: ["Naksharix Privacy Policy", "Astrology Privacy", "AI Astrology Privacy"]
});

export default function PrivacyPolicyPage() {
  return <LegalTrustPage page="privacy" />;
}

import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal-policy-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Privacy Policy - Naksharix",
  description:
    "Read how Naksharix handles account data, birth details, saved reports, consultation records, Razorpay payment references, cookies, and deletion requests.",
  path: "/privacy-policy",
  keywords: ["Naksharix Privacy Policy", "Birth Data Privacy", "Razorpay Payment Privacy", "Astrology Consultation Privacy"],
});

export default function PrivacyPolicyPage() {
  return <LegalPolicyPage page="privacy" />;
}

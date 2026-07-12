import type { Metadata } from "next";
import { LegalCurrentPage } from "@/components/legal-current-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Privacy Policy - Naksharix",
  description: "Read how Naksharix handles account data, birth details, saved reports, consultations, Razorpay payment metadata, cookies, and privacy requests.",
  path: "/privacy-policy",
  keywords: ["Naksharix Privacy Policy", "Astrology Privacy", "Razorpay Privacy"]
});

export default function PrivacyPolicyPage() {
  return <LegalCurrentPage page="privacy" />;
}

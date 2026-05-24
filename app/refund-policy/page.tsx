import type { Metadata } from "next";
import { LegalTrustPage } from "@/components/legal-trust-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Refund and Cancellation Policy - Naksharix",
  description: "Read the current Naksharix refund and cancellation policy while automatic paid reports and payment automation are not active.",
  path: "/refund-policy",
  keywords: ["Naksharix Refund Policy", "Astrology Refund", "Cancellation Policy"]
});

export default function RefundPolicyPage() {
  return <LegalTrustPage page="refund" />;
}

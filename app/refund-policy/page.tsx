import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal-policy-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Refund and Cancellation Policy - Naksharix",
  description:
    "Read how Naksharix reviews duplicate or failed payments, digital-report delivery issues, consultation cancellations, reschedules, and eligible refunds.",
  path: "/refund-policy",
  keywords: ["Naksharix Refund Policy", "Digital Report Refund", "Consultation Cancellation", "Razorpay Payment Support"],
});

export default function RefundPolicyPage() {
  return <LegalPolicyPage page="refund" />;
}

import type { Metadata } from "next";
import { LegalCurrentPage } from "@/components/legal-current-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Refund and Cancellation Policy - Naksharix",
  description: "Read the Naksharix refund and cancellation policy for digital premium reports, duplicate or failed payments, and consultation bookings.",
  path: "/refund-policy",
  keywords: ["Naksharix Refund Policy", "Digital Report Refund", "Consultation Cancellation"]
});

export default function RefundPolicyPage() {
  return <LegalCurrentPage page="refund" />;
}

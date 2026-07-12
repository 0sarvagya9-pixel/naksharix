import type { Metadata } from "next";
import { LegalCurrentPage } from "@/components/legal-current-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Delivery Policy - Naksharix",
  description: "Read how Naksharix delivers premium digital reports and consultation confirmations, and the current status of physical product shipping.",
  path: "/delivery-policy",
  keywords: ["Naksharix Delivery Policy", "Digital Report Delivery", "Consultation Delivery"]
});

export default function DeliveryPolicyPage() {
  return <LegalCurrentPage page="delivery" />;
}

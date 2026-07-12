import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal-policy-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Delivery Policy - Naksharix",
    description:
      "Read how Naksharix delivers premium digital reports and consultation details, and why physical shipping remains unavailable while the shop is coming soon.",
    path: "/delivery-policy",
    keywords: ["Naksharix Delivery Policy", "Digital Report Delivery", "Consultation Delivery", "Shipping Policy"],
  }),
  robots: { index: true, follow: true },
};

export default function DeliveryPolicyPage() {
  return <LegalPolicyPage page="delivery" />;
}

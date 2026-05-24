import type { Metadata } from "next";
import { LegalTrustPage } from "@/components/legal-trust-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Contact Naksharix Support",
  description: "Contact Naksharix support at care@naksharix.com for astrology reports, kundli, AI chat, consultations, payments, and account help.",
  path: "/contact",
  keywords: ["Naksharix Contact", "Astrology Support", "care@naksharix.com"]
});

export default function ContactPage() {
  return <LegalTrustPage page="contact" />;
}

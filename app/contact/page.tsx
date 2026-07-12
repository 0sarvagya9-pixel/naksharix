import type { Metadata } from "next";
import { LegalCurrentPage } from "@/components/legal-current-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Contact Naksharix Support",
  description: "Contact Naksharix support at care@naksharix.com for accounts, reports, consultations, payments, refunds, and privacy requests.",
  path: "/contact",
  keywords: ["Naksharix Contact", "Astrology Support", "care@naksharix.com"]
});

export default function ContactPage() {
  return <LegalCurrentPage page="contact" />;
}

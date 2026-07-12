import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal-policy-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Contact Naksharix Support",
  description:
    "Contact Naksharix support for account access, saved reports, Razorpay payments, consultation bookings, privacy requests, and technical help.",
  path: "/contact",
  keywords: ["Naksharix Contact", "Astrology Support", "Kundli Payment Support", "Consultation Support"],
});

export default function ContactPage() {
  return <LegalPolicyPage page="contact" />;
}

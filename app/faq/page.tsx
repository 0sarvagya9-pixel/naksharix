import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal-policy-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Frequently Asked Questions - Naksharix",
    description:
      "Find answers about Naksharix premium reports, Razorpay payments, consultation booking, saved reports, privacy, refunds, AI status, and shop status.",
    path: "/faq",
    keywords: ["Naksharix FAQ", "Kundli Payment FAQ", "Astrology Consultation FAQ", "Saved Reports Help"],
  }),
  robots: { index: true, follow: true },
};

export default function FaqPage() {
  return <LegalPolicyPage page="faq" />;
}

import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal-policy-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Terms & Conditions - Naksharix",
    description:
      "Read the Naksharix terms for accounts, astrology tools, digital reports, verified Razorpay payments, consultation bookings, and responsible use.",
    path: "/terms-and-conditions",
    keywords: ["Naksharix Terms", "Astrology Service Terms", "Digital Report Terms", "Consultation Terms"],
  }),
  robots: { index: true, follow: true },
};

export default function TermsAndConditionsPage() {
  return <LegalPolicyPage page="terms" />;
}

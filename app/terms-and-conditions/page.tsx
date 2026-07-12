import type { Metadata } from "next";
import { LegalCurrentPage } from "@/components/legal-current-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Terms & Conditions - Naksharix",
    description: "Read the terms for Naksharix astrology tools, digital reports, verified payments, and consultation booking.",
    path: "/terms-and-conditions",
    keywords: ["Naksharix Terms", "Astrology Terms", "Digital Report Terms"]
  }),
  robots: { index: true, follow: true }
};

export default function TermsAndConditionsPage() {
  return <LegalCurrentPage page="terms" />;
}

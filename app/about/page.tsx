import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal-policy-page";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "About Naksharix - Vedic Astrology Tools and Digital Reports",
  description:
    "Learn how Naksharix provides Vedic astrology tools, saved Kundli reports, verified premium access, horoscope guidance, and consultation booking.",
  path: "/about",
  keywords: ["About Naksharix", "Vedic Astrology Platform", "Digital Kundli Reports", "Astrology Consultations"],
});

export default function AboutPage() {
  return <LegalPolicyPage page="about" />;
}

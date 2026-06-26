import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { LegalTrustPage } from "@/components/legal-trust-page";

export const metadata: Metadata = seo({
  title: "About Naksharix - Vedic Astrology Platform",
  description: "Learn about Naksharix, an astrology platform combining Vedic astrology principles with modern product design for practical daily guidance.",
  path: "/about",
  keywords: ["About Naksharix", "Vedic Astrology", "Vedic Astrology Platform"]
});

export default function AboutPage() {
  return <LegalTrustPage page="about" />;
}

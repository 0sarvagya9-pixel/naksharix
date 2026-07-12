import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { PricingContent } from "@/components/pricing-content";

export const metadata: Metadata = seo({
  title: "Naksharix Services and Pricing",
  description: "Review available Naksharix free tools, premium digital reports, and astrologer consultation options. Prices are shown on the relevant report or approved astrologer page.",
  path: "/pricing",
  keywords: ["Naksharix Services", "Kundli Report Price", "Astrology Consultation Price"]
});

export default function PricingPage() {
  return <PricingContent />;
}

import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { PricingContent } from "@/components/pricing-content";

export const metadata: Metadata = seo({
  title: "Pricing - Premium Astrology Plans",
  description: "Choose Naksharix Free, Premium, or VIP plans for horoscope, kundli, numerology, tarot reading, panchang, AI reports, and consultations.",
  path: "/pricing",
  keywords: ["Astrology Subscription", "Premium Horoscope", "Paid Kundli Reports"]
});

export default function PricingPage() {
  return <PricingContent />;
}

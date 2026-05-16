import type { Metadata } from "next";
import { AstrologerShowcase, CTASection, FAQSection, FeaturedIn, FeatureGrid, HomeHero, StickyMobileCTA, Testimonials, TrustCounters } from "@/components/home-sections";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Naksharix - Premium Astrology, Horoscope, Kundli and Tarot Reading",
  description: "Unlock Your Cosmic Destiny with Naksharix, a premium astrology platform for Horoscope, Kundli, Numerology, Tarot Reading, Panchang, and AI astrologer guidance.",
  path: "/",
  keywords: ["Astrology SaaS", "AI Astrologer", "Cosmic Destiny"]
});

export default function HomePage() {
  return (
    <main className="star-field">
      <HomeHero />
      <TrustCounters />
      <FeatureGrid />
      <AstrologerShowcase />
      <CTASection />
      <Testimonials />
      <FeaturedIn />
      <FAQSection />
      <StickyMobileCTA />
    </main>
  );
}

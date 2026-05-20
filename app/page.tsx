import type { Metadata } from "next";
import { DesktopHomepageArtboard } from "@/components/homepage-artboard";
import { MobileHomeFallback } from "@/components/mobile-home-fallback";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Naksharix - Premium Astrology, Horoscope, Kundli and Tarot Reading",
  description: "Unlock Your Cosmic Destiny with Naksharix, a premium astrology platform for Horoscope, Kundli, Numerology, Tarot Reading, Panchang, and AI astrologer guidance.",
  path: "/",
  keywords: ["Astrology SaaS", "AI Astrologer", "Cosmic Destiny"]
});

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#020817]">
      <DesktopHomepageArtboard />
      <MobileHomeFallback />
    </main>
  );
}

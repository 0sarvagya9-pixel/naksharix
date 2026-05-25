import type { Metadata } from "next";
import { FeatureComingSoonContent } from "@/components/feature-coming-soon-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
  title: "Horoscope Coming Soon | Naksharix",
  description: "Naksharix horoscope experiences for daily, weekly, monthly, and yearly guidance are coming soon.",
  path: "/horoscope",
  keywords: ["Horoscope", "Daily Horoscope", "Weekly Horoscope", "Love Horoscope", "Career Horoscope"]
  }),
  robots: { index: false, follow: true }
};

export default function HoroscopePage() {
  return <FeatureComingSoonContent kind="horoscope" />;
}

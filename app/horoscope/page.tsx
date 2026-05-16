import { HoroscopePageContent } from "@/components/horoscope-page-content";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Horoscope - Daily, Weekly, Monthly and Yearly Astrology",
  description: "Get Naksharix horoscope readings for daily, weekly, monthly, yearly, love, career, finance, and health astrology.",
  path: "/horoscope",
  keywords: ["Horoscope", "Daily Horoscope", "Weekly Horoscope", "Love Horoscope", "Career Horoscope"]
});

export default function HoroscopePage() {
  return <HoroscopePageContent />;
}

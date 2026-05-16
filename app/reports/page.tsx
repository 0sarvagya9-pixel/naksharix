import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { ReportsContent } from "@/components/reports-content";

export const metadata: Metadata = seo({
  title: "Paid Astrology Reports - Naksharix",
  description: "Order premium Naksharix reports for kundli, yearly horoscope, compatibility, tarot, numerology, panchang, and AI remedies.",
  path: "/reports",
  keywords: ["Paid Kundli Report", "Premium Horoscope", "Astrology Report", "AI Yearly Report"]
});

export default function ReportsPage() {
  return <ReportsContent />;
}

import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { ReportsContent } from "@/components/reports-content";

export const metadata: Metadata = seo({
  title: "Premium Astrology Reports | Kundli, Match Making, Numerology & Career Reports",
  description: "Explore detailed astrology reports including Kundli, match making, numerology, Lo Shu, career, wealth, love, Sade Sati, Manglik, and transit reports from Naksharix.",
  path: "/reports",
  keywords: ["Premium Astrology Reports", "Kundli Report", "Match Making Report", "Numerology Report", "Lo Shu Report"]
});

export default function ReportsPage() {
  return <ReportsContent />;
}

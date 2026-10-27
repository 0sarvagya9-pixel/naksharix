import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { ReportsContent } from "@/components/reports-content";
import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";

export const metadata: Metadata = seo({
  title: "Premium Astrology Reports | Kundli, Match Making, Numerology & Career Reports",
  description: "Explore detailed astrology reports including Kundli, match making, numerology, Lo Shu, career, wealth, love, Sade Sati, Manglik, and transit reports from Naksharix.",
  path: "/reports",
  keywords: ["Premium Astrology Reports", "Kundli Report", "Match Making Report", "Numerology Report", "Lo Shu Report"]
});

export default function ReportsPage() {
  return <><EditorialServiceBanner eyebrow="CHARTS & REPORTS"
    headline="A deeper look at your cosmic story"
    caption="Explore available traditional chart, matching and numerology report topics. Availability and any applicable pricing are shown in the report workflow."
    image="/naksharix/editorial-reports.svg" imageAlt="Illustrated birth-chart report"
    link="/kundli" linkLabel="Begin with a free Kundli" />
    <ReportsContent /></>;
}

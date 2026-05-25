import type { Metadata } from "next";
import { FeatureComingSoonContent } from "@/components/feature-coming-soon-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
  title: "Consultation Coming Soon | Naksharix",
  description: "Naksharix astrology consultation booking is coming soon with safe expert onboarding, scheduling, and confirmation flow.",
  path: "/consultation",
  keywords: ["Astrology Consultation", "Astrologer Booking", "Live Astrology"]
  }),
  robots: { index: false, follow: true }
};

export default function ConsultationPage() {
  return <FeatureComingSoonContent kind="consultation" />;
}

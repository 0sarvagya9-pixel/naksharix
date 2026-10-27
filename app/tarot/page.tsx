import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { TarotPageContent } from "@/components/tarot-page-content";

export const metadata: Metadata = seo({
  title: "Tarot Reading - AI Tarot Spreads",
  description: "Experience Naksharix Tarot Reading with daily tarot, love tarot, career tarot, animated spreads, and AI interpretation.",
  path: "/tarot",
  keywords: ["Tarot Reading", "Daily Tarot", "Love Tarot", "Career Tarot", "AI Tarot"]
});

export default function TarotPage() {
  return <><EditorialServiceBanner eyebrow="TAROT EXPLORATION"
  headline="A symbolic path to reflection"
  caption="Explore traditional card symbolism and thoughtful questions. This is not a verified prediction or professional advice."
  image="/naksharix/editorial-tarot.svg" imageAlt="Original decorative tarot card illustration"
  link="/learn" linkLabel="Explore the learning library" /><TarotPageContent /></>;
}

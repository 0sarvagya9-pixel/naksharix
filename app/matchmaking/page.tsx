import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { MatchmakingContent } from "@/components/matchmaking-content";

export const metadata: Metadata = seo({
  title: "Kundli Matching - Gun Milan and Marriage Compatibility",
  description: "Use Naksharix Kundli Matching for Gun Milan, compatibility score, manglik matching, marriage prediction, and relationship analysis.",
  path: "/matchmaking",
  keywords: ["Kundli Matching", "Gun Milan", "Marriage Compatibility", "Manglik Matching"]
});

export default function MatchmakingPage() {
  return <><EditorialServiceBanner eyebrow="KUNDLI MATCHING"
  headline="Explore traditional compatibility"
  caption="Compare birth details with Guna Milan concepts and review the calculation caveats before drawing conclusions."
  image="/naksharix/editorial-kundli.svg" imageAlt="Original Vedic birth-chart geometry illustration"
  link="/kundli" linkLabel="Generate your own Kundli" /><MatchmakingContent /></>;
}

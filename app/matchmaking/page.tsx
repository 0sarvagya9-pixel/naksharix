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
  return <MatchmakingContent />;
}

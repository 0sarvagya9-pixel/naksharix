import { Section } from "@/components/section";
import { MatchmakingForm } from "@/components/matchmaking-form";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Kundli Matching - Gun Milan and Marriage Compatibility",
  description: "Use Naksharix Kundli Matching for Gun Milan, compatibility score, manglik matching, marriage prediction, and relationship analysis.",
  path: "/matchmaking",
  keywords: ["Kundli Matching", "Gun Milan", "Marriage Compatibility", "Manglik Matching"]
});

export default function MatchmakingPage() {
  return (
    <Section>
      <h1 className="font-cinzel text-4xl font-black">Kundli Matching</h1>
      <p className="mt-3 naksh-muted-text">Gun Milan, compatibility score, manglik matching, marriage prediction, relationship analysis, charts, and PDF-ready reports.</p>
      <MatchmakingForm />
    </Section>
  );
}

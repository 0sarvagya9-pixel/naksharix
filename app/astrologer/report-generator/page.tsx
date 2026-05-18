import type { Metadata } from "next";
import { AiReportGeneratorForm } from "@/components/ai-report-generator-form";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  title: "AI Report Generator - Naksharix",
  description: "Generate ethical AI-assisted astrology consultation reports with Gemini for Naksharix astrologers and consultants.",
  path: "/astrologer/report-generator"
});

export default async function AstrologerReportGeneratorPage() {
  await requireAstroRole();

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Gemini Assistant</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">AI-assisted Report Generator</h1>
        <p className="mt-3 max-w-3xl naksh-muted-text">Create polished consultation notes and report drafts. Review every output before sharing with users.</p>
        <div className="mt-8"><AiReportGeneratorForm /></div>
      </Section>
    </main>
  );
}

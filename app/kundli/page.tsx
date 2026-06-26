import { KundliForm } from "@/components/kundli-form";
import { Section } from "@/components/section";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Kundli Generator - Vedic Astrology Birth Chart",
  description: "Generate a premium Naksharix Kundli with planets, houses, lagna, navamsa, dasha, yog, dosha, manglik analysis, and panchang.",
  path: "/kundli",
  keywords: ["Kundli", "Kundli Generator", "Birth Chart", "Manglik Analysis", "Dasha"]
});

export default function KundliPage() {
  return (
    <main className="inner-page-shell star-field">
      <Section>
        <div className="inner-section rounded-3xl border border-[#E7D8BE] p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B8862E]">Provider-calculated birth chart</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#1F2933]">Kundli Generator</h1>
          <p className="mt-3 max-w-3xl text-[#6B7280]">Generate planets, houses, lagna, navamsa, dashas, yogas, doshas, manglik analysis, panchang details, and PDF-ready report data using Naksharix internal astrology engine.</p>
        </div>
        <div className="mt-8">
          <KundliForm />
        </div>
      </Section>
    </main>
  );
}

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
    <main>
      <Section>
        <h1 className="font-cinzel text-4xl font-black">Kundli Generator</h1>
        <p className="mt-3 max-w-2xl naksh-muted-text">Generate planets, houses, lagna, navamsa, dashas, yogas, doshas, manglik analysis, panchang details, and PDF-ready report data.</p>
        <div className="mt-8">
          <KundliForm />
        </div>
      </Section>
    </main>
  );
}

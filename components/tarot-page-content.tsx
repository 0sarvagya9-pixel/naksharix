"use client";

import { InteractiveTarot } from "@/components/interactive-tarot";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

export function TarotPageContent() {
  const { tr } = useLanguage();
  return (
    <main className="inner-page-shell min-h-screen">
    <Section>
      <div className="inner-section rounded-3xl border border-[#E7D8BE] p-6 md:p-8">
        <p className="font-cinzel text-sm font-semibold uppercase tracking-[0.22em] text-[#B8862E]">{tr("navTarot")}</p>
        <h1 className="mt-3 font-decorative text-4xl font-black text-[#1F2933]">{tr("tarotPageTitle")}</h1>
        <p className="mt-3 text-[#6B7280]">{tr("tarotPageSubtitle")}</p>
      </div>
      <div className="mt-8"><InteractiveTarot /></div>
    </Section>
    </main>
  );
}

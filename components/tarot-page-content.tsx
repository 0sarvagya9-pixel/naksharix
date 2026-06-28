"use client";

import { InteractiveTarot } from "@/components/interactive-tarot";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

export function TarotPageContent() {
  const { tr } = useLanguage();
  return (
    <Section className="inner-page-shell">
      <p className="font-cinzel text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{tr("navTarot")}</p>
      <h1 className="mt-3 font-decorative text-4xl font-black text-[#1b1c22]">{tr("tarotPageTitle")}</h1>
      <p className="mt-3 naksh-muted-text">{tr("tarotPageSubtitle")}</p>
      <div className="mt-8"><InteractiveTarot /></div>
    </Section>
  );
}

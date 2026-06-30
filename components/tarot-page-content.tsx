"use client";

import { InteractiveTarot } from "@/components/interactive-tarot";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

export function TarotPageContent() {
  const { tr } = useLanguage();
  return (
    <Section className="inner-page-shell">
      <div className="glass-panel rounded-3xl p-6 md:p-10">
        <p className="font-cinzel text-sm font-semibold uppercase tracking-[0.22em] text-[#c98924]">{tr("navTarot")}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black text-[#17181d]">{tr("tarotPageTitle")}</h1>
        <p className="mt-3 text-base text-[#525866]">{tr("tarotPageSubtitle")}</p>
        <div className="mt-8"><InteractiveTarot /></div>
      </div>
    </Section>
  );
}

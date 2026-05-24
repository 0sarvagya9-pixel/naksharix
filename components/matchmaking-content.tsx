"use client";

import { MatchmakingForm } from "@/components/matchmaking-form";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

export function MatchmakingContent() {
  const { tr } = useLanguage();

  return (
    <main className="inner-page-shell star-field">
      <Section>
        <div className="max-w-3xl">
          <p className="font-cinzel text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{tr("compatibilityMatch")}</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382]">{tr("matchmakingPageTitle")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 naksh-muted-text">{tr("matchmakingPageDescription")}</p>
        </div>
        <MatchmakingForm />
      </Section>
    </main>
  );
}

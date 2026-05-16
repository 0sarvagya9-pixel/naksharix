"use client";

import { InteractiveTarot } from "@/components/interactive-tarot";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

export function TarotPageContent() {
  const { tr } = useLanguage();
  return (
    <Section>
      <h1 className="font-decorative text-4xl font-black">{tr("tarotPageTitle")}</h1>
      <p className="mt-3 text-muted-foreground">{tr("tarotPageSubtitle")}</p>
      <div className="mt-8"><InteractiveTarot /></div>
    </Section>
  );
}

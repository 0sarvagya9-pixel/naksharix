"use client";

import { AstroTool } from "@/components/astro-tool";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

export function HoroscopePageContent() {
  const { tr } = useLanguage();
  return (
    <Section>
      <h1 className="font-cinzel text-4xl font-black">{tr("horoscopeTitle")}</h1>
      <p className="mt-3 text-muted-foreground">{tr("horoscopeSubtitle")}</p>
      <div className="mt-8"><AstroTool type="horoscope" /></div>
    </Section>
  );
}

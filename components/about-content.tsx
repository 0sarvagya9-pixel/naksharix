"use client";

import { Brain, Compass, HeartHandshake, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

export function AboutContent() {
  const { tr } = useLanguage();
  const values = [
    { title: tr("clarityOverFear"), copy: tr("clarityOverFearCopy"), Icon: HeartHandshake },
    { title: tr("traditionPlusTechnology"), copy: tr("traditionPlusTechnologyCopy"), Icon: Brain },
    { title: tr("usefulDailyGuidance"), copy: tr("usefulDailyGuidanceCopy"), Icon: Compass }
  ];
  const timeline = [
    [tr("foundation"), tr("foundationCopy")],
    [tr("aiLayer"), tr("aiLayerCopy")],
    [tr("commerce"), tr("commerceCopy")],
    [tr("marketplace"), tr("marketplaceCopy")]
  ];
  const roles = [tr("vedicAdvisor"), tr("aiProductAdvisor"), tr("customerCareLead")];

  return (
    <main className="star-field">
      <Section>
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{tr("aboutEyebrow")}</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black sm:text-5xl">{tr("aboutTitle")}</h1>
          <p className="mt-5 text-lg leading-8 naksh-muted-text">{tr("aboutIntro")}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {values.map(({ title, copy, Icon }) => (
            <Card key={title} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
              <CardContent className="p-6"><Icon className="h-6 w-6 text-[#FFD700]" /><h2 className="mt-5 font-cinzel text-xl font-bold">{title}</h2><p className="mt-3 text-sm leading-6 naksh-muted-text">{copy}</p></CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="glass"><CardContent className="p-6"><Sparkles className="h-6 w-6 text-[#FFD700]" /><h2 className="mt-4 font-cinzel text-2xl font-black">{tr("whyNaksharix")}</h2><p className="mt-4 leading-7 naksh-muted-text">{tr("whyNaksharixCopy1")}</p><p className="mt-4 leading-7 naksh-muted-text">{tr("whyNaksharixCopy2")}</p></CardContent></Card>
          <Card className="glass"><CardContent className="p-6"><ShieldCheck className="h-6 w-6 text-[#FFD700]" /><h2 className="mt-4 font-cinzel text-2xl font-black">{tr("ethicalDisclaimer")}</h2><p className="mt-4 leading-7 naksh-muted-text">{tr("ethicalDisclaimerCopy")}</p></CardContent></Card>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {timeline.map(([title, copy]) => <Card key={title} className="border-[#D4AF37]/20 bg-[#061D3C]/75"><CardContent className="p-5"><h2 className="font-cinzel text-lg font-bold">{title}</h2><p className="mt-3 text-sm leading-6 naksh-muted-text">{copy}</p></CardContent></Card>)}
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {roles.map((role) => <Card key={role} className="border-[#D4AF37]/20 bg-[#061D3C]/75"><CardContent className="p-6"><div className="grid h-14 w-14 place-items-center rounded-lg bg-[#D4AF37]/10"><Users className="h-6 w-6 text-[#FFD700]" /></div><h2 className="mt-4 font-cinzel text-lg font-bold">{role}</h2><p className="mt-2 text-sm naksh-muted-text">{tr("advisorPlaceholder")}</p></CardContent></Card>)}
        </div>
      </Section>
    </main>
  );
}

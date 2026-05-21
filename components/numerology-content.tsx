"use client";

import Link from "next/link";
import { Calculator, Grid3X3, Hash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

const featureCards = [
  { titleKey: "numerologyCoreNumbers", copyKey: "numerologyCoreNumbersCopy", icon: Hash },
  { titleKey: "numerologyNameVibration", copyKey: "numerologyNameVibrationCopy", icon: Sparkles },
  { titleKey: "numerologyLoShu", copyKey: "numerologyLoShuCopy", icon: Grid3X3 }
] as const;

export function NumerologyContent() {
  const { tr } = useLanguage();

  return (
    <main className="star-field bg-[#020612]">
      <Section>
        <div className="relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[radial-gradient(circle_at_78%_16%,rgba(0,245,160,0.12),transparent_24rem),radial-gradient(circle_at_10%_10%,rgba(220,169,86,0.14),transparent_22rem),linear-gradient(135deg,#0a1224,#020612_82%)] p-6 shadow-[0_24px_80px_rgba(2,6,18,0.48)] sm:p-8">
          <div className="max-w-3xl">
            <p className="font-cinzel text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{tr("navNumerology")}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{tr("numerologyTitle")}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 naksh-muted-text">{tr("numerologyDescription")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/calculators"><Calculator className="h-4 w-4" />{tr("numerologyCta")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/reports">{tr("premiumReports")}</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featureCards.map(({ titleKey, copyKey, icon: Icon }) => (
              <Card key={titleKey} className="border-[#1e293b] bg-[#0f1c3a]/88 shadow-[0_18px_60px_rgba(2,6,18,0.32)]">
                <CardContent className="p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#dca956]/10 text-[#dca956] shadow-[0_0_22px_rgba(220,169,86,0.12)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 font-cinzel text-xl font-bold text-[#ffffff]">{tr(titleKey)}</h2>
                  <p className="mt-3 text-sm leading-6 naksh-muted-text">{tr(copyKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}

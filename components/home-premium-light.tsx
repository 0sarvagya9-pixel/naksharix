import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard, SectionShell, StatusBadge, TrustNote } from "@/components/premium-light-ui";
import { Theme10Hero } from "@/components/theme10/theme10-hero";
import { Theme10PanchangCard } from "@/components/theme10/theme10-panchang-card";
import { Theme10ReportCards } from "@/components/theme10/theme10-report-cards";
import { Theme10ToolStrip } from "@/components/theme10/theme10-tool-strip";
import { Theme10TrustRow } from "@/components/theme10/theme10-trust-row";

export function HomePremiumLight() {
  return (
    <main className="overflow-hidden bg-[#FAF7F0] text-[#1F2933]">
      <Theme10Hero />
      <Theme10ToolStrip />

      <SectionShell className="grid gap-6 pt-12 lg:grid-cols-[0.92fr_1.08fr]">
        <Theme10PanchangCard />
        <PremiumCard className="bg-[linear-gradient(145deg,#FFFFFF,#FFF9F0)]">
          <StatusBadge label="Why Naksharix" tone="gold" />
          <h2 className="mt-5 font-cinzel text-4xl font-black text-[#1F2933]">Premium guidance with clear boundaries</h2>
          <p className="mt-4 text-base leading-7 text-[#6B7280]">
            Naksharix separates active tools from held modules, keeps report workflows review-based, and labels provider-calculated astrology clearly.
          </p>
          <TrustNote className="mt-6">
            Calculated using Naksharix internal astrology engine. Values may vary slightly by source. Spiritual guidance, not a promised outcome.
          </TrustNote>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Clear status labels", "Held modules stay held", "Real download checks"].map((item) => (
              <div key={item} className="flex gap-2 rounded-2xl border border-[#E7D8BE] bg-white/72 p-3 text-sm font-bold text-[#1F2933]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#0f8f6f]" />
                {item}
              </div>
            ))}
          </div>
          <Button className="mt-7" asChild>
            <Link href="/reports">
              Explore Premium Reports
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </PremiumCard>
      </SectionShell>

      <Theme10ReportCards />
      <Theme10TrustRow />

      <SectionShell className="pt-0">
        <div className="grid gap-4 rounded-[1.75rem] border border-[#E7D8BE] bg-white/76 p-5 shadow-[0_18px_54px_rgba(86,64,31,0.08)] md:grid-cols-3">
          {[
            ["Internal engine", "Kundli, Panchang and Gochar snapshot use the Naksharix provider."],
            ["Secure workflow", "Report requests, PDFs and downloads are protected by auth and status checks."],
            ["Honest hold states", "AI Astrologer, Shop and Consultation remain Coming Soon."]
          ].map(([title, copy]) => (
            <div key={title} className="flex gap-3 rounded-2xl bg-[#FFF9F0]/75 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#B8862E]" />
              <div>
                <p className="font-semibold text-[#1F2933]">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E7D8BE] bg-white/92 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" asChild>
            <Link href="/kundli">Kundli</Link>
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link href="/free-calculators">Tools</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/reports">Reports</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

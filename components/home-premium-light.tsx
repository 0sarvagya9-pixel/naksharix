import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { PremiumCard, SectionShell, StatusBadge, TrustNote } from "@/components/premium-light-ui";
import { Theme10Hero } from "@/components/theme10/theme10-hero";
import { Theme10PanchangCard } from "@/components/theme10/theme10-panchang-card";
import { Theme10ReportCards } from "@/components/theme10/theme10-report-cards";
import { Theme10ToolStrip } from "@/components/theme10/theme10-tool-strip";
import { Theme10TrustRow } from "@/components/theme10/theme10-trust-row";

export function HomePremiumLight() {
  return (
    <main className="overflow-hidden bg-[#020612] text-[#FAFAFA]">
      {/* ── Full-viewport parallax hero ── */}
      <Theme10Hero />

      {/* ── Quick-access tool strip (overlaps hero bottom) ── */}
      <Theme10ToolStrip />

      {/* ── Mid section: Panchang + brand value card ── */}
      <SectionShell className="grid gap-6 pt-12 lg:grid-cols-[0.92fr_1.08fr]">
        <Theme10PanchangCard />

        {/* Brand value glass card */}
        <PremiumCard>
          <StatusBadge label="Why Naksharix" tone="gold" />
          <h2 className="mt-5 font-cinzel text-4xl font-black text-[#FAFAFA]">
            Premium guidance with clear boundaries
          </h2>
          <p className="mt-4 text-base leading-7 text-[#94a3b8]">
            Naksharix separates active tools from held modules, keeps report workflows
            review-based, and labels provider-calculated astrology clearly.
          </p>
          <TrustNote className="mt-6">
            Calculated using Naksharix internal astrology engine. Values may vary slightly by
            source. Spiritual guidance, not a promised outcome.
          </TrustNote>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Clear status labels", "Held modules stay held", "Real download checks"].map((item) => (
              <div
                key={item}
                className="flex gap-2 rounded-2xl border border-[#D8AF66]/20 bg-[#D8AF66]/5 p-3 text-sm font-bold text-[#FAFAFA]"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#0f8f6f]" />
                {item}
              </div>
            ))}
          </div>
          <Link href="/reports" className="btn-gold mt-7 inline-flex">
            Explore Premium Reports
            <ArrowRight className="h-4 w-4" />
          </Link>
        </PremiumCard>
      </SectionShell>

      {/* ── Report cards grid ── */}
      <Theme10ReportCards />

      {/* ── Trust row ── */}
      <Theme10TrustRow />

      {/* ── Feature highlight strip ── */}
      <SectionShell className="pt-0">
        <div className="cosmic-glass grid gap-4 rounded-[1.75rem] p-5 md:grid-cols-3">
          {[
            ["Internal engine", "Kundli, Panchang and Gochar snapshot use the Naksharix provider."],
            ["Secure workflow", "Report requests, PDFs and downloads are protected by auth and status checks."],
            ["Honest hold states", "AI Astrologer, Shop and Consultation remain Coming Soon."],
          ].map(([title, copy]) => (
            <div key={title} className="flex gap-3 rounded-2xl bg-white/[0.03] p-4">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#D8AF66]" />
              <div>
                <p className="font-semibold text-[#FAFAFA]">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[#94a3b8]">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* ── Mobile sticky bottom nav ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D8AF66]/20 bg-[rgba(2,6,18,0.88)] p-3 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-3 gap-2">
          <Link href="/kundli"           className="btn-gold py-2 text-xs">Kundli</Link>
          <Link href="/free-calculators" className="btn-ghost-gold py-2 text-xs">Tools</Link>
          <Link href="/reports"          className="btn-ghost-gold py-2 text-xs">Reports</Link>
        </div>
      </div>
    </main>
  );
}

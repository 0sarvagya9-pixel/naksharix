import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Mandala / background accent blob ─────────────────────────── */
export function MandalaBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        "before:absolute before:-right-28 before:top-10 before:h-96 before:w-96 before:rounded-full",
        "before:bg-[radial-gradient(circle,rgba(216,175,102,0.12),transparent_58%)]",
        "after:absolute after:-left-20 after:bottom-0 after:h-80 after:w-80 after:rounded-full",
        "after:bg-[radial-gradient(circle,rgba(220,232,247,0.08),transparent_62%)]",
        className
      )}
    />
  );
}

/* ── Section shell ────────────────────────────────────────────── */
export function SectionShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8", className)}>
      {children}
    </section>
  );
}

/* ── Generic glass card ───────────────────────────────────────── */
export function PremiumCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "cosmic-glass rounded-2xl p-5 text-[#FAFAFA]",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ── Feature card (link) ──────────────────────────────────────── */
export function FeatureCard({
  title, copy, href, icon: Icon, badge,
}: {
  title: string;
  copy: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "cosmic-glass-interactive group block h-full rounded-2xl p-5"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#D8AF66]/30 bg-[#D8AF66]/10 text-[#D8AF66]">
          <Icon className="h-5 w-5" />
        </span>
        {badge ? <StatusBadge label={badge} tone="gold" /> : null}
      </div>
      <h3 className="mt-5 font-cinzel text-xl font-bold text-[#FAFAFA]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{copy}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#D8AF66]">
        Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/* ── Status badge ─────────────────────────────────────────────── */
export function StatusBadge({
  label,
  tone = "blue",
}: {
  label: string;
  tone?: "blue" | "gold" | "green" | "muted";
}) {
  const tones = {
    blue:  "border-[#DCE8F7]/20 bg-[#DCE8F7]/10 text-[#DCE8F7]",
    gold:  "border-[#D8AF66]/30 bg-[#D8AF66]/10 text-[#D8AF66]",
    green: "border-[#0f8f6f]/30 bg-[#0f8f6f]/10 text-[#0f8f6f]",
    muted: "border-white/10 bg-white/5 text-[#94a3b8]",
  };
  return (
    <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", tones[tone])}>
      {label}
    </span>
  );
}

/* ── Trust note ───────────────────────────────────────────────── */
export function TrustNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#D8AF66]/20 bg-[#D8AF66]/5 p-4 text-sm leading-6 text-[#94a3b8]",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ── Report CTA ───────────────────────────────────────────────── */
export function ReportCTA({
  href = "/reports",
  label = "Request Premium Report",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link href={href} className="btn-gold">
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

/* ── Empty state ──────────────────────────────────────────────── */
export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <PremiumCard className="text-center">
      <h3 className="font-cinzel text-2xl font-bold text-[#FAFAFA]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#94a3b8]">{copy}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </PremiumCard>
  );
}

/* ── Section divider ──────────────────────────────────────────── */
export function CosmicDivider() {
  return (
    <div className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-[#D8AF66]/45 to-transparent" />
  );
}

/* ── Light Hero (used on inner pages) ────────────────────────── */
export function LightHero({
  eyebrow,
  title,
  copy,
  actions,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#D8AF66]/15">
      <MandalaBackground />
      <SectionShell className="grid min-h-[calc(100vh-6rem)] items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#D8AF66]/35 bg-[#D8AF66]/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D8AF66]">
            <Sparkles className="h-4 w-4" />
            {eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl font-decorative text-5xl font-black uppercase leading-[0.95] tracking-normal text-[#FAFAFA] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#94a3b8]">{copy}</p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        <div className="relative z-10">
          <div className="relative mx-auto aspect-square max-w-[34rem] rounded-full border border-[#D8AF66]/20 bg-[radial-gradient(circle_at_50%_42%,rgba(4,12,30,0.80),rgba(2,6,18,0.95))] shadow-[0_28px_90px_rgba(0,0,0,0.55),0_0_60px_rgba(216,175,102,0.10)]">
            <div className="absolute inset-10 rounded-full border border-[#D8AF66]/25" />
            <div className="absolute inset-20 rounded-full border border-[#D8AF66]/15" />
            <div className="absolute left-1/2 top-1/2 grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#D8AF66]/10 text-5xl font-black text-[#D8AF66] shadow-[0_0_40px_rgba(216,175,102,0.30)] ring-1 ring-[#D8AF66]/25">
              ॐ
            </div>
            {[
              { label: "Kundli",   pos: "absolute left-8 top-16" },
              { label: "Panchang", pos: "absolute right-8 top-28" },
              { label: "Reports",  pos: "absolute bottom-16 left-14" },
              { label: "Transits", pos: "absolute bottom-20 right-12" },
            ].map(({ label, pos }) => (
              <div
                key={label}
                className={`${pos} cosmic-glass rounded-2xl px-4 py-3 text-sm font-semibold text-[#FAFAFA]`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    </section>
  );
}

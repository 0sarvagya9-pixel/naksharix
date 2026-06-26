import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MandalaBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        "before:absolute before:-right-28 before:top-10 before:h-96 before:w-96 before:rounded-full before:border before:border-[#D8AF66]/20 before:bg-[radial-gradient(circle,rgba(247,234,211,0.55),transparent_58%)]",
        "after:absolute after:-left-20 after:bottom-0 after:h-80 after:w-80 after:rounded-full after:border after:border-[#DCE8F7]/70 after:bg-[radial-gradient(circle,rgba(220,232,247,0.56),transparent_62%)]",
        className
      )}
    />
  );
}

export function SectionShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8", className)}>{children}</section>;
}

export function PremiumCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-[#E7D8BE] bg-white/88 p-5 text-[#1F2933] shadow-[0_18px_54px_rgba(86,64,31,0.10)] backdrop-blur", className)}>
      {children}
    </div>
  );
}

export function LightHero({ eyebrow, title, copy, actions }: { eyebrow: string; title: string; copy: string; actions?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-[#E7D8BE] bg-[linear-gradient(135deg,#FAF7F0_0%,#FFF9F0_52%,#DCE8F7_140%)]">
      <MandalaBackground />
      <SectionShell className="grid min-h-[calc(100vh-6rem)] items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#D8AF66]/45 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#B8862E] shadow-sm">
            <Sparkles className="h-4 w-4" />
            {eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl font-decorative text-5xl font-black uppercase leading-[0.95] tracking-normal text-[#1F2933] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B7280]">{copy}</p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        <div className="relative z-10">
          <div className="relative mx-auto aspect-square max-w-[34rem] rounded-full border border-[#E7D8BE] bg-[radial-gradient(circle_at_50%_42%,#FFFFFF_0%,#FFF9F0_42%,#DCE8F7_100%)] shadow-[0_28px_90px_rgba(86,64,31,0.12)]">
            <div className="absolute inset-10 rounded-full border border-[#D8AF66]/35" />
            <div className="absolute inset-20 rounded-full border border-[#DCE8F7]" />
            <div className="absolute left-1/2 top-1/2 grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-5xl font-black text-[#B8862E] shadow-[0_18px_50px_rgba(86,64,31,0.13)]">
              ॐ
            </div>
            <div className="absolute left-8 top-16 rounded-2xl border border-[#E7D8BE] bg-white/82 px-4 py-3 text-sm font-semibold text-[#1F2933] shadow-sm">Kundli</div>
            <div className="absolute right-8 top-28 rounded-2xl border border-[#E7D8BE] bg-white/82 px-4 py-3 text-sm font-semibold text-[#1F2933] shadow-sm">Panchang</div>
            <div className="absolute bottom-16 left-14 rounded-2xl border border-[#E7D8BE] bg-white/82 px-4 py-3 text-sm font-semibold text-[#1F2933] shadow-sm">Reports</div>
            <div className="absolute bottom-20 right-12 rounded-2xl border border-[#E7D8BE] bg-white/82 px-4 py-3 text-sm font-semibold text-[#1F2933] shadow-sm">Transits</div>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}

export function FeatureCard({ title, copy, href, icon: Icon, badge }: { title: string; copy: string; href: string; icon: LucideIcon; badge?: string }) {
  return (
    <Link href={href} className="group block h-full rounded-2xl border border-[#E7D8BE] bg-white/86 p-5 shadow-[0_18px_54px_rgba(86,64,31,0.08)] transition hover:-translate-y-1 hover:border-[#D8AF66] hover:shadow-[0_24px_70px_rgba(86,64,31,0.13)]">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#D8AF66]/40 bg-[#F7EAD3]/70 text-[#B8862E]">
          <Icon className="h-5 w-5" />
        </span>
        {badge ? <StatusBadge label={badge} tone="gold" /> : null}
      </div>
      <h3 className="mt-5 font-cinzel text-xl font-bold text-[#1F2933]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{copy}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#B8862E]">
        Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function StatusBadge({ label, tone = "blue" }: { label: string; tone?: "blue" | "gold" | "green" | "muted" }) {
  const tones = {
    blue: "border-[#DCE8F7] bg-[#DCE8F7]/70 text-[#315579]",
    gold: "border-[#D8AF66]/35 bg-[#F7EAD3]/70 text-[#B8862E]",
    green: "border-[#0f8f6f]/20 bg-[#0f8f6f]/10 text-[#0f8f6f]",
    muted: "border-[#E7D8BE] bg-white/70 text-[#6B7280]"
  };
  return <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", tones[tone])}>{label}</span>;
}

export function TrustNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-[#E7D8BE] bg-[#FFF9F0]/80 p-4 text-sm leading-6 text-[#6B7280]", className)}>{children}</div>;
}

export function ReportCTA({ href = "/reports", label = "Request Premium Report" }: { href?: string; label?: string }) {
  return (
    <Button asChild>
      <Link href={href}>
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}

export function EmptyState({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) {
  return (
    <PremiumCard className="text-center">
      <h3 className="font-cinzel text-2xl font-bold text-[#1F2933]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6B7280]">{copy}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </PremiumCard>
  );
}

export function CosmicDivider() {
  return <div className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-[#D8AF66]/60 to-transparent" />;
}

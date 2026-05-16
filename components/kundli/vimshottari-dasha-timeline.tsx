"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Clock3, Sparkles } from "lucide-react";
import { translatePlanet, type ChartLanguage } from "@/lib/kundli/chart-mapping";
import { cn } from "@/lib/utils";

export type DashaTimelinePeriod = {
  planet?: string;
  startDate?: string;
  endDate?: string;
  startsAt?: string;
  endsAt?: string;
  period?: string;
  antardashas?: DashaTimelinePeriod[];
  children?: DashaTimelinePeriod[];
};

export function VimshottariDashaTimeline({
  mahadashas,
  language
}: {
  mahadashas?: DashaTimelinePeriod[];
  language: ChartLanguage;
}) {
  const labels = dashaLabels(language);
  const periods = useMemo(() => normalizePeriods(mahadashas), [mahadashas]);
  const [open, setOpen] = useState<Set<string>>(() => new Set(periods.slice(0, 1).map((period) => period.id)));

  function toggle(id: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-200/20 bg-[radial-gradient(circle_at_16%_8%,rgba(245,190,88,0.14),transparent_24rem),linear-gradient(135deg,rgba(28,10,52,0.88),rgba(8,4,19,0.96))] p-5 shadow-[0_24px_80px_rgba(5,2,14,0.3)]">
      <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full border border-amber-200/15" />
      <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-cinzel text-xs uppercase tracking-[0.28em] text-amber-200/75">{labels.engine}</p>
          <h3 className="font-cinzel text-2xl font-black text-amber-50">{labels.title}</h3>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-amber-200/60 via-purple-300/25 to-transparent sm:max-w-xs" />
      </div>

      {periods.length ? (
        <div className="relative grid gap-3">
          <div className="absolute bottom-2 left-[1.05rem] top-2 w-px bg-gradient-to-b from-amber-200/45 via-purple-300/25 to-transparent" />
          {periods.map((period) => (
            <DashaRow key={period.id} period={period} labels={labels} open={open} onToggle={toggle} level={0} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200/15 bg-white/[0.045] p-5 text-sm text-muted-foreground">
          {labels.notAvailable}
        </div>
      )}
    </section>
  );
}

function DashaRow({
  period,
  labels,
  open,
  onToggle,
  level
}: {
  period: NormalizedDasha;
  labels: ReturnType<typeof dashaLabels>;
  open: Set<string>;
  onToggle: (id: string) => void;
  level: number;
}) {
  const expanded = open.has(period.id);
  const hasChildren = period.children.length > 0;
  const progress = getPeriodProgress(period.startDate, period.endDate);

  return (
    <div className={cn("relative", level > 0 && "ml-8")}>
      <div className="relative z-10 flex gap-3">
        <span className={cn("mt-3 grid h-9 w-9 shrink-0 place-items-center rounded-full border text-amber-100 shadow-[0_0_22px_rgba(245,190,88,0.12)]", level === 0 ? "border-amber-200/35 bg-amber-200/12" : "border-purple-300/25 bg-purple-300/10")}>
          {level === 0 ? <Sparkles className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1 rounded-xl border border-amber-200/15 bg-white/[0.045] p-4 backdrop-blur transition hover:border-amber-200/35 hover:bg-white/[0.065]">
          <button
            type="button"
            onClick={() => hasChildren && onToggle(period.id)}
            className="flex w-full items-start justify-between gap-3 text-left"
            aria-expanded={hasChildren ? expanded : undefined}
          >
            <span className="min-w-0">
              <span className="block font-cinzel text-lg font-bold text-amber-100">
                {translatePlanet(period.planet, labels.language) || labels.unknownPlanet}
              </span>
              <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {level === 0 ? labels.mahadasha : labels.antardasha}
              </span>
            </span>
            {hasChildren ? (
              <span className="mt-1 rounded-full border border-amber-200/20 bg-black/20 p-1 text-amber-100">
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
            ) : null}
          </button>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {formatDate(period.startDate, labels.language)} - {formatDate(period.endDate, labels.language)}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-200 via-purple-300 to-amber-100" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-100">
              {progress}% {labels.elapsed}
            </span>
          </div>
          {hasChildren && expanded ? (
            <div className="mt-4 grid gap-3">
              {period.children.map((child) => (
                <DashaRow key={child.id} period={child} labels={labels} open={open} onToggle={onToggle} level={Math.min(level + 1, 4)} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type NormalizedDasha = {
  id: string;
  planet?: string;
  startDate?: string;
  endDate?: string;
  children: NormalizedDasha[];
};

function normalizePeriods(periods: DashaTimelinePeriod[] | undefined, prefix = "dasha"): NormalizedDasha[] {
  return (periods ?? []).map((period, index) => {
    const startDate = period.startDate ?? period.startsAt ?? parsePeriodDate(period.period, 0);
    const endDate = period.endDate ?? period.endsAt ?? parsePeriodDate(period.period, 1);
    const id = `${prefix}-${index}-${period.planet ?? "planet"}-${startDate ?? "start"}`;
    return {
      id,
      planet: period.planet,
      startDate,
      endDate,
      children: normalizePeriods(period.antardashas ?? period.children, id)
    };
  });
}

function parsePeriodDate(period: string | undefined, index: 0 | 1) {
  if (!period) return undefined;
  const parts = period.split(/\s+to\s+|–/i).map((part) => part.trim()).filter(Boolean);
  return parts[index];
}

function getPeriodProgress(start: string | undefined, end: string | undefined) {
  const startTime = start ? new Date(start).getTime() : Number.NaN;
  const endTime = end ? new Date(end).getTime() : Number.NaN;
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) return 0;
  const now = Date.now();
  const raw = ((now - startTime) / (endTime - startTime)) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function formatDate(value: string | undefined, language: ChartLanguage) {
  if (!value) return dashaLabels(language).notAvailable;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function dashaLabels(language: ChartLanguage) {
  if (language === "hi") {
    return {
      language,
      engine: "दशा इंजन",
      title: "विंशोत्तरी दशा टाइमलाइन",
      mahadasha: "महादशा",
      antardasha: "अंतर्दशा",
      elapsed: "बीता",
      unknownPlanet: "ग्रह",
      notAvailable: "उपलब्ध नहीं"
    };
  }
  if (language === "hinglish") {
    return {
      language,
      engine: "Dasha Engine",
      title: "Vimshottari Dasha Timeline",
      mahadasha: "Mahadasha",
      antardasha: "Antardasha",
      elapsed: "elapsed",
      unknownPlanet: "Grah",
      notAvailable: "Available nahi hai"
    };
  }
  return {
    language,
    engine: "Dasha Engine",
    title: "Vimshottari Dasha Timeline",
    mahadasha: "Mahadasha",
    antardasha: "Antardasha",
    elapsed: "elapsed",
    unknownPlanet: "Planet",
    notAvailable: "Not available"
  };
}

"use client";

import { useMemo, useState } from "react";
import { ChartTooltip } from "@/components/kundli/chart-tooltip";
import {
  chartLabels,
  normalizeNorthIndianChart,
  type ChartCell,
  type ChartLanguage,
  type NorthIndianChartData
} from "@/lib/kundli/chart-mapping";
import { cn } from "@/lib/utils";

export function NorthIndianChart({ data, className }: { data: NorthIndianChartData; className?: string }) {
  const [activeCell, setActiveCell] = useState<ChartCell | null>(null);
  const [tooltipPoint, setTooltipPoint] = useState({ x: 0, y: 0 });
  const cells = useMemo(() => normalizeNorthIndianChart(data), [data]);
  const labels = chartLabels(data.language);
  const title = chartTitle(data.chartType, data.language);
  const hasCalculatedChart = data.houses.length >= 12;

  function showTooltip(cell: ChartCell, event: React.PointerEvent<SVGPolygonElement | SVGGElement>) {
    setActiveCell(cell);
    setTooltipPoint({ x: event.clientX, y: event.clientY });
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-amber-200/20 bg-[radial-gradient(circle_at_16%_0%,rgba(245,190,88,0.16),transparent_24rem),linear-gradient(135deg,rgba(25,8,48,0.92),rgba(9,4,19,0.98))] p-4 shadow-[0_22px_70px_rgba(5,2,14,0.34)]",
        className
      )}
      onPointerLeave={() => setActiveCell(null)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-cinzel text-xl font-black text-amber-50">{title}</p>
          <p className="mt-1 text-xs text-amber-100/75">
            {labels.sign}: <span className="font-semibold text-amber-100">{translatedAscendant(data.ascendantSign, data.language)}</span>
          </p>
        </div>
        <span className="rounded-full border border-amber-200/30 bg-amber-200/12 px-3 py-1 text-xs font-bold text-amber-100">
          {data.chartType}
        </span>
      </div>

      {!hasCalculatedChart ? (
        <div className="grid min-h-[18rem] place-items-center rounded-xl border border-amber-200/20 bg-white/[0.04] p-6 text-center">
          <p className="max-w-xs text-sm font-semibold text-amber-100">{chartUnavailable(data.chartType, data.language)}</p>
        </div>
      ) : (
        <div className="relative mx-auto aspect-square max-w-[32rem] rounded-xl border border-[#3d2c19]/30 bg-[#fff4d8] p-2 shadow-[inset_0_0_0_1px_rgba(100,61,21,0.16),inset_0_18px_60px_rgba(118,72,21,0.09)]">
          <svg viewBox="0 0 400 400" className="h-full w-full touch-manipulation select-none" aria-label={`${title} North Indian chart`}>
            <defs>
              <filter id={`chartActive-${data.chartType}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id={`paperDots-${data.chartType}`} width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.8" fill="rgba(92,54,19,0.12)" />
              </pattern>
            </defs>

            <rect x="18" y="18" width="364" height="364" rx="8" fill="#fff7e6" stroke="#3f2a14" strokeWidth="2.1" />
            <rect x="18" y="18" width="364" height="364" rx="8" fill={`url(#paperDots-${data.chartType})`} opacity="0.55" />

            {cells.map((cell) => {
              const active = activeCell?.house === cell.house;
              return (
                <polygon
                  key={`${data.chartType}-hit-${cell.house}`}
                  points={cell.points}
                  tabIndex={0}
                  role="button"
                  aria-label={`${labels.house} ${cell.house}, ${labels.sign} ${cell.signLabel}`}
                  fill={active ? "rgba(245,190,88,0.22)" : "rgba(255,255,255,0.001)"}
                  stroke={active ? "#9a5b16" : "transparent"}
                  strokeWidth={active ? 1.6 : 0}
                  className="cursor-pointer outline-none transition duration-200 focus:stroke-[#9a5b16]"
                  filter={active ? `url(#chartActive-${data.chartType})` : undefined}
                  onPointerMove={(event) => showTooltip(cell, event)}
                  onPointerDown={(event) => showTooltip(cell, event)}
                  onFocus={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    setActiveCell(cell);
                    setTooltipPoint({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                  }}
                  onBlur={() => setActiveCell(null)}
                />
              );
            })}

            <g stroke="#2b1c10" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M18 18 H382 V382 H18 Z" />
              <path d="M200 18 L382 200 L200 382 L18 200 Z" />
              <path d="M18 18 L382 382 M382 18 L18 382" />
              <path d="M18 200 H382 M200 18 V382" opacity="0.72" />
              <path d="M108 120 L200 212 L292 120 M108 280 L200 188 L292 280" opacity="0.62" />
            </g>

            {cells.map((cell) => (
              <g key={`${data.chartType}-${cell.house}`} className="pointer-events-none">
                <text x={cell.labelX} y={cell.labelY - 24} textAnchor="middle" className="fill-[#6b4a21] font-cinzel text-[10px] font-black">
                  {cell.signShortLabel}
                </text>
                {cell.planetLabels.slice(0, 3).map((planet, index) => (
                  <text key={`${cell.house}-${planet}-${index}`} x={cell.labelX} y={cell.labelY - 4 + index * 15} textAnchor="middle" className="fill-[#7c2d12] text-[13px] font-black">
                    {planet}
                  </text>
                ))}
                {cell.planetLabels.length > 3 ? (
                  <text x={cell.labelX} y={cell.labelY + 45} textAnchor="middle" className="fill-[#6b4a21] text-[10px] font-semibold">
                    +{cell.planetLabels.length - 3}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>
        </div>
      )}
      <ChartTooltip cell={activeCell} language={data.language} x={tooltipPoint.x} y={tooltipPoint.y} />
    </section>
  );
}

function chartUnavailable(chartType: "D1" | "D9", language: ChartLanguage) {
  if (chartType === "D9") {
    if (language === "hi") return "D9 गणना अभी उपलब्ध नहीं है।";
    if (language === "hinglish") return "D9 calculation abhi available nahi hai.";
    return "D9 calculation not available yet.";
  }
  if (language === "hi") return "गणना अभी उपलब्ध नहीं है।";
  if (language === "hinglish") return "Calculation abhi available nahi hai.";
  return "Calculation not available yet.";
}

function chartTitle(chartType: "D1" | "D9", language: ChartLanguage) {
  if (chartType === "D1") {
    if (language === "hi") return "लग्न चक्र";
    if (language === "hinglish") return "Lagna D1";
    return "Lagna D1";
  }
  if (language === "hi") return "नवांश चक्र";
  if (language === "hinglish") return "Navamsha D9";
  return "Navamsha D9";
}

function translatedAscendant(sign: string, language: ChartLanguage) {
  const temporary = normalizeNorthIndianChart({ chartType: "D1", ascendantSign: sign, language, houses: [] })[0];
  return temporary?.signLabel || sign;
}

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
        "relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.22)] shadow-[0_18px_55px_rgba(0,0,0,0.28)] p-4",
        className
      )}
      style={{
        background: "rgba(8,14,30,0.78)",
        backdropFilter: "blur(10px) saturate(130%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 18px 55px rgba(0,0,0,0.28)"
      }}
      onPointerLeave={() => setActiveCell(null)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-cinzel text-xl font-black text-[#fffaf0]">{title}</p>
          <p className="mt-1 text-xs text-[rgba(255,255,255,0.70)]">
            {labels.sign}: <span className="font-semibold text-[#f2c56b]">{translatedAscendant(data.ascendantSign, data.language)}</span>
          </p>
        </div>
        <span className="rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.06)] px-3 py-1 text-xs font-bold text-[#f2c56b]">
          {data.chartType}
        </span>
      </div>

      {!hasCalculatedChart ? (
        <div className="grid min-h-[18rem] place-items-center rounded-xl border border-[#1e293b] bg-[#0f1c3a]/85 p-6 text-center">
          <p className="max-w-xs text-sm font-semibold text-[#f3d382]">{chartUnavailable(data.chartType, data.language)}</p>
        </div>
      ) : (
        <div className="relative mx-auto aspect-[10/7] max-w-[38rem] rounded-xl border border-[#1e293b] bg-[#0f1c3a] p-2 shadow-[inset_0_0_0_1px_rgba(220,169,86,0.08),inset_0_18px_60px_rgba(0,0,0,0.2)]">
          <svg viewBox="0 0 600 420" className="h-full w-full touch-manipulation select-none" aria-label={`${title} North Indian chart`}>
            <defs>
              <filter id={`chartActive-${data.chartType}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id={`paperDots-${data.chartType}`} width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.8" fill="rgba(220,169,86,0.12)" />
              </pattern>
            </defs>

            <rect x="96" y="6" width="408" height="408" rx="4" fill="#0a1224" stroke="#dca956" strokeOpacity="0.42" strokeWidth="2.2" />
            <rect x="96" y="6" width="408" height="408" rx="4" fill={`url(#paperDots-${data.chartType})`} opacity="0.42" />

            {cells.map((cell) => {
              const active = activeCell?.house === cell.house;
              return (
                <polygon
                  key={`${data.chartType}-hit-${cell.house}`}
                  points={cell.points}
                  tabIndex={0}
                  role="button"
                  aria-label={`${labels.house} ${cell.house}, ${labels.sign} ${cell.signLabel}`}
                  fill={active ? "rgba(220,169,86,0.22)" : "rgba(15,28,58,0.9)"}
                  stroke={active ? "#dca956" : "#1e293b"}
                  strokeWidth={active ? 2.1 : 1.45}
                  className="cursor-pointer outline-none transition duration-200 focus:stroke-[#dca956]"
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

            {cells.map((cell) => {
              const visiblePlanets = cell.planetLabels.slice(0, cell.maxLines);
              const overflowCount = Math.max(0, cell.planetLabels.length - visiblePlanets.length);
              const rows = visiblePlanets.length + (overflowCount ? 1 : 0);
              const startY = cell.planetY - ((Math.max(rows, 1) - 1) * cell.planetLineHeight) / 2;
              return (
                <g key={`${data.chartType}-${cell.house}`} className="pointer-events-none">
                  <text
                    x={cell.signX}
                    y={cell.signY}
                    textAnchor="middle"
                    className="fill-[#f3d382] font-cinzel text-[10px] font-black sm:text-[12px]"
                    paintOrder="stroke"
                    stroke="#020612"
                    strokeWidth="2"
                  >
                    {cell.signShortLabel}
                  </text>
                  {visiblePlanets.map((planet, index) => (
                    <text
                      key={`${cell.house}-${planet}-${index}`}
                      x={cell.planetX}
                      y={startY + index * cell.planetLineHeight}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-[#ffffff] text-[12px] font-black sm:text-[14px]"
                      paintOrder="stroke"
                      stroke="#020612"
                      strokeWidth="2.4"
                    >
                      {planet}
                    </text>
                  ))}
                  {overflowCount ? (
                    <text
                      x={cell.planetX}
                      y={startY + visiblePlanets.length * cell.planetLineHeight}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-[#f3d382] text-[10px] font-black sm:text-[12px]"
                      paintOrder="stroke"
                      stroke="#020612"
                      strokeWidth="2"
                    >
                      +{overflowCount}
                    </text>
                  ) : null}
                </g>
              );
            })}
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





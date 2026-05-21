"use client";

import { chartLabels, type ChartCell, type ChartLanguage } from "@/lib/kundli/chart-mapping";
import { cn } from "@/lib/utils";

export function ChartTooltip({
  cell,
  language,
  x,
  y,
  className
}: {
  cell: ChartCell | null;
  language: ChartLanguage;
  x: number;
  y: number;
  className?: string;
}) {
  if (!cell) return null;
  const labels = chartLabels(language);

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[80] w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-[#1e293b] bg-[#0a1224]/95 p-4 text-sm shadow-[0_18px_60px_rgba(2,6,18,0.68),0_0_30px_rgba(220,169,86,0.12)] backdrop-blur-xl",
        className
      )}
      style={{
        left: `min(max(${x + 14}px, 1rem), calc(100vw - 19rem))`,
        top: `min(max(${y + 14}px, 1rem), calc(100vh - 17rem))`
      }}
      role="status"
    >
      <div className="mb-3 border-b border-[#1e293b] pb-2">
        <p className="font-cinzel text-base font-bold text-[#f3d382]">
          {labels.house} {cell.house}
        </p>
        <p className="text-xs naksh-muted-text">
          {labels.sign}: <span className="text-[#f3d382]">{cell.signLabel}</span>
          {cell.signLordLabel ? <> · {labels.signLord}: <span className="text-[#f3d382]">{cell.signLordLabel}</span></> : null}
        </p>
      </div>
      {cell.planets?.length ? (
        <div className="grid gap-2">
          {cell.planets.map((planet, index) => (
            <div key={`${cell.house}-${planet.planet}-${planet.degree ?? "na"}`} className="rounded-lg border border-[#1e293b] bg-[#0f1c3a]/85 p-2">
              <p className="font-medium text-foreground">{cell.planetFullLabels[index] ?? planet.planet}</p>
              <p className="mt-1 text-xs leading-5 naksh-muted-text">
                {typeof planet.degree === "number" ? `${labels.degree}: ${planet.degree.toFixed(2)}°` : null}
                {planet.nakshatra ? ` · ${labels.nakshatra}: ${planet.nakshatra}` : ""}
                {planet.pada ? ` · ${labels.pada}: ${planet.pada}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs naksh-muted-text">{labels.noPlanets}</p>
      )}
    </div>
  );
}

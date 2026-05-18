"use client";

import type { SwissKundliPlanet } from "@/lib/astrology/swiss-kundli";
import { cn } from "@/lib/utils";

export type VedicNorthIndianChartData = {
  ascendant: {
    rashiNumber: number;
    rashi: string;
    degreeInSign?: number;
  };
  planets: SwissKundliPlanet[];
};

type HouseCell = {
  house: number;
  rashiNumber: number;
  rashi: string;
  planets: SwissKundliPlanet[];
  points: string;
  x: number;
  y: number;
};

const rashiNames = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const northIndianCells: Record<number, { points: string; x: number; y: number }> = {
  1: { points: "200,24 292,116 200,208 108,116", x: 200, y: 114 },
  2: { points: "24,24 200,24 108,116 24,116", x: 92, y: 66 },
  3: { points: "24,116 108,116 200,208 108,208", x: 110, y: 164 },
  4: { points: "24,116 108,208 24,376 24,252", x: 58, y: 246 },
  5: { points: "24,376 108,208 200,376", x: 116, y: 320 },
  6: { points: "108,208 200,208 292,300 200,376", x: 194, y: 296 },
  7: { points: "200,376 292,300 376,376", x: 286, y: 334 },
  8: { points: "292,300 376,116 376,376", x: 338, y: 246 },
  9: { points: "200,208 292,116 376,116 292,300", x: 294, y: 184 },
  10: { points: "292,116 200,24 376,24 376,116", x: 310, y: 66 },
  11: { points: "108,116 200,208 108,208 24,116", x: 110, y: 188 },
  12: { points: "292,116 376,116 292,300 200,208", x: 292, y: 206 }
};

export function VedicNorthIndianChart({
  data,
  title = "North Indian Kundli",
  className
}: {
  data: VedicNorthIndianChartData;
  title?: string;
  className?: string;
}) {
  const houses = buildHouseCells(data);

  return (
    <section className={cn("rounded-2xl border border-[#F5C542]/25 bg-[#160a28] p-4 shadow-[0_22px_70px_rgba(5,2,14,0.34)]", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-cinzel text-xl font-black text-[#FFF7E8]">{title}</h3>
          <p className="text-xs text-[#FFD36A]/75">
            Lagna: {data.ascendant.rashiNumber} {data.ascendant.rashi}
            {typeof data.ascendant.degreeInSign === "number" ? ` ${data.ascendant.degreeInSign.toFixed(2)}°` : ""}
          </p>
        </div>
        <span className="rounded-full border border-[#F5C542]/35 bg-[#F5C542]/10 px-3 py-1 text-xs font-bold text-[#FFD36A]">D1</span>
      </div>

      <div className="mx-auto aspect-square max-w-[34rem] rounded-xl border border-[#3d2c19]/30 bg-[#fff5dd] p-2">
        <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label={title}>
          <rect x="16" y="16" width="368" height="368" rx="8" fill="#fff8e8" stroke="#2b1c10" strokeWidth="2" />
          <g stroke="#2b1c10" strokeWidth="1.55" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 16 H384 V384 H16 Z" />
            <path d="M200 16 L384 200 L200 384 L16 200 Z" />
            <path d="M16 16 L384 384 M384 16 L16 384" />
            <path d="M16 200 H384 M200 16 V384" opacity="0.75" />
          </g>

          {houses.map((house) => (
            <g key={house.house}>
              <polygon points={house.points} fill={house.house === 1 ? "rgba(245,190,88,0.22)" : "transparent"} stroke="transparent" />
              <text x={house.x} y={house.y - 20} textAnchor="middle" className="fill-[#5f3813] font-cinzel text-[13px] font-black">
                {house.rashiNumber}
              </text>
              <text x={house.x} y={house.y - 5} textAnchor="middle" className="fill-[#211407] text-[10px] font-bold">
                H{house.house}
              </text>
              {house.planets.slice(0, 4).map((planet, index) => (
                <text key={`${house.house}-${planet.name}`} x={house.x} y={house.y + 13 + index * 13} textAnchor="middle" className="fill-[#7c2d12] text-[11px] font-bold">
                  {planetAbbreviation(planet.name)}
                </text>
              ))}
              {house.planets.length > 4 ? (
                <text x={house.x} y={house.y + 66} textAnchor="middle" className="fill-[#6b4a21] text-[10px] font-semibold">
                  +{house.planets.length - 4}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

function buildHouseCells(data: VedicNorthIndianChartData): HouseCell[] {
  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const rashiNumber = ((data.ascendant.rashiNumber + house - 2) % 12) + 1;
    const planets = data.planets.filter((planet) => planet.house === house);
    return {
      house,
      rashiNumber,
      rashi: rashiNames[rashiNumber - 1],
      planets,
      ...northIndianCells[house]
    };
  });
}

function planetAbbreviation(planet: SwissKundliPlanet["name"]) {
  const abbreviations: Record<SwissKundliPlanet["name"], string> = {
    Sun: "Su",
    Moon: "Mo",
    Mars: "Ma",
    Mercury: "Me",
    Jupiter: "Ju",
    Venus: "Ve",
    Saturn: "Sa",
    Rahu: "Ra",
    Ketu: "Ke"
  };
  return abbreviations[planet];
}

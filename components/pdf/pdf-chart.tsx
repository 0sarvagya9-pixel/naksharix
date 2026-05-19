import { Line, Rect, Svg, Text, View } from "@react-pdf/renderer";
import type { HousePosition } from "@/lib/astrology/types";
import type { PdfChartHouse } from "@/lib/kundli/pdf-data";

type CompatibleHouse = HousePosition | PdfChartHouse;

const LAYOUT: Record<number, { signX: number; signY: number; planetX: number; planetY: number; anchor?: "start" | "middle" | "end" }> = {
  1: { signX: 150, signY: 32, planetX: 150, planetY: 54, anchor: "middle" },
  2: { signX: 78, signY: 24, planetX: 88, planetY: 56, anchor: "middle" },
  3: { signX: 34, signY: 78, planetX: 56, planetY: 100, anchor: "middle" },
  4: { signX: 78, signY: 136, planetX: 88, planetY: 156, anchor: "middle" },
  5: { signX: 34, signY: 186, planetX: 56, planetY: 204, anchor: "middle" },
  6: { signX: 86, signY: 236, planetX: 96, planetY: 254, anchor: "middle" },
  7: { signX: 150, signY: 220, planetX: 150, planetY: 244, anchor: "middle" },
  8: { signX: 214, signY: 236, planetX: 204, planetY: 254, anchor: "middle" },
  9: { signX: 266, signY: 186, planetX: 244, planetY: 204, anchor: "middle" },
  10: { signX: 222, signY: 136, planetX: 212, planetY: 156, anchor: "middle" },
  11: { signX: 266, signY: 78, planetX: 244, planetY: 100, anchor: "middle" },
  12: { signX: 214, signY: 24, planetX: 204, planetY: 56, anchor: "middle" }
};

export function PdfChart({ houses, compact = false }: { houses: CompatibleHouse[]; compact?: boolean }) {
  const chartHouses = Array.from({ length: 12 }, (_, index) => houses.find((house) => houseNumber(house) === index + 1)).filter(Boolean) as CompatibleHouse[];
  return (
    <View wrap={false} style={{ width: compact ? 138 : 245, marginVertical: 4 }}>
      <Svg width={compact ? 138 : 245} height={compact ? 115 : 230} viewBox="0 0 300 280">
        <Rect x="1" y="1" width="298" height="278" fill="#fff7df" stroke="#2e1b0d" strokeWidth="2" />
        <Line x1="0" y1="0" x2="300" y2="280" stroke="#2e1b0d" strokeWidth="1.4" />
        <Line x1="300" y1="0" x2="0" y2="280" stroke="#2e1b0d" strokeWidth="1.4" />
        <Line x1="150" y1="0" x2="300" y2="140" stroke="#2e1b0d" strokeWidth="1.4" />
        <Line x1="300" y1="140" x2="150" y2="280" stroke="#2e1b0d" strokeWidth="1.4" />
        <Line x1="150" y1="280" x2="0" y2="140" stroke="#2e1b0d" strokeWidth="1.4" />
        <Line x1="0" y1="140" x2="150" y2="0" stroke="#2e1b0d" strokeWidth="1.4" />
        <Line x1="75" y1="70" x2="225" y2="70" stroke="#2e1b0d" strokeWidth="1.1" />
        <Line x1="75" y1="210" x2="225" y2="210" stroke="#2e1b0d" strokeWidth="1.1" />
        <Line x1="75" y1="70" x2="75" y2="210" stroke="#2e1b0d" strokeWidth="1.1" />
        <Line x1="225" y1="70" x2="225" y2="210" stroke="#2e1b0d" strokeWidth="1.1" />
        {chartHouses.map((house) => <HouseText key={safeText(houseNumber(house))} house={house} compact={compact} />)}
      </Svg>
    </View>
  );
}

function HouseText({ house, compact }: { house: CompatibleHouse; compact: boolean }) {
  const currentHouse = houseNumber(house);
  const layout = LAYOUT[currentHouse] ?? LAYOUT[1];
  const planets = planetLabels(house).slice(0, compact ? 3 : 4);
  const hidden = planetLabels(house).length - planets.length;
  const lines = hidden > 0 ? [...planets, `+${hidden}`] : planets;
  return (
    <>
      <Text x={layout.signX} y={layout.signY} textAnchor={layout.anchor ?? "middle"} fill="#7b4b16" style={{ fontSize: compact ? 10 : 12, fontWeight: "bold" }}>{safeText(signNumberLabel(house))}</Text>
      {lines.length ? lines.map((planet, index) => (
        <Text key={`${currentHouse}-${safeText(planet)}-${index}`} x={layout.planetX} y={layout.planetY + index * (compact ? 13 : 15)} textAnchor={layout.anchor ?? "middle"} fill="#3a2110" style={{ fontSize: compact ? 9 : 11, fontWeight: "bold" }}>{safeText(planet)}</Text>
      )) : (
        <Text x={layout.planetX} y={layout.planetY} textAnchor={layout.anchor ?? "middle"} fill="#8a7a65" style={{ fontSize: compact ? 8 : 10 }}>-</Text>
      )}
    </>
  );
}

function signNumberLabel(house: CompatibleHouse) {
  const signNumber = "signNumber" in house ? house.signNumber : undefined;
  return signNumber ? String(signNumber) : signToNumber(house.sign) ?? "-";
}

function houseNumber(house: CompatibleHouse) {
  const parsed = Number(safeText(house.house));
  return Number.isFinite(parsed) ? parsed : 1;
}

function planetLabels(house: CompatibleHouse) {
  const planets = house.planets ?? [];
  return planets.map((planet) => shortPlanet(typeof planet === "string" ? planet : planet.planet)).filter(Boolean);
}

function shortPlanet(planet?: string) {
  const map: Record<string, string> = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Ascendant: "As", Lagna: "As" };
  return map[safeText(planet)] ?? safeText(planet).slice(0, 3);
}

function signToNumber(sign?: string) {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const index = signs.findIndex((item) => item.toLowerCase() === String(sign ?? "").toLowerCase());
  return index >= 0 ? String(index + 1) : undefined;
}

function safeText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(safeText).join(", ");
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("name" in obj) return safeText(obj.name);
    if ("label" in obj) return safeText(obj.label);
    if ("value" in obj) return safeText(obj.value);
    if ("sign" in obj) return safeText(obj.sign);
    if ("house" in obj) return safeText(obj.house);
    if ("planet" in obj) return safeText(obj.planet);
    try {
      return JSON.stringify(obj);
    } catch {
      return "-";
    }
  }
  return String(value);
}

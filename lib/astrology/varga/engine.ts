import type { VargaChartDefinition, VargaChartKey, VargaChartResult } from "@/lib/astrology/varga/types";
import { normalizeDegrees } from "@/lib/astrology/own-engine/time";
import { rashis } from "@/lib/astrology/own-engine/zodiac";
import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";

export const VARGA_CHART_DEFINITIONS: VargaChartDefinition[] = [
  { key: "D1", label: "Rashi / Lagna", divisor: 1, priority: "base", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Base chart is provider-regression-tested; external fixtures required before external precision claims." },
  { key: "D2", label: "Hora", divisor: 2, priority: "future", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Internal Parashari Hora formula is provider-regression-tested; external fixtures required before public output." },
  { key: "D3", label: "Drekkana", divisor: 3, priority: "future", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Internal Drekkana formula is provider-regression-tested; external fixtures required before public output." },
  { key: "D4", label: "Chaturthamsha", divisor: 4, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D7", label: "Saptamsha", divisor: 7, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D9", label: "Navamsha", divisor: 9, priority: "first_candidate", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Internal Navamsha formula is provider-regression-tested; external fixtures required before public output." },
  { key: "D10", label: "Dashamsha", divisor: 10, priority: "first_candidate", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Internal Dashamsha formula is provider-regression-tested; external fixtures required before public output." },
  { key: "D12", label: "Dwadashamsha", divisor: 12, priority: "future", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Internal Dwadashamsha formula is provider-regression-tested; external fixtures required before public output." },
  { key: "D16", label: "Shodashamsha", divisor: 16, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D20", label: "Vimshamsha", divisor: 20, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D24", label: "Chaturvimshamsha", divisor: 24, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D27", label: "Saptavimshamsha", divisor: 27, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D30", label: "Trimshamsha", divisor: 30, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D40", label: "Khavedamsha", divisor: 40, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D45", label: "Akshavedamsha", divisor: 45, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D60", label: "Shashtiamsha", divisor: 60, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Requires very high birth-time precision and external fixtures." },
  { key: "D64", label: "Chatushashtiamsha", divisor: 64, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Later-stage chart only after D1-D60 are stable." }
];

export function getVargaDefinition(key: VargaChartKey) {
  return VARGA_CHART_DEFINITIONS.find((definition) => definition.key === key);
}

export function calculateVargaChart(chart: VargaChartKey, planets: CanonicalPlanet[]): VargaChartResult {
  const supported = new Set<VargaChartKey>(["D1", "D2", "D3", "D9", "D10", "D12"]);
  if (!supported.has(chart)) return createBlockedVargaResult(chart);

  return {
    chart,
    placements: planets.map((planet) => {
      const longitude = planet.absoluteLongitude;
      if (typeof longitude !== "number") {
        return { planet: planet.planet, sourceLongitude: null, sign: null, degree: null, verified: false };
      }
      const placement = vargaPlacement(chart, longitude);
      return {
        planet: planet.planet,
        sourceLongitude: longitude,
        sign: placement.sign,
        degree: placement.degree,
        verified: true
      };
    }),
    verificationLevel: "provider_verified",
    publicEnabled: false,
    limitations: [
      `${chart} is calculated internally from planet sidereal longitudes.`,
      "Formula output is provider-regression-tested but not externally fixture-verified yet.",
      "Public Varga chart display remains disabled until trusted fixtures pass."
    ]
  };
}

export function calculateSupportedVargaCharts(planets: CanonicalPlanet[]) {
  return (["D1", "D2", "D3", "D9", "D10", "D12"] as VargaChartKey[]).map((chart) => calculateVargaChart(chart, planets));
}

function vargaPlacement(chart: VargaChartKey, longitude: number) {
  const normalized = normalizeDegrees(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;

  if (chart === "D1") return signPlacement(signIndex, degreeInSign);
  if (chart === "D2") return horaPlacement(signIndex, degreeInSign);
  if (chart === "D3") return drekkanaPlacement(signIndex, degreeInSign);
  if (chart === "D9") return navamsaPlacement(signIndex, degreeInSign);
  if (chart === "D10") return dashamshaPlacement(signIndex, degreeInSign);
  if (chart === "D12") return dwadashamshaPlacement(signIndex, degreeInSign);
  return signPlacement(signIndex, degreeInSign);
}

function signPlacement(signIndex: number, degree: number) {
  return { sign: rashis[signIndex], degree: round(degree) };
}

function horaPlacement(signIndex: number, degree: number) {
  const oddSign = signIndex % 2 === 0;
  const sign = oddSign
    ? degree < 15 ? "Leo" : "Cancer"
    : degree < 15 ? "Cancer" : "Leo";
  return { sign, degree: round((degree % 15) * 2) };
}

function drekkanaPlacement(signIndex: number, degree: number) {
  const part = Math.min(2, Math.floor(degree / 10));
  const targetIndex = [signIndex, (signIndex + 4) % 12, (signIndex + 8) % 12][part];
  return { sign: rashis[targetIndex], degree: round((degree % 10) * 3) };
}

function navamsaPlacement(signIndex: number, degree: number) {
  const part = Math.min(8, Math.floor(degree / (30 / 9)));
  const startIndex = [0, 3, 6, 9].includes(signIndex)
    ? signIndex
    : [1, 4, 7, 10].includes(signIndex)
      ? (signIndex + 8) % 12
      : (signIndex + 4) % 12;
  return { sign: rashis[(startIndex + part) % 12], degree: round((degree % (30 / 9)) * 9) };
}

function dashamshaPlacement(signIndex: number, degree: number) {
  const part = Math.min(9, Math.floor(degree / 3));
  const startIndex = signIndex % 2 === 0 ? signIndex : (signIndex + 8) % 12;
  return { sign: rashis[(startIndex + part) % 12], degree: round((degree % 3) * 10) };
}

function dwadashamshaPlacement(signIndex: number, degree: number) {
  const part = Math.min(11, Math.floor(degree / 2.5));
  return { sign: rashis[(signIndex + part) % 12], degree: round((degree % 2.5) * 12) };
}

function round(value: number) {
  return Number(value.toFixed(6));
}

export function createBlockedVargaResult(chart: VargaChartKey): VargaChartResult {
  return {
    chart,
    placements: [],
    verificationLevel: "blocked_until_verified_formula",
    publicEnabled: false,
    limitations: [
      "Varga chart formulas and provider input precision are not fixture-verified yet.",
      "No public Varga chart output should be shown until verified fixtures pass.",
      "D9 and D10 are listed as first future candidates, not active outputs."
    ]
  };
}

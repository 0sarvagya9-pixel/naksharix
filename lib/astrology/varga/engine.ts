import type { VargaChartDefinition, VargaChartKey, VargaChartResult } from "@/lib/astrology/varga/types";

export const VARGA_CHART_DEFINITIONS: VargaChartDefinition[] = [
  { key: "D1", label: "Rashi / Lagna", divisor: 1, priority: "base", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Base chart exists through current Kundli flows, but exact provider precision remains fixture-blocked." },
  { key: "D2", label: "Hora", divisor: 2, priority: "future", implementationStatus: "blocked_until_fixture", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D3", label: "Drekkana", divisor: 3, priority: "future", implementationStatus: "blocked_until_fixture", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D4", label: "Chaturthamsha", divisor: 4, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D7", label: "Saptamsha", divisor: 7, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
  { key: "D9", label: "Navamsha", divisor: 9, priority: "first_candidate", implementationStatus: "blocked_until_fixture", formulaVerified: false, publicEnabled: false, notes: "First future candidate after provider precision is verified." },
  { key: "D10", label: "Dashamsha", divisor: 10, priority: "first_candidate", implementationStatus: "blocked_until_fixture", formulaVerified: false, publicEnabled: false, notes: "First future candidate after D9 validation." },
  { key: "D12", label: "Dwadashamsha", divisor: 12, priority: "future", implementationStatus: "blocked_until_fixture", formulaVerified: false, publicEnabled: false, notes: "Formula and external fixtures required." },
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

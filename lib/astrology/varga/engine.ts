import type { VargaChartDefinition, VargaChartKey, VargaChartResult } from "@/lib/astrology/varga/types";
import {CLASSICAL_VARGA_KEYS,classicalVargaCoordinates,roundedDivisionDegree,type ClassicalVargaKey} from "@/lib/astrology/varga/partition";
import { rashis } from "@/lib/astrology/own-engine/zodiac";
import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";

export const VARGA_CHART_DEFINITIONS: VargaChartDefinition[] = [
  { key: "D1", label: "Rashi / Lagna", divisor: 1, priority: "base", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Base chart is provider-regression-tested; external fixtures required before external precision claims." },
  { key: "D2", label: "Hora", divisor: 2, priority: "future", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Internal Parashari Hora formula is provider-regression-tested; external fixtures required before public output." },
  { key: "D3", label: "Drekkana", divisor: 3, priority: "future", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Internal Drekkana formula is provider-regression-tested; external fixtures required before public output." },
  { key: "D4", label: "Chaturthamsha", divisor: 4, priority: "future", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Named classical sign mapping implemented. Independent software fixtures required before public use." },
  { key: "D7", label: "Saptamsha", divisor: 7, priority: "future", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Named classical sign mapping implemented. Independent software fixtures required before public use." },
  { key: "D9", label: "Navamsha", divisor: 9, priority: "first_candidate", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Internal Navamsha formula is provider-regression-tested; external fixtures required before public output." },
  { key: "D10", label: "Dashamsha", divisor: 10, priority: "first_candidate", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Internal Dashamsha formula is provider-regression-tested; external fixtures required before public output." },
  { key: "D12", label: "Dwadashamsha", divisor: 12, priority: "future", implementationStatus: "provider_verified", formulaVerified: false, publicEnabled: false, notes: "Internal Dwadashamsha formula is provider-regression-tested; external fixtures required before public output." },
  { key: "D16", label: "Shodashamsha", divisor: 16, priority: "future", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Named classical sign mapping implemented. Independent software fixtures required before public use." },
  { key: "D20", label: "Vimshamsha", divisor: 20, priority: "future", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Named classical sign mapping implemented. Independent software fixtures required before public use." },
  { key: "D24", label: "Chaturvimshamsha", divisor: 24, priority: "future", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Named classical sign mapping implemented. Independent software fixtures required before public use." },
  { key: "D27", label: "Saptavimshamsha", divisor: 27, priority: "future", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Named classical sign mapping implemented. Independent software fixtures required before public use." },
  { key: "D30", label: "Trimshamsha", divisor: 30, priority: "future", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Classical unequal spans; within-span degrees are normalized display coordinates. Independent software fixtures required before public use." },
  { key: "D40", label: "Khavedamsha", divisor: 40, priority: "future", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Named classical sign mapping implemented. Independent software fixtures required before public use." },
  { key: "D45", label: "Akshavedamsha", divisor: 45, priority: "future", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Named classical sign mapping implemented. Independent software fixtures required before public use." },
  { key: "D60", label: "Shashtiamsha", divisor: 60, priority: "future", implementationStatus: "implemented_unverified", formulaVerified: false, publicEnabled: false, notes: "Named local-degree remainder method; highly birth-time sensitive and other traditions differ. Independent software fixtures required before public use." },
  { key: "D64", label: "Chatushashtiamsha", divisor: 64, priority: "future", implementationStatus: "planned", formulaVerified: false, publicEnabled: false, notes: "Later-stage chart only after D1-D60 are stable." }
];

export function getVargaDefinition(key: VargaChartKey) {
  return VARGA_CHART_DEFINITIONS.find((definition) => definition.key === key);
}

export function calculateVargaChart(chart: VargaChartKey, planets: CanonicalPlanet[]): VargaChartResult {
  const supported = new Set<VargaChartKey>(CLASSICAL_VARGA_KEYS);
  const providerRegression=["D1","D2","D3","D9","D10","D12"].includes(chart);
  if (!supported.has(chart)) return createBlockedVargaResult(chart);

  const placements=planets.map((planet) => {
      const longitude = planet.absoluteLongitude;
      if (typeof longitude !== "number" || !Number.isFinite(longitude)) {
        return { planet: planet.planet, sourceLongitude: null, sign: null, degree: null, verified: false };
      }
      const placement = vargaPlacement(chart as ClassicalVargaKey, longitude);
      return {
        planet: planet.planet,
        sourceLongitude: longitude,
        sign: placement.sign,
        degree: placement.degree,
        verified: providerRegression
      };
    });
  return {
    chart,placements,
    verificationLevel: placements.length>0&&placements.every(p=>p.sign!==null)?(providerRegression?"provider_verified":"implemented_unverified"):"needs_external_validation",
    publicEnabled: false,
    limitations: [
      `${chart} is calculated internally from planet sidereal longitudes.`,
      providerRegression?"Formula output is provider-regression-tested but not externally fixture-verified yet.":"Named classical arithmetic convention implemented; independent software parity remains outstanding.",
      ...(chart==="D30"?["D30 degree is normalized within its unequal span; only sign selection is the classical text-based method."]:chart==="D60"?["D60 uses the local-degree remainder convention; alternate methods and minute-sensitive Lagna must be separately qualified."]:[]),
      "Public Varga chart display remains disabled until trusted fixtures pass."
    ]
  };
}

export function calculateSupportedVargaCharts(planets: CanonicalPlanet[]) {
  return (["D1", "D2", "D3", "D9", "D10", "D12"] as VargaChartKey[]).map((chart) => calculateVargaChart(chart, planets));
}

// Preserve the existing six-chart consumer contract until the new divisions
// have separate independent release acceptance.
export function calculateInternalClassicalVargas(planets:CanonicalPlanet[]){
 return CLASSICAL_VARGA_KEYS.map(chart=>calculateVargaChart(chart,planets));
}
function vargaPlacement(chart: ClassicalVargaKey, longitude:number){
 const c=classicalVargaCoordinates(chart,longitude);
 return {sign:rashis[c.signIndex],degree:roundedDivisionDegree(c.degree)};
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

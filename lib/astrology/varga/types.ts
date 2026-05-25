import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";

export type VargaVerificationLevel =
  | "verified_external"
  | "provider_verified"
  | "needs_external_validation"
  | "blocked_until_verified_formula"
  | "implemented_unverified";

export type VargaChartKey =
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "D7"
  | "D9"
  | "D10"
  | "D12"
  | "D16"
  | "D20"
  | "D24"
  | "D27"
  | "D30"
  | "D40"
  | "D45"
  | "D60"
  | "D64";

export type VargaImplementationStatus =
  | "implemented_verified"
  | "provider_verified"
  | "implemented_unverified"
  | "planned"
  | "blocked_until_fixture";

export type VargaPlanetPlacement = {
  planet: CanonicalPlanet["planet"];
  sourceLongitude: number | null;
  sign: string | null;
  degree: number | null;
  verified: boolean;
};

export type VargaChartDefinition = {
  key: VargaChartKey;
  label: string;
  divisor: number;
  priority: "base" | "first_candidate" | "future";
  implementationStatus: VargaImplementationStatus;
  formulaVerified: boolean;
  publicEnabled: false;
  notes: string;
};

export type VargaChartResult = {
  chart: VargaChartKey;
  placements: VargaPlanetPlacement[];
  verificationLevel: VargaVerificationLevel;
  publicEnabled: false;
  limitations: string[];
};

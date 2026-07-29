import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";

export type StrengthVerificationLevel =
  | "verified_external"
  | "provider_verified"
  | "needs_external_validation"
  | "partial_internal"
  | "blocked_until_provider_ready"
  | "blocked_until_verified_formula";

export type ShadbalaComponent =
  | "sthanaBala"
  | "digBala"
  | "kalaBala"
  | "cheshtaBala"
  | "naisargikaBala"
  | "drikBala";

export type ShadbalaPlanetScore = {
  planet: Exclude<CanonicalPlanet["planet"], "Rahu" | "Ketu">;
  components: Record<ShadbalaComponent, number | null>;
  componentStatus: Record<ShadbalaComponent, { status: "calculated" | "unavailable"; reason: string }>;
  total: number | null;
  verified: boolean;
};

export type AshtakvargaScore = {
  planet: CanonicalPlanet["planet"];
  bhinna: Array<number | null>;
  sarva?: Array<number | null>;
  verified: boolean;
};

export type StrengthFoundationStatus = {
  module: "shadbala" | "ashtakvarga";
  verificationLevel: StrengthVerificationLevel;
  publicEnabled: false;
  verified: false;
  requiredBeforeActivation: string[];
};

export type StrengthDependency = {
  key: string;
  label: string;
  requiredFor: Array<"shadbala" | "ashtakvarga">;
  status: "available_unverified" | "missing" | "blocked_until_provider_ready";
};

export type PartialShadbalaResult = {
  scores: ShadbalaPlanetScore[];
  verificationLevel: "provider_verified" | "needs_external_validation";
  publicEnabled: false;
  missingDependencies: string[];
  limitations: string[];
};

export type PartialAshtakvargaResult = {
  scores: AshtakvargaScore[];
  sarva?: number[];
  checksums?: Record<string, number>;
  verificationLevel: "blocked_until_verified_formula" | "needs_external_validation";
  publicEnabled: false;
  missingDependencies: string[];
  limitations: string[];
};

export const STRENGTH_DEPENDENCIES: StrengthDependency[] = [
  { key: "planetDegrees", label: "Verified planet degrees", requiredFor: ["shadbala", "ashtakvarga"], status: "available_unverified" },
  { key: "houses", label: "Verified houses", requiredFor: ["shadbala", "ashtakvarga"], status: "available_unverified" },
  { key: "aspects", label: "Verified aspects", requiredFor: ["shadbala"], status: "missing" },
  { key: "retrograde", label: "Retrograde status", requiredFor: ["shadbala"], status: "available_unverified" },
  { key: "dignity", label: "Planet dignity", requiredFor: ["shadbala"], status: "available_unverified" },
  { key: "divisionalData", label: "Divisional chart data", requiredFor: ["shadbala"], status: "available_unverified" }
];

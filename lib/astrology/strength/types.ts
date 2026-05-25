import type { CanonicalPlanet } from "@/lib/astrology/ephemeris/types";

export type StrengthVerificationLevel =
  | "verified_external"
  | "needs_external_validation"
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

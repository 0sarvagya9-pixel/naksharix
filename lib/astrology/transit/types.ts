import type { AyanamsaKey, CanonicalChartInput, CanonicalPlanet } from "@/lib/astrology/ephemeris/types";

export type TransitVerificationLevel =
  | "verified_external"
  | "needs_external_validation"
  | "blocked_until_provider_ready";

export type TransitActivationStatus =
  | "coming_soon"
  | "educational_only"
  | "blocked_until_provider_ready"
  | "blocked_until_verified_fixtures"
  | "verified_internal_only";

export type TransitPlanetName = CanonicalPlanet["planet"];

export type TransitCalculationInput = {
  date: string;
  timezone: string;
  ayanamsa: AyanamsaKey;
  natalChart?: CanonicalChartInput;
};

export type TransitPosition = {
  planet: TransitPlanetName;
  sign: string | null;
  degree: number | null;
  absoluteLongitude: number | null;
  retrograde: boolean | null;
};

export type TransitIngressWindow = {
  planet: TransitPlanetName;
  fromSign: string | null;
  toSign: string | null;
  startsAt: string | null;
  endsAt?: string | null;
  source: string;
  verified: boolean;
};

export type TransitEngineStatus = {
  status: TransitActivationStatus;
  verified: false;
  publicPredictionEnabled: false;
  reason: string;
  requiredBeforeActivation: string[];
};

export type TransitFoundationResult = {
  input: TransitCalculationInput | null;
  positions: TransitPosition[];
  ingressWindows: TransitIngressWindow[];
  metadata: {
    provider: string;
    verificationLevel: TransitVerificationLevel;
    publicPredictionEnabled: false;
    limitations: string[];
  };
};

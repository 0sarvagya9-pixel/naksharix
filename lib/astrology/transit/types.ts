import type { AyanamsaKey, CanonicalChartInput, CanonicalPlanet } from "@/lib/astrology/ephemeris/types";

export type TransitVerificationLevel =
  | "verified_external"
  | "provider_verified"
  | "needs_external_validation"
  | "blocked_until_provider_ready"
  | "limited_internal";

export type TransitActivationStatus =
  | "coming_soon"
  | "educational_only"
  | "blocked_until_provider_ready"
  | "blocked_until_verified_fixtures"
  | "provider_verified_internal_only"
  | "verified_internal_only";

export type TransitPlanetName = CanonicalPlanet["planet"];

export type TransitCalculationInput = {
  date: string;
  timezone: string;
  ayanamsa: AyanamsaKey;
  latitude?: number;
  longitude?: number;
  place?: string;
  natalChart?: CanonicalChartInput;
};

export type TransitPosition = {
  planet: TransitPlanetName;
  sign: string | null;
  degree: number | null;
  absoluteLongitude: number | null;
  retrograde: boolean | null;
  verified: boolean;
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

export type TransitTimelineEvent = {
  planet: TransitPlanetName;
  eventType: "sign_ingress" | "station_retrograde" | "station_direct";
  date: string;
  from: string | boolean | null;
  to: string | boolean | null;
  degree: number | null;
  source: string;
  verificationLevel: TransitVerificationLevel;
  precision: "daily_provider_scan";
  note: string;
};

export type TransitEngineStatus = {
  status: TransitActivationStatus;
  verified: boolean;
  publicPredictionEnabled: false;
  reason: string;
  requiredBeforeActivation: string[];
};

export type TransitFoundationResult = {
  input: TransitCalculationInput | null;
  positions: TransitPosition[];
  ingressWindows: TransitIngressWindow[];
  timeline?: TransitTimelineEvent[];
  natalOverlay?: {
    enabled: false;
    reason: string;
  };
  metadata: {
    provider: string;
    verificationLevel: TransitVerificationLevel;
    publicPredictionEnabled: false;
    limitations: string[];
  };
};

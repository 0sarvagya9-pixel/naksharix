import type { AstrologyBirthInput } from "@/lib/astrology/types";

export type AyanamsaKey = "lahiri" | "raman" | "kp" | "fagan_bradley";

export type PrecisionLevel =
  | "verified_external"
  | "deterministic_mapping"
  | "limited_internal"
  | "needs_external_validation"
  | "blocked_until_provider_ready";

export type EphemerisProviderMetadata = {
  provider: string;
  calculationMode: string;
  precisionLevel: PrecisionLevel;
  verified: boolean;
  limitations: string[];
};

export type AyanamsaOption = {
  key: AyanamsaKey;
  label: string;
  implemented: boolean;
  verified: boolean;
  publicSelectable: boolean;
  notes: string;
};

export type CanonicalChartInput = Pick<
  AstrologyBirthInput,
  "name" | "gender" | "dateOfBirth" | "timeOfBirth" | "birthPlace" | "latitude" | "longitude" | "timezone" | "language"
> & {
  ayanamsa?: AyanamsaKey;
  houseSystem?: string;
};

export type CanonicalPoint = {
  sign: string | null;
  degree: number | null;
  absoluteLongitude?: number | null;
};

export type CanonicalPlanet = CanonicalPoint & {
  planet: "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";
  retrograde?: boolean | null;
  combust?: boolean | null;
  house?: number | null;
};

export type CanonicalNakshatra = {
  name: string | null;
  pada: number | null;
};

export type CanonicalDashaSummary = {
  startingMahadashaLord: string | null;
  balanceAtBirth: string | null;
  transitions: Array<{ lord: string; startsAt: string; endsAt: string }>;
  verified: boolean;
};

export type CanonicalChartResult = {
  normalizedInput: CanonicalChartInput;
  ayanamsa: {
    key: AyanamsaKey;
    label: string;
    degree: number | null;
    verified: boolean;
  };
  ascendant: CanonicalPoint;
  moon: CanonicalPoint;
  nakshatra: CanonicalNakshatra;
  planets: CanonicalPlanet[];
  houses?: Array<{ house: number; sign: string | null; planets: string[] }>;
  dasha?: CanonicalDashaSummary;
  metadata: EphemerisProviderMetadata;
};

export type EphemerisProvider = {
  id: string;
  label: string;
  calculateChart(input: CanonicalChartInput): Promise<CanonicalChartResult>;
};

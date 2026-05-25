export type PanchangPrecisionLevel = "verified_external" | "provider_verified" | "needs_external_validation" | "blocked_until_provider_ready";

export const REQUIRED_PANCHANG_FIELDS = [
  "Date",
  "Location",
  "Timezone",
  "Sunrise",
  "Sunset",
  "Moonrise",
  "Moonset",
  "Tithi",
  "Nakshatra",
  "Yoga",
  "Karana",
  "Vaar",
  "Rahu Kaal",
  "Yamaganda",
  "Gulika Kaal",
  "Abhijit Muhurat"
] as const;

export type PanchangRequiredField = (typeof REQUIRED_PANCHANG_FIELDS)[number];

export type PanchangAccuracyInput = {
  date: string;
  timezone: string;
  latitude: number;
  longitude: number;
  place: string;
};

export type PanchangAccuracyExpected = Record<PanchangRequiredField, string | null> & {
  toleranceMinutes?: number;
};

export type PanchangAccuracySample = {
  id: string;
  name: string;
  purpose: string;
  source: string | null;
  source_note: string;
  verified_level: PanchangPrecisionLevel;
  input: PanchangAccuracyInput;
  expected: PanchangAccuracyExpected;
};

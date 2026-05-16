import type { AstrologyBirthInput } from "@/lib/astrology/types";

export type KundliVerificationTestCase = AstrologyBirthInput & {
  timezoneOffset: number;
  verificationNote: string;
};

export const kundliVerificationTestCases: KundliVerificationTestCase[] = [
  {
    name: "Sarvagya Pandey",
    gender: "Prefer not to say",
    dateOfBirth: "1992-10-19",
    timeOfBirth: "04:20",
    birthPlace: "Tikamgarh, Madhya Pradesh, India",
    latitude: 24.7456,
    longitude: 78.8321,
    timezone: "Asia/Kolkata",
    timezoneOffset: 5.5,
    language: "en",
    verificationNote: "Use this case to compare Ascendant, planetary sidereal longitudes, Rahu/Ketu, D1 houses, and D9 placements against a trusted Lahiri/True Node Vedic source."
  }
];

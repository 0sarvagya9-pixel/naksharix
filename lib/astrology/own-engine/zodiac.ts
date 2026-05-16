import { normalizeDegrees } from "@/lib/astrology/own-engine/time";

export const rashis = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;

export type RashiName = (typeof rashis)[number];

const LAHIRI_AYANAMSA_J2000_DEGREES = 23.856446;
const LAHIRI_PRECESSION_ARCSEC_PER_YEAR = 50.290966;

export function lahiriAyanamsa(julianDay: number) {
  const yearsFromJ2000 = (julianDay - 2451545.0) / 365.2425;
  return LAHIRI_AYANAMSA_J2000_DEGREES + (LAHIRI_PRECESSION_ARCSEC_PER_YEAR / 3600) * yearsFromJ2000;
}

export function tropicalToSidereal(longitude: number, julianDay: number) {
  return normalizeDegrees(longitude - lahiriAyanamsa(julianDay));
}

export function longitudeToRashi(longitude: number) {
  const normalized = normalizeDegrees(longitude);
  const index = Math.floor(normalized / 30);
  return {
    rashi: rashis[index],
    rashiNumber: index + 1,
    degreeInSign: normalized % 30
  };
}

export function wholeSignHouse(planetSignNumber: number, ascendantSignNumber: number) {
  return ((planetSignNumber - ascendantSignNumber + 12) % 12) + 1;
}

export function absoluteLongitude(rashi: string, degreeInSign: number) {
  const index = Math.max(0, rashis.findIndex((sign) => sign === rashi));
  return index * 30 + degreeInSign;
}

import { normalizeDegrees } from "@/lib/astrology/own-engine/time";

export const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
] as const;

export function nakshatraFromLongitude(longitude: number) {
  const normalized = normalizeDegrees(longitude);
  // The 108 half-open padas are each exactly 10/3 degrees. Compute both
  // indices from the same global sector; epsilon must not move a boundary.
  const sector=Math.min(107,Math.floor(normalized*3/10));
  return {name:nakshatras[Math.floor(sector/4)],pada:sector%4+1};
}

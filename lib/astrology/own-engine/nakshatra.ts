import { normalizeDegrees } from "@/lib/astrology/own-engine/time";

export const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
] as const;

export function nakshatraFromLongitude(longitude: number) {
  const normalized = normalizeDegrees(longitude);
  const span = 360 / 27;
  const epsilon = 1e-9;
  const index = Math.min(26, Math.floor((normalized + epsilon) / span));
  const pada = Math.min(4, Math.floor(((normalized + epsilon) % span) / (span / 4)) + 1);
  return { name: nakshatras[index], pada };
}

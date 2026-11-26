import { normalizeDegrees } from "@/lib/astrology/own-engine/time";

export const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
] as const;

// Compare against the rounded representation of each exact 10/3-degree
// boundary. Multiplication alone can put the immediately preceding float on it.
function padaSector(longitude:number) {
  const value=normalizeDegrees(longitude);
  const estimate=Math.min(107,Math.floor(value*3/10));
  if(value<estimate*10/3)return estimate-1;
  if(estimate<107 && value>=(estimate+1)*10/3)return estimate+1;
  return estimate;
}

export function nakshatraIndexFromLongitude(longitude:number){
  return Math.floor(padaSector(longitude)/4);
}

export function nakshatraFromLongitude(longitude: number) {
  const sector=padaSector(longitude);
  return {name:nakshatras[Math.floor(sector/4)],pada:sector%4+1};
}

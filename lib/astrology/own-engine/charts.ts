import { normalizeDegrees } from "@/lib/astrology/own-engine/time";
import { longitudeToRashi, rashis, wholeSignHouse } from "@/lib/astrology/own-engine/zodiac";
import type { HousePosition, PlanetPosition } from "@/lib/astrology/types";

export function buildD1Chart(ascendantSignNumber: number, planets: PlanetPosition[]): HousePosition[] {
  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const rashiNumber = ((ascendantSignNumber + house - 2) % 12) + 1;
    return {
      house,
      sign: rashis[rashiNumber - 1],
      planets: planets.filter((planet) => planet.house === house).map((planet) => planet.planet)
    };
  });
}

export function buildD9Chart(ascendantLongitude: number, sourcePlanets: Array<PlanetPosition & { absoluteLongitude?: number }>): HousePosition[] {
  const navamsaAscendant = navamsaSignFromLongitude(ascendantLongitude);
  const navamsaPlanets = sourcePlanets.map((planet) => {
    const absolute = planet.absoluteLongitude ?? 0;
    const navamsa = navamsaSignFromLongitude(absolute);
    return {
      ...planet,
      sign: navamsa.rashi,
      degree: navamsa.degreeInSign,
      house: wholeSignHouse(navamsa.rashiNumber, navamsaAscendant.rashiNumber)
    };
  });
  return buildD1Chart(navamsaAscendant.rashiNumber, navamsaPlanets);
}

export function navamsaSignFromLongitude(longitude: number) {
  const normalized = normalizeDegrees(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  const navamsaIndex = Math.floor(degreeInSign / (30 / 9));
  const startIndex = [0, 3, 6, 9].includes(signIndex)
    ? signIndex
    : [1, 4, 7, 10].includes(signIndex)
      ? (signIndex + 8) % 12
      : (signIndex + 4) % 12;
  const d9SignIndex = (startIndex + navamsaIndex) % 12;
  const degreeInSignD9 = (degreeInSign % (30 / 9)) * 9;
  return { ...longitudeToRashi(d9SignIndex * 30 + degreeInSignD9), rashiNumber: d9SignIndex + 1, rashi: rashis[d9SignIndex] };
}

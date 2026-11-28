import {navamsaCoordinates} from "@/lib/astrology/varga/partition";
import {rashis,wholeSignHouse} from "@/lib/astrology/own-engine/zodiac";
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
    const idx=rashis.findIndex(sign=>sign===planet.sign);
    const supplied=planet.absoluteLongitude;
    const absolute=typeof supplied==="number"&&Number.isFinite(supplied)?supplied:
      idx>=0&&typeof planet.degree==="number"&&Number.isFinite(planet.degree)&&planet.degree>=0&&planet.degree<30?idx*30+planet.degree:NaN;
    if(!Number.isFinite(absolute))throw Error("NAVAMSA_PLANET_LONGITUDE_REQUIRED");
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
  const {signIndex,degree}=navamsaCoordinates(longitude);
  return {rashi:rashis[signIndex],rashiNumber:signIndex+1,degreeInSign:degree};
}

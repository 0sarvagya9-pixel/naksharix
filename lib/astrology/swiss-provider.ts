import "server-only";

import { format } from "date-fns";
import { calculateKundli, wholeSignHouse, type SwissKundliPlanet, type SwissKundliResult } from "@/lib/astrology/swiss-kundli";
import { getPanchang } from "@/lib/astrology/engine";
import type { AstrologyBirthInput, BirthChartData, HousePosition, PlanetPosition } from "@/lib/astrology/types";

const rashis = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export function createSwissBirthChart(input: AstrologyBirthInput): BirthChartData {
  const dateOfBirth = formatDate(input.dateOfBirth);
  const timezoneOffset = resolveTimezoneOffset(input.timezone, dateOfBirth, input.timeOfBirth);
  const kundli = calculateKundli(dateOfBirth, withSeconds(input.timeOfBirth), input.latitude, input.longitude, timezoneOffset);
  logKundliDebug(input, kundli, timezoneOffset);

  const planetPositions = toPlanetPositions(kundli.planets);
  const lagnaChart = toWholeSignChart(kundli.ascendant.rashiNumber, planetPositions);
  const navamsaAscendant = navamsaSignFromLongitude(kundli.ascendant.longitude);
  const navamsaPositions = toNavamsaPositions(kundli.planets, navamsaAscendant.rashiNumber);
  const navamsaChart = toWholeSignChart(navamsaAscendant.rashiNumber, navamsaPositions);
  const moon = planetPositions.find((planet) => planet.planet === "Moon");
  const sun = planetPositions.find((planet) => planet.planet === "Sun");
  const moonNakshatra = moon ? nakshatraFromLongitude(toAbsoluteLongitude(moon.sign, moon.degree ?? 0)) : undefined;
  return {
    profile: { name: input.name, gender: input.gender },
    birthDetails: {
      dateOfBirth,
      timeOfBirth: input.timeOfBirth,
      birthPlace: input.birthPlace,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone
    },
    panchang: getPanchang(new Date(`${dateOfBirth}T00:00:00.000Z`), input.latitude, input.longitude),
    avakhada: {
      moonSign: moon?.sign ?? "Aries",
      sunSign: sun?.sign ?? "Aries",
      ascendant: kundli.ascendant.rashi,
      nakshatra: moonNakshatra?.name ?? "Ashwini",
      gana: "Needs verified panchang",
      yoni: "Needs verified panchang",
      nadi: "Needs verified panchang"
    },
    charts: {
      lagna: lagnaChart,
      navamsa: navamsaChart
    },
    planetPositions,
    housePositions: lagnaChart,
    vimshottariDasha: [],
    manglikDosha: unavailableDosha("Core dosha analysis runs in the report enrichment layer."),
    kaalSarpDosha: {
      present: false,
      severity: "Not verified",
      summary: "Kaal Sarp requires a dedicated node-axis verification pass and is not asserted by this engine yet.",
      remedies: ["Avoid fear-based conclusions from a single factor."]
    },
    sadeSati: {
      status: "Not verified",
      guidance: "Sade Sati needs Saturn transit comparison with natal Moon. This engine keeps it unclaimed until transit verification is enabled."
    },
    nakshatraAnalysis: `${moonNakshatra?.name ?? "Moon nakshatra"} and pada ${moonNakshatra?.pada ?? "-"} are calculated from the Moon's sidereal longitude.`,
    lagnaAnalysis: `${kundli.ascendant.rashi} Lagna at ${kundli.ascendant.degreeInSign.toFixed(2)}° sets the whole-sign first house.`,
    remedies: ["Calculation not available yet."],
    calculationMeta: {
      provider: "swiss",
      ayanamsaName: kundli.ayanamsa,
      ayanamsaDegree: 0,
      houseSystem: kundli.houseSystem,
      nodeMode: kundli.nodeType,
      julianDay: kundli.julianDayUtc,
      utcDate: new Date().toISOString(),
      ascendantLongitude: kundli.ascendant.longitude
    }
  };
}

function toPlanetPositions(planets: SwissKundliPlanet[]): PlanetPosition[] {
  return planets.map((planet) => {
    const absoluteLongitude = toAbsoluteLongitude(planet.rashi, planet.degreeInSign);
    const nakshatra = nakshatraFromLongitude(absoluteLongitude);
    return {
      planet: planet.name,
      sign: planet.rashi,
      house: planet.house,
      degree: planet.degreeInSign,
      absoluteLongitude,
      nakshatra: nakshatra.name,
      pada: nakshatra.pada,
      retrograde: planet.retrograde
    };
  });
}

function toNavamsaPositions(planets: SwissKundliPlanet[], navamsaAscendantSignNumber: number): PlanetPosition[] {
  return planets.map((planet) => {
    const navamsa = navamsaSignFromLongitude(planet.longitude);
    const longitudeInNavamsa = navamsa.degreeInSign;
    const nakshatra = nakshatraFromLongitude(planet.longitude);
    return {
      planet: planet.name,
      sign: navamsa.rashi,
      house: wholeSignHouse(navamsa.rashiNumber, navamsaAscendantSignNumber),
      degree: longitudeInNavamsa,
      absoluteLongitude: planet.longitude,
      nakshatra: nakshatra.name,
      pada: nakshatra.pada,
      retrograde: planet.retrograde
    };
  });
}

function toWholeSignChart(ascendantSignNumber: number, planets: PlanetPosition[]): HousePosition[] {
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

function navamsaSignFromLongitude(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  const navamsaIndex = Math.floor(degreeInSign / (30 / 9));
  const startIndex = [0, 3, 6, 9].includes(signIndex)
    ? signIndex
    : [1, 4, 7, 10].includes(signIndex)
      ? (signIndex + 8) % 12
      : (signIndex + 4) % 12;
  const d9SignIndex = (startIndex + navamsaIndex) % 12;
  const degreeInNavamsa = (degreeInSign % (30 / 9)) * 9;
  return {
    rashi: rashis[d9SignIndex],
    rashiNumber: d9SignIndex + 1,
    degreeInSign: Number(degreeInNavamsa.toFixed(6))
  };
}

function nakshatraFromLongitude(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360;
  const span = 360 / 27;
  const index = Math.floor(normalized / span);
  const pada = Math.floor((normalized % span) / (span / 4)) + 1;
  return { name: nakshatras[index] ?? "Ashwini", pada };
}

function toAbsoluteLongitude(sign: string, degree: number) {
  const signIndex = Math.max(0, rashis.indexOf(sign));
  return signIndex * 30 + degree;
}

function resolveTimezoneOffset(timezone: string, date: string, time: string) {
  const numeric = Number(timezone);
  if (Number.isFinite(numeric)) return numeric;
  if (/^[+-]?\d{1,2}(:?\d{2}|\.\d{1,2})?$/.test(timezone)) return timezone;
  try {
    const utcDate = new Date(`${date}T${withSeconds(time)}.000Z`);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
      hour: "2-digit"
    }).formatToParts(utcDate);
    const token = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+0";
    const match = token.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;
    const hours = Number(match[1]);
    const minutes = Number(match[2] ?? 0);
    return hours + Math.sign(hours || 1) * minutes / 60;
  } catch {
    return 5.5;
  }
}

function withSeconds(time: string) {
  return /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time;
}

function formatDate(value: string | Date) {
  return value instanceof Date ? format(value, "yyyy-MM-dd") : value.slice(0, 10);
}

function unavailableDosha(summary: string) {
  return { present: false, severity: "Not verified", summary, remedies: ["Avoid fear-based conclusions from a single factor."] };
}

function logKundliDebug(input: AstrologyBirthInput, kundli: SwissKundliResult, timezoneOffset: string | number) {
  if (process.env.NODE_ENV === "production" || process.env.KUNDLI_DEBUG !== "true") return;
  console.info("[Naksharix Kundli Debug]", {
    input: {
      dateOfBirth: formatDate(input.dateOfBirth),
      timeOfBirth: input.timeOfBirth,
      birthPlace: input.birthPlace,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone,
      timezoneOffset,
      language: input.language
    },
    ascendant: kundli.ascendant,
    planets: kundli.planets.map((planet) => {
      const nakshatra = nakshatraFromLongitude(planet.longitude);
      return {
        planet: planet.name,
        siderealLongitude: planet.longitude,
        rashi: planet.rashi,
        degreeInRashi: planet.degreeInSign,
        house: planet.house,
        nakshatra: nakshatra.name,
        pada: nakshatra.pada
      };
    })
  });
}

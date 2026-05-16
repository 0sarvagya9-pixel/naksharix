import "server-only";

import * as Astronomy from "astronomy-engine";
import { calculatePanchang } from "@/lib/astrology/own-engine/panchang";
import { buildD1Chart, buildD9Chart } from "@/lib/astrology/own-engine/charts";
import { nakshatraFromLongitude } from "@/lib/astrology/own-engine/nakshatra";
import { julianDayFromUtc, localBirthToUtcDate, localSiderealTimeDegrees, normalizeBirthDate, normalizeBirthTime, normalizeDegrees, parseBirthDateTime, parseTimezoneOffsetToHours } from "@/lib/astrology/own-engine/time";
import { lahiriAyanamsa, longitudeToRashi, tropicalToSidereal, wholeSignHouse } from "@/lib/astrology/own-engine/zodiac";
import { isAstroSageSarvagyaPandeyInput, printAstroSageSarvagyaBenchmarkComparison } from "@/lib/astrology/test-cases/astrosage-sarvagya-pandey";
import type { AstrologyBirthInput, BirthChartData, PlanetPosition } from "@/lib/astrology/types";

type ComputedPlanet = PlanetPosition & {
  absoluteLongitude: number;
  rashiNumber: number;
};

type SupportedBody = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";

const physicalBodies: SupportedBody[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const planetOrder = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"] as const;

export function calculateOwnEngineBirthChart(input: AstrologyBirthInput): BirthChartData {
  const dateText = normalizeBirthDate(input.dateOfBirth);
  const timeText = normalizeBirthTime(input.timeOfBirth);
  const parts = parseBirthDateTime(dateText, timeText);
  const timezoneOffset = parseTimezoneOffsetToHours(input.timezone, dateText, timeText);
  const utcDate = localBirthToUtcDate(parts, timezoneOffset);
  const julianDay = julianDayFromUtc(utcDate);
  const astronomyTime = Astronomy.MakeTime(utcDate);
  const ayanamsa = lahiriAyanamsa(julianDay);
  const ascendantLongitude = calculateAscendant(julianDay, input.latitude, input.longitude);
  const ascendant = longitudeToRashi(ascendantLongitude);
  const planetLongitudes = calculateSiderealLongitudes(astronomyTime, julianDay);
  const planets = buildPlanetPositions(planetLongitudes, ascendant.rashiNumber);
  const sun = planets.find((planet) => planet.planet === "Sun");
  const moon = planets.find((planet) => planet.planet === "Moon");
  const moonNakshatra = nakshatraFromLongitude(moon?.absoluteLongitude ?? 0);
  const d1 = buildD1Chart(ascendant.rashiNumber, planets);
  const d9 = buildD9Chart(ascendantLongitude, planets);
  const notAvailable = notAvailableFor(input.language);
  const panchang = calculatePanchang({
    date: utcDate,
    latitude: input.latitude,
    longitude: input.longitude,
    sunLongitude: sun?.absoluteLongitude ?? 0,
    moonLongitude: moon?.absoluteLongitude ?? 0,
    timezoneOffset,
    notAvailable
  });

  const debugData = {
    dateOfBirth: dateText,
    timeOfBirth: timeText,
    utcDate: utcDate.toISOString(),
    julianDay,
    timezoneOffset,
    ayanamsa,
    ascendantLongitude,
    ascendant,
    planets,
    panchang
  };

  logOwnEngineVerification(input, debugData);

  return {
    profile: { name: input.name, gender: input.gender },
    birthDetails: {
      dateOfBirth: dateText,
      timeOfBirth: timeText,
      birthPlace: input.birthPlace,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone
    },
    panchang,
    avakhada: {
      moonSign: moon?.sign ?? notAvailable,
      sunSign: sun?.sign ?? notAvailable,
      ascendant: ascendant.rashi,
      nakshatra: moonNakshatra.name,
      gana: notAvailable,
      yoni: notAvailable,
      nadi: notAvailable
    },
    charts: {
      lagna: d1,
      navamsa: d9
    },
    planetPositions: planets.map((planet) => ({
      planet: planet.planet,
      sign: planet.sign,
      house: planet.house,
      degree: planet.degree,
      nakshatra: planet.nakshatra,
      pada: planet.pada,
      retrograde: planet.retrograde
    })),
    housePositions: d1,
    vimshottariDasha: [],
    manglikDosha: unavailableDosha(notAvailable),
    kaalSarpDosha: unavailableDosha(notAvailable),
    sadeSati: { status: notAvailable, guidance: notAvailable },
    nakshatraAnalysis: analysisText(input.language, "nakshatra", moonNakshatra.name, moonNakshatra.pada),
    lagnaAnalysis: analysisText(input.language, "lagna", ascendant.rashi, ascendant.degreeInSign),
    remedies: [notAvailable],
    calculationMeta: {
      provider: "own_engine",
      ayanamsaName: "Lahiri / Chitra Paksha",
      ayanamsaDegree: Number(ayanamsa.toFixed(6)),
      houseSystem: "Vedic Whole Sign",
      nodeMode: "Mean lunar node benchmark mode",
      julianDay: Number(julianDay.toFixed(8)),
      utcDate: utcDate.toISOString()
    }
  };
}

function calculateSiderealLongitudes(time: Astronomy.AstroTime, julianDay: number) {
  const entries: Array<[string, number]> = physicalBodies.map((body) => [body, siderealLongitude(body, time, julianDay)]);
  const rahu = meanRahuLongitude(julianDay);
  entries.push(["Rahu", rahu], ["Ketu", normalizeDegrees(rahu + 180)]);
  return Object.fromEntries(entries) as Record<(typeof planetOrder)[number], number>;
}

function siderealLongitude(body: SupportedBody, time: Astronomy.AstroTime, julianDay: number) {
  const tropical = body === "Moon"
    ? Astronomy.EclipticGeoMoon(time).lon
    : Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[body], time, true)).elon;
  return tropicalToSidereal(tropical, julianDay);
}

function meanRahuLongitude(julianDay: number) {
  const t = (julianDay - 2451545.0) / 36525;
  const tropicalNode = 125.04455501 - 1934.1361849 * t + 0.0020762 * t * t + (t * t * t) / 467410 - (t * t * t * t) / 60616000;
  return tropicalToSidereal(normalizeDegrees(tropicalNode), julianDay);
}

function buildPlanetPositions(longitudes: Record<(typeof planetOrder)[number], number>, ascendantSignNumber: number): ComputedPlanet[] {
  return planetOrder.map((planet) => {
    const absoluteLongitude = longitudes[planet];
    const rashi = longitudeToRashi(absoluteLongitude);
    const nakshatra = nakshatraFromLongitude(absoluteLongitude);
    return {
      planet,
      sign: rashi.rashi,
      house: wholeSignHouse(rashi.rashiNumber, ascendantSignNumber),
      degree: Number(rashi.degreeInSign.toFixed(4)),
      nakshatra: nakshatra.name,
      pada: nakshatra.pada,
      retrograde: false,
      absoluteLongitude: Number(absoluteLongitude.toFixed(6)),
      rashiNumber: rashi.rashiNumber
    };
  });
}

function calculateAscendant(julianDay: number, latitude: number, longitude: number) {
  const lst = localSiderealTimeDegrees(julianDay, longitude);
  const epsilon = degToRad(23.439291 - 0.00000036 * (julianDay - 2451545.0));
  const phi = degToRad(latitude);
  const theta = degToRad(lst);
  const descendant = radToDeg(Math.atan2(-Math.cos(theta), Math.sin(theta) * Math.cos(epsilon) + Math.tan(phi) * Math.sin(epsilon)));
  return tropicalToSidereal(normalizeDegrees(descendant + 180), julianDay);
}

function unavailableDosha(notAvailable: string) {
  return { present: false, severity: notAvailable, summary: notAvailable, remedies: [notAvailable] };
}

function notAvailableFor(language: AstrologyBirthInput["language"]) {
  if (language === "hi") return "उपलब्ध नहीं";
  if (language === "hinglish") return "Available nahi hai";
  return "Not available";
}

function calculationNotAvailableFor(language: AstrologyBirthInput["language"]) {
  if (language === "hi") return "गणना अभी उपलब्ध नहीं है।";
  if (language === "hinglish") return "Calculation abhi available nahi hai.";
  return "Calculation not available yet.";
}

function analysisText(language: AstrologyBirthInput["language"], type: "nakshatra" | "lagna", value: string, detail: number) {
  if (language === "hi") {
    return type === "nakshatra"
      ? `${value} नक्षत्र और पद ${detail} चंद्रमा की सिडेरियल गणना से प्राप्त हुआ है।`
      : `${value} लग्न ${Number(detail).toFixed(2)}° पर है और यही प्रथम भाव का आधार है।`;
  }
  if (language === "hinglish") {
    return type === "nakshatra"
      ? `${value} nakshatra aur pada ${detail} Moon ki sidereal calculation se mila hai.`
      : `${value} Lagna ${Number(detail).toFixed(2)}° par hai aur ye first house ka base hai.`;
  }
  return type === "nakshatra"
    ? `${value} nakshatra and pada ${detail} are calculated from the Moon's sidereal longitude.`
    : `${value} Lagna at ${Number(detail).toFixed(2)}° sets the whole-sign first house.`;
}

function degToRad(value: number) {
  return (value * Math.PI) / 180;
}

function radToDeg(value: number) {
  return (value * 180) / Math.PI;
}

function logOwnEngineVerification(input: AstrologyBirthInput, data: {
  dateOfBirth: string;
  timeOfBirth: string;
  utcDate: string;
  julianDay: number;
  timezoneOffset: number;
  ayanamsa: number;
  ascendantLongitude: number;
  ascendant: ReturnType<typeof longitudeToRashi>;
  planets: ComputedPlanet[];
  panchang: ReturnType<typeof calculatePanchang>;
}) {
  console.info("Active astrology provider: own_engine");
  if (process.env.NODE_ENV === "production" || process.env.KUNDLI_DEBUG !== "true") return;

  const payload = {
    input: {
      name: input.name,
      dateOfBirth: data.dateOfBirth,
      timeOfBirth: data.timeOfBirth,
      birthPlace: input.birthPlace,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone,
      timezoneOffset: data.timezoneOffset,
      utcConvertedTime: data.utcDate,
      julianDay: Number(data.julianDay.toFixed(8)),
      activeProvider: "own_engine",
      ayanamsaName: "Lahiri / Chitra Paksha",
      ayanamsaDegree: Number(data.ayanamsa.toFixed(6)),
      houseSystem: "Vedic Whole Sign",
      nodeMode: "Mean lunar node benchmark mode",
      language: input.language
    },
    calculated: {
      lagnaLongitude: Number(data.ascendantLongitude.toFixed(6)),
      lagnaRashi: data.ascendant.rashi,
      lagnaDegree: Number(data.ascendant.degreeInSign.toFixed(4)),
      planets: data.planets.map((planet) => ({
        planet: planet.planet,
        absoluteLongitude: planet.absoluteLongitude,
        rashiNumber: planet.rashiNumber,
        rashiName: planet.sign,
        degreeInRashi: planet.degree,
        houseNumber: planet.house,
        nakshatra: planet.nakshatra,
        pada: planet.pada
      })),
      unavailable: {
        vimshottariDasha: calculationNotAvailableFor(input.language),
        manglikDosh: calculationNotAvailableFor(input.language),
        sadeSati: calculationNotAvailableFor(input.language)
      },
      panchang: data.panchang
    }
  };
  console.info(`[Naksharix Kundli Verification]\n${JSON.stringify(payload, null, 2)}`);

  if (isAstroSageSarvagyaPandeyInput(input)) {
    printAstroSageSarvagyaBenchmarkComparison({
      ayanamsa: data.ayanamsa,
      ascendant: data.ascendant,
      planets: data.planets,
      panchang: data.panchang,
      vimshottariDasha: []
    });
  }
}

import * as Astronomy from "astronomy-engine";
import { calculateVimshottariDasha } from "@/lib/astrology/premium-engine/dasha";
import { nakshatraFromLongitude } from "@/lib/astrology/own-engine/nakshatra";
import {
  julianDayFromUtc,
  localBirthToUtcDate,
  localSiderealTimeDegrees,
  normalizeBirthDate,
  normalizeBirthTime,
  normalizeDegrees,
  parseBirthDateTime,
  parseTimezoneOffsetToHours
} from "@/lib/astrology/own-engine/time";
import { lahiriAyanamsa, longitudeToRashi, tropicalToSidereal, wholeSignHouse } from "@/lib/astrology/own-engine/zodiac";
import type { CanonicalChartInput, CanonicalChartResult, CanonicalPlanet } from "@/lib/astrology/ephemeris/types";

type SupportedBody = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";
type PlanetName = CanonicalPlanet["planet"];

const physicalBodies: SupportedBody[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const planetOrder: PlanetName[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

export type InternalChartInput = Partial<CanonicalChartInput> & {
  date?: string;
  time?: string;
  place?: string;
  house_system?: string;
};

export function calculateInternalChart(input: InternalChartInput): CanonicalChartResult {
  const normalized = normalizeChartInput(input);
  const dateText = normalizeBirthDate(normalized.dateOfBirth);
  const timeText = normalizeBirthTime(normalized.timeOfBirth);
  const parts = parseBirthDateTime(dateText, timeText);
  const timezoneOffset = parseTimezoneOffsetToHours(normalized.timezone, dateText, timeText);
  const utcDate = localBirthToUtcDate(parts, timezoneOffset);
  const julianDay = julianDayFromUtc(utcDate);
  const time = Astronomy.MakeTime(utcDate);
  const ayanamsa = lahiriAyanamsa(julianDay);
  const ascendantLongitude = calculateAscendant(julianDay, normalized.latitude, normalized.longitude);
  const ascendantRashi = longitudeToRashi(ascendantLongitude);
  const longitudes = calculateSiderealLongitudes(time, julianDay);
  const planets = buildCanonicalPlanets(longitudes, ascendantRashi.rashiNumber, time, julianDay);
  const moon = planets.find((planet) => planet.planet === "Moon");
  const moonNakshatra = moon?.absoluteLongitude != null ? nakshatraFromLongitude(moon.absoluteLongitude) : { name: null, pada: null };
  const dasha = moon?.absoluteLongitude != null
    ? calculateVimshottariDasha({ moonLongitude: moon.absoluteLongitude, birthDateTime: utcDate, currentDate: new Date() })
    : null;

  return {
    normalizedInput: {
      ...normalized,
      dateOfBirth: dateText,
      timeOfBirth: timeText,
      timezone: normalized.timezone,
      ayanamsa: normalized.ayanamsa ?? "lahiri",
      houseSystem: normalized.houseSystem ?? "Vedic Whole Sign"
    },
    ayanamsa: {
      key: "lahiri",
      label: "Lahiri / Chitra Paksha",
      degree: round(ayanamsa),
      verified: false
    },
    ascendant: {
      sign: ascendantRashi.rashi,
      degree: round(ascendantRashi.degreeInSign),
      absoluteLongitude: round(ascendantLongitude)
    },
    moon: {
      sign: moon?.sign ?? null,
      degree: moon?.degree ?? null,
      absoluteLongitude: moon?.absoluteLongitude ?? null
    },
    nakshatra: {
      name: moonNakshatra.name,
      pada: moonNakshatra.pada
    },
    planets,
    houses: buildWholeSignHouses(ascendantRashi.rashiNumber, planets),
    dasha: dasha
      ? {
          startingMahadashaLord: dasha.startingMahadashaLord,
          balanceAtBirth: `${dasha.balanceAtBirthYears} years`,
          transitions: dasha.mahadashas.slice(0, 9).map((period) => ({
            lord: period.lord,
            startsAt: period.startsAt,
            endsAt: period.endsAt
          })),
          verified: false
        }
      : undefined,
    metadata: {
      provider: "naksharix_astronomy_engine_lahiri_internal",
      calculationMode: "astronomy_engine_geocentric_sidereal_limited_internal",
      precisionLevel: "provider_verified",
      verified: false,
      limitations: [
        "Planet positions are calculated internally with astronomy-engine and Lahiri sidereal conversion.",
        "Ascendant and planet positions are provider-regression-tested but not externally verified.",
        "Rahu uses mean lunar node formula; Ketu is opposite Rahu.",
        "Combustion is a calculated proximity flag, not a reviewed predictive judgment.",
        "No external premium precision claim should be made until trusted external fixtures pass."
      ]
    }
  };
}

function normalizeChartInput(input: InternalChartInput): CanonicalChartInput {
  const dateOfBirth = input.dateOfBirth ?? input.date;
  const timeOfBirth = input.timeOfBirth ?? input.time;
  const birthPlace = input.birthPlace ?? input.place ?? "Unknown";
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);

  if (!dateOfBirth) throw new Error("Date is required for chart calculation.");
  if (!timeOfBirth) throw new Error("Time is required for chart calculation.");
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error("Latitude must be between -90 and 90.");
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error("Longitude must be between -180 and 180.");

  return {
    ...input,
    name: input.name ?? "Internal calculation",
    gender: input.gender ?? "not_specified",
    dateOfBirth,
    timeOfBirth,
    birthPlace,
    latitude,
    longitude,
    timezone: input.timezone ?? "Asia/Kolkata",
    language: input.language ?? "en",
    houseSystem: input.houseSystem ?? input.house_system ?? "Vedic Whole Sign",
    ayanamsa: input.ayanamsa ?? "lahiri"
  };
}

function calculateSiderealLongitudes(time: Astronomy.AstroTime, julianDay: number): Record<PlanetName, number> {
  const entries: Array<[PlanetName, number]> = physicalBodies.map((body) => [body, siderealLongitude(body, time, julianDay)]);
  const rahu = meanRahuLongitude(julianDay);
  entries.push(["Rahu", rahu], ["Ketu", normalizeDegrees(rahu + 180)]);
  return Object.fromEntries(entries) as Record<PlanetName, number>;
}

function siderealLongitude(body: SupportedBody, time: Astronomy.AstroTime, julianDay: number) {
  const tropical = body === "Moon"
    ? Astronomy.EclipticGeoMoon(time).lon
    : Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[body], time, true)).elon;
  return tropicalToSidereal(tropical, julianDay);
}

function buildCanonicalPlanets(longitudes: Record<PlanetName, number>, ascendantSignNumber: number, time: Astronomy.AstroTime, julianDay: number): CanonicalPlanet[] {
  const sunLongitude = longitudes.Sun;

  return planetOrder.map((planet) => {
    const absoluteLongitude = round(longitudes[planet]);
    const rashi = longitudeToRashi(absoluteLongitude);
    const retrograde = isPhysicalBody(planet) && planet !== "Sun" && planet !== "Moon"
      ? isRetrograde(planet, time, julianDay)
      : planet === "Rahu" || planet === "Ketu";

    return {
      planet,
      sign: rashi.rashi,
      degree: round(rashi.degreeInSign),
      absoluteLongitude,
      house: wholeSignHouse(rashi.rashiNumber, ascendantSignNumber),
      retrograde,
      combust: combustionFlag(planet, absoluteLongitude, sunLongitude)
    };
  });
}

function isRetrograde(body: SupportedBody, time: Astronomy.AstroTime, julianDay: number) {
  const laterDate = new Date(time.date.getTime() + 24 * 60 * 60 * 1000);
  const laterJulian = julianDay + 1;
  const later = siderealLongitude(body, Astronomy.MakeTime(laterDate), laterJulian);
  const now = siderealLongitude(body, time, julianDay);
  const delta = signedDelta(later - now);
  return delta < 0;
}

function isPhysicalBody(planet: PlanetName): planet is SupportedBody {
  return physicalBodies.includes(planet as SupportedBody);
}

function combustionFlag(planet: PlanetName, planetLongitude: number, sunLongitude: number) {
  if (planet === "Sun" || planet === "Moon" || planet === "Rahu" || planet === "Ketu") return null;
  return Math.abs(signedDelta(planetLongitude - sunLongitude)) <= 8.5;
}

function buildWholeSignHouses(ascendantSignNumber: number, planets: CanonicalPlanet[]) {
  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const signNumber = ((ascendantSignNumber + house - 2) % 12) + 1;
    return {
      house,
      sign: longitudeToRashi((signNumber - 1) * 30).rashi,
      planets: planets.filter((planet) => planet.house === house).map((planet) => planet.planet)
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

function meanRahuLongitude(julianDay: number) {
  const t = (julianDay - 2451545.0) / 36525;
  const tropicalNode = 125.04455501 - 1934.1361849 * t + 0.0020762 * t * t + (t * t * t) / 467410 - (t * t * t * t) / 60616000;
  return tropicalToSidereal(normalizeDegrees(tropicalNode), julianDay);
}

function signedDelta(value: number) {
  const normalized = normalizeDegrees(value);
  return normalized > 180 ? normalized - 360 : normalized;
}

function degToRad(value: number) {
  return (value * Math.PI) / 180;
}

function radToDeg(value: number) {
  return (value * 180) / Math.PI;
}

function round(value: number, digits = 6) {
  return Number(value.toFixed(digits));
}

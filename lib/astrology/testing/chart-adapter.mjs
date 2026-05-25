import * as Astronomy from "astronomy-engine";

const rashis = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];
const physicalBodies = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const planetOrder = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const vimshottari = [
  ["Ketu", 7], ["Venus", 20], ["Sun", 6], ["Moon", 10], ["Mars", 7], ["Rahu", 18], ["Jupiter", 16], ["Saturn", 19], ["Mercury", 17]
];

export async function calculateChartForFixture(input) {
  const normalized = normalizeInput(input);
  const utcDate = localBirthToUtcDate(parseDate(normalized.date), parseTime(normalized.time), parseTimezoneOffset(normalized.timezone));
  const julianDay = julianDayFromUtc(utcDate);
  const time = Astronomy.MakeTime(utcDate);
  const ayanamsa = lahiriAyanamsa(julianDay);
  const ascendantLongitude = calculateAscendant(julianDay, normalized.latitude, normalized.longitude);
  const ascendant = longitudeToRashi(ascendantLongitude);
  const longitudes = calculateSiderealLongitudes(time, julianDay);
  const planets = planetOrder.map((planet) => {
    const absoluteLongitude = round(longitudes[planet]);
    const rashi = longitudeToRashi(absoluteLongitude);
    return {
      planet,
      sign: rashi.rashi,
      degree: round(rashi.degreeInSign),
      absoluteLongitude,
      house: wholeSignHouse(rashi.rashiNumber, ascendant.rashiNumber),
      retrograde: ["Rahu", "Ketu"].includes(planet) ? true : ["Sun", "Moon"].includes(planet) ? false : isRetrograde(planet, time, julianDay),
      combust: combustionFlag(planet, absoluteLongitude, longitudes.Sun)
    };
  });
  const moon = planets.find((planet) => planet.planet === "Moon");
  const moonNakshatra = nakshatraFromLongitude(moon.absoluteLongitude);
  const dasha = calculateDasha(moon.absoluteLongitude, utcDate);

  return {
    normalizedInput: normalized,
    ayanamsa: { key: "lahiri", label: "Lahiri / Chitra Paksha", degree: round(ayanamsa), verified: false },
    ascendant: { sign: ascendant.rashi, degree: round(ascendant.degreeInSign), absoluteLongitude: round(ascendantLongitude) },
    moon: { sign: moon.sign, degree: moon.degree, absoluteLongitude: moon.absoluteLongitude },
    planets,
    houses: buildHouses(ascendant.rashiNumber, planets),
    nakshatra: { name: moonNakshatra.name, pada: moonNakshatra.pada },
    dasha,
    metadata: {
      providerName: "naksharix_astronomy_engine_lahiri_internal",
      calculationMode: "astronomy_engine_geocentric_sidereal_limited_internal",
      precisionLevel: "limited_internal",
      supportedFields: [
        "ascendant.sign",
        "ascendant.degree",
        "planet.degrees",
        "moon.longitude",
        "nakshatra.from_moon_longitude",
        "dasha.balance_from_moon_longitude",
        "whole_sign_houses",
        "retrograde.approx_daily_delta",
        "combust.proximity_flag"
      ],
      unsupportedFields: [
        "external_precision_claim",
        "verified_ascendant_fixture",
        "verified_planet_fixture",
        "verified_dasha_transition_fixture"
      ],
      verified: false
    }
  };
}

function normalizeInput(input) {
  const date = input?.date ?? input?.dateOfBirth;
  const time = input?.time ?? input?.timeOfBirth;
  const latitude = Number(input?.latitude);
  const longitude = Number(input?.longitude);
  if (!date) throw new Error("Fixture date is required.");
  if (!time) throw new Error("Fixture time is required.");
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error("Fixture latitude is invalid.");
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error("Fixture longitude is invalid.");
  return {
    date,
    time,
    timezone: input?.timezone ?? "+05:30",
    latitude,
    longitude,
    place: input?.place ?? input?.birthPlace ?? "Unknown",
    ayanamsa: input?.ayanamsa ?? "lahiri",
    house_system: input?.house_system ?? input?.houseSystem ?? "Vedic Whole Sign"
  };
}

function calculateSiderealLongitudes(time, julianDay) {
  const entries = Object.fromEntries(physicalBodies.map((body) => [body, siderealLongitude(body, time, julianDay)]));
  const rahu = meanRahuLongitude(julianDay);
  entries.Rahu = rahu;
  entries.Ketu = normalizeDegrees(rahu + 180);
  return entries;
}

function siderealLongitude(body, time, julianDay) {
  const tropical = body === "Moon"
    ? Astronomy.EclipticGeoMoon(time).lon
    : Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[body], time, true)).elon;
  return tropicalToSidereal(tropical, julianDay);
}

function isRetrograde(body, time, julianDay) {
  if (!physicalBodies.includes(body)) return false;
  const laterDate = new Date(time.date.getTime() + 24 * 60 * 60 * 1000);
  const delta = signedDelta(siderealLongitude(body, Astronomy.MakeTime(laterDate), julianDay + 1) - siderealLongitude(body, time, julianDay));
  return delta < 0;
}

function calculateDasha(moonLongitude, birthDate) {
  const span = 360 / 27;
  const nakIndex = Math.min(26, Math.floor(normalizeDegrees(moonLongitude) / span));
  const lordIndex = nakIndex % 9;
  const [lord, years] = vimshottari[lordIndex];
  const offset = normalizeDegrees(moonLongitude) - nakIndex * span;
  const balanceYears = round((1 - offset / span) * years);
  const startsAt = new Date(birthDate.getTime() - (years - balanceYears) * 365.2425 * 24 * 60 * 60 * 1000);
  const transitions = [];
  let cursor = startsAt;
  for (let i = 0; i < 9; i += 1) {
    const [periodLord, duration] = vimshottari[(lordIndex + i) % 9];
    const next = new Date(cursor.getTime() + duration * 365.2425 * 24 * 60 * 60 * 1000);
    transitions.push({ lord: periodLord, startsAt: cursor.toISOString(), endsAt: next.toISOString() });
    cursor = next;
  }
  return { startingMahadashaLord: lord, balanceAtBirth: `${balanceYears} years`, transitions, supported: true, verified: false };
}

function buildHouses(ascendantSignNumber, planets) {
  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const signNumber = ((ascendantSignNumber + house - 2) % 12) + 1;
    return { house, sign: rashis[signNumber - 1], planets: planets.filter((planet) => planet.house === house).map((planet) => planet.planet) };
  });
}

function combustionFlag(planet, longitude, sunLongitude) {
  if (["Sun", "Moon", "Rahu", "Ketu"].includes(planet)) return null;
  return Math.abs(signedDelta(longitude - sunLongitude)) <= 8.5;
}

function nakshatraFromLongitude(longitude) {
  const span = 360 / 27;
  const normalized = normalizeDegrees(longitude);
  const index = Math.min(26, Math.floor((normalized + 1e-9) / span));
  const pada = Math.min(4, Math.floor(((normalized + 1e-9) % span) / (span / 4)) + 1);
  return { name: nakshatras[index], pada };
}

function longitudeToRashi(longitude) {
  const normalized = normalizeDegrees(longitude);
  const index = Math.floor(normalized / 30);
  return { rashi: rashis[index], rashiNumber: index + 1, degreeInSign: normalized % 30 };
}

function wholeSignHouse(planetSignNumber, ascendantSignNumber) {
  return ((planetSignNumber - ascendantSignNumber + 12) % 12) + 1;
}

function calculateAscendant(julianDay, latitude, longitude) {
  const lst = localSiderealTimeDegrees(julianDay, longitude);
  const epsilon = degToRad(23.439291 - 0.00000036 * (julianDay - 2451545.0));
  const phi = degToRad(latitude);
  const theta = degToRad(lst);
  const descendant = radToDeg(Math.atan2(-Math.cos(theta), Math.sin(theta) * Math.cos(epsilon) + Math.tan(phi) * Math.sin(epsilon)));
  return tropicalToSidereal(normalizeDegrees(descendant + 180), julianDay);
}

function meanRahuLongitude(julianDay) {
  const t = (julianDay - 2451545.0) / 36525;
  return tropicalToSidereal(normalizeDegrees(125.04455501 - 1934.1361849 * t + 0.0020762 * t * t + (t * t * t) / 467410 - (t * t * t * t) / 60616000), julianDay);
}

function tropicalToSidereal(longitude, julianDay) {
  return normalizeDegrees(longitude - lahiriAyanamsa(julianDay));
}

function lahiriAyanamsa(julianDay) {
  return 23.856446 + (50.290966 / 3600) * ((julianDay - 2451545.0) / 365.2425);
}

function localSiderealTimeDegrees(julianDay, longitude) {
  const t = (julianDay - 2451545.0) / 36525;
  return normalizeDegrees(280.46061837 + 360.98564736629 * (julianDay - 2451545.0) + 0.000387933 * t * t - (t * t * t) / 38710000 + longitude);
}

function localBirthToUtcDate(date, time, timezoneOffset) {
  return new Date(Date.UTC(date.year, date.month - 1, date.day, time.hour, time.minute, time.second) - timezoneOffset * 60 * 60 * 1000);
}

function julianDayFromUtc(date) {
  const year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  let y = year;
  if (month <= 2) {
    y -= 1;
    month += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

function parseDate(date) {
  const match = String(date).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error("Date must be YYYY-MM-DD.");
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function parseTime(time) {
  const match = String(time).match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) throw new Error("Time must be HH:MM or HH:MM:SS.");
  return { hour: Number(match[1]), minute: Number(match[2]), second: Number(match[3] ?? 0) };
}

function parseTimezoneOffset(timezone) {
  const value = String(timezone ?? "+05:30").trim();
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  const match = value.match(/^([+-])?(\d{1,2})(?::?(\d{2})|\.(\d{1,2}))?$/);
  if (!match) return 5.5;
  const sign = match[1] === "-" ? -1 : 1;
  const minutes = match[3] ? Number(match[3]) : match[4] ? Number(`0.${match[4]}`) * 60 : 0;
  return sign * (Number(match[2]) + minutes / 60);
}

function signedDelta(value) {
  const normalized = normalizeDegrees(value);
  return normalized > 180 ? normalized - 360 : normalized;
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function degToRad(value) {
  return (value * Math.PI) / 180;
}

function radToDeg(value) {
  return (value * 180) / Math.PI;
}

function round(value, digits = 6) {
  return Number(value.toFixed(digits));
}

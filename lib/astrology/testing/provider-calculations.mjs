import * as Astronomy from "astronomy-engine";
import { calculateChartForFixture } from "./chart-adapter.mjs";

export const providerMetadata = {
  providerName: "astronomy-engine",
  providerVersion: "2.1.19",
  calculationMode: "naksharix_internal_astronomy_engine_geocentric_sidereal_lahiri",
  ayanamsaMethod: "Naksharix Lahiri / Chitra Paksha approximation",
  precisionLevel: "deterministic_provider_regression",
  verificationLevel: "provider_verified",
  externalVerification: false
};

const rashis = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];
const tithis = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"];
const yogas = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const repeatingKaranas = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];
const planetOrder = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

export async function providerChart(input) {
  const chart = await calculateChartForFixture(input);
  return {
    ...chart,
    metadata: {
      ...chart.metadata,
      providerName: providerMetadata.providerName,
      providerVersion: providerMetadata.providerVersion,
      calculationMode: providerMetadata.calculationMode,
      precisionLevel: providerMetadata.precisionLevel,
      verificationLevel: providerMetadata.verificationLevel,
      externalVerification: false,
      verified: true
    }
  };
}

export function providerPanchang(input) {
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const timezone = String(input.timezone ?? "+05:30");
  const timezoneOffset = parseTimezoneOffset(timezone);
  const localDay = parseDate(input.date);
  const localNoonUtc = new Date(Date.UTC(localDay.year, localDay.month - 1, localDay.day, 12) - timezoneOffset * 60 * 60 * 1000);
  const time = Astronomy.MakeTime(localNoonUtc);
  const julianDay = julianDayFromUtc(localNoonUtc);
  const sunLongitude = siderealLongitude("Sun", time, julianDay);
  const moonLongitude = siderealMoonLongitude(time, julianDay);
  const elongation = normalizeDegrees(moonLongitude - sunLongitude);
  const nakshatra = nakshatraFromLongitude(moonLongitude);
  const yogaLongitude = normalizeDegrees(sunLongitude + moonLongitude);
  const sunTimes = riseSet(Astronomy.Body.Sun, localDay, latitude, longitude, timezoneOffset);
  const moonTimes = riseSet(Astronomy.Body.Moon, localDay, latitude, longitude, timezoneOffset);
  const vaar = weekdayName(localNoonUtc, timezoneOffset);
  const windows = sunTimes.rise && sunTimes.set ? daySegmentWindows(sunTimes.rise, sunTimes.set, vaar) : null;
  const missingFields = [
    sunTimes.rise ? null : "sunrise",
    sunTimes.set ? null : "sunset",
    windows?.rahuKaal ? null : "rahuKaal",
    windows?.yamaganda ? null : "yamaganda",
    windows?.gulikaKaal ? null : "gulikaKaal",
    windows?.abhijitMuhurat ? null : "abhijitMuhurat"
  ].filter(Boolean);

  return {
    date: input.date,
    location: input.place,
    timezone,
    latitude,
    longitude,
    sunrise: sunTimes.rise,
    sunset: sunTimes.set,
    moonrise: moonTimes.rise,
    moonset: moonTimes.set,
    tithi: tithis[Math.min(29, Math.floor(elongation / 12))],
    paksha: Math.floor(elongation / 12) < 15 ? "Shukla Paksha" : "Krishna Paksha",
    nakshatra: nakshatra.name,
    nakshatraPada: nakshatra.pada,
    yoga: yogas[Math.min(26, Math.floor(yogaLongitude / (360 / 27)))],
    karana: karanaFromElongation(elongation),
    vaar,
    rahuKaal: windows?.rahuKaal ?? null,
    yamaganda: windows?.yamaganda ?? null,
    gulikaKaal: windows?.gulikaKaal ?? null,
    abhijitMuhurat: windows?.abhijitMuhurat ?? null,
    missingFields,
    metadata: {
      ...providerMetadata,
      calculationMode: "naksharix_internal_panchang_astronomy_engine_local_noon",
      limitations: [
        "Provider-verified means deterministic regression against Naksharix internal provider output.",
        "This is not external Swiss Ephemeris verification.",
        "Tithi, Nakshatra, Yoga, and Karana are sampled at local noon."
      ]
    }
  };
}

export async function providerTransit(input) {
  const chart = await providerChart({
    date: input.date,
    time: input.time ?? "12:00",
    timezone: input.timezone,
    latitude: input.latitude,
    longitude: input.longitude,
    place: input.place ?? "Transit reference",
    ayanamsa: input.ayanamsa ?? "lahiri",
    house_system: "Vedic Whole Sign"
  });
  return {
    input,
    positions: chart.planets.map((planet) => ({
      planet: planet.planet,
      sign: planet.sign,
      degree: planet.degree,
      absoluteLongitude: planet.absoluteLongitude,
      retrograde: planet.retrograde ?? null
    })),
    metadata: {
      ...providerMetadata,
      calculationMode: "naksharix_internal_transit_snapshot",
      limitations: ["Transit snapshot is provider-verified for fixed dates; ingress windows remain unavailable."]
    }
  };
}

export function providerVargaFromPlanets(planets) {
  const charts = ["D1", "D2", "D3", "D9", "D10", "D12"];
  return charts.map((chart) => ({
    chart,
    verificationLevel: "provider_verified",
    publicEnabled: false,
    placements: planets.map((planet) => {
      const placement = vargaPlacement(chart, planet.absoluteLongitude);
      return {
        planet: planet.planet,
        sourceLongitude: planet.absoluteLongitude,
        sign: placement.sign,
        degree: placement.degree
      };
    })
  }));
}

export function planetExpectedMap(planets) {
  return Object.fromEntries(planetOrder.map((name) => {
    const planet = planets.find((entry) => entry.planet === name);
    return [name, {
      sign: planet.sign,
      degree: planet.degree,
      absoluteLongitude: planet.absoluteLongitude,
      retrograde: planet.retrograde ?? null,
      combust: planet.combust ?? null,
      toleranceDegrees: 0.000001
    }];
  }));
}

function siderealLongitude(body, time, julianDay) {
  const tropical = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[body], time, true)).elon;
  return tropicalToSidereal(tropical, julianDay);
}

function siderealMoonLongitude(time, julianDay) {
  return tropicalToSidereal(Astronomy.EclipticGeoMoon(time).lon, julianDay);
}

function riseSet(body, localDay, latitude, longitude, timezoneOffset) {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const startUtc = new Date(Date.UTC(localDay.year, localDay.month - 1, localDay.day) - timezoneOffset * 60 * 60 * 1000);
  const rise = Astronomy.SearchRiseSet(body, observer, +1, startUtc, 1);
  const set = Astronomy.SearchRiseSet(body, observer, -1, startUtc, 1);
  return {
    rise: rise ? formatTimeWithOffset(rise.date, timezoneOffset) : null,
    set: set ? formatTimeWithOffset(set.date, timezoneOffset) : null
  };
}

function daySegmentWindows(sunrise, sunset, weekday) {
  const riseMinutes = parseClock(sunrise);
  const setMinutes = parseClock(sunset);
  const segment = (setMinutes - riseMinutes) / 8;
  const weekdayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(weekday);
  const rahuSegments = [8, 2, 7, 5, 6, 4, 3];
  const yamagandaSegments = [5, 4, 3, 2, 1, 7, 6];
  const gulikaSegments = [7, 6, 5, 4, 3, 2, 1];
  const segmentRange = (oneBased) => `${formatClock(riseMinutes + (oneBased - 1) * segment)} - ${formatClock(riseMinutes + oneBased * segment)}`;
  const solarNoon = (riseMinutes + setMinutes) / 2;
  return {
    rahuKaal: segmentRange(rahuSegments[weekdayIndex] ?? 8),
    yamaganda: segmentRange(yamagandaSegments[weekdayIndex] ?? 5),
    gulikaKaal: segmentRange(gulikaSegments[weekdayIndex] ?? 7),
    abhijitMuhurat: `${formatClock(solarNoon - 24)} - ${formatClock(solarNoon + 24)}`
  };
}

function karanaFromElongation(elongation) {
  const halfTithi = Math.floor(elongation / 6) + 1;
  if (halfTithi === 1) return "Kimstughna";
  if (halfTithi === 58) return "Shakuni";
  if (halfTithi === 59) return "Chatushpada";
  if (halfTithi >= 60) return "Naga";
  return repeatingKaranas[(halfTithi - 2) % repeatingKaranas.length];
}

function vargaPlacement(chart, longitude) {
  const normalized = normalizeDegrees(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  if (chart === "D1") return { sign: rashis[signIndex], degree: round(degreeInSign) };
  if (chart === "D2") return horaPlacement(signIndex, degreeInSign);
  if (chart === "D3") return drekkanaPlacement(signIndex, degreeInSign);
  if (chart === "D9") return navamsaPlacement(signIndex, degreeInSign);
  if (chart === "D10") return dashamshaPlacement(signIndex, degreeInSign);
  if (chart === "D12") return dwadashamshaPlacement(signIndex, degreeInSign);
  return { sign: rashis[signIndex], degree: round(degreeInSign) };
}

function horaPlacement(signIndex, degree) {
  const oddSign = signIndex % 2 === 0;
  const sign = oddSign ? degree < 15 ? "Leo" : "Cancer" : degree < 15 ? "Cancer" : "Leo";
  return { sign, degree: round((degree % 15) * 2) };
}

function drekkanaPlacement(signIndex, degree) {
  const part = Math.min(2, Math.floor(degree / 10));
  const targetIndex = [signIndex, (signIndex + 4) % 12, (signIndex + 8) % 12][part];
  return { sign: rashis[targetIndex], degree: round((degree % 10) * 3) };
}

function navamsaPlacement(signIndex, degree) {
  const part = Math.min(8, Math.floor(degree / (30 / 9)));
  const startIndex = [0, 3, 6, 9].includes(signIndex) ? signIndex : [1, 4, 7, 10].includes(signIndex) ? (signIndex + 8) % 12 : (signIndex + 4) % 12;
  return { sign: rashis[(startIndex + part) % 12], degree: round((degree % (30 / 9)) * 9) };
}

function dashamshaPlacement(signIndex, degree) {
  const part = Math.min(9, Math.floor(degree / 3));
  const startIndex = signIndex % 2 === 0 ? signIndex : (signIndex + 8) % 12;
  return { sign: rashis[(startIndex + part) % 12], degree: round((degree % 3) * 10) };
}

function dwadashamshaPlacement(signIndex, degree) {
  const part = Math.min(11, Math.floor(degree / 2.5));
  return { sign: rashis[(signIndex + part) % 12], degree: round((degree % 2.5) * 12) };
}

function nakshatraFromLongitude(longitude) {
  const span = 360 / 27;
  const normalized = normalizeDegrees(longitude);
  const index = Math.min(26, Math.floor((normalized + 1e-9) / span));
  const pada = Math.min(4, Math.floor(((normalized + 1e-9) % span) / (span / 4)) + 1);
  return { name: nakshatras[index], pada };
}

function tropicalToSidereal(longitude, julianDay) {
  return normalizeDegrees(longitude - lahiriAyanamsa(julianDay));
}

function lahiriAyanamsa(julianDay) {
  return 23.856446 + (50.290966 / 3600) * ((julianDay - 2451545.0) / 365.2425);
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

function weekdayName(date, timezoneOffset) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000));
}

function parseClock(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function formatClock(value) {
  const minutes = Math.round(value);
  const normalized = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

function formatTimeWithOffset(date, timezoneOffset) {
  const local = new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000);
  return local.toISOString().slice(11, 16);
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function round(value, digits = 6) {
  return Number(value.toFixed(digits));
}

import * as Astronomy from "astronomy-engine";
import { nakshatraFromLongitude } from "@/lib/astrology/own-engine/nakshatra";
import { julianDayFromUtc, normalizeDegrees, parseTimezoneOffsetToHours } from "@/lib/astrology/own-engine/time";
import { tropicalToSidereal } from "@/lib/astrology/own-engine/zodiac";

export type PremiumPanchangInput = {
  date: string | Date;
  latitude: number;
  longitude: number;
  timezone?: string | number;
  place?: string;
};

export type PremiumPanchangResult = {
  date: string;
  location: string;
  timezone: string;
  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  tithi: string;
  paksha: "Shukla Paksha" | "Krishna Paksha";
  nakshatra: string;
  nakshatraPada: number;
  yoga: string;
  karana: string;
  vaar: string;
  rahuKaal: string | null;
  yamaganda: string | null;
  gulikaKaal: string | null;
  abhijitMuhurat: string | null;
  metadata: {
    calculationMode: "astronomy_engine_internal_provider_verified";
    verificationLevel: "provider_verified";
    externalVerification: false;
    verified: false;
    missingFields: string[];
    source: "naksharix_internal_astronomy_engine";
    limitations: string[];
  };
};

const tithis = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"];
const yogas = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const repeatingKaranas = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];

export function calculatePremiumPanchang(input: PremiumPanchangInput): PremiumPanchangResult {
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error("Latitude must be between -90 and 90.");
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error("Longitude must be between -180 and 180.");

  const timezoneText = String(input.timezone ?? "+05:30");
  const timezoneOffset = parseTimezoneOffsetToHours(timezoneText, localDateText(input.date), "12:00");
  const localNoonUtc = localNoonToUtc(input.date, timezoneOffset);
  const localDay = localDateParts(localNoonUtc, timezoneOffset);
  const dateText = `${localDay.year}-${String(localDay.month).padStart(2, "0")}-${String(localDay.day).padStart(2, "0")}`;
  const time = Astronomy.MakeTime(localNoonUtc);
  const julianDay = julianDayFromUtc(localNoonUtc);
  const sunLongitude = siderealSunLongitude(time, julianDay);
  const moonLongitude = siderealMoonLongitude(time, julianDay);
  const elongation = normalizeDegrees(moonLongitude - sunLongitude);
  const nakshatra = nakshatraFromLongitude(moonLongitude);
  const yogaLongitude = normalizeDegrees(sunLongitude + moonLongitude);
  const sunTimes = riseSet(Astronomy.Body.Sun, localDay, latitude, longitude, timezoneOffset);
  const moonTimes = riseSet(Astronomy.Body.Moon, localDay, latitude, longitude, timezoneOffset);
  const weekday = weekdayName(localNoonUtc, timezoneOffset);
  const dayWindow = sunTimes.rise && sunTimes.set ? daySegmentWindows(sunTimes.rise, sunTimes.set, weekday) : null;
  const missingFields = [
    sunTimes.rise ? null : "Sunrise",
    sunTimes.set ? null : "Sunset",
    dayWindow ? null : "Rahu Kaal/Yamaganda/Gulika/Abhijit"
  ].filter(Boolean) as string[];

  return {
    date: dateText,
    location: input.place ?? `${latitude}, ${longitude}`,
    timezone: timezoneText,
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
    vaar: weekday,
    rahuKaal: dayWindow?.rahuKaal ?? null,
    yamaganda: dayWindow?.yamaganda ?? null,
    gulikaKaal: dayWindow?.gulikaKaal ?? null,
    abhijitMuhurat: dayWindow?.abhijitMuhurat ?? null,
    metadata: {
      calculationMode: "astronomy_engine_internal_provider_verified",
      verificationLevel: "provider_verified",
      externalVerification: false,
      verified: false,
      missingFields,
      source: "naksharix_internal_astronomy_engine",
      limitations: [
        "Panchang values are deterministic provider-regression-tested, not externally fixture-verified.",
        "Tithi, Nakshatra, Yoga, and Karana are sampled at local noon for the selected date.",
        "Cross-check with a trusted Panchang source for critical Muhurat decisions."
      ]
    }
  };
}

function siderealSunLongitude(time: Astronomy.AstroTime, julianDay: number) {
  return tropicalToSidereal(Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, time, true)).elon, julianDay);
}

function siderealMoonLongitude(time: Astronomy.AstroTime, julianDay: number) {
  return tropicalToSidereal(Astronomy.EclipticGeoMoon(time).lon, julianDay);
}

function riseSet(body: Astronomy.Body, localDay: { year: number; month: number; day: number }, latitude: number, longitude: number, timezoneOffset: number) {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const startUtc = new Date(Date.UTC(localDay.year, localDay.month - 1, localDay.day) - timezoneOffset * 60 * 60 * 1000);
  const rise = Astronomy.SearchRiseSet(body, observer, +1, startUtc, 1);
  const set = Astronomy.SearchRiseSet(body, observer, -1, startUtc, 1);
  return {
    rise: rise ? formatTimeWithOffset(rise.date, timezoneOffset) : null,
    set: set ? formatTimeWithOffset(set.date, timezoneOffset) : null
  };
}

function daySegmentWindows(sunrise: string, sunset: string, weekday: string) {
  const riseMinutes = parseClock(sunrise);
  const setMinutes = parseClock(sunset);
  const segment = (setMinutes - riseMinutes) / 8;
  const weekdayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(weekday);
  const rahuSegments = [8, 2, 7, 5, 6, 4, 3];
  const yamagandaSegments = [5, 4, 3, 2, 1, 7, 6];
  const gulikaSegments = [7, 6, 5, 4, 3, 2, 1];
  const segmentRange = (oneBased: number) => `${formatClock(riseMinutes + (oneBased - 1) * segment)} - ${formatClock(riseMinutes + oneBased * segment)}`;
  const solarNoon = (riseMinutes + setMinutes) / 2;
  return {
    rahuKaal: segmentRange(rahuSegments[weekdayIndex] ?? 8),
    yamaganda: segmentRange(yamagandaSegments[weekdayIndex] ?? 5),
    gulikaKaal: segmentRange(gulikaSegments[weekdayIndex] ?? 7),
    abhijitMuhurat: `${formatClock(solarNoon - 24)} - ${formatClock(solarNoon + 24)}`
  };
}

function karanaFromElongation(elongation: number) {
  const halfTithi = Math.floor(elongation / 6) + 1;
  if (halfTithi === 1) return "Kimstughna";
  if (halfTithi === 58) return "Shakuni";
  if (halfTithi === 59) return "Chatushpada";
  if (halfTithi >= 60) return "Naga";
  return repeatingKaranas[(halfTithi - 2) % repeatingKaranas.length];
}

function localNoonToUtc(date: string | Date, timezoneOffset: number) {
  const parts = localDateParts(date instanceof Date ? date : new Date(`${localDateText(date)}T00:00:00.000Z`), 0);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12) - timezoneOffset * 60 * 60 * 1000);
}

function localDateParts(date: Date, timezoneOffset: number) {
  const local = new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000);
  return { year: local.getUTCFullYear(), month: local.getUTCMonth() + 1, day: local.getUTCDate() };
}

function localDateText(date: string | Date) {
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  return String(date).slice(0, 10);
}

function weekdayName(date: Date, timezoneOffset: number) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000));
}

function parseClock(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function formatClock(value: number) {
  const minutes = Math.round(value);
  const normalized = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

function formatTimeWithOffset(date: Date, timezoneOffset: number) {
  const local = new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000);
  return local.toISOString().slice(11, 16);
}

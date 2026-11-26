import * as Astronomy from "astronomy-engine";
import { lahiriMoonLongitude } from "@/lib/astrology/own-engine/lahiri-moon";
import { nakshatraFromLongitude, nakshatraIndexFromLongitude } from "@/lib/astrology/own-engine/nakshatra";
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
  const moonLongitude = siderealMoonLongitude(time);
  const elongation = normalizeDegrees(moonLongitude - sunLongitude);
  const nakshatra = nakshatraFromLongitude(moonLongitude);
  const yogaLongitude = normalizeDegrees(sunLongitude + moonLongitude);
  const fixedOffset = /^[+-]?(?:\d{1,2}(?:\.\d+)?|\d{1,2}:?\d{2})$/.test(timezoneText);
  const zone = fixedOffset ? undefined : timezoneText;
  const dayFormatter = zone && new Intl.DateTimeFormat("en-CA", {timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit"});
  const clockFormatter = zone && new Intl.DateTimeFormat("en-GB", {timeZone: zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23"});
  const eventLabel = (event: Date) => clockFormatter ? clockFormatter.format(event) : formatTimeWithOffset(event, timezoneOffset);
  const clock = (event: Date | null) => event && eventLabel(event);
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const sunTimes = riseSet(Astronomy.Body.Sun, observer, localNoonUtc, dayFormatter || undefined);
  const moonTimes = riseSet(Astronomy.Body.Moon, observer, localNoonUtc, dayFormatter || undefined);
  const weekday = weekdayName(localNoonUtc, timezoneOffset);
  const dayWindow = sunTimes.rise && sunTimes.set && sunTimes.set > sunTimes.rise
    ? daySegmentWindows(sunTimes.rise, sunTimes.set, weekday, eventLabel) : null;
  const missingFields = [
    sunTimes.rise ? null : "Sunrise",
    sunTimes.set ? null : "Sunset",
    dayWindow ? null : "Rahu Kaal/Yamaganda/Gulika/Abhijit"
  ].filter(Boolean) as string[];

  return {
    date: dateText,
    location: input.place ?? `${latitude}, ${longitude}`,
    timezone: timezoneText,
    sunrise: clock(sunTimes.rise),
    sunset: clock(sunTimes.set),
    moonrise: clock(moonTimes.rise),
    moonset: clock(moonTimes.set),
    tithi: tithis[Math.min(29, Math.floor(elongation / 12))],
    paksha: Math.floor(elongation / 12) < 15 ? "Shukla Paksha" : "Krishna Paksha",
    nakshatra: nakshatra.name,
    nakshatraPada: nakshatra.pada,
    yoga: yogas[nakshatraIndexFromLongitude(yogaLongitude)],
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

function siderealMoonLongitude(time: Astronomy.AstroTime) {
  return lahiriMoonLongitude(time);
}

function riseSet(body: Astronomy.Body, observer: Astronomy.Observer, localNoon: Date, localDay?: Intl.DateTimeFormat) {
  const hour = 3600_000;
  // Fixed offsets have a 24-hour day. A named-zone date may begin with a gap or fold,
  // or precede a skipped date. Filter actual event instants by their civil date.
  const radius = localDay ? 39 : 12;
  const start = localNoon.getTime() - radius * hour;
  const end = localNoon.getTime() + radius * hour;
  const wanted = localDay?.format(localNoon);
  function find(direction: 1 | -1) {
    let cursor = start;
    while (cursor < end) {
      const event = Astronomy.SearchRiseSet(body, observer, direction, new Date(cursor), (end - cursor) / 86400_000);
      if (!event || event.date.getTime() >= end) return null;
      if (!localDay || localDay.format(event.date) === wanted) return event.date;
      // A small advance excludes the previous crossing even if its root rounds to the same millisecond.
      cursor = Math.max(cursor + 1000, event.date.getTime() + 1000);
    }
    return null;
  }
  return {rise: find(1), set: find(-1)};
}

function daySegmentWindows(sunrise: Date, sunset: Date, weekday: string, label: (d: Date) => string) {
  const start = sunrise.getTime();
  const duration = sunset.getTime() - start;
  const weekdayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(weekday);
  const window = (oneBased: number, divisions: number) => {
    const at = (edge: number) => label(new Date(Math.round((start + duration * edge / divisions) / 60_000) * 60_000));
    return `${at(oneBased - 1)} - ${at(oneBased)}`;
  };
  return {
    rahuKaal: window([8, 2, 7, 5, 6, 4, 3][weekdayIndex], 8),
    yamaganda: window([5, 4, 3, 2, 1, 7, 6][weekdayIndex], 8),
    gulikaKaal: window([7, 6, 5, 4, 3, 2, 1][weekdayIndex], 8),
    abhijitMuhurat: window(8, 15)
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

function formatTimeWithOffset(date: Date, timezoneOffset: number) {
  const local = new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000);
  return local.toISOString().slice(11, 16);
}

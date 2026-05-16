import * as Astronomy from "astronomy-engine";
import { format } from "date-fns";
import { nakshatraFromLongitude } from "@/lib/astrology/own-engine/nakshatra";
import { normalizeDegrees } from "@/lib/astrology/own-engine/time";
import type { PanchangSnapshot } from "@/lib/astrology/types";

const tithis = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"];
const yogas = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const repeatingKaranas = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];

export function calculatePanchang(input: {
  date: Date;
  latitude: number;
  longitude: number;
  sunLongitude: number;
  moonLongitude: number;
  timezoneOffset?: number;
  notAvailable?: string;
}): PanchangSnapshot {
  const elongation = normalizeDegrees(input.moonLongitude - input.sunLongitude);
  const tithiIndex = Math.min(29, Math.floor(elongation / 12));
  const nakshatra = nakshatraFromLongitude(input.moonLongitude);
  const yogaLongitude = normalizeDegrees(input.sunLongitude + input.moonLongitude);
  const yogaIndex = Math.min(26, Math.floor(yogaLongitude / (360 / 27)));
  const notAvailable = input.notAvailable ?? "Not available";
  const timezoneOffset = input.timezoneOffset ?? 5.5;
  const localDate = localDateParts(input.date, timezoneOffset);
  const sunTimes = calculateSunRiseSet(localDate, input.latitude, input.longitude, timezoneOffset, notAvailable);

  return {
    date: `${localDate.year}-${String(localDate.month).padStart(2, "0")}-${String(localDate.day).padStart(2, "0")}`,
    tithi: tithis[tithiIndex],
    paksha: tithiIndex < 15 ? "Shukla Paksha" : "Krishna Paksha",
    vaar: format(offsetDate(input.date, timezoneOffset), "EEEE"),
    nakshatra: nakshatra.name,
    nakshatraPada: nakshatra.pada,
    yoga: yogas[yogaIndex],
    karan: karanaFromElongation(elongation),
    rahuKaal: notAvailable,
    choghadiya: notAvailable,
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset,
    festival: null,
    muhurat: notAvailable
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

function calculateSunRiseSet(
  localDate: { year: number; month: number; day: number },
  latitude: number,
  longitude: number,
  timezoneOffset: number,
  fallback: string
) {
  try {
    const observer = new Astronomy.Observer(latitude, longitude, 0);
    const startUtc = new Date(Date.UTC(localDate.year, localDate.month - 1, localDate.day) - timezoneOffset * 60 * 60 * 1000);
    const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, startUtc, 1);
    const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, startUtc, 1);
    return {
      sunrise: sunrise ? formatTimeWithOffset(sunrise.date, timezoneOffset) : fallback,
      sunset: sunset ? formatTimeWithOffset(sunset.date, timezoneOffset) : fallback
    };
  } catch {
    return { sunrise: fallback, sunset: fallback };
  }
}

function localDateParts(date: Date, timezoneOffset: number) {
  const local = offsetDate(date, timezoneOffset);
  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth() + 1,
    day: local.getUTCDate()
  };
}

function offsetDate(date: Date, timezoneOffset: number) {
  return new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000);
}

function formatTimeWithOffset(date: Date, timezoneOffset: number) {
  return offsetDate(date, timezoneOffset).toISOString().slice(11, 19);
}

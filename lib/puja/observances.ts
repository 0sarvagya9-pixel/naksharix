/**
 * Curated India-reference Hindu observances for 2026–2028. No claims of local
 * puja muhurat, temple fulfilment, paid booking, or comprehensive regional coverage.
 * Dates are individually reviewed before inclusion; NEVER add one Gregorian year
 * to a lunar festival or silently generate unsourced future years.
 */
export type PujaObservance = {
  id: string;
  date: string;
  name: string;
  sourceUrl: string;
  bookingStatus: "information_only";
};
export const PUJA_SOURCES: Record<number, string> = {
  2026: "https://www.drikpanchang.com/calendars/indian/indiancalendar.html?lang=en&year=2026",
  2027: "https://www.drikpanchang.com/calendars/indian/indiancalendar.html?lang=en&year=2027",
  2028: "https://www.drikpanchang.com/calendars/indian/indiancalendar.html?lang=en&year=2028"
};

// Original curated index of major calendar observances, NOT a vendor's offerings.
const OBSERVANCES: ReadonlyArray<readonly [string, string]> = [
  ["2026-10-29", "Karwa Chauth"], ["2026-11-06", "Dhanteras"],
  ["2026-11-08", "Lakshmi Puja / Diwali"], ["2026-11-10", "Govardhan Puja"],
  ["2026-11-11", "Bhai Dooj"], ["2026-11-15", "Chhath Puja"],
  ["2026-11-24", "Kartik Purnima"],
  ["2027-01-15", "Makar Sankranti / Surya Puja"],
  ["2027-02-11", "Vasant Panchami / Saraswati Puja"],
  ["2027-03-06", "Maha Shivaratri / Shiva Puja"],
  ["2027-03-21", "Holika Dahan"], ["2027-03-22", "Holi"],
  ["2027-04-07", "Chaitra Navratri"], ["2027-04-07", "Gudi Padwa / Ugadi"],
  ["2027-04-15", "Ram Navami Puja"], ["2027-04-20", "Hanuman Jayanti"],
  ["2027-05-09", "Akshaya Tritiya"], ["2027-05-20", "Buddha Purnima"],
  ["2027-07-05", "Jagannath Rath Yatra"],
  ["2027-07-18", "Guru Purnima Puja"],
  ["2027-08-17", "Raksha Bandhan"],
  ["2027-08-25", "Krishna Janmashtami Puja"],
  ["2027-09-04", "Ganesh Chaturthi Puja"],
  ["2027-09-30", "Sharad Navratri"],
  ["2027-10-07", "Durga Ashtami Puja"],
  ["2027-10-08", "Maha Navami Puja"],
  ["2027-10-09", "Dussehra / Vijayadashami"],
  ["2027-10-18", "Karwa Chauth"],
  ["2027-10-27", "Dhanteras"],
  ["2027-10-29", "Lakshmi Puja / Diwali"],
  ["2027-10-30", "Govardhan Puja"],
  ["2027-10-31", "Bhai Dooj"], ["2027-11-04", "Chhath Puja"],
  ["2027-11-14", "Kartik Purnima"],
  ["2028-01-15", "Makar Sankranti / Surya Puja"],
  ["2028-01-31", "Vasant Panchami / Saraswati Puja"],
  ["2028-02-23", "Maha Shivaratri / Shiva Puja"],
  ["2028-03-10", "Holika Dahan"],
  ["2028-03-11", "Holi"],
  ["2028-03-27", "Chaitra Navratri"],
  ["2028-03-27", "Gudi Padwa / Ugadi"],
  ["2028-04-03", "Ram Navami Puja (Smarta)"],
  ["2028-05-08", "Buddha Purnima"],
  ["2028-06-24", "Jagannath Rath Yatra"],
  ["2028-07-06", "Guru Purnima Puja"],
  ["2028-08-05", "Raksha Bandhan"],
  ["2028-08-13", "Krishna Janmashtami Puja"],
  ["2028-08-23", "Ganesh Chaturthi Puja"],
  ["2028-09-19", "Sharad Navratri"],
  ["2028-09-26", "Durga Ashtami Puja"],
  ["2028-09-27", "Dussehra / Vijayadashami"],
  ["2028-10-07", "Karwa Chauth"],
  ["2028-10-15", "Dhanteras"],
  ["2028-10-17", "Lakshmi Puja / Diwali"],
  ["2028-10-18", "Govardhan Puja"],
  ["2028-10-19", "Bhai Dooj"],
  ["2028-10-23", "Chhath Puja"]
];
function validDate(text: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(text) &&
    !Number.isNaN(Date.parse(text + "T00:00:00Z")) &&
    new Date(text + "T00:00:00Z").toISOString().slice(0, 10) === text;
}

export const pujaObservances: readonly PujaObservance[] = Object.freeze(
  OBSERVANCES.map(([date, name]) => {
    if (!validDate(date) || !PUJA_SOURCES[Number(date.slice(0, 4))]) {
      throw new Error("PUJA_CALENDAR_SOURCE_OR_DATE_MISSING");
    }
    return Object.freeze({
      id: date + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      date, name,
      sourceUrl: PUJA_SOURCES[Number(date.slice(0, 4))],
      bookingStatus: "information_only" as const
    });
  }).sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name))
);

export function todayInIndia(now: Date = new Date()): string {
  if (!Number.isFinite(now.getTime())) throw new Error("INVALID_CLOCK");
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const value = (key: string) => parts.find((part) => part.type === key)?.value || "";
  return value("year") + "-" + value("month") + "-" + value("day");
}

export function calendarYearsAfter(date: string, years: number): string {
  if (!validDate(date) || !Number.isInteger(years) || years < 1 || years > 3)
    throw new Error("INVALID_CALENDAR_HORIZON");
  const year = Number(date.slice(0, 4)) + years;
  const monthDay = date.slice(5);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return String(year) + "-" + (monthDay === "02-29" && !leap ? "02-28" : monthDay);
}

export function nextTwoYearsPujaCalendar(now: Date = new Date()) {
  const from = todayInIndia(now);
  const untilExclusive = calendarYearsAfter(from, 2);
  const events = pujaObservances.filter((item) => item.date >= from && item.date < untilExclusive);
  return {
    from, untilExclusive, events,
    countryReference: "India (New Delhi reference; check local Panchang)",
    bookingAvailable: false,
    exhaustiveRegionalCoverage: false,
    datesReviewedThroughYear: 2028,
    futureYearsRequireReview: Number(untilExclusive.slice(0, 4)) > 2029 ||
      (Number(untilExclusive.slice(0, 4)) === 2029 && untilExclusive > "2029-01-01"),
    note: "Dates are informational, not local tithi/muhurat, verified priest capacity or paid reservations."
  };
}

import assert from "node:assert/strict";
import {
  pujaObservances, nextTwoYearsPujaCalendar,
  todayInIndia, calendarYearsAfter, PUJA_SOURCES
} from "../lib/puja/observances.ts";
const instant = (date) => new Date(date + "T05:45:00+05:30");
assert.equal(todayInIndia(instant("2026-10-27")), "2026-10-27");
assert.equal(calendarYearsAfter("2028-02-29",1), "2029-02-28");
assert.throws(() => calendarYearsAfter("2028-02-30", 1));
assert.throws(() => calendarYearsAfter("2028-02-29", 0));
assert.ok(pujaObservances.length >= 50);
assert.equal(new Set(pujaObservances.map((event) => event.id)).size, pujaObservances.length);
assert.ok(pujaObservances.every((event) => event.bookingStatus === "information_only" && event.sourceUrl === PUJA_SOURCES[Number(event.date.slice(0,4))]));
for (let i=1;i<pujaObservances.length;i++) assert.ok(pujaObservances[i].date >= pujaObservances[i-1].date);
const calendar = nextTwoYearsPujaCalendar(instant("2026-10-27"));
assert.equal(calendar.from, "2026-10-27");
assert.equal(calendar.untilExclusive, "2028-10-27");
assert.equal(calendar.bookingAvailable, false);
assert.equal(calendar.exhaustiveRegionalCoverage, false);
assert.ok(calendar.events.some((event) => event.date === "2027-10-29" && event.name.includes("Diwali")));
assert.ok(calendar.events.some((event) => event.date === "2028-10-17" && event.name.includes("Diwali")));
assert.ok(calendar.events.every((event) => event.date >= calendar.from && event.date < calendar.untilExclusive));
assert.ok(nextTwoYearsPujaCalendar(instant("2028-12-31")).futureYearsRequireReview);
console.log("PUJA_CALENDAR_QA=PASS;EVENTS=" + pujaObservances.length + ";BOOKING_ACTIVATION=NO");

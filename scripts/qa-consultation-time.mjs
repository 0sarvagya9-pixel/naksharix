import assert from "node:assert/strict";
import { parseConsultationSlotTime, consultationSlotWeekday, formatConsultationSlotTime } from "../lib/consultations/slot-time.ts";

const valid = [
  ["2026-10-13", "10:00", "2026-10-13T04:30:00.000Z", 2],
  ["2026-10-14", "00:15", "2026-10-13T18:45:00.000Z", 3],
  ["2026-12-31", "23:45", "2026-12-31T18:15:00.000Z", 4]
];
let assertions = 0;
for (const [date, time, expectedUtc, expectedWeekday] of valid) {
  assert.equal(parseConsultationSlotTime(date, time)?.toISOString(), expectedUtc);
  assert.equal(consultationSlotWeekday(date), expectedWeekday);
  assertions += 2;
}
for (const [date, time] of [
  ["2026-02-31", "10:00"],
  ["2026-10-13", "99:00"],
  ["2026-10-13", "20:99"],
  ["not-a-date", "10:00"]
]) {
  assert.equal(parseConsultationSlotTime(date, time), null);
  assertions++;
}
assert.ok(formatConsultationSlotTime(new Date("2026-10-13T04:30:00.000Z")).includes("10:00"));
assertions++;
console.log(`CONSULTATION_IST_REGRESSION=${assertions}/${assertions}_PASS`);

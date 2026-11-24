import assert from "node:assert/strict";
import { parseTimezoneOffsetToHours } from "../lib/astrology/own-engine/time.ts";
const offset=parseTimezoneOffsetToHours;
const cases=[["Asia/Kolkata","1990-01-15","10:30",5.5],["UTC","2026-01-15","12:00",0],["Europe/London","2026-01-15","12:00",0],["Europe/London","2026-07-15","12:00",1],["America/New_York","2026-01-15","12:00",-5],["America/New_York","2026-07-15","12:00",-4],["+05:45","2026-01-15","12:00",5.75],["-00:30","2026-01-15","12:00",-.5]];
for(const [zone,date,time,expected] of cases)assert.equal(offset(zone,date,time),expected);
for(const args of [["Invalid/Zone","2026-01-15","12:00"],["+15:00","2026-01-15","12:00"],["+05:99","2026-01-15","12:00"],["America/New_York","2026-03-08","02:30"],["America/New_York","2026-11-01","01:30"]])assert.throws(()=>offset(...args));
console.log("WORLDCLASS_TIMEZONE=13/13_PASS");

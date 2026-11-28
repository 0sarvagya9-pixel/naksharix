import assert from "node:assert/strict";import {createReferenceCalendar} from "../lib/calendar/ical.ts";
const evt={id:"festival-2027-01-15",date:"2027-01-15",name:"मकर संक्रांति, पर्व; परीक्षण",sourceUrl:"https://www.drikpanchang.com/"};
const file=createReferenceCalendar([evt],1,new Date("2026-11-24T00:00:00Z"));
assert.ok(file.includes("DTSTART;VALUE=DATE:20270115\r\nDTEND;VALUE=DATE:20270116"));
assert.ok(file.includes("TRIGGER:-P1D"));assert.ok(file.split("\r\n").every(line=>Buffer.byteLength(line)<=75));
assert.ok(file.replaceAll("\r\n ","").includes("मकर संक्रांति\\, पर्व\\; परीक्षण"));
assert.throws(()=>createReferenceCalendar([{...evt,date:"2027-02-30"}],0));
assert.throws(()=>createReferenceCalendar([evt,evt],0));assert.throws(()=>createReferenceCalendar([{...evt,sourceUrl:"http://unsafe.example/"}],0));
assert.ok(!createReferenceCalendar([evt],0).includes("BEGIN:VALARM"));console.log("CALENDAR_EXPORT_PASS");

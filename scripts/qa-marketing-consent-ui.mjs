import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { marketingConsentAcknowledged as ack, marketingPreferenceCopy, marketingInterests, normalizeMarketingLocale, marketingConsentText } from "../lib/marketing-consent.ts";
const valid = "2026-11-25T01:05:00.000Z";
const cases = [
  ["subscribe", {subscribed:true, confirmedAt:valid}, true],
  ["subscribe", {subscribed:false}, false],
  ["subscribe", {subscribed:true}, false],
  ["subscribe", {subscribed:true, confirmedAt:"invalid"}, false],
  ["subscribe", {subscribed:true, confirmedAt:"2026-02-30T00:00:00.000Z"}, false],
  ["subscribe", {subscribed:"true", confirmedAt:valid}, false],
  ["subscribe", null, false],
  ["subscribe", [], false],
  ["unsubscribe", {subscribed:false}, true],
  ["unsubscribe", {subscribed:true, confirmedAt:valid}, false],
  ["unsubscribe", {subscribed:0}, false],
  ["unsubscribe", {}, false],
];
for (const [action,value,expected] of cases) assert.equal(ack(action,value),expected,JSON.stringify([action,value]));
for (const locale of ["en","hi","hinglish"]) {
  const copy=marketingPreferenceCopy[locale];
  assert.equal(copy.labels.length,marketingInterests.length);
  assert.equal(new Set(copy.labels).size,marketingInterests.length);
  for(const value of Object.values(copy)) assert.ok(Array.isArray(value) ? value.every(Boolean) : value.trim());
  assert.equal(normalizeMarketingLocale(locale),locale);
}
assert.equal(normalizeMarketingLocale("invalid"),"en");
assert.equal(marketingPreferenceCopy.en.consent,marketingConsentText);
const source=readFileSync("components/email-updates-form.tsx","utf8");
assert.match(source,/lock\.current = true/);
assert.match(source,/marketingConsentAcknowledged\(action, result.data\)/);
assert.match(source,/disabled=\{busy \|\| uncertain\}/);
for(const field of ["setLocale","setInterest","setCountry"]) assert.match(source,new RegExp(field+"\\([^;]+; setConsent\\(false\\)"));
assert.match(source,/setUncertain\(true\)/);
assert.match(source,/clearTimeout\(timeout\)/);
console.log("Marketing consent acknowledgement: 12 runtime cases; locale and form contract assertions passed.");

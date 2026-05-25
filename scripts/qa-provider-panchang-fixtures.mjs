import fs from "node:fs";
import path from "node:path";
import { providerPanchang } from "../lib/astrology/testing/provider-calculations.mjs";

const root = process.cwd();
const fixtures = JSON.parse(fs.readFileSync(path.join(root, "fixtures", "generated", "provider-panchang-fixtures.json"), "utf8"));
const results = [];
const requiredFields = ["sunrise", "sunset", "tithi", "nakshatra", "yoga", "karana", "vaar", "rahuKaal", "yamaganda", "gulikaKaal", "abhijitMuhurat"];

function record(status, name, detail = "") {
  results.push({ status, name, detail });
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

for (const fixture of fixtures) {
  assert(fixture.verification_level === "provider_verified", `${fixture.id}: verification level`, fixture.verification_level);
  assert(fixture.external_verification === false, `${fixture.id}: external verification boundary`, "provider fixture only");
  const actual = providerPanchang(fixture.input);
  for (const field of requiredFields) {
    assert(Boolean(actual[field]), `${fixture.id}: ${field} generated`, String(actual[field]));
    assert(actual[field] === fixture.expected[field], `${fixture.id}: ${field} regression`, String(actual[field]));
  }
  assert(Array.isArray(actual.missingFields) && actual.missingFields.length === 0, `${fixture.id}: no required missing fields`, actual.missingFields.join(", "));
  if (fixture.expected.moonrise) assert(actual.moonrise === fixture.expected.moonrise, `${fixture.id}: moonrise regression`, String(actual.moonrise));
  if (fixture.expected.moonset) assert(actual.moonset === fixture.expected.moonset, `${fixture.id}: moonset regression`, String(actual.moonset));
}

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
console.log(`\nProvider Panchang QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);

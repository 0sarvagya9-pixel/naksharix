import fs from "node:fs";
import path from "node:path";
import { providerChart } from "../lib/astrology/testing/provider-calculations.mjs";

const root = process.cwd();
const file = path.join(root, "fixtures", "generated", "provider-kundli-fixtures.json");
const fixtures = JSON.parse(fs.readFileSync(file, "utf8"));
const results = [];

function record(status, name, detail = "") {
  results.push({ status, name, detail });
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

for (const fixture of fixtures) {
  assert(fixture.verification_level === "provider_verified", `${fixture.id}: verification level`, fixture.verification_level);
  assert(fixture.external_verification === false, `${fixture.id}: external verification boundary`, "provider fixture only");
  const chart = await providerChart(fixture.input);
  comparePoint(`${fixture.id}: ascendant`, chart.ascendant, fixture.expected.ascendant);
  comparePoint(`${fixture.id}: moon`, chart.moon, fixture.expected.moon);
  assert(chart.nakshatra.name === fixture.expected.moon.nakshatra, `${fixture.id}: moon nakshatra`, chart.nakshatra.name);
  assert(chart.nakshatra.pada === fixture.expected.moon.pada, `${fixture.id}: moon pada`, String(chart.nakshatra.pada));
  for (const planet of chart.planets) {
    comparePoint(`${fixture.id}: ${planet.planet}`, planet, fixture.expected.planets[planet.planet]);
    assert(planet.retrograde === fixture.expected.planets[planet.planet].retrograde, `${fixture.id}: ${planet.planet} retrograde`, String(planet.retrograde));
  }
  assert(chart.dasha?.startingMahadashaLord === fixture.expected.dasha.startingMahadashaLord, `${fixture.id}: Dasha starting lord`, chart.dasha?.startingMahadashaLord);
  assert(chart.dasha?.balanceAtBirth === fixture.expected.dasha.balanceAtBirth, `${fixture.id}: Dasha balance`, chart.dasha?.balanceAtBirth);
}

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
console.log(`\nProvider Kundli QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);

function comparePoint(name, actual, expected) {
  const tolerance = expected.toleranceDegrees ?? 0.000001;
  assert(actual.sign === expected.sign, `${name} sign`, `${actual.sign}`);
  assert(Math.abs(actual.degree - expected.degree) <= tolerance, `${name} degree`, `${actual.degree}`);
  assert(Math.abs(actual.absoluteLongitude - expected.absoluteLongitude) <= tolerance, `${name} longitude`, `${actual.absoluteLongitude}`);
}

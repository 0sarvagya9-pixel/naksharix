import fs from "node:fs";
import path from "node:path";
import { providerTransit } from "../lib/astrology/testing/provider-calculations.mjs";

const root = process.cwd();
const fixtures = JSON.parse(fs.readFileSync(path.join(root, "fixtures", "generated", "provider-transit-fixtures.json"), "utf8"));
const results = [];

function record(status, name, detail = "") {
  results.push({ status, name, detail });
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

for (const fixture of fixtures) {
  assert(fixture.verification_level === "provider_verified", `${fixture.id}: verification level`, fixture.verification_level);
  const actual = await providerTransit(fixture.input);
  assert(actual.positions.length === 9, `${fixture.id}: planet count`, String(actual.positions.length));
  for (const expected of fixture.expected.positions) {
    const actualPlanet = actual.positions.find((planet) => planet.planet === expected.planet);
    assert(Boolean(actualPlanet), `${fixture.id}: ${expected.planet} exists`, "position available");
    assert(actualPlanet.sign === expected.sign, `${fixture.id}: ${expected.planet} sign`, actualPlanet.sign);
    assert(Math.abs(actualPlanet.degree - expected.degree) <= 0.000001, `${fixture.id}: ${expected.planet} degree`, String(actualPlanet.degree));
    assert(Math.abs(actualPlanet.absoluteLongitude - expected.absoluteLongitude) <= 0.000001, `${fixture.id}: ${expected.planet} longitude`, String(actualPlanet.absoluteLongitude));
  }
}

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
console.log(`\nProvider Transit QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);

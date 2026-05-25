import fs from "node:fs";
import path from "node:path";
import { providerVargaFromPlanets } from "../lib/astrology/testing/provider-calculations.mjs";

const root = process.cwd();
const fixtures = JSON.parse(fs.readFileSync(path.join(root, "fixtures", "generated", "provider-varga-fixtures.json"), "utf8"));
const results = [];

function record(status, name, detail = "") {
  results.push({ status, name, detail });
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

for (const fixture of fixtures) {
  assert(fixture.verification_level === "provider_verified", `${fixture.id}: verification level`, fixture.verification_level);
  const actualCharts = providerVargaFromPlanets(fixture.input.planets);
  assert(actualCharts.length === 6, `${fixture.id}: supported chart count`, String(actualCharts.length));
  for (const expectedChart of fixture.expected.charts) {
    const actualChart = actualCharts.find((chart) => chart.chart === expectedChart.chart);
    assert(Boolean(actualChart), `${fixture.id}: ${expectedChart.chart} exists`, "chart available");
    assert(actualChart.verificationLevel === "provider_verified", `${fixture.id}: ${expectedChart.chart} provider verified`, actualChart.verificationLevel);
    for (const expectedPlacement of expectedChart.placements) {
      const actualPlacement = actualChart.placements.find((placement) => placement.planet === expectedPlacement.planet);
      assert(Boolean(actualPlacement), `${fixture.id}: ${expectedChart.chart} ${expectedPlacement.planet} placement`, "placement available");
      assert(actualPlacement.sign === expectedPlacement.sign, `${fixture.id}: ${expectedChart.chart} ${expectedPlacement.planet} sign`, actualPlacement.sign);
      assert(Math.abs(actualPlacement.degree - expectedPlacement.degree) <= 0.000001, `${fixture.id}: ${expectedChart.chart} ${expectedPlacement.planet} degree`, String(actualPlacement.degree));
    }
  }
}

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
console.log(`\nProvider Varga QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);

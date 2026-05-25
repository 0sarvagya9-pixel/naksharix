import fs from "node:fs";
import path from "node:path";
import { calculateChartForFixture } from "../lib/astrology/testing/chart-adapter.mjs";

const root = process.cwd();
const results = [];

function record(status, name, detail = "") {
  results.push({ status, name, detail });
}

function pass(name, detail) {
  record("PASSED", name, detail);
}

function fail(name, detail) {
  record("FAILED", name, detail);
}

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(condition, name, detail) {
  if (condition) pass(name, detail);
  else fail(name, detail);
}

const sample = await calculateChartForFixture({
  date: "1990-01-01",
  time: "12:00",
  timezone: "+05:30",
  latitude: 28.6139,
  longitude: 77.209,
  place: "Delhi",
  ayanamsa: "lahiri",
  house_system: "Vedic Whole Sign"
});

assert(sample.metadata.providerName === "naksharix_astronomy_engine_lahiri_internal", "Chart adapter provider", sample.metadata.providerName);
assert(sample.metadata.verified === false, "Chart adapter external verification boundary", "provider output is not externally verified");
assert(Number.isFinite(sample.ascendant?.absoluteLongitude), "Ascendant calculated", `${sample.ascendant.sign} ${sample.ascendant.degree}`);
assert(Array.isArray(sample.planets) && sample.planets.length === 9, "Planet positions calculated", `${sample.planets.length} planets`);
assert(sample.planets.every((planet) => Number.isFinite(planet.absoluteLongitude) && Number.isFinite(planet.degree)), "Planet longitudes finite", "all canonical planets have finite degrees");
assert(sample.nakshatra?.name && Number.isInteger(sample.nakshatra.pada), "Moon nakshatra calculated", `${sample.nakshatra.name} pada ${sample.nakshatra.pada}`);
assert(sample.dasha?.startingMahadashaLord && sample.dasha.transitions.length >= 9, "Dasha transitions calculated", `${sample.dasha?.startingMahadashaLord}`);

if (sample.dasha?.transitions?.length) {
  const monotonic = sample.dasha.transitions.every((period, index, periods) => {
    const start = Date.parse(period.startsAt);
    const end = Date.parse(period.endsAt);
    const previousEnd = index === 0 ? start : Date.parse(periods[index - 1].endsAt);
    return Number.isFinite(start) && Number.isFinite(end) && end > start && start >= previousEnd;
  });
  assert(monotonic, "Dasha transitions monotonic", "start/end ranges are ordered");
}

const sourceChecks = [
  ["lib/astrology/premium-engine/chart.ts", "calculateInternalChart", "Core chart engine exists"],
  ["lib/astrology/premium-engine/dasha.ts", "calculateVimshottariDasha", "Dasha engine exists"],
  ["lib/astrology/premium-engine/panchang.ts", "calculatePremiumPanchang", "Panchang internal service exists"],
  ["lib/astrology/transit/engine.ts", "calculateInternalTransitSnapshot", "Transit internal snapshot exists"],
  ["lib/astrology/varga/engine.ts", "calculateVargaChart", "Varga calculation service exists"],
  ["lib/astrology/strength/shadbala.ts", "calculatePartialShadbala", "Partial Shadbala service exists"],
  ["lib/astrology/strength/ashtakvarga.ts", "createAshtakvargaDependencyResult", "Ashtakvarga dependency service exists"],
  ["lib/astrology/interpretation/rule-engine.ts", "generateStarterInterpretation", "Interpretation starter engine exists"],
  ["lib/astrology/remedies/rules.ts", "generateSafeRemedies", "Remedies starter engine exists"],
  ["lib/reports/premium-report-content-engine.ts", "assemblePremiumReportContent", "Premium report content assembler exists"],
  ["lib/astrology/premium-engine/activation-status.ts", "premiumEngineActivationMatrix", "Premium engine activation matrix exists"]
];

for (const [file, needle, name] of sourceChecks) {
  assert(source(file).includes(needle), name, file);
}

const unsafePublicPatterns = [
  /publicPredictionEnabled:\s*true/,
  /premiumComplete:\s*true/,
  /100%\s*accurate/i,
  /guaranteed\s+(success|wealth|marriage|result|outcome)|will\s+definitely/i
];

for (const file of [
  "lib/astrology/premium-engine/chart.ts",
  "lib/astrology/premium-engine/panchang.ts",
  "lib/astrology/transit/engine.ts",
  "lib/astrology/varga/engine.ts",
  "lib/astrology/strength/shadbala.ts",
  "lib/astrology/strength/ashtakvarga.ts",
  "lib/astrology/interpretation/rule-engine.ts",
  "lib/astrology/remedies/rules.ts",
  "lib/reports/premium-report-content-engine.ts",
  "lib/astrology/premium-engine/activation-status.ts",
  "lib/reports/premium-report-generation-service.ts"
]) {
  const text = source(file);
  for (const pattern of unsafePublicPatterns) {
    assert(!pattern.test(text), `No unsafe public claim in ${file}`, pattern.toString());
  }
}

const matrix = source("lib/astrology/premium-engine/activation-status.ts");
for (const moduleName of [
  "chart_precision",
  "dasha",
  "panchang",
  "transit",
  "varga",
  "shadbala",
  "ashtakvarga",
  "interpretation",
  "remedies",
  "premium_report_content",
  "pdf_generation"
]) {
  assert(matrix.includes(`${moduleName}:`), `Activation matrix includes ${moduleName}`, "public gate is explicit");
}
assert(matrix.includes("panchang") && matrix.includes("public_active_provider_verified"), "Panchang provider-verified public activation is explicit", "not external verified");
assert(!/transit:\s*{[\s\S]*?publicEnabled:\s*true/.test(matrix), "Transit remains publicly disabled", "ingress/retrograde fixtures still required");
assert(!/varga:\s*{[\s\S]*?publicEnabled:\s*true/.test(matrix), "Varga remains publicly disabled", "external chart fixtures still required");
assert(!/shadbala:\s*{[\s\S]*?publicEnabled:\s*true/.test(matrix), "Full Shadbala remains publicly disabled", "formula fixtures still required");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nPremium engine QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

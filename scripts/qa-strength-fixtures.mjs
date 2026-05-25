import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];
const allowedLevels = new Set(["verified_external", "needs_external_validation", "blocked_until_provider_ready", "blocked_until_verified_formula"]);
const shadbalaComponents = ["sthanaBala", "digBala", "kalaBala", "cheshtaBala", "naisargikaBala", "drikBala", "total"];
const shadbalaPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function isFilled(value) {
  return value !== null && value !== undefined && value !== "";
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

function validateStrengthFoundation() {
  const files = [
    "lib/astrology/strength/types.ts",
    "lib/astrology/strength/shadbala.ts",
    "lib/astrology/strength/ashtakvarga.ts"
  ];
  for (const file of files) assert(exists(file), `Strength source exists: ${file}`, file);
  const combined = files.map(source).join("\n");
  assert(!/publicEnabled:\s*true/.test(combined), "Strength modules are not public enabled", "foundation only");
  assert(!/verified:\s*true/.test(combined), "Strength modules are not marked verified", "no fake verification");
  assert(!/total:\s*[1-9][0-9]*(\.[0-9]+)?/.test(combined), "No fake numeric Shadbala total in source", "no score output");
}

function validateShadbalaFixtures() {
  const samples = readJson("fixtures/astrology/shadbala-basic.json");
  assert(Array.isArray(samples), "Shadbala fixture root is array", `${samples.length} sample slots`);
  for (const sample of samples) {
    const prefix = `${sample.id ?? "missing-id"} schema`;
    for (const field of ["id", "name", "purpose", "source_note", "verified_level"]) {
      assert(isFilled(sample[field]), prefix, `${field} is required`);
    }
    assert(allowedLevels.has(sample.verified_level), prefix, `verified_level ${sample.verified_level}`);
    for (const planet of shadbalaPlanets) {
      const score = sample.expected?.planets?.[planet];
      assert(Boolean(score), prefix, `expected.planets.${planet} exists`);
      for (const component of shadbalaComponents) {
        assert(component in (score ?? {}), prefix, `${planet}.${component} exists`);
      }
    }
    if (sample.verified_level === "verified_external") {
      const missing = shadbalaPlanets.flatMap((planet) => shadbalaComponents.filter((component) => typeof sample.expected.planets[planet][component] !== "number").map((component) => `${planet}.${component}`));
      if (missing.length) record("FAILED", sample.name, `verified fixture missing scores: ${missing.join(", ")}`);
      else record("BLOCKED_UNTIL_PROVIDER_READY", sample.name, "Shadbala runtime comparison adapter is not wired yet.");
    } else {
      record(sample.verified_level === "needs_external_validation" ? "SKIPPED_NEEDS_EXTERNAL_VALIDATION" : "BLOCKED_UNTIL_PROVIDER_READY", sample.name, sample.source_note);
    }
  }
}

function validateAshtakvargaFixtures() {
  const samples = readJson("fixtures/astrology/ashtakvarga-basic.json");
  assert(Array.isArray(samples), "Ashtakvarga fixture root is array", `${samples.length} sample slots`);
  for (const sample of samples) {
    const prefix = `${sample.id ?? "missing-id"} schema`;
    for (const field of ["id", "name", "purpose", "source_note", "verified_level"]) {
      assert(isFilled(sample[field]), prefix, `${field} is required`);
    }
    assert(allowedLevels.has(sample.verified_level), prefix, `verified_level ${sample.verified_level}`);
    assert(typeof sample.expected?.bhinna === "object", prefix, "expected.bhinna object exists");
    assert(Array.isArray(sample.expected?.sarva), prefix, "expected.sarva array exists");
    if (sample.verified_level === "verified_external") {
      if (!sample.expected.sarva.length) record("FAILED", sample.name, "verified fixture has no Sarva Ashtakvarga values");
      else record("BLOCKED_UNTIL_PROVIDER_READY", sample.name, "Ashtakvarga runtime comparison adapter is not wired yet.");
    } else {
      record(sample.verified_level === "needs_external_validation" ? "SKIPPED_NEEDS_EXTERNAL_VALIDATION" : "BLOCKED_UNTIL_PROVIDER_READY", sample.name, sample.source_note);
    }
  }
}

validateStrengthFoundation();
validateShadbalaFixtures();
validateAshtakvargaFixtures();

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nStrength fixture QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

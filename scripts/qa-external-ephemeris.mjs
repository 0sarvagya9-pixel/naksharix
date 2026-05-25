import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fixturePath = "fixtures/astrology/external-ephemeris-kundli-samples.json";
const panchangFixturePath = "fixtures/astrology/panchang-accuracy-samples.json";
const requiredPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const requiredPanchangFields = ["Date", "Location", "Timezone", "Sunrise", "Sunset", "Moonrise", "Moonset", "Tithi", "Nakshatra", "Yoga", "Karana", "Vaar", "Rahu Kaal", "Yamaganda", "Gulika Kaal", "Abhijit Muhurat"];
const allowedLevels = new Set(["verified_external", "needs_external_validation", "approximate", "blocked_until_provider_ready"]);
const results = [];

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function fail(name, detail) {
  record("FAILED", name, detail);
}

function pass(name, detail) {
  record("PASSED", name, detail);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function sourceExists(file) {
  return fs.existsSync(path.join(root, file));
}

function isFilled(value) {
  return value !== null && value !== undefined && value !== "";
}

function validateFixtureShape(sample) {
  const prefix = `${sample.id ?? "missing-id"} schema`;
  if (!sample.id) fail(prefix, "id is required");
  if (!sample.name) fail(prefix, "name is required");
  if (!sample.purpose) fail(prefix, "purpose is required");
  if (!allowedLevels.has(sample.verified_level)) fail(prefix, `invalid verified_level ${sample.verified_level}`);
  for (const field of ["date", "time", "timezone", "latitude", "longitude", "place", "ayanamsa", "house_system"]) {
    if (!isFilled(sample.input?.[field])) fail(prefix, `input.${field} is required`);
  }
  if (!sample.expected?.ascendant) fail(prefix, "expected.ascendant is required");
  if (!sample.expected?.moon) fail(prefix, "expected.moon is required");
  if (!sample.expected?.planets) fail(prefix, "expected.planets is required");
  if (!sample.expected?.dasha) fail(prefix, "expected.dasha is required");
  for (const planet of requiredPlanets) {
    if (!sample.expected?.planets?.[planet]) fail(prefix, `expected.planets.${planet} is required`);
  }
}

function hasCompleteExpectedValues(sample) {
  const asc = sample.expected.ascendant;
  const moon = sample.expected.moon;
  if (!isFilled(asc.sign) || typeof asc.degree !== "number") return false;
  if (!isFilled(moon.sign) || typeof moon.degree !== "number" || !isFilled(moon.nakshatra) || typeof moon.pada !== "number") return false;
  return requiredPlanets.every((planet) => {
    const expected = sample.expected.planets[planet];
    return isFilled(expected.sign) && typeof expected.degree === "number";
  });
}

function providerAdapterStatus() {
  const ownEngine = sourceExists("lib/astrology/own-engine/index.ts");
  const provider = sourceExists("lib/astrology/provider.ts");
  const swiss = sourceExists("lib/astrology/swiss-kundli.ts");
  const adapter = sourceExists("lib/astrology/ephemeris/current-provider-adapter.ts");
  const types = sourceExists("lib/astrology/ephemeris/types.ts");
  if (adapter && types) {
    return {
      availableForStrictRuntime: false,
      detail: "Typed ephemeris adapter exists, but it intentionally reports blocked/unverified metadata until trusted external fixtures and a CI-safe calculation runtime are wired.",
      suggestedAdapter: "Promote current-provider-adapter only after it can return canonical chart JSON with verified provider metadata."
    };
  }
  if (ownEngine && provider) {
    return {
      availableForStrictRuntime: false,
      detail: "Engine source exists, but qa:ephemeris intentionally avoids importing server-only TypeScript providers from plain Node until a CI-safe adapter is added.",
      suggestedAdapter: "Create a scripts/adapters/calculate-chart-fixture.mjs or TypeScript test harness that returns canonical chart JSON."
    };
  }
  if (swiss) {
    return {
      availableForStrictRuntime: false,
      detail: "Swiss source exists, but direct runtime validation is blocked until optional native binding availability is guaranteed in CI.",
      suggestedAdapter: "Add a provider-stable fixture adapter after swisseph availability is verified."
    };
  }
  return {
    availableForStrictRuntime: false,
    detail: "No CI-safe astrology calculation adapter was found.",
    suggestedAdapter: "Expose calculateChart(input) from a test-safe adapter."
  };
}

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function compareVerifiedFixture(sample, adapter) {
  if (!hasCompleteExpectedValues(sample)) {
    fail(sample.name, "verified_external fixture has null or incomplete expected ephemeris values");
    return;
  }
  if (!adapter.availableForStrictRuntime) {
    record("ENGINE_FUNCTION_NOT_EXPORTED", sample.name, adapter.detail);
    return;
  }
  // Future path: call adapter.calculateChart(sample.input) and compare with tolerances.
  record("BLOCKED_UNTIL_PROVIDER_READY", sample.name, "Runtime comparison adapter is not wired yet.");
}

const samples = readJson(fixturePath);
const adapter = providerAdapterStatus();

if (!Array.isArray(samples)) {
  fail("external ephemeris fixture file", "fixture root must be an array");
} else {
  pass("external ephemeris fixture file", `${samples.length} sample slots loaded`);
  for (const sample of samples) {
    validateFixtureShape(sample);
    if (sample.verified_level === "verified_external") {
      compareVerifiedFixture(sample, adapter);
    } else if (sample.verified_level === "needs_external_validation") {
      record("SKIPPED_NEEDS_EXTERNAL_VALIDATION", sample.name, sample.source_note);
    } else if (sample.verified_level === "approximate") {
      record("SKIPPED_NEEDS_EXTERNAL_VALIDATION", sample.name, "Approximate fixtures are documentation only and cannot prove precision.");
    } else if (sample.verified_level === "blocked_until_provider_ready") {
      record("BLOCKED_UNTIL_PROVIDER_READY", sample.name, sample.source_note);
    }
  }
}

record("ENGINE_FUNCTION_NOT_EXPORTED", "runtime adapter status", adapter.detail);

function validateAyanamsaSupport() {
  const provider = source("lib/astrology/ephemeris/provider.ts");
  const adapterSource = source("lib/astrology/ephemeris/current-provider-adapter.ts");
  for (const key of ["lahiri", "raman", "kp", "fagan_bradley"]) {
    if (!provider.includes(`key: "${key}"`)) fail("ayanamsa support schema", `${key} option is missing`);
  }
  if (!/key:\s*"lahiri"[\s\S]*?implemented:\s*true[\s\S]*?verified:\s*false[\s\S]*?publicSelectable:\s*false/.test(provider)) {
    fail("ayanamsa support schema", "Lahiri must be implemented but not publicly selectable/verified yet");
  } else {
    pass("ayanamsa support schema", "Lahiri is implemented but not marked verified/public selectable");
  }
  for (const key of ["raman", "kp", "fagan_bradley"]) {
    const pattern = new RegExp(`key:\\s*"${key}"[\\s\\S]*?implemented:\\s*false[\\s\\S]*?verified:\\s*false[\\s\\S]*?publicSelectable:\\s*false`);
    if (!pattern.test(provider)) fail("ayanamsa support schema", `${key} must remain unimplemented/unverified/not public selectable`);
  }
  if (provider.includes('precisionLevel: "blocked_until_provider_ready"') && provider.includes("verified: false") && adapterSource.includes("currentEphemerisMetadata()")) {
    pass("ephemeris adapter metadata", "current adapter reports blocked/unverified status");
  } else {
    fail("ephemeris adapter metadata", "current adapter must report blocked/unverified status");
  }
}

function validatePanchangFixtures() {
  const samples = readJson(panchangFixturePath);
  if (!Array.isArray(samples)) {
    fail("Panchang accuracy fixtures", "fixture root must be an array");
    return;
  }
  pass("Panchang accuracy fixture file", `${samples.length} sample slots loaded`);
  for (const sample of samples) {
    const prefix = `${sample.id ?? "missing-id"} schema`;
    for (const field of ["id", "name", "purpose", "source_note", "verified_level"]) {
      if (!isFilled(sample[field])) fail(prefix, `${field} is required`);
    }
    for (const field of ["date", "timezone", "latitude", "longitude", "place"]) {
      if (!isFilled(sample.input?.[field])) fail(prefix, `input.${field} is required`);
    }
    for (const field of requiredPanchangFields) {
      if (!(field in (sample.expected ?? {}))) fail(prefix, `expected.${field} is required`);
    }
    if (sample.verified_level === "verified_external") {
      const missing = requiredPanchangFields.filter((field) => !isFilled(sample.expected?.[field]));
      if (missing.length) fail(sample.name, `verified Panchang fixture has missing fields: ${missing.join(", ")}`);
      else record("BLOCKED_UNTIL_PROVIDER_READY", sample.name, "Panchang comparison adapter is not wired yet.");
    } else {
      record("SKIPPED_NEEDS_EXTERNAL_VALIDATION", sample.name, sample.source_note);
    }
  }
}

validateAyanamsaSupport();
validatePanchangFixtures();

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nExternal ephemeris QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED || samples.some((sample) => sample.verified_level === "verified_external") && counts.ENGINE_FUNCTION_NOT_EXPORTED) {
  process.exit(1);
}

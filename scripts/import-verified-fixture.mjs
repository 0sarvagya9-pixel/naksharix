import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (key?.startsWith("--")) args.set(key.slice(2), value ?? "true");
}

const categories = {
  kundli: {
    template: "fixtures/import-templates/kundli-external-fixture.template.json",
    target: "fixtures/astrology/external-ephemeris-kundli-samples.json",
    requiredInput: ["date", "time", "timezone", "latitude", "longitude", "place", "ayanamsa", "house_system"],
    requiredExpected: ["ascendant", "moon", "planets", "dasha"]
  },
  panchang: {
    template: "fixtures/import-templates/panchang-external-fixture.template.json",
    target: "fixtures/astrology/panchang-accuracy-samples.json",
    requiredInput: ["date", "timezone", "latitude", "longitude", "place"],
    requiredExpected: ["Date", "Location", "Timezone", "Sunrise", "Sunset", "Moonrise", "Moonset", "Tithi", "Nakshatra", "Yoga", "Karana", "Vaar", "Rahu Kaal", "Yamaganda", "Gulika Kaal", "Abhijit Muhurat"]
  },
  transit: {
    template: "fixtures/import-templates/transit-external-fixture.template.json",
    target: "fixtures/astrology/transit-accuracy-samples.json",
    requiredInput: ["planet", "startDate", "endDate", "timezone", "ayanamsa"],
    requiredExpected: ["ingressAt", "retrogradeStart", "retrogradeEnd", "directAt", "toleranceHours"]
  },
  varga: {
    template: "fixtures/import-templates/varga-external-fixture.template.json",
    target: "fixtures/astrology/varga-basic.json",
    requiredInput: ["chart", "ayanamsa", "planets"],
    requiredExpected: ["placements", "toleranceDegrees"]
  },
  strength: {
    template: "fixtures/import-templates/strength-external-fixture.template.json",
    target: "fixtures/astrology/shadbala-basic.json",
    requiredInput: ["date", "time", "timezone", "latitude", "longitude", "ayanamsa"],
    requiredExpected: []
  }
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function isFilled(value) {
  return value !== null && value !== undefined && value !== "";
}

function validateFixture(category, fixture) {
  const config = categories[category];
  const errors = [];
  for (const field of ["id", "name", "purpose", "source_note", "verified_level"]) {
    if (!isFilled(fixture[field])) errors.push(`${field} is required`);
  }
  if (!["verified_external", "needs_external_validation", "approximate", "blocked_until_provider_ready", "blocked_until_verified_formula"].includes(fixture.verified_level)) {
    errors.push(`invalid verified_level: ${fixture.verified_level}`);
  }
  for (const field of config.requiredInput) {
    if (!isFilled(fixture.input?.[field]) && !Array.isArray(fixture.input?.[field])) errors.push(`input.${field} is required`);
  }
  for (const field of config.requiredExpected) {
    if (!(field in (fixture.expected ?? {}))) errors.push(`expected.${field} is required`);
  }

  if (fixture.verified_level === "verified_external") {
    if (!isFilled(fixture.source)) errors.push("source is required for verified_external");
    if (!isFilled(fixture.source_note)) errors.push("source_note is required for verified_external");
    const missingExpected = JSON.stringify(fixture.expected).includes(":null");
    if (missingExpected) errors.push("verified_external fixture cannot contain null expected values");
  }
  return errors;
}

function checkTemplates() {
  let failed = false;
  for (const [category, config] of Object.entries(categories)) {
    const template = readJson(config.template);
    const errors = validateFixture(category, template);
    const blockingErrors = errors.filter((error) => !error.includes("source is required") && !error.includes("cannot contain null"));
    if (blockingErrors.length) {
      failed = true;
      console.log(`FAILED: ${category} template - ${blockingErrors.join("; ")}`);
    } else {
      console.log(`PASSED: ${category} template schema`);
    }
  }
  if (failed) process.exit(1);
}

if (args.has("check-templates") || process.argv.length === 2) {
  checkTemplates();
  process.exit(0);
}

const category = args.get("category");
const inputPath = args.get("input");
if (!category || !categories[category]) {
  console.error(`FAILED: --category must be one of ${Object.keys(categories).join(", ")}`);
  process.exit(1);
}
if (!inputPath) {
  console.error("FAILED: --input is required");
  process.exit(1);
}

const fixture = JSON.parse(fs.readFileSync(path.resolve(root, inputPath), "utf8"));
const errors = validateFixture(category, fixture);
if (errors.length) {
  console.error(`FAILED: fixture validation failed - ${errors.join("; ")}`);
  process.exit(1);
}

const target = categories[category].target;
const current = readJson(target);
if (!Array.isArray(current)) {
  console.error(`FAILED: target fixture file must be an array: ${target}`);
  process.exit(1);
}
if (current.some((item) => item.id === fixture.id)) {
  console.error(`FAILED: duplicate fixture id ${fixture.id}`);
  process.exit(1);
}
current.push(fixture);
writeJson(target, current);
console.log(`PASSED: imported ${fixture.id} into ${target} with verified_level=${fixture.verified_level}`);

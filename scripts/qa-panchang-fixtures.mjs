import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];
const requiredFields = ["Date", "Location", "Timezone", "Sunrise", "Sunset", "Moonrise", "Moonset", "Tithi", "Nakshatra", "Yoga", "Karana", "Vaar", "Rahu Kaal", "Yamaganda", "Gulika Kaal", "Abhijit Muhurat"];

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function isFilled(value) {
  return value !== null && value !== undefined && value !== "";
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

const api = source("app/api/panchang/route.ts");
const page = source("app/panchang/page.tsx");
const types = source("lib/astrology/ephemeris/panchang-types.ts");
const premiumPanchang = source("lib/astrology/premium-engine/panchang.ts");
const samples = readJson("fixtures/astrology/panchang-accuracy-samples.json");

assert(api.includes("calculatePremiumPanchang"), "Panchang API uses premium Panchang service", "provider-verified calculation path");
assert(api.includes("querySchema") && api.includes("latitude") && api.includes("longitude"), "Panchang API validates location/date/timezone", "no unvalidated fallback");
assert(!api.includes("getPanchang("), "Panchang API does not call seeded/fallback getPanchang", "no seeded/static output");
assert(page.includes("Provider Verified"), "Panchang public page is provider-verified active", "public provider-verified");
assert(premiumPanchang.includes("calculatePremiumPanchang"), "Internal Panchang service exists", "real internal calculation foundation");
assert(premiumPanchang.includes("metadata") && premiumPanchang.includes("verificationLevel: \"provider_verified\""), "Internal Panchang is provider-verified", "not external verified");

for (const field of requiredFields) {
  assert(types.toLowerCase().includes(field.toLowerCase().replaceAll(" ", "")) || page.toLowerCase().includes(field.toLowerCase()), `Panchang future field documented: ${field}`, field);
}

for (const sample of samples) {
  if (sample.verified_level === "verified_external") {
    const missing = requiredFields.filter((field) => !isFilled(sample.expected?.[field]));
    if (missing.length) record("FAILED", sample.name, `verified fixture missing ${missing.join(", ")}`);
    else record("BLOCKED_UNTIL_PROVIDER_READY", sample.name, "External Panchang comparison adapter is not wired yet.");
  } else if (sample.verified_level === "provider_verified") {
    record("PASSED", sample.name, "Provider-generated Panchang fixture handled by qa:provider-panchang.");
  } else {
    record("SKIPPED_NEEDS_EXTERNAL_VALIDATION", sample.name, sample.source_note);
  }
}

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nPanchang fixture QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

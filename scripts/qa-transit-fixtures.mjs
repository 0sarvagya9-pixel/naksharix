import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];
const allowedLevels = new Set(["verified_external", "needs_external_validation", "blocked_until_provider_ready"]);
const requiredTransitPlanets = new Set(["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]);

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

function listFiles(dir) {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(relative) : [relative.replaceAll("\\", "/")];
  });
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

function validateTransitFoundation() {
  assert(exists("lib/astrology/transit/types.ts"), "Transit types exist", "lib/astrology/transit/types.ts");
  assert(exists("lib/astrology/transit/engine.ts"), "Transit engine foundation exists", "lib/astrology/transit/engine.ts");
  const engine = source("lib/astrology/transit/engine.ts");
  assert(engine.includes("publicPredictionEnabled: false"), "Transit public prediction disabled", "foundation status is blocked");
  assert(!/ingressAt:\s*['"][0-9]/.test(engine), "Transit engine does not hardcode ingress dates", "no fake dates");
}

function validateTransitFixtures() {
  const samples = readJson("fixtures/astrology/transit-accuracy-samples.json");
  assert(Array.isArray(samples), "Transit fixture root is array", `${samples.length} sample slots`);
  for (const sample of samples) {
    const prefix = `${sample.id ?? "missing-id"} schema`;
    for (const field of ["id", "name", "purpose", "source_note", "verified_level"]) {
      assert(isFilled(sample[field]), prefix, `${field} is required`);
    }
    assert(allowedLevels.has(sample.verified_level), prefix, `verified_level ${sample.verified_level}`);
    assert(requiredTransitPlanets.has(sample.input?.planet), prefix, `planet ${sample.input?.planet}`);
    for (const field of ["startDate", "endDate", "timezone", "ayanamsa"]) {
      assert(isFilled(sample.input?.[field]), prefix, `input.${field} is required`);
    }
    for (const field of ["ingressAt", "retrogradeStart", "retrogradeEnd", "toleranceHours"]) {
      assert(field in (sample.expected ?? {}), prefix, `expected.${field} exists`);
    }

    if (sample.verified_level === "verified_external") {
      const missing = ["ingressAt", "toleranceHours"].filter((field) => !isFilled(sample.expected?.[field]));
      if (missing.length) record("FAILED", sample.name, `verified fixture missing ${missing.join(", ")}`);
      else record("BLOCKED_UNTIL_PROVIDER_READY", sample.name, "Transit runtime comparison adapter is not wired yet.");
    } else if (sample.verified_level === "blocked_until_provider_ready") {
      record("BLOCKED_UNTIL_PROVIDER_READY", sample.name, sample.source_note);
    } else {
      record("SKIPPED_NEEDS_EXTERNAL_VALIDATION", sample.name, sample.source_note);
    }
  }
}

function validatePublicTransitSafety() {
  const sitemap = source("app/sitemap.ts").toLowerCase();
  const files = listFiles("app").map((file) => file.toLowerCase());
  const blockedFragments = ["sun-transit", "moon-transit", "mars-transit", "mercury-transit", "jupiter-transit", "venus-transit", "saturn-transit", "rahu-transit", "ketu-transit"];
  for (const fragment of blockedFragments) {
    assert(!sitemap.includes(fragment), `Transit sitemap safety: ${fragment}`, "not promoted as active SEO route");
    const routeFiles = files.filter((file) => file.includes(fragment));
    assert(routeFiles.length === 0, `Transit route safety: ${fragment}`, routeFiles.length ? routeFiles.join(", ") : "no route file");
  }
  assert(exists("app/transits/page.tsx"), "Current transit snapshot page exists", "provider-calculated snapshot only");
  assert(sitemap.includes("/transits"), "Current transit snapshot is sitemap eligible", "active general snapshot route");
  const transitsPage = source("app/transits/page.tsx");
  assert(transitsPage.includes("not a personalized birth-chart transit prediction"), "Transit page claim boundary", "no personalized fake prediction");
  assert(transitsPage.includes("Ingress dates, retrograde windows") && transitsPage.includes("Coming Soon"), "Transit page blocks prediction dates", "no fake ingress dates");
  assert(!/publicPredictionEnabled:\s*true/.test(source("lib/astrology/transit/engine.ts")), "Transit public prediction safety still present", "no public transit prediction activation");
}

validateTransitFoundation();
validateTransitFixtures();
validatePublicTransitSafety();

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nTransit fixture QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

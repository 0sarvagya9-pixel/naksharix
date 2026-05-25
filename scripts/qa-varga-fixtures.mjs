import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];
const allowedLevels = new Set(["verified_external", "needs_external_validation", "blocked_until_verified_formula"]);
const supportedCharts = new Set(["D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12", "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60", "D64"]);

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

function validateVargaFoundation() {
  assert(exists("lib/astrology/varga/types.ts"), "Varga types exist", "lib/astrology/varga/types.ts");
  assert(exists("lib/astrology/varga/engine.ts"), "Varga engine foundation exists", "lib/astrology/varga/engine.ts");
  const engine = source("lib/astrology/varga/engine.ts");
  for (const chart of supportedCharts) {
    assert(engine.includes(`key: "${chart}"`), `Varga definition exists: ${chart}`, "definition present");
  }
  assert(!/formulaVerified:\s*true/.test(engine), "No Varga formula is marked verified", "foundation only");
  assert(!/publicEnabled:\s*true/.test(engine), "No Varga chart is public enabled", "foundation only");
}

function validateVargaFixtures() {
  const samples = readJson("fixtures/astrology/varga-basic.json");
  assert(Array.isArray(samples), "Varga fixture root is array", `${samples.length} sample slots`);
  for (const sample of samples) {
    const prefix = `${sample.id ?? "missing-id"} schema`;
    for (const field of ["id", "name", "purpose", "source_note", "verified_level"]) {
      assert(isFilled(sample[field]), prefix, `${field} is required`);
    }
    assert(allowedLevels.has(sample.verified_level), prefix, `verified_level ${sample.verified_level}`);
    assert(supportedCharts.has(sample.input?.chart), prefix, `chart ${sample.input?.chart}`);
    assert(Array.isArray(sample.input?.planets), prefix, "input.planets array exists");
    assert(Array.isArray(sample.expected?.placements), prefix, "expected.placements array exists");

    if (sample.verified_level === "verified_external") {
      if (!sample.expected.placements.length) record("FAILED", sample.name, "verified fixture has no expected placements");
      else record("BLOCKED_UNTIL_PROVIDER_READY", sample.name, "Varga runtime comparison adapter is not wired yet.");
    } else if (sample.verified_level === "blocked_until_verified_formula") {
      record("BLOCKED_UNTIL_PROVIDER_READY", sample.name, sample.source_note);
    } else {
      record("SKIPPED_NEEDS_EXTERNAL_VALIDATION", sample.name, sample.source_note);
    }
  }
}

validateVargaFoundation();
validateVargaFixtures();

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nVarga fixture QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

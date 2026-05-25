import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];
const RASHIS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const MASTER_NUMBERS = new Set([11, 22, 33]);

function fixture(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function assertEqual(actual, expected, name, detail) {
  if (actual === expected) record("PASSED", name, detail ?? `${actual}`);
  else record("FAILED", name, `${detail ?? name}: expected ${expected}, received ${actual}`);
}

function assert(condition, name, detail) {
  if (condition) record("PASSED", name, detail);
  else record("FAILED", name, detail);
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function nakshatraFromLongitude(longitude) {
  const normalized = normalizeDegrees(longitude);
  const span = 360 / 27;
  const epsilon = 1e-9;
  const index = Math.min(26, Math.floor((normalized + epsilon) / span));
  const pada = Math.min(4, Math.floor(((normalized + epsilon) % span) / (span / 4)) + 1);
  return { name: NAKSHATRAS[index], pada };
}

function longitudeToRashi(longitude) {
  const normalized = normalizeDegrees(longitude);
  const index = Math.floor(normalized / 30);
  return { rashi: RASHIS[index], rashiNumber: index + 1, degreeInSign: normalized % 30 };
}

function reduceNumber(value) {
  if (MASTER_NUMBERS.has(value)) return value;
  if (value <= 9) return Math.max(1, value);
  return reduceNumber(String(value).split("").reduce((sum, digit) => sum + Number(digit), 0));
}

function dateDigits(dateOfBirth) {
  const date = new Date(`${dateOfBirth.slice(0, 10)}T00:00:00.000Z`);
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getUTCFullYear());
  return `${dd}${mm}${yyyy}`.split("").map(Number);
}

function nameValues(name) {
  const vowels = new Set(["A", "E", "I", "O", "U"]);
  let total = 0;
  let vowelTotal = 0;
  let consonantTotal = 0;
  for (const letter of name.toUpperCase().replace(/[^A-Z]/g, "")) {
    const value = ((letter.charCodeAt(0) - 65) % 9) + 1;
    total += value;
    if (vowels.has(letter)) vowelTotal += value;
    else consonantTotal += value;
  }
  return { total: total || 1, vowels: vowelTotal, consonants: consonantTotal };
}

function loShuCounts(digits) {
  const counts = Object.fromEntries(Array.from({ length: 9 }, (_, index) => [String(index + 1), 0]));
  for (const digit of digits) {
    if (digit >= 1 && digit <= 9) counts[String(digit)] += 1;
  }
  return counts;
}

function testNumerology() {
  for (const item of fixture("fixtures/numerology/numerology-basic.json")) {
    const digits = dateDigits(item.input.dateOfBirth);
    const values = nameValues(item.input.name);
    assertEqual(reduceNumber(Number(String(digits[0]) + String(digits[1]))), item.expected.birthNumber, `${item.name}: birth number`);
    assertEqual(reduceNumber(digits.reduce((sum, digit) => sum + digit, 0)), item.expected.lifePath, `${item.name}: life path`);
    assertEqual(reduceNumber(values.total), item.expected.nameNumber, `${item.name}: name number`);
    if (typeof item.expected.soulUrge === "number") assertEqual(reduceNumber(values.vowels || values.total), item.expected.soulUrge, `${item.name}: soul urge`);
    if (typeof item.expected.personalityNumber === "number") assertEqual(reduceNumber(Math.max(1, values.consonants || values.total)), item.expected.personalityNumber, `${item.name}: personality`);
  }
}

function testLoShu() {
  for (const item of fixture("fixtures/numerology/lo-shu-basic.json")) {
    const counts = loShuCounts(dateDigits(item.input.dateOfBirth));
    assert(JSON.stringify(counts) === JSON.stringify(item.expected.gridCounts), `${item.name}: grid counts`, JSON.stringify(counts));
    const present = Object.entries(counts).filter(([, count]) => count > 0).map(([number]) => Number(number));
    const missing = Object.entries(counts).filter(([, count]) => count === 0).map(([number]) => Number(number));
    const repeated = Object.entries(counts).filter(([, count]) => count > 1).map(([number, count]) => ({ number: Number(number), count }));
    assert(JSON.stringify(present) === JSON.stringify(item.expected.presentNumbers), `${item.name}: present numbers`, present.join(", "));
    assert(JSON.stringify(missing) === JSON.stringify(item.expected.missingNumbers), `${item.name}: missing numbers`, missing.join(", "));
    assert(JSON.stringify(repeated) === JSON.stringify(item.expected.repeatedNumbers), `${item.name}: repeated numbers`, JSON.stringify(repeated));
  }
}

function testNakshatraBoundaries() {
  const ownEngine = source("lib/astrology/own-engine/nakshatra.ts");
  assert(ownEngine.includes("export function nakshatraFromLongitude"), "Nakshatra function export exists", "lib/astrology/own-engine/nakshatra.ts");
  for (const item of fixture("fixtures/astrology/nakshatra-boundaries.json")) {
    assertEqual(NAKSHATRAS.length, item.expected.nakshatraCount, `${item.name}: nakshatra count`);
    for (const testCase of item.input.cases) {
      const actual = nakshatraFromLongitude(testCase.longitude);
      assertEqual(actual.name, testCase.expectedName, `${item.name}: ${testCase.longitude} name`);
      assertEqual(actual.pada, testCase.expectedPada, `${item.name}: ${testCase.longitude} pada`);
    }
  }
}

function testMoonSignBoundaries() {
  const ownEngine = source("lib/astrology/own-engine/zodiac.ts");
  assert(ownEngine.includes("export function longitudeToRashi"), "Rashi function export exists", "lib/astrology/own-engine/zodiac.ts");
  for (const item of fixture("fixtures/astrology/moon-sign-boundaries.json")) {
    assertEqual(RASHIS.length, item.expected.rashiCount, `${item.name}: rashi count`);
    for (const testCase of item.input.cases) {
      const actual = longitudeToRashi(testCase.longitude);
      assertEqual(actual.rashi, testCase.expectedRashi, `${item.name}: ${testCase.longitude} rashi`);
      assertEqual(actual.rashiNumber, testCase.expectedRashiNumber, `${item.name}: ${testCase.longitude} rashi number`);
    }
  }
}

function testDashaContracts() {
  for (const item of fixture("fixtures/astrology/dasha-transitions.json")) {
    if (item.verified_level !== "deterministic") {
      record("SKIPPED_NEEDS_VALIDATION", item.name, item.source_note);
      continue;
    }
    const total = item.input.years.reduce((sum, years) => sum + years, 0);
    assertEqual(total, item.expected.totalYears, `${item.name}: total years`);
    assertEqual(item.input.lords[0], item.expected.firstLord, `${item.name}: first lord`);
    assertEqual(item.input.lords.at(-1), item.expected.lastLord, `${item.name}: last lord`);
  }
}

function testMatchingContracts() {
  const sourceText = source("lib/matching/kundli-matching.ts");
  assert(sourceText.includes("export function validateAshtakootFactors"), "Matching validation export exists", "validateAshtakootFactors");
  assert(sourceText.includes("export function normalizeNakshatraForMatching"), "Matching nakshatra normalization export exists", "normalizeNakshatraForMatching");
  for (const item of fixture("fixtures/matching/ashtakoot-basic.json")) {
    if (item.input.factors) {
      const totalMax = item.input.factors.reduce((sum, factor) => sum + factor.maxScore, 0);
      assertEqual(totalMax, item.expected.totalMax, `${item.name}: total max`);
      assertEqual(item.input.factors.length, item.expected.factorCount, `${item.name}: factor count`);
      assert(item.input.factors.every((factor) => factor.score >= 0), `${item.name}: no negative scores`, "all scores >= 0");
      assert(item.input.factors.every((factor) => factor.score <= factor.maxScore), `${item.name}: no score above max`, "all scores <= max");
    }
    if (item.input.cases) {
      for (const testCase of item.input.cases) {
        const pattern = new RegExp(`index:\\s*${testCase.expectedIndex}[^}]+name:\\s*"${testCase.name}"[^}]+nadi:\\s*"${testCase.expectedNadi}"`, "s");
        assert(pattern.test(sourceText), `${item.name}: ${testCase.name} reference`, `index ${testCase.expectedIndex}, nadi ${testCase.expectedNadi}`);
      }
    }
  }
}

function testPanchangGate() {
  const api = source("app/api/panchang/route.ts");
  const page = source("app/panchang/page.tsx");
  for (const item of fixture("fixtures/safety/panchang-gate.json")) {
    assert(api.includes(String(item.expected.apiStatus)), `${item.name}: API returns disabled status`, String(item.expected.apiStatus));
    for (const phrase of item.expected.mustNotCall) {
      assert(!api.includes(phrase), `${item.name}: API does not call ${phrase}`, "guarded");
    }
    assert(page.includes(item.expected.pageStatus), `${item.name}: page remains ${item.expected.pageStatus}`, "public hold");
    for (const field of item.expected.requiredFutureFields) {
      assert(page.toLowerCase().includes(field.toLowerCase()), `${item.name}: documents ${field}`, field);
    }
  }
}

function testTransitGate() {
  const sitemap = source("app/sitemap.ts");
  const appFiles = listFiles("app");
  for (const item of fixture("fixtures/safety/transit-gate.json")) {
    const activeRoutes = appFiles.filter((file) => item.input.blockedRouteFragments.some((fragment) => file.toLowerCase().includes(fragment)));
    assertEqual(activeRoutes.length, item.expected.activePredictionRoutes, `${item.name}: no active transit route files`);
    for (const fragment of item.input.blockedRouteFragments) {
      assert(!sitemap.toLowerCase().includes(fragment), `${item.name}: sitemap does not promote ${fragment}`, "not promoted");
    }
  }
}

function testKundliFixtureStatus() {
  for (const item of fixture("fixtures/astrology/kundli-basic.json")) {
    record("SKIPPED_NEEDS_VALIDATION", item.name, item.source_note);
  }
}

function testPublicClaimSafety() {
  const files = [
    "components/focused-calculator-content.tsx",
    "components/reports-content.tsx",
    "app/reports/[slug]/page.tsx",
    "app/panchang/page.tsx",
    "app/api/panchang/route.ts",
    "lib/contact-cta.ts",
    "app/sitemap.ts"
  ];
  const forbidden = [
    /100%\s*accurate/i,
    /instant report delivered/i,
    /payment successful/i,
    /live Panchang/i,
    /real-time transit prediction/i,
    /personalized by your birth chart/i,
    /Request on WhatsApp|WhatsApp\/Contact|payment confirmation/i
  ];
  for (const file of files) {
    const text = source(file);
    for (const pattern of forbidden) {
      assert(!pattern.test(text), `Public claim safety: ${file}`, `blocked pattern ${pattern}`);
    }
  }
}

function listFiles(dir) {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(relative) : [relative.replaceAll("\\", "/")];
  });
}

testNumerology();
testLoShu();
testNakshatraBoundaries();
testMoonSignBoundaries();
testDashaContracts();
testMatchingContracts();
testPanchangGate();
testTransitGate();
testKundliFixtureStatus();
testPublicClaimSafety();

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}

console.log(`\nEngine fixture QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

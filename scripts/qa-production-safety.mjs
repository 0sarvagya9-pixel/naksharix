import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

const holdPages = [
  { route: "app/shop/page.tsx", label: "Shop" },
  { route: "app/consultation/page.tsx", label: "Consultation" },
  { route: "app/ai-astrologer/page.tsx", label: "AI Astrologer" }
];

for (const page of holdPages) {
  if (!exists(page.route)) {
    record("FAILED", `${page.label} hold page`, `${page.route} missing`);
    continue;
  }
  const text = source(page.route).toLowerCase();
  assert(text.includes("coming soon") || text.includes("beta") || text.includes("aicomingsooncontent"), `${page.label} remains held`, page.route);
}

const noFakePublicFiles = [
  "components/reports-content.tsx",
  "app/reports/[slug]/page.tsx",
  "app/panchang/page.tsx",
  "app/api/panchang/route.ts",
  "lib/astrology/transit/engine.ts",
  "lib/astrology/varga/engine.ts",
  "lib/astrology/strength/shadbala.ts",
  "lib/astrology/strength/ashtakvarga.ts",
  "lib/reports/premium-report-types.ts"
];

const forbidden = [
  /100%\s*accurate/i,
  /guaranteed result/i,
  /instant report delivered/i,
  /fake/i,
  /real-time transit prediction/i,
  /live Panchang/i,
  /automaticDeliveryEnabled:\s*true/,
  /paymentEnabled:\s*true/,
  /publicPredictionEnabled:\s*true/
];

for (const file of noFakePublicFiles) {
  const text = source(file);
  for (const pattern of forbidden) {
    assert(!pattern.test(text), `Production claim safety: ${file}`, `blocked pattern ${pattern}`);
  }
}

const robots = source("app/robots.ts");
assert(robots.includes("/panchang"), "Robots allows provider-verified Panchang", "/panchang allowed");
assert(robots.includes("/shop"), "Robots keeps Shop held", "/shop disallowed");
assert(robots.includes("/consultation"), "Robots keeps Consultation held", "/consultation disallowed");
assert(robots.includes("/ai-astrologer"), "Robots keeps AI Astrologer held", "/ai-astrologer disallowed");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nProduction safety QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

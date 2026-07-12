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

const parkedPages = [
  { route: "app/shop/page.tsx", label: "Shop", markers: ["ShopComingSoonContent", "index: false"] },
  { route: "app/ai-astrologer/page.tsx", label: "AI Astrologer", markers: ["Temporarily Parked", "index: false"] },
  { route: "app/talk-to-kundli/page.tsx", label: "Legacy Kundli AI", markers: ["permanentRedirect", "/ai-astrologer"] },
  { route: "app/chatbot/page.tsx", label: "Legacy chatbot", markers: ["permanentRedirect", "/ai-astrologer"] }
];

for (const page of parkedPages) {
  if (!exists(page.route)) {
    record("FAILED", `${page.label} parked page`, `${page.route} missing`);
    continue;
  }
  const text = source(page.route);
  assert(page.markers.every((marker) => text.includes(marker)), `${page.label} remains safely parked`, page.route);
}

const consultation = source("app/consultation/page.tsx");
assert(consultation.includes("AstrologersPageContent") && consultation.includes('status: "APPROVED"'), "Consultation remains active", "approved profiles are rendered");
assert(consultation.includes("index: true"), "Consultation remains indexable", "active public service");

const noFakePublicFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/ai-astrologer/page.tsx",
  "app/talk-to-kundli/page.tsx",
  "app/chatbot/page.tsx",
  "app/shop/page.tsx",
  "components/nx-home.tsx",
  "components/reports-content.tsx",
  "components/shop-coming-soon-content.tsx",
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
  /1M\+/i,
  /10k\+/i,
  /98%/i,
  /happy users/i,
  /expert astrologers/i,
  /trusted by millions/i,
  /100%\s*accurate/i,
  /guaranteed result/i,
  /instant report delivered/i,
  /AI-Powered Accuracy/i,
  /Gemini-powered/i,
  /placeholder payments/i,
  /Advisor profile placeholder/i,
  /real-time transit prediction/i,
  /automaticDeliveryEnabled:\s*true/,
  /publicPredictionEnabled:\s*true/
];

for (const file of noFakePublicFiles) {
  if (!exists(file)) {
    record("FAILED", `Production claim safety: ${file}`, "file missing");
    continue;
  }
  const text = source(file);
  for (const pattern of forbidden) {
    assert(!pattern.test(text), `Production claim safety: ${file}`, `blocked pattern ${pattern}`);
  }
}

const robots = source("app/robots.ts");
assert(robots.includes('"/consultation"'), "Robots allows active Consultation", "/consultation allowed");
for (const route of ["/shop", "/ai-astrologer", "/talk-to-kundli", "/chatbot"]) {
  assert(robots.includes(`"${route}"`), `Robots blocks parked route ${route}`, `${route} disallowed`);
}

const sitemap = source("app/sitemap.ts");
assert(!sitemap.includes('"/talk-to-kundli"') && !sitemap.includes('"/ai-astrologer"') && !sitemap.includes('"/shop"'), "Sitemap excludes parked routes", "AI and Shop are not promoted for indexing");
assert(sitemap.includes('"/consultation"'), "Sitemap includes active Consultation", "/consultation included");

const aiChat = source("app/api/ai/chat/route.ts");
const aiReports = source("app/api/ai/report-generator/route.ts");
assert(aiChat.includes("isAiAstrologerEnabled") && aiChat.includes("aiFeatureParkedResponse"), "Public AI chat fails closed", "feature flag guard runs before request parsing");
assert(aiReports.includes("isAiAstrologerEnabled") && aiReports.includes("aiFeatureParkedResponse"), "AI report generator fails closed", "feature flag guard is present");

const diagnostics = source("app/api/admin/diagnose-gemini/route.ts");
assert(diagnostics.includes("areAiDiagnosticsEnabled") && diagnostics.includes('["ADMIN", "SUPER_ADMIN"]'), "Gemini diagnostics are gated", "admin plus explicit non-production flag");
assert(!diagnostics.includes("keyPrefix") && !diagnostics.includes("keyLength") && !diagnostics.includes("dataSummary"), "Gemini diagnostics expose no key metadata", "no prefix, length, or raw provider response");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nProduction safety QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

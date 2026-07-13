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

const legacyPages = [
  { route: "app/talk-to-kundli/page.tsx", label: "Legacy Kundli AI", markers: ["permanentRedirect", "/ai-astrologer"] },
  { route: "app/chatbot/page.tsx", label: "Legacy chatbot", markers: ["permanentRedirect", "/ai-astrologer"] }
];

for (const page of legacyPages) {
  if (!exists(page.route)) {
    record("FAILED", `${page.label} redirect page`, `${page.route} missing`);
    continue;
  }
  const text = source(page.route);
  assert(page.markers.every((marker) => text.includes(marker)), `${page.label} redirects safely`, page.route);
}

const shopPage = source("app/shop/page.tsx");
const shopContent = source("components/shop-coming-soon-content.tsx");
assert(shopPage.includes("index: true") && shopPage.includes("Spiritual Catalogue"), "Shop publishes a truthful informational catalogue", "indexable catalogue metadata");
assert(shopContent.includes("shopProducts") && shopContent.includes("Ask Availability"), "Shop catalogue renders real seed product information", "searchable contact-based catalogue");
assert(!shopContent.includes("RazorpayCheckoutButton") && !shopContent.includes("Add to Cart") && !shopContent.includes("Buy Now"), "Shop does not invent ecommerce", "no cart or product checkout controls");

const aiPage = source("app/ai-astrologer/page.tsx");
const aiChatUi = source("components/ai-astrologer-chat.tsx");
const aiChatProvider = source("lib/ai/gemini-chat.ts");
const aiFeatureStatus = source("lib/ai/feature-status.ts");
assert(aiPage.includes("isAiAstrologerReady") && aiPage.includes("AiAstrologerChat") && aiPage.includes("Temporarily Unavailable"), "AI page is readiness-gated", "live UI only renders with flag and real key");
assert(aiChatUi.includes("/api/ai/chat") && aiChatUi.includes("Gemini service") && aiChatUi.includes("consent"), "AI chat UI has provider disclosure and consent", "no hidden sensitive-data processing");
assert(aiChatProvider.includes("GeminiChatProviderError") && aiChatProvider.includes("gemini-3.5-flash") === false && aiChatProvider.includes("env.GEMINI_MODEL"), "AI chat provider is configurable and fail-closed", "strict provider errors without generated fallback");
assert(!aiChatProvider.includes("return fallback") && !aiChatProvider.includes("chatFallback"), "Public AI chat has no synthetic provider fallback", "provider outage returns unavailable");
assert(aiFeatureStatus.includes("AI_REPORT_GENERATOR_ENABLED") || aiFeatureStatus.includes("isAiReportGeneratorEnabled"), "Public chat and internal AI report flags are separated", "enabling chat cannot activate report generation");

const consultation = source("app/consultation/page.tsx");
assert(consultation.includes("AstrologersPageContent") && consultation.includes('status: "APPROVED"'), "Consultation remains active", "approved profiles are rendered");
assert(consultation.includes("index: true"), "Consultation remains indexable", "active public service");

const pricing = source("components/pricing-content.tsx");
assert(!pricing.includes("RazorpayCheckoutButton") && !pricing.includes("subscriptionPlans"), "Unsupported public subscriptions are hidden", "pricing links only to active reports and consultations");
assert(pricing.includes('href: "/reports"') && pricing.includes('href: "/consultation"'), "Pricing routes to active services", "report and consultation pages");

const paymentOrder = source("app/api/payments/razorpay/order/route.ts");
assert(paymentOrder.includes('env.SUBSCRIPTIONS_ENABLED !== "true"'), "Subscription API fails closed", "explicit feature flag required");

const noFakePublicFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/pricing/page.tsx",
  "app/ai-astrologer/page.tsx",
  "app/talk-to-kundli/page.tsx",
  "app/chatbot/page.tsx",
  "app/shop/page.tsx",
  "components/ai-astrologer-chat.tsx",
  "components/nx-home.tsx",
  "components/pricing-content.tsx",
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
assert(robots.includes('"/consultation"') && robots.includes('"/shop"'), "Robots allows active Consultation and Shop", "public services allowed");
assert(robots.includes("isAiAstrologerReady") && robots.includes('"/ai-astrologer"'), "Robots gates AI indexing by readiness", "AI route is conditional");
assert(robots.includes('"/talk-to-kundli"') && robots.includes('"/chatbot"'), "Robots blocks legacy AI aliases", "redirect-only routes disallowed");

const sitemap = source("app/sitemap.ts");
assert(sitemap.includes('"/shop"'), "Sitemap includes the informational Shop catalogue", "/shop included");
assert(sitemap.includes("isAiAstrologerReady") && sitemap.includes('"/ai-astrologer"'), "Sitemap includes AI only when ready", "conditional AI indexing");
assert(!sitemap.includes('"/talk-to-kundli"') && !sitemap.includes('"/chatbot"'), "Sitemap excludes legacy AI aliases", "redirect routes not indexed");
assert(sitemap.includes('"/consultation"'), "Sitemap includes active Consultation", "/consultation included");

const aiChat = source("app/api/ai/chat/route.ts");
const aiReports = source("app/api/ai/report-generator/route.ts");
assert(aiChat.includes("isAiAstrologerEnabled") && aiChat.includes("aiFeatureParkedResponse"), "Public AI chat fails closed", "feature flag guard runs before request parsing");
assert(aiChat.includes("chatWithAstrologerAIStrict") && aiChat.includes("isGeminiChatProviderError"), "Public AI chat handles provider failures without fallback", "strict Gemini path");
assert(aiReports.includes("isAiReportGeneratorEnabled") && aiReports.includes("aiFeatureParkedResponse"), "AI report generator fails closed independently", "separate feature flag guard");

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

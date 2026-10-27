const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const failures = [];
const passes = [];

function pass(name, detail = "") {
  passes.push({ name, detail });
}

function fail(name, detail) {
  failures.push({ name, detail });
}

async function request(path, init = {}) {
  return fetch(new URL(path, baseUrl), { redirect: "manual", ...init });
}

async function expectStatus(path, expected, init, name = path) {
  try {
    const response = await request(path, init);
    if (response.status !== expected) {
      fail(name, `expected ${expected}, received ${response.status}`);
      return null;
    }
    pass(name, `HTTP ${response.status}`);
    return response;
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
    return null;
  }
}

const publicPages = [
  ["/", "Vedic Astrology Tools"],
  ["/about", "About Naksharix"],
  ["/consultation", "Astrology Consultations"],
  ["/pricing", "Services and Pricing"],
  ["/shop", "Naksharix Spiritual Catalogue"],
  ["/ai-astrologer", "AI Astrologer"]
];

for (const [path, titleMarker] of publicPages) {
  const response = await expectStatus(path, 200, undefined, `public page ${path}`);
  if (!response) continue;
  const html = await response.text();
  if (!html.includes(titleMarker)) fail(`title marker ${path}`, `missing ${titleMarker}`);
  else pass(`title marker ${path}`, titleMarker);
  for (const forbidden of ["1M+", "10k+", "98%", "Trusted by Millions", "AI-Powered Accuracy", "Gemini-powered", "placeholder payments"]) {
    if (html.toLowerCase().includes(forbidden.toLowerCase())) fail(`claim safety ${path}`, `found ${forbidden}`);
  }
  if (path === "/pricing" && /subscribe to|INR 499\/mo|INR 1499\/mo/i.test(html)) {
    fail("pricing safety", "unsupported public subscription checkout is visible");
  }
  if (path === "/shop" && /add to cart|buy now|pay with razorpay/i.test(html)) {
    fail("shop safety", "unsupported ecommerce control is visible");
  }
}

const redirects = [
  ["/talk-to-kundli", "/ai-astrologer"],
  ["/chatbot", "/ai-astrologer"],
  ["/terms", "/terms-and-conditions"],
  ["/match-making", "/matchmaking"],
  ["/auth/login", "/login"],
  ["/auth/signup", "/signup"]
];

for (const [path, destination] of redirects) {
  const response = await request(path);
  if (![307, 308].includes(response.status)) {
    fail(`redirect ${path}`, `expected 307/308, received ${response.status}`);
    continue;
  }
  const location = response.headers.get("location") ?? "";
  if (!location.endsWith(destination)) fail(`redirect ${path}`, `expected ${destination}, received ${location}`);
  else pass(`redirect ${path}`, destination);
}

const robotsResponse = await expectStatus("/robots.txt", 200, undefined, "robots.txt");
if (robotsResponse) {
  const robots = await robotsResponse.text();
  for (const route of ["/api", "/admin", "/dashboard", "/ai-astrologer", "/talk-to-kundli", "/chatbot"]) {
    if (!robots.includes(`Disallow: ${route}`)) fail("robots coverage", `missing ${route}`);
  }
  for (const route of ["/consultation", "/shop"]) {
    if (!robots.includes(`Allow: ${route}`)) fail("robots coverage", `${route} is not allowed`);
  }
}

const sitemapResponse = await expectStatus("/sitemap.xml", 200, undefined, "sitemap.xml");
if (sitemapResponse) {
  const sitemap = await sitemapResponse.text();
  for (const active of ["/consultation", "/shop"]) {
    if (!sitemap.includes(active)) fail("sitemap active routes", `${active} missing`);
  }
  for (const unavailable of ["/ai-astrologer", "/talk-to-kundli", "/chatbot"]) {
    if (sitemap.includes(unavailable)) fail("sitemap unavailable routes", `found ${unavailable}`);
  }
}

const healthResponse = await expectStatus("/api/health", 200, undefined, "health endpoint");
if (healthResponse) {
  const body = await healthResponse.json();
  if (body.data?.status !== "ok" || body.data?.checks?.database !== "ok") {
    fail("health payload", JSON.stringify(body));
  } else {
    pass("health payload", "database ok");
  }
}

const opsResponse = await expectStatus("/api/ops/readiness", 200, undefined, "public capability readiness");
if (opsResponse) {
  const responseBody = await opsResponse.json();
  const schema = responseBody.data?.services?.databaseSchema;
  if (schema?.ready !== true || schema?.missingCount !== 0) {
    fail("predeploy feature schema", "Disposable database is missing LearningProgress or PujaPartner");
    // Debug metadata ONLY against disposable CI localhost PostgreSQL. Read-only,
    // no credentials and no application rows are printed; never connect to Neon.
    const db = process.env.DATABASE_URL;
    if (process.env.CI === "true" && db) {
      try {
        const uri = new URL(db);
        if (["localhost", "127.0.0.1"].includes(uri.hostname) &&
            ["/naksharix", "/naksharix_browser"].includes(uri.pathname)) {
          const { PrismaClient } = await import("@prisma/client");
          const client = new PrismaClient();
          try {
            const metadata = await client.$transaction(async (tx) => {
              await tx.$executeRaw`SET TRANSACTION READ ONLY`;
              const columns = await tx.$queryRaw`SELECT table_name, column_name, data_type, udt_name, is_nullable, datetime_precision FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('LearningProgress','PujaPartner') ORDER BY table_name,column_name`;
              const indexes = await tx.$queryRaw`SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename IN ('LearningProgress','PujaPartner') ORDER BY tablename,indexname`;
              const constraints = await tx.$queryRaw`SELECT c.conrelid::regclass::text AS table_name,c.conname,c.contype,c.convalidated,c.confdeltype,c.confupdtype,pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c WHERE c.conrelid IN (to_regclass('public."LearningProgress"'),to_regclass('public."PujaPartner"')) ORDER BY c.conname`;
              return {columns,indexes,constraints};
            });
            console.log("DISPOSABLE_SCHEMA_METADATA=" + JSON.stringify(metadata));
          } finally { await client.$disconnect(); }
        }
      } catch (diagnosticError) {
        console.log("DISPOSABLE_SCHEMA_METADATA_UNAVAILABLE=" + String(diagnosticError).slice(0,160));
      }
    }

  } else pass("predeploy feature schema", "both staged feature tables and indexes exist");
}
const partnerResponse = await expectStatus("/api/puja/partners", 200, undefined, "public reviewed-only Puja registry");
if (partnerResponse) {
  const body = await partnerResponse.json();
  if (!Array.isArray(body.data?.partners)) fail("puja registry", "expected reviewed partner array");
  else pass("puja registry", "safe empty/verified partner listing");
}

const aiStatusResponse = await expectStatus("/api/ai/status", 200, undefined, "AI readiness endpoint");
if (aiStatusResponse) {
  const body = await aiStatusResponse.json();
  if (body.data?.enabled !== false || body.data?.ready !== false) {
    fail("AI readiness payload", JSON.stringify(body));
  } else if (/key|secret|model/i.test(JSON.stringify(body))) {
    fail("AI readiness payload", "sensitive provider metadata exposed");
  } else {
    pass("AI readiness payload", "disabled and not ready without provider metadata");
  }
}

await expectStatus(
  "/api/ai/chat",
  403,
  { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }) },
  "AI chat rejects mutation without CSRF"
);

const csrfResponse = await expectStatus("/api/csrf", 200, undefined, "CSRF token endpoint");
if (csrfResponse) {
  const csrfBody = await csrfResponse.json();
  const token = csrfBody.data?.csrfToken;
  const cookie = (csrfResponse.headers.get("set-cookie") ?? "").split(";")[0];
  if (!token || !cookie) {
    fail("CSRF token material", "token or cookie missing");
  } else {
    await expectStatus(
      "/api/ai/chat",
      503,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": token, cookie },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] })
      },
      "disabled AI chat fails closed"
    );
  }
}

await expectStatus("/api/admin/diagnose-gemini", 404, undefined, "Gemini diagnostics hidden from public");
await expectStatus("/api/admin/readiness", 404, undefined, "system readiness hidden from public");
await expectStatus(
  "/api/payments/razorpay/webhook",
  400,
  { method: "POST", headers: { "Content-Type": "application/json", "x-razorpay-signature": "invalid" }, body: "{}" },
  "Razorpay webhook bypasses CSRF but rejects invalid signature"
);

for (const result of passes) console.log(`PASSED: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
for (const result of failures) console.log(`FAILED: ${result.name} - ${result.detail}`);
console.log(`\nHTTP smoke summary: ${JSON.stringify({ PASSED: passes.length, FAILED: failures.length })}`);
if (failures.length) process.exit(1);

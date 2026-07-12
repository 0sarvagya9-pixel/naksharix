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
  ["/shop", "Shop Coming Soon"],
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
  for (const route of ["/api", "/admin", "/dashboard", "/ai-astrologer", "/talk-to-kundli", "/chatbot", "/shop"]) {
    if (!robots.includes(`Disallow: ${route}`)) fail("robots coverage", `missing ${route}`);
  }
  if (!robots.includes("Allow: /consultation")) fail("robots coverage", "consultation is not allowed");
}

const sitemapResponse = await expectStatus("/sitemap.xml", 200, undefined, "sitemap.xml");
if (sitemapResponse) {
  const sitemap = await sitemapResponse.text();
  if (!sitemap.includes("/consultation")) fail("sitemap active routes", "consultation missing");
  for (const parked of ["/ai-astrologer", "/talk-to-kundli", "/chatbot", "/shop"]) {
    if (sitemap.includes(parked)) fail("sitemap parked routes", `found ${parked}`);
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
      "parked AI chat fails closed"
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

import assert from "node:assert/strict";

const base = new URL(process.env.FUNCTIONAL_SMOKE_BASE_URL || "http://127.0.0.1:3000");
const db = new URL(process.env.DATABASE_URL || "postgresql://unknown:unknown@nowhere/unknown");
if (process.env.CI !== "true" || base.protocol !== "http:" ||
    !["localhost", "127.0.0.1"].includes(base.hostname) ||
    !["localhost", "127.0.0.1"].includes(db.hostname) ||
    db.pathname !== "/naksharix") {
  console.error("FUNCTIONAL_SMOKE_REFUSED: requires CI disposable localhost database and localhost app.");
  process.exit(1);
}

let passed = 0;
let failed = 0;
const errors = [];
async function request(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    return await fetch(new URL(path, base), { redirect: "manual", signal: controller.signal, ...init });
  } finally {
    clearTimeout(timer);
  }
}
async function verify(name, fn) {
  try {
    await fn();
    passed++;
    console.log("FUNCTIONAL_PASS " + name);
  } catch (error) {
    failed++;
    const detail = error instanceof Error ? error.message : String(error);
    errors.push({ name, detail });
    console.error("FUNCTIONAL_FAIL " + name + ": " + detail);
  }
}
const csrfRes = await request("/api/csrf");
assert.equal(csrfRes.status, 200, "CSRF endpoint must work before functional suite");
const csrfBody = await csrfRes.json();
const csrf = csrfBody.data?.csrfToken;
const cookie = (csrfRes.headers.get("set-cookie") || "").split(";")[0];
assert.ok(csrf && cookie && cookie.includes("naksharix_csrf="), "CSRF cookie + token required");
function post(path, json, opts = {}) {
  return request(path, { method: "POST", headers: {
    "content-type": "application/json", "x-csrf-token": csrf, cookie, ...opts.headers
  }, body: JSON.stringify(json) });
}
async function expectData(response, name) {
  const body = await response.json();
  assert.equal(response.status, 200, name + ": " + JSON.stringify(body).slice(0, 500));
  assert.ok(body && typeof body.data === "object", name + ": missing data");
  return body.data;
}

await verify("public operational endpoints", async () => {
  for (const pathname of ["/api/health", "/api/release", "/api/ops/readiness", "/api/ai/status"]) {
    const response = await request(pathname);
    assert.equal(response.status, 200, pathname);
    const body = await response.json();
    assert.ok(body.data && typeof body.data === "object", pathname);
  }
});
await verify("mandatory OTP verification page", async () => {
  const res = await request("/verify-email");
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /verify|verification|OTP/i);
});
await verify("Panchang calculates a genuine complete location result", async () => {
  const res = await request("/api/panchang?date=2026-10-13&latitude=28.6139&longitude=77.209&timezone=%2B05%3A30&place=Delhi");
  const d = await expectData(res, "panchang");
  assert.equal(d.panchang.date, "2026-10-13");
  for (const k of ["tithi", "nakshatra", "yoga", "karana", "sunrise", "sunset"]) assert.ok(d.panchang[k], "missing " + k);
  assert.deepEqual(d.panchang.metadata?.missingFields || [], []);
});
await verify("Panchang rejects invalid location", async () => {
  const res = await request("/api/panchang?date=2026-10-13&latitude=999&longitude=77&timezone=%2B05%3A30");
  assert.equal(res.status, 422);
});
await verify("Numerology returns real report", async () => {
  const d = await expectData(await post("/api/numerology", { name: "Sample Person", dateOfBirth: "1990-01-15", locale: "en" }), "numerology");
  assert.ok(d.report && Object.keys(d.report).length > 2, "numerology result missing");
});
await verify("Numerology rejects short name", async () => {
  assert.equal((await post("/api/numerology", { name: "A", dateOfBirth: "1990-01-15" })).status, 422);
});
await verify("core astrology calculator produces actual data", async () => {
  const d = await expectData(await post("/api/calculators/core", { name: "Sample Person", birthDate: "1990-01-15", birthTime: "10:30", latitude: 28.6139, longitude: 77.209 }), "core calculator");
  assert.ok(d.calculators?.numerology, "core numerology missing");
});
const signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
await verify("all 12 horoscope APIs yield independent sign-specific responses", async () => {
  const outputs = [];
  for (const zodiac of signs) {
    const d = await expectData(await post("/api/horoscope", { zodiac, period: "daily", category: "general", locale: "en" }), zodiac);
    assert.equal(d.horoscope?.zodiac, zodiac);
    assert.ok(typeof d.horoscope?.content === "string" && d.horoscope.content.length > 25);
    outputs.push(d.horoscope.content);
  }
  assert.ok(new Set(outputs).size > 1, "all horoscopes are identical");
});
await verify("horoscope invalid schema fails closed", async () => {
  assert.equal((await post("/api/horoscope", { zodiac: "x", period: "daily" })).status, 422);
});
await verify("tarot draw creates a real spread", async () => {
  const d = await expectData(await post("/api/tarot", { spread: "three-card", question: "How can I reflect on goals?", locale: "en" }), "tarot");
  assert.ok(Array.isArray(d.reading?.cards) && d.reading.cards.length === 3, "three-card spread incorrect");
  assert.ok(d.reading?.interpretation, "missing tarot interpretation");
});
await verify("anonymous user cannot access administrative surfaces", async () => {
  for (const pathname of ["/api/admin/readiness", "/api/admin/report-requests", "/api/admin/bookings", "/api/admin/revenue"]) {
    const res = await request(pathname);
    assert.ok([401, 403, 404, 405].includes(res.status), pathname + " allowed " + res.status);
  }
});
await verify("CSRF blocks unauthorized state changes", async () => {
  for (const pathname of ["/api/horoscope", "/api/tarot", "/api/auth/signup", "/api/consultation-bookings"]) {
    const res = await request(pathname, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({})
    });
    assert.equal(res.status, 403, pathname);
  }
});
await verify("public numerology is an intentional CSRF-exempt calculation", async () => {
  const r = await request("/api/numerology", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Example Person", dateOfBirth: "1990-01-15" })
  });
  await expectData(r, "public numerology without cookie");
});
await verify("anonymous booking is rejected before data mutation", async () => {
  const res = await post("/api/consultation-bookings", {
    astrologerProfileId: "nonexistent", slotId: "nonexistent", bookingDate: "2027-01-01",
    customerName: "Sample Person", customerEmail: "sample@example.test", question: "Please advise"
  });
  assert.equal(res.status, 401, "anonymous booking access");
});
console.log("NAKSHARIX_FUNCTIONAL_HTTP=" + passed + "/" + (passed + failed) + "_PASS;FAILED=" + failed);
for (const item of errors) console.error(JSON.stringify(item));
if (failed) process.exit(1);

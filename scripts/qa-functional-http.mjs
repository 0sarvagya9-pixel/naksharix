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

await verify("Panchang rejects impossible calendar dates and out-of-range civil offsets",async()=>{
  const parameters={date:"2024-02-29",latitude:"28.6139",longitude:"77.209",timezone:"+05:30"};
  const get=overrides=>request("/api/panchang?"+new URLSearchParams({...parameters,...overrides}));
  assert.equal((await get({})).status,200);
  for(const invalid of [{date:"2026-02-30"},{date:"2025-02-29"},{timezone:"+29:00"},{timezone:"+05:60"},{timezone:"-14:01"}]){
    assert.equal((await get(invalid)).status,422,JSON.stringify(invalid));
  }
});
await verify("public operational endpoints", async () => {
  for (const pathname of ["/api/health", "/api/release", "/api/ops/readiness", "/api/ai/status"]) {
    const response = await request(pathname);
    assert.equal(response.status, 200, pathname);
    const body = await response.json();
    assert.ok(body.data && typeof body.data === "object", pathname);
  }
});
await verify("offline global place directory returns real IANA coordinates",async()=>{
 for(const [q,zone] of [["Delhi","Asia/Kolkata"],["London","Europe/London"],["Tokyo","Asia/Tokyo"],["Sydney","Australia/Sydney"],["New York","America/New_York"],["São Paulo","America/Sao_Paulo"]]){
  const d=await expectData(await request("/api/location/search?q="+encodeURIComponent(q)),q);assert.ok(d.suggestions.some(p=>p.timezone===zone&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)),q+" missing actual location");assert.equal(d.manualCoordinatesSupported,true);assert.match(d.attribution,/GeoNames/);
 }
 const d=await expectData(await request("/api/location/search?q=qqzzxx-no-city-000"),"unknown");assert.deepEqual(d.suggestions,[]);assert.equal(d.manualCoordinatesSupported,true);
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
  const d = await expectData(await post("/api/calculators/core", { name: "Sample Person", birthDate: "1990-01-15", birthTime: "10:30", birthPlace:"Delhi", timezone:"Asia/Kolkata", latitude: 28.6139, longitude: 77.209 }), "core calculator");
  assert.ok(d.calculators?.numerology, "core numerology missing");
  const c=d.calculators;
  assert.ok(c.calculationMeta?.provider==="own_engine" && c.moonSign && c.sunSign && c.ascendant && c.nakshatra);
  assert.equal(c.loveScore,null);assert.equal(c.friendshipScore,null);
  const renamed=await expectData(await post("/api/calculators/core",{name:"Different Sample",birthDate:"1990-01-15",birthTime:"10:30",birthPlace:"Delhi",timezone:"Asia/Kolkata",latitude:28.6139,longitude:77.209}),"name invariance");
  for(const field of ["moonSign","sunSign","ascendant","nakshatra","ayanamsa"])assert.equal(renamed.calculators[field],c[field],field+" must not depend on name");
  const invalid=await post("/api/calculators/core",{name:"Sample Person",birthDate:"1990-01-15",birthTime:"10:30",birthPlace:"Delhi",timezone:"Invalid/Zone",latitude:28.6139,longitude:77.209});assert.equal(invalid.status,422);
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

const birth = {
  name: "Sample Person", gender: "male", dateOfBirth: "1990-01-15", timeOfBirth: "10:30",
  birthPlace: "Delhi", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata", language: "en"
};
await verify("all six chart-based focused calculator kinds return real computed chart values", async () => {
  for (const kind of ["dasha", "nakshatra", "moon-sign", "lagna", "manglik", "yoga"]) {
    const d = await expectData(await post("/api/focused-calculators/kundli", { ...birth, kind }), kind);
    assert.equal(d.kind, kind);
    assert.ok(d.avakhada?.nakshatra, "missing Nakshatra for " + kind);
    assert.ok(d.avakhada?.moonSign, "missing Moon sign for " + kind);
    assert.ok(d.calculationMeta, "missing calculation evidence for " + kind);
  }
});
await verify("Kundli generator creates structured birth report as anonymous user", async () => {
  const d = await expectData(await post("/api/kundli/generate", birth), "kundli generate");
  assert.ok(d.report && typeof d.report === "object", "Kundli chart absent");
  assert.equal(d.meta?.saved, false, "anonymous Kundli must not save user record");
});
await verify("matchmaking engine returns real compatibility calculation", async () => {
  const bride = {
    name: "Sample Bride", gender: "female", birthDate: "1992-02-02", birthTime: "13:15",
    birthPlace: "Delhi", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata"
  };
  const groom = {
    name: "Sample Groom", gender: "male", birthDate: "1990-01-15", birthTime: "10:30",
    birthPlace: "Delhi", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata"
  };
  const d = await expectData(await post("/api/matchmaking", { bride, groom, locale: "en" }), "matchmaking");
  assert.ok(d.match && Number.isFinite(d.match.compatibilityScore), "computed compatibility missing");
  assert.equal(d.match.matchingMode,"naksharix_ashtakoot_27_nakshatra_v3");
  assert.equal(d.match.maxGuna,36);assert.equal(d.match.factors.length,8);
  const renamed=await expectData(await post("/api/matchmaking",{bride:{...bride,name:"Other Sample Bride"},groom:{...groom,name:"Other Sample Groom"},locale:"en"}),"name-invariant matching");assert.equal(renamed.match.guna,d.match.guna);assert.deepEqual(renamed.match.factors,d.match.factors);
});
await verify("A04 all three existing matching paths return the same eight traditional factors and reject invalid aliases",async()=>{
  const bride={name:"Synthetic Bride",gender:"female",birthDate:"1992-02-02",birthTime:"13:15",birthPlace:"Delhi",latitude:28.6139,longitude:77.209,timezone:"Asia/Kolkata"};
  const groom={name:"Synthetic Groom",gender:"male",birthDate:"1990-01-15",birthTime:"10:30",birthPlace:"Delhi",latitude:28.6139,longitude:77.209,timezone:"Asia/Kolkata"};
  const canonical=({birthDate,birthTime,...rest})=>({...rest,dateOfBirth:birthDate,timeOfBirth:birthTime});
  const legacy=(await expectData(await post("/api/matchmaking",{bride,groom,locale:"en"}),"legacy")).match;
  const current=(await expectData(await post("/api/kundli-match/generate",{bride:canonical(bride),groom:canonical(groom),language:"en"}),"current")).report;
  const alias=(await expectData(await post("/api/kundli-match",{bride,groom,locale:"en"}),"alias")).report;
  for(const report of [current,alias]){
    const factors=report.gunaMilan.ashtakoot;
    assert.equal(report.matchingMode,legacy.matchingMode);
    assert.equal(factors.length,8);
    assert.deepEqual(factors.map(f=>f.maxScore).sort((a,b)=>a-b),[1,2,3,4,5,6,7,8]);
    assert.ok(factors.every(f=>f.available===true&&Number.isFinite(f.score)&&f.score>=0&&f.score<=f.maxScore));
    assert.ok(Math.abs(factors.reduce((s,f)=>s+f.score,0)-report.gunaMilan.totalScore)<0.051);
    assert.equal(report.gunaMilan.maxScore,36);
    assert.equal(report.gunaMilan.totalScore,legacy.guna);
    assert.deepEqual(factors.map(f=>({name:f.name,score:f.score,max:f.maxScore,meaning:f.meaning})),legacy.factors);
  }
  const alternate=await expectData(await post("/api/matchmaking",{bride:canonical(bride),groom:canonical(groom),language:"en"}),"legacy canonical inputs");
  assert.deepEqual(alternate.match.factors,legacy.factors);
  for(const route of ["/api/matchmaking","/api/kundli-match/generate","/api/kundli-match"]){
    for(const patch of [{birthDate:"1992-02-31"},{birthTime:"25:00"},{timezone:"Unknown/Zone"},{latitude:null},{latitude:""},{dateOfBirth:"1993-02-02"},{timeOfBirth:"12:00"}]){
      const response=await post(route,{bride:{...bride,...patch},groom,locale:"en"});
      assert.equal(response.status,422,route+" "+Object.keys(patch).join(","));
      assert.ok((await response.json()).error);
    }
  }
});
await verify("weekly, monthly and yearly horoscope APIs produce nonempty sign results", async () => {
  for (const period of ["weekly", "monthly", "yearly"]) {
    const d = await expectData(await post("/api/horoscope", { zodiac: "aries", period, category: "general" }), period);
    assert.ok(d.horoscope?.content && d.horoscope.content.length > 25, period + " horoscope empty");
  }
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
await verify("A22 2027 web and mobile APIs match independent monthly references across all signs and locales",async()=>{
 const {readFileSync}=await import("node:fs");
 const {rows}=JSON.parse(readFileSync(new URL("../fixtures/astrology/independent-2027-annual-swiss-reference.json",import.meta.url),"utf8"));
 const signs=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
 let guides=0;
 for(const locale of ["en","hi","hinglish"])for(const [i,sign] of signs.entries()){
  const zodiac=sign.toLowerCase();
  const web=(await expectData(await post("/api/horoscope",{zodiac,period:"yearly",category:"general",locale,year:2027}),"annual web")).horoscope;
  const mobile=await expectData(await request("/api/mobile/horoscope?"+new URLSearchParams({zodiac,period:"yearly",locale,year:"2027"})),"annual mobile");
  const g=web.annualGuide;assert.deepEqual(g,mobile.annualGuide);assert.equal(g.year,2027);assert.equal(g.referenceSign,sign);assert.equal(g.personalPrediction,false);assert.equal(g.rows.length,12);
  assert.equal(web.luckyNumber,null);
  for(const [j,r] of g.rows.entries()){
   assert.equal(r.date,rows[j].date);
   assert.equal(r.jupiter,signs[Math.floor(rows[j].Jupiter/30)]);assert.equal(r.saturn,signs[Math.floor(rows[j].Saturn/30)]);
   assert.equal(r.growthHouse,(Math.floor(rows[j].Jupiter/30)-i+12)%12+1);
   assert.equal(r.structureHouse,(Math.floor(rows[j].Saturn/30)-i+12)%12+1);
  }
  guides++;
 }
 assert.equal(guides,36);
 assert.equal((await post("/api/horoscope",{zodiac:"aries",period:"daily",category:"general",year:2027})).status,422);
 assert.equal((await request("/api/mobile/horoscope?zodiac=aries&period=daily&year=2027")).status,422);
 console.log("A22_ANNUAL_HTTP_PASS "+JSON.stringify({webGuides:guides,mobileGuides:guides,scope:"local API runtime; no physical device or prediction certification"}));
});
console.log("NAKSHARIX_FUNCTIONAL_HTTP=" + passed + "/" + (passed + failed) + "_PASS;FAILED=" + failed);
for (const item of errors) console.error(JSON.stringify(item));
if (failed) process.exit(1);

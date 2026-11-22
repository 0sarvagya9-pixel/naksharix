import assert from "node:assert/strict";
import { verifyLiveSeo } from "./check-seo-indexability.mjs";

const origin = "https://www.naksharix.com";
const results = [];
async function get(path) {
  const response = await fetch(origin + path, {
    cache: "no-store",
    headers: { "User-Agent": "Naksharix-AdSense-Readiness/1.0", "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(30000)
  });
  const body = await response.text();
  assert.equal(response.status, 200, "HTTP 200 required for " + path);
  results.push({ path, status: response.status, bytes: body.length });
  return body;
}

const seo = await verifyLiveSeo(fetch, origin);
assert.ok(seo.passed, "LIVE_SEO_INTEGRITY_FAIL=" + JSON.stringify(seo.results.filter(x => !x.passed)));
const ads = (await get("/ads.txt")).trim();
assert.equal(ads, "google.com, pub-7848529669366564, DIRECT, f08c47fec0942fa0", "AdSense seller record incorrect");
const sitemap = await get("/sitemap.xml");
assert.ok(!/<loc>https:\/\/www\.naksharix\.com\/pujas(?:\/|<)/.test(sitemap), "Paused Puja unexpectedly included in sitemap");
const homepage = await get("/");
assert.equal((homepage.match(/<h1\b/gi) || []).length, 1, "Homepage should render exactly one main H1");
assert.ok(homepage.includes("Discover your"), "Primary original hero missing");
const pujas = await get("/pujas");
assert.ok(/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(pujas), "Puja coming-soon page must be noindex");
assert.ok(pujas.includes("Coming Soon") && pujas.includes("नई पूजा बुकिंग"), "Puja pause declaration missing");
for (const [path, term] of [
  ["/free-calculators/dasha-calculator", "Understand the Vimshottari Dasha timeline"],
  ["/free-calculators/name-number-calculator", "How Naksharix calculates a Name Number"],
  ["/free-calculators/guna-milan-calculator", "What does a Guna Milan score out of 36 mean?"],
  ["/free-calculators/nakshatra-calculator", "How a birth Nakshatra is determined"]
]) {
  const body = await get(path);
  assert.ok(body.includes(term), "Missing original educational explanation on " + path);
  assert.ok((body.match(/<h[23]\b/gi) || []).length >= 3, "Insufficient instructional structure on " + path);
}
for (const path of ["/about", "/contact", "/faq", "/privacy-policy", "/terms-and-conditions", "/refund-policy", "/delivery-policy", "/advertising", "/shop", "/reports", "/learn"]) {
  const body = await get(path);
  assert.ok(/<h1\b/i.test(body), "Page has no main heading: " + path);
}
const apex = await fetch("https://naksharix.com/", {
  redirect: "follow", headers: { "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(30000)
});
assert.equal(apex.status, 200, "Apex domain not accessible");
assert.equal(new URL(apex.url).hostname, "www.naksharix.com", "Apex should redirect to canonical www");
console.log("ADSENSE_LIVE_POSTDEPLOY=PASS;SEO_ROUTES=" + seo.results.length + ";DIRECT_PAGES=" + results.length);
console.log("SITE_OWNERSHIP=PASS;PAUSED_PUJA=NOINDEX;HOMEPAGE_H1=ONE;NO_GOOGLE_APPROVAL_CLAIM");
console.log("PAGE_RESULTS=" + JSON.stringify(results));

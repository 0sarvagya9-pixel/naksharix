/**
 * Public search-discovery notification. Zero credentials, zero visitor/PII data.
 * Only verified, live, indexable public NAKSHARIX guide/shop URLs are submitted.
 * A 200/202 confirms receipt, not crawling, ranking, indexing or organic traffic.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

export const ORIGIN = "https://www.naksharix.com";
export const INDEXNOW_KEY = "ef1d79191967d8cf6d2404e50e8017c1";
export const INDEXNOW_KEY_URL = `${ORIGIN}/${INDEXNOW_KEY}.txt`;
export const DISCOVERY_ROUTES = Object.freeze([
  "/",
  "/about",
  "/hi",
  "/hi/about",
  "/faq",
  "/kumbh-mela-2027",
  "/hi/kumbh-mela-2027",
  "/festival-calendar",
  "/hi/festival-calendar",
  "/grahan-2027",
  "/yearly-horoscope",
  "/yearly-horoscope-2027",
  "/hi/yearly-horoscope-2027",
  "/hi/grahan-2027",
  "/puja-calendar",
  "/panchang",
  "/blog/daily-horoscope-personalization",
  "/blog/kundli-matching-score",
  "/blog/tarot-reflection",
  "/blog/lagna-vs-rashi",
  "/blog/panchang-five-elements",
  "/blog/lo-shu-grid-beginners",
  "/blog/vimshottari-dasha-timeline",
  "/blog/how-to-book-puja-online",
  "/blog/rudraksha-product-buying-checklist",
  "/blog/personalized-astrology-report-delivery-guide",
  "/blog",
  "/learn",
  "/shop",
  "/shop/5-mukhi-rudraksha",
  "/shop/dhan-yog-bracelet",
  "/shop/shri-yantra",
  "/shop/rudraksha-mala",
  "/free-kundli",
  "/hi/free-kundli",
  "/kundli-matching",
  "/hi/kundli-milan",
  "/tarot",
  "/numerology",
  "/weekly-love-horoscope",
  "/numerology-monthly-horoscope",
  "/reports",
  "/reports/premium-kundli",
  "/reports/couple-kundli",
  "/reports/love-report",
  "/reports/career-report",
  "/reports/numerology-lo-shu-report"
]);

export function assertDiscoveryConfiguration() {
  assert.match(INDEXNOW_KEY, /^[a-f0-9]{32}$/, "Invalid public IndexNow proof key");
  assert.equal(new Set(DISCOVERY_ROUTES).size, DISCOVERY_ROUTES.length, "Duplicate discovery routes");
  assert.ok(DISCOVERY_ROUTES.every(route => route === "/" || /^\/(?:hi\/)?(?:kumbh-mela-2027|festival-calendar|grahan-2027|yearly-horoscope-2027)$/.test(route) || /^\/(?:yearly-horoscope|puja-calendar|panchang|about|faq|hi(?:\/about)?|blog(?:\/[a-z-]+)?|learn|shop(?:\/[a-z0-9-]+)?|reports(?:\/(?:premium-kundli|couple-kundli|love-report|career-report|numerology-lo-shu-report))?|free-kundli|hi\/(?:free-kundli|kundli-milan)|kundli-matching|tarot|numerology|weekly-love-horoscope|numerology-monthly-horoscope)$/.test(route)),
    "Unexpected or sensitive submission path");
  return DISCOVERY_ROUTES.map(route => ORIGIN + route);
}

async function readPublic(url, asText = true) {
  const response = await fetch(url, {
    redirect: "error",
    headers: { "accept": asText ? "text/plain,application/xml,text/html,application/json" : "application/json", "cache-control": "no-cache" },
    signal: AbortSignal.timeout(25000)
  });
  if (!response.ok) throw new Error("Public SEO endpoint unavailable: " + new URL(url).pathname + " HTTP " + response.status);
  return asText ? await response.text() : await response.json();
}

async function verifyExactProduction() {
  const expected = process.env.GITHUB_SHA;
  if (!/^[0-9a-f]{40}$/.test(expected ?? "")) throw new Error("RELEASE_SHA_NOT_PINNED");
  const attempts = 36;
  for (let n = 1; n <= attempts; n++) {
    try {
      const release = await readPublic(ORIGIN + "/api/release", false);
      if (release?.data?.commitSha === expected && release?.data?.branch === "complete-production-polish" &&
          release?.data?.environment === "production") {
        console.log("INDEXNOW_EXACT_RELEASE=PASS");
        return;
      }
    } catch (error) {
      console.log("INDEXNOW_RELEASE_PROBE=" + String(error?.message ?? error).slice(0,150));
    }
    if (n < attempts) await new Promise(resolve => setTimeout(resolve, 20000));
  }
  throw new Error("RELEASE_SHA_NOT_LIVE_NO_SUBMISSION");
}

export function changedDiscoveryRoutes(all, changedFiles) {
  const selected = new Set();
  const add = route => { const url=ORIGIN+route; if(all.includes(url)) selected.add(url); };
  for (const file of changedFiles) {
    const direct=file.match(/^app\/(.*?)\/?page\.tsx$/);
    if(direct && !direct[1].includes("["))add(direct[1]?"/"+direct[1]:"/");
    if(file==="components/schema-markup.tsx" || file==="lib/seo-brand.ts" || file==="components/seo/brand-answers.tsx" || file==="components/legal-policy-page.tsx") ["/","/hi","/about","/hi/about","/faq"].forEach(add);
    if(file==="components/home/approved-gallery-home.tsx")add("/");
    if(file==="components/seo/seasonal-guides.tsx" || file==="lib/seo-seasonal.ts" || file==="lib/seo-seasonal-copy.ts") ["/kumbh-mela-2027","/hi/kumbh-mela-2027","/festival-calendar","/hi/festival-calendar","/grahan-2027","/hi/grahan-2027"].forEach(add);
    if(file==="lib/horoscope/annual.ts" || file==="lib/horoscope/annual-rules.ts" || file==="components/horoscope/annual-guide-view.tsx") ["/yearly-horoscope","/yearly-horoscope-2027","/hi/yearly-horoscope-2027"].forEach(add);
    if(file==="lib/puja/observances.ts") ["/festival-calendar","/hi/festival-calendar","/puja-calendar"].forEach(add);
    if(file==="lib/blog-content.ts" || file.startsWith("app/blog/")) all.filter(url=>url.startsWith(ORIGIN+"/blog")).forEach(url=>selected.add(url));
    if(file==="lib/shop/organic-discovery.ts" || file==="components/shop/product-share-actions.tsx" || file==="app/shop/[slug]/page.tsx") all.filter(url=>url.startsWith(ORIGIN+"/shop")||url.startsWith(ORIGIN+"/reports")).forEach(url=>selected.add(url));
    if(file==="app/reports/[slug]/page.tsx" || file==="components/optional-report-next-step.tsx" || file==="components/relevant-report-discovery.tsx") all.filter(url=>url.startsWith(ORIGIN+"/reports")||/\/(free-kundli|kundli-matching|kundli-milan|tarot|numerology|weekly-love-horoscope|numerology-monthly-horoscope)$/.test(url)).forEach(url=>selected.add(url));
  }
  return [...selected];
}

function getChangedFiles() {
  const event=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8"));
  if (event.deleted || event.forced || !/^[0-9a-f]{40}$/.test(event.before || "") || !/^[0-9a-f]{40}$/.test(event.after || "") || event.before === "0".repeat(40) || event.after !== process.env.GITHUB_SHA) throw new Error("INDEXNOW_CHANGE_SCOPE_UNKNOWN");
  return execFileSync("git", ["diff","--name-only","--diff-filter=ACMR",event.before,event.after], {encoding:"utf8"}).trim().split("\n");
}

async function main() {
  const all = assertDiscoveryConfiguration();
  let urlList = all;
  if (process.argv.includes("--validate-only")) {
    assert.deepEqual(changedDiscoveryRoutes(all,["app/page.tsx"]),[ORIGIN+"/"]);
    assert.deepEqual(changedDiscoveryRoutes(all,["app/hi/about/page.tsx"]),[ORIGIN+"/hi/about"]);
    assert.deepEqual(changedDiscoveryRoutes(all,["app/admin/page.tsx","app/orders/page.tsx","README.md"]),[]);
    assert.equal(changedDiscoveryRoutes(all,["lib/seo-brand.ts"]).length,5);
    assert.deepEqual(changedDiscoveryRoutes(all,["app/hi/kumbh-mela-2027/page.tsx"]),[ORIGIN+"/hi/kumbh-mela-2027"]);
    assert.equal(changedDiscoveryRoutes(all,["lib/seo-seasonal.ts"]).length,6);
    assert.equal(changedDiscoveryRoutes(all,["lib/puja/observances.ts"]).length,3);
    console.log("INDEXNOW_STATIC_CHECK=PASS;ROUTES=" + urlList.length + ";CHANGE_SCOPE=7/7_PASS");
    return;
  }
  if (process.env.GITHUB_REF !== "refs/heads/complete-production-polish")
    throw new Error("NOT_AUTHORIZED_PRODUCTION_BRANCH");
  urlList = process.env.GITHUB_EVENT_NAME === "workflow_dispatch" ? all : changedDiscoveryRoutes(all, getChangedFiles());
  if (!urlList.length) { console.log("INDEXNOW_SKIPPED_NO_CHANGED_PUBLIC_ROUTES"); return; }
  await verifyExactProduction();

  const keyFile = (await readPublic(INDEXNOW_KEY_URL)).trim();
  assert.equal(keyFile, INDEXNOW_KEY, "INDEXNOW_PUBLIC_KEY_VERIFICATION_FAILED");
  console.log("INDEXNOW_HOST_PROOF=PASS");

  const sitemap = await readPublic(ORIGIN + "/sitemap.xml");
  for (const url of urlList) {
    if (!sitemap.includes("<loc>" + url + "</loc>"))
      throw new Error("PUBLIC_SITEMAP_MISSING_URL=" + new URL(url).pathname);
  }
  console.log("INDEXNOW_SITEMAP_CHECK=PASS;URLS=" + urlList.length);

  for (const url of urlList) {
    const html = await readPublic(url);
    // Next.js metadata may be streamed after </head>. Check real markup, not
    // serialized script payloads or comments that can contain unrelated text.
    const head = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
    if (/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(head) ||
        /<meta[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(head))
      throw new Error("NON_INDEXABLE_URL=" + new URL(url).pathname);
  }
  console.log("INDEXNOW_LIVE_PAGES=PASS");

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    redirect: "error",
    headers: { "content-type": "application/json; charset=utf-8", "accept": "text/plain" },
    body: JSON.stringify({ host: "www.naksharix.com", key: INDEXNOW_KEY, keyLocation: INDEXNOW_KEY_URL, urlList }),
    signal: AbortSignal.timeout(30000)
  });
  if (![200, 202].includes(response.status)) {
    throw new Error("INDEXNOW_NOT_ACCEPTED_HTTP_" + response.status);
  }
  console.log("INDEXNOW_SUBMISSION_ACCEPTED=YES;HTTP=" + response.status +
    ";URL_COUNT=" + urlList.length + ";GOOGLE_INDEXED=UNKNOWN;SEARCH_TRAFFIC_GAIN=NOT_MEASURED");
}

main().catch(error => {
  console.error("INDEXNOW_FAIL_CLOSED=" + String(error?.message ?? error));
  process.exitCode = 1;
});

/**
 * Public search-discovery notification. Zero credentials, zero visitor/PII data.
 * Only verified, live, indexable NAKSHARIX guide URLs are submitted.
 * A 200/202 confirms receipt, not crawling, ranking, indexing or organic traffic.
 */
import assert from "node:assert/strict";

export const ORIGIN = "https://www.naksharix.com";
export const INDEXNOW_KEY = "ef1d79191967d8cf6d2404e50e8017c1";
export const INDEXNOW_KEY_URL = `${ORIGIN}/${INDEXNOW_KEY}.txt`;
export const DISCOVERY_ROUTES = Object.freeze([
  "/blog/daily-horoscope-personalization",
  "/blog/kundli-matching-score",
  "/blog/tarot-reflection",
  "/blog/lagna-vs-rashi",
  "/blog/panchang-five-elements",
  "/blog/lo-shu-grid-beginners",
  "/blog/vimshottari-dasha-timeline",
  "/blog",
  "/learn"
]);

export function assertDiscoveryConfiguration() {
  assert.match(INDEXNOW_KEY, /^[a-f0-9]{32}$/, "Invalid public IndexNow proof key");
  assert.equal(new Set(DISCOVERY_ROUTES).size, DISCOVERY_ROUTES.length, "Duplicate discovery routes");
  assert.ok(DISCOVERY_ROUTES.every(route => /^\/(?:blog(?:\/[a-z-]+)?|learn)$/.test(route)),
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

async function main() {
  const urlList = assertDiscoveryConfiguration();
  if (process.argv.includes("--validate-only")) {
    console.log("INDEXNOW_STATIC_CHECK=PASS;ROUTES=" + urlList.length);
    return;
  }
  if (process.env.GITHUB_REF !== "refs/heads/complete-production-polish")
    throw new Error("NOT_AUTHORIZED_PRODUCTION_BRANCH");
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
    const head = html.split("</head>")[0] ?? "";
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

import assert from "node:assert/strict";

export const CANONICAL_ORIGIN = "https://www.naksharix.com";
export const CORE_ROUTES = [
  "/", "/free-kundli", "/kundli-matching", "/reports",
  "/shop", "/pujas", "/learn", "/hi"
];
const MUST_APPEAR = [
  "https://www.naksharix.com/",
  "https://www.naksharix.com/free-kundli",
  "https://www.naksharix.com/reports",
  "https://www.naksharix.com/shop",
  "https://www.naksharix.com/pujas",
  "https://www.naksharix.com/hi"
];
const PRIVATE_PREFIXES = [
  "/admin", "/dashboard", "/api", "/astrologer", "/auth", "/login",
  "/profile", "/saved-reports", "/my-readings", "/payment", "/report-request"
];

export async function verifyLiveSeo(fetcher = fetch, origin = CANONICAL_ORIGIN) {
  const results = [];
  const collect = (path, issue) => {
    results.push({ path, passed: !issue, ...(issue ? { reason: issue } : {}) });
  };
  const get = async path => {
    const response = await fetcher(origin + path, {
      cache: "no-store",
      redirect: "follow",
      headers: { "User-Agent": "Naksharix-SEO-Health/1.0" },
      signal: AbortSignal.timeout(20000)
    });
    const text = await response.text();
    return { response, text: text.slice(0, 450000) };
  };
  const locateTag = (html, tag, attr, target) =>
    [...html.matchAll(new RegExp("<" + tag + "\\b[^>]*>", "gi"))]
      .map(x => x[0])
      .find(x => new RegExp("\\b" + attr + "\\s*=\\s*['\\\"]" + target + "['\\\"]", "i").test(x));
  const attrValue = (tag, attr) => {
    const match = tag?.match(new RegExp("\\b" + attr + "\\s*=\\s*['\\\"]([^'\\\"]+)['\\\"]", "i"));
    return match?.[1] ?? null;
  };
  try {
    const { response, text } = await get("/robots.txt");
    const canonical = origin + "/sitemap.xml";
    collect("/robots.txt", !response.ok ? "HTTP non-success" :
      !text.includes("Sitemap: " + canonical) ? "sitemap reference incorrect" :
      !text.includes("Disallow: /admin") || !text.includes("Disallow: /api") ?
      "private routes not protected" : null);
  } catch {
    collect("/robots.txt", "unable to retrieve");
  }
  try {
    const { response, text } = await get("/sitemap.xml");
    const urls = [...text.matchAll(/<loc>\\s*(https:\/\/[^<\\s]+)\\s*<\/loc>/g)].map(x => x[1]);
    const unique = new Set(urls);
    const bad = urls.filter(url => {
      try {
        const target = new URL(url);
        return target.origin !== origin || PRIVATE_PREFIXES.some(p =>
          target.pathname === p || target.pathname.startsWith(p + "/"));
      } catch { return true; }
    });
    collect("/sitemap.xml", !response.ok ? "HTTP non-success" :
      urls.length < 40 ? "unexpectedly few public routes" :
      unique.size !== urls.length ? "duplicate loc URLs" :
      bad.length ? "noncanonical or private loc found" :
      MUST_APPEAR.some(p => !unique.has(p.endsWith("/") ? p.slice(0, -1) : p) &&
        !unique.has(p)) ? "required public loc missing" : null);
  } catch {
    collect("/sitemap.xml", "unable to retrieve");
  }

  for (const path of CORE_ROUTES) {
    try {
      const { response, text } = await get(path);
      const head = text.split(/<\/head>/i)[0];
      const canonical = attrValue(locateTag(head, "link", "rel", "canonical"), "href");
      const robots = attrValue(locateTag(head, "meta", "name", "robots"), "content") ?? "";
      const headerRobots = response.headers?.get?.("x-robots-tag") ?? "";
      const expected = origin + path;
      const issue = !response.ok ? "HTTP non-success" :
        /noindex/i.test(robots + " " + headerRobots) ? "unexpected noindex" :
        !/<title>[^<]+<\/title>/i.test(head) ? "missing HTML title" :
        !locateTag(head, "meta", "name", "description") ? "missing meta description" :
        canonical !== expected && !(path === "/" && canonical === origin) ? "incorrect or absent self-canonical" : null;
      collect(path, issue);
    } catch {
      collect(path, "unable to retrieve");
    }
  }
  return { passed: results.every(x => x.passed), results };
}

if (process.argv[1]?.endsWith("check-seo-indexability.mjs")) {
  const result = await verifyLiveSeo();
  console.log("NAKSHARIX_SEO_HEALTH=" + (result.passed ? "PASS" : "FAIL"));
  console.log("CHECK_COUNT=" + result.results.length);
  if (!result.passed) {
    console.error("FAILED=" + result.results.filter(x => !x.passed)
      .map(x => x.path + ":" + x.reason).join(","));
    process.exitCode = 1;
  }
}

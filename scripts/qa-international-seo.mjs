import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (name) => readFileSync(name, "utf8");
const registry = read("lib/seo-localization.ts");
const seo = read("lib/seo.ts");
const sitemap = read("app/sitemap.ts");
const layout = read("app/layout.tsx");
const middleware = read("middleware.ts");
const provider = read("components/language-provider.tsx");
const switcher = read("components/language-switcher.tsx");
const pairs = [...registry.matchAll(/\{ en: "([^"]+)", hi: "([^"]+)" \}/g)];
assert.equal(pairs.length, 3, "Only three independently available bilingual page pairs");
const paths = pairs.flatMap(([, en, hi]) => [en, hi]);
assert.equal(new Set(paths).size, paths.length, "Duplicate language-alternate URL");
for (const route of paths) {
  const name = route === "/" ? "app/page.tsx" : "app" + route + "/page.tsx";
  assert.ok(read(name).includes('from "@/lib/seo"'), "Missing translated metadata at " + route);
}
assert.ok(!registry.includes('{ en: "/daily-horoscope", hi: "/hi/aaj-ka-rashifal" }'), "False daily forecast translation");
assert.ok(seo.includes("publishedSeoAlternates(path, env.NEXT_PUBLIC_APP_URL)"), "Missing reciprocal HTML hreflang");
assert.ok(sitemap.includes("publishedSeoAlternates(route, env.NEXT_PUBLIC_APP_URL)"), "Missing sitemap alternate URLs");
assert.ok(!sitemap.includes("lastModified: new Date()"), "Fabricated last-modified dates");
assert.ok(layout.includes("alternates: {}"), "Accidental inherited homepage canonical");
assert.ok(layout.includes('requestHeaders.get("x-naksharix-route-locale")') &&
  middleware.includes('requestHeaders.set("x-naksharix-route-locale", "hi")') &&
  middleware.includes('"/hi/:path*"'), "Hindi route lang not guaranteed at SSR");
assert.ok(provider.includes("routeLocale ?? normalizeLocale(") &&
  switcher.includes("publishedDestinationForLocale("), "Wrong client locale navigation");
console.log("SEO_LOCALE_GATE=PASS;PUBLISHED_TRANSLATED_PAIRS=3;UNREVIEWED_LOCALES_NOT_INDEXED=YES");

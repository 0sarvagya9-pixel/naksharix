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
  middleware.includes('requestHeaders.set("x-naksharix-route-locale", languageMatch[1])') &&
  middleware.includes('"/hi/:path*"'), "Hindi route lang not guaranteed at SSR");
assert.ok(provider.includes("routeLocale ?? normalizeLocale(") &&
  switcher.includes("publishedDestinationForLocale("), "Wrong client locale navigation");

const growth = read("lib/growth-pages.ts");
const growthView = read("components/seo-growth-page.tsx");
assert.ok(growth.includes('heading: "Which birth details matter?"') && growth.includes('heading: "What does a score out of 36 mean?"'), "Primary high-intent pages need substantive guidance");
assert.ok(growth.includes("you do not need to calculate latitude and longitude yourself"), "Birthplace instructions must not ask visitors for internal coordinates");
assert.ok(!growthView.includes('"AI follow-up questions"'), "No global misleading AI upsell on all SEO pages");
assert.ok(sitemap.includes("const uniqueRoutes = new Map<string, SitemapEntry>()"), "Duplicate sitemap URLs not deduplicated");

const guide = read("lib/kundli-education.ts");
const guidePage = read("app/[language]/learn/kundli-explained/page.tsx");
const guideContent = read("components/seo/kundli-education-page.tsx");
const hreflang = read("lib/seo-localization.ts");
for (const locale of ["en", "hi", "mr", "bn", "es", "fr"]) {
  assert.ok(guide.includes('"' + locale + '": {'), "Missing native education content: " + locale);
  assert.ok(guide.includes('locale === "en" ? "/learn/kundli-explained"'), "Guide URLs do not have stable English fallback");
}
assert.ok(guidePage.includes("generateStaticParams") && guidePage.includes("notFound()"), "Localized routes must reject unknown languages");
assert.ok(guideContent.includes("hrefLang={code}") && guideContent.includes('lang={locale}'), "Native guide needs user-accessible language links and language markup");
assert.ok(hreflang.includes("kundliGuideLanguages.map("), "Guide hreflang must include only completed native-language content");
assert.ok(layout.includes('const htmlLang = documentLanguage;'), "HTML language is still controlled by visitor cookie");
assert.ok(middleware.includes('"/mr/:path*"') && middleware.includes('"/bn/:path*"') && middleware.includes('"/es/:path*"') && middleware.includes('"/fr/:path*"'), "Localized SSR middleware absent");


const homepage=read("app/page.tsx");
const mainKundli=read("app/kundli/page.tsx");
const hindiHome=read("app/hi/page.tsx");
assert.ok(homepage.includes('title: "Free Kundli, Horoscope & Vedic Astrology Tools"'), "Homepage must address its core organic search intent");
assert.ok(mainKundli.includes('title: "Free Kundli Online | Janam Kundali & Vedic Birth Chart"') && !mainKundli.includes("Generate a premium Naksharix Kundli"), "Free Kundli SEO must match free product");
assert.ok(hindiHome.includes("फ्री कुंडली, राशिफल और वैदिक ज्योतिष") && hindiHome.includes('href="/hi/free-kundli"'), "Hindi home must use native core search intent and direct useful route");

console.log("SEO_LOCALE_GATE=PASS;BILINGUAL_CORE_PAIRS=3;EDUCATIONAL_GUIDE_LANGUAGES=6;OTHER_LANGUAGES_NOT_INDEXED=YES");

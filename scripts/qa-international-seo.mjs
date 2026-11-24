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
assert.equal(pairs.length, 4, "Exactly four independently available bilingual page pairs, including brand About");
assert.ok(pairs.some(([,en,hi])=>en==="/about" && hi==="/hi/about"), "Brand About reciprocal pair missing");
const paths = pairs.flatMap(([, en, hi]) => [en, hi]);
assert.equal(new Set(paths).size, paths.length, "Duplicate language-alternate URL");
for (const route of paths) {
  const name = route === "/" ? "app/page.tsx" : "app" + route + "/page.tsx";
  assert.ok(read(name).includes('from "@/lib/seo"'), "Missing translated metadata at " + route);
}
assert.ok(!registry.includes('{ en: "/daily-horoscope", hi: "/hi/aaj-ka-rashifal" }'), "False daily forecast translation");
assert.ok(seo.includes("publishedSeoAlternates(path, origin)"), "Missing origin-aligned HTML hreflang");
assert.ok(sitemap.includes("publishedSeoAlternates(route, seoOrigin)"), "Missing origin-aligned sitemap alternates");
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
assert.ok(hreflang.includes("indexableKundliGuideLanguages.map("), "Guide hreflang must include only reviewed language editions");
assert.ok(layout.includes('const htmlLang = documentLanguage;'), "HTML language is still controlled by visitor cookie");
assert.ok(provider.includes('documentLanguage === "en"') && provider.includes('nextLocale === "hinglish" ? "hi-Latn"'), "English UI must retain Hinglish language attribute while native guides remain route-specific");
assert.ok(middleware.includes('"/mr/:path*"') && middleware.includes('"/bn/:path*"') && middleware.includes('"/es/:path*"') && middleware.includes('"/fr/:path*"'), "Localized SSR middleware absent");


const homepage=read("app/page.tsx");
const mainKundli=read("app/kundli/page.tsx");
const hindiHome=read("app/hi/page.tsx");
assert.ok(homepage.includes('title: "Free Kundli, Horoscope & Vedic Astrology Tools"'), "Homepage must address its core organic search intent");
assert.ok(mainKundli.includes('title: "Free Kundli Online | Janam Kundali & Vedic Birth Chart"') && !mainKundli.includes("Generate a premium Naksharix Kundli"), "Free Kundli SEO must match free product");
assert.ok(hindiHome.includes("फ्री कुंडली, राशिफल और वैदिक ज्योतिष") && hindiHome.includes('href="/hi/free-kundli"'), "Hindi home must use native core search intent and direct useful route");

const editor = read("lib/kundli-education.ts");
const localizedRoute = read("app/[language]/learn/kundli-explained/page.tsx");
assert.ok(editor.includes('indexableKundliGuideLanguages = ["en", "hi"]'), "Only existing baseline languages are indexable until reviewed");
assert.ok(localizedRoute.includes("robots: { index: false, follow: true }"), "Language drafts must be noindex");
assert.ok(sitemap.includes("indexableKundliGuideLanguages.map("), "Sitemap must include indexable guides only");
assert.ok(hreflang.includes("indexableKundliGuideLanguages.map("), "No unreviewed language in hreflang");
for (const route of ["commerce-enquiry", "ask-astrologer", "puja-enquiry"]) {
  assert.ok(read("app/" + route + "/page.tsx").includes("robots: { index: false, follow: true }"), "Private enquiry exposed to indexing: " + route);
  assert.ok(!sitemap.includes('"/' + route + '"'), "Private intake present in sitemap: " + route);
}

const seoOrigin = read("lib/seo-origin.ts");
assert.ok(seoOrigin.includes('url.hostname = "www.naksharix.com"'), "Canonical SEO host must match verified Vercel www redirect");
assert.ok(seo.includes("canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL)"), "SEO metadata host mismatch");
assert.ok(sitemap.includes("const seoOrigin = canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL)"), "Sitemap host mismatch");
assert.ok(read("app/robots.ts").includes("sitemap: `${seoOrigin}/sitemap.xml`"), "robots sitemap host mismatch");
assert.ok(read("components/schema-markup.tsx").includes("canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL)"), "Organization JSON-LD host mismatch");
assert.ok(layout.includes("new URL(canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL))"), "Root metadataBase host mismatch");


// Public organic discovery must be useful, connected and honest, not thin doorway pages.
const editorial = read("lib/blog-content.ts");
const article = read("app/blog/[slug]/page.tsx");
const learning = read("app/learn/page.tsx");
for (const slug of [
  "daily-horoscope-personalization", "kundli-matching-score", "tarot-reflection",
  "lagna-vs-rashi", "panchang-five-elements", "lo-shu-grid-beginners", "vimshottari-dasha-timeline",
  "how-to-book-puja-online", "rudraksha-product-buying-checklist", "personalized-astrology-report-delivery-guide"
]) {
  assert.ok(editorial.includes('"' + slug + '"'), "Missing substantive editorial guide: " + slug);
}
assert.ok(editorial.includes("sections: readonly EditorialSection[]") &&
  editorial.includes("as const satisfies readonly EditorialPost[]") &&
  (editorial.match(/"paragraphs": \[/g) || []).length >= 43,
  "Guides must have multiple distinct explanatory paragraphs instead of one thin teaser");
assert.ok(article.includes("post.sections.map") && article.includes("post.related.map") &&
  article.includes("canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL)") &&
  article.includes('inLanguage: "en"') && article.includes("isAccessibleForFree: true"),
  "Article semantic headings, free tools and canonical JSON-LD absent");
assert.ok(learning.includes("/blog/how-to-book-puja-online") &&
  learning.includes("/blog/rudraksha-product-buying-checklist") &&
  learning.includes("/blog/personalized-astrology-report-delivery-guide") &&
  read("app/shop/page.tsx").includes("/blog/rudraksha-product-buying-checklist") &&
  read("app/reports/page.tsx").includes("/blog/personalized-astrology-report-delivery-guide"),
  "Practical non-payment guides must have genuine internal navigation");
assert.ok(editorial.includes('"slug": "puja"') && editorial.includes('"slug": "shop"') &&
  editorial.includes("not evidence") && editorial.includes("independent evidence"),
  "Shop and Puja guides must distinguish spiritual symbolism from actual fulfilment proof");
assert.ok(learning.includes("/blog/lagna-vs-rashi") && learning.includes("/blog/panchang-five-elements"),
  "Learning library must link the new high-intent articles");
assert.ok(sitemap.includes("blogPosts.map((post)"), "Blog articles must stay discoverable in the sitemap");
assert.ok(editorial.includes("not a guarantee") && editorial.includes("not validated") &&
  editorial.includes("qualified professional advice"),
  "Editorial content lacks explicit uncertainty or responsible use safeguards");
console.log("EDITORIAL_GROWTH_QA=PASS;ORIGINAL_GUIDES=10;SECTIONS=43;BASIC_INTERNAL_LINKS=PASS");

// Direct paid discovery must be voluntary, priced from the same authoritative
// catalogue as checkout, and clearly distinguished from free education.
const optionalReport = read("components/optional-report-next-step.tsx");
for (const marker of ["getManualReport(reportSlug)", "getManualReportCheckout(reportSlug)",
  "checkout.price", 'href={`/reports/${report.slug}`}', "Optional personalized paid report",
  "You can use the free tool without buying anything.", "फ्री टूल का उपयोग करने के लिए रिपोर्ट खरीदना जरूरी नहीं है।"])
  assert.ok(optionalReport.includes(marker), "Optional report discovery missing: " + marker);
assert.ok(!optionalReport.includes("RazorpayCheckoutButton") && !optionalReport.includes("fetch(") &&
  !optionalReport.includes("useEffect") && !optionalReport.includes("location."),
  "Optional discovery must never initiate payment, read user data or force navigation");
assert.ok(growthView.includes('page.slug === "free-kundli" ? "premium-kundli"') &&
  growthView.includes('page.slug === "kundli-matching" ? "couple-kundli"') &&
  growthView.includes('<OptionalReportNextStep reportSlug={optionalReport} locale="en" />') &&
  !growthView.includes("Naksharix SEO Guide"), "English report discovery or public copy regression");
assert.ok(read("app/hi/free-kundli/page.tsx").includes('<OptionalReportNextStep reportSlug="premium-kundli" locale="hi" />') &&
  read("app/hi/kundli-milan/page.tsx").includes('<OptionalReportNextStep reportSlug="couple-kundli" locale="hi" />'),
  "Hindi report discovery missing");
assert.ok(article.includes("Shop catalogue (optional purchase)") && article.includes("Paid reports (optional purchase)") &&
  article.includes("Current service availability") && !article.includes("Try the related free tools"),
  "Do not label paid or paused services as free tools");
console.log("OPTIONAL_REPORT_DISCOVERY=PASS;EN_HI=4;AUTHORITATIVE_PRICE=YES;NO_FORCED_PURCHASE=YES");



// Search discovery must submit only public educational URLs after production release identity.
const indexNow = read("scripts/seo/submit-indexnow.mjs");
const indexNowFlow = read(".github/workflows/seo-indexnow.yml");
for (const slug of [
  "how-to-book-puja-online","rudraksha-product-buying-checklist",
  "personalized-astrology-report-delivery-guide"
]) {
  assert.ok(indexNow.includes('"/blog/' + slug + '"'), "Newly published original guide missing from indexable discovery: " + slug);
}
const indexNowKey = "ef1d79191967d8cf6d2404e50e8017c1";
assert.equal(read("public/" + indexNowKey + ".txt").trim(), indexNowKey, "IndexNow public proof mismatch");
for (const code of [
  "INDEXNOW_EXACT_RELEASE=PASS", "RELEASE_SHA_NOT_LIVE_NO_SUBMISSION",
  "INDEXNOW_PUBLIC_KEY_VERIFICATION_FAILED", "INDEXNOW_SITEMAP_CHECK=PASS",
  "NON_INDEXABLE_URL=", "INDEXNOW_SUBMISSION_ACCEPTED=YES",
  "https://api.indexnow.org/indexnow", "GOOGLE_INDEXED=UNKNOWN",
  "SEARCH_TRAFFIC_GAIN=NOT_MEASURED", "NOT_AUTHORIZED_PRODUCTION_BRANCH"
]) assert.ok(indexNow.includes(code), "IndexNow public safe submission missing: " + code);
for (const path of [
  "/blog/daily-horoscope-personalization", "/blog/kundli-matching-score",
  "/blog/tarot-reflection", "/blog/lagna-vs-rashi",
  "/blog/panchang-five-elements", "/blog/lo-shu-grid-beginners",
  "/blog/vimshottari-dasha-timeline"
]) assert.ok(indexNow.includes('"' + path + '"'), "IndexNow guide missing: " + path);
assert.ok(indexNowFlow.includes("branches:\n      - complete-production-polish") &&
  indexNowFlow.includes("timeout-minutes: 20") &&
  indexNowFlow.includes("contents: read") &&
  !indexNowFlow.includes("schedule:") &&
  !indexNowFlow.includes("pull_request:"),
  "IndexNow workflow must run only on legitimate production changes; no schedule or PR spam");
assert.ok(!indexNow.includes("process.env.DATABASE_URL") &&
  !indexNow.includes("NEXT_PUBLIC_APP_URL") &&
  !indexNow.includes("RAZORPAY") &&
  !indexNow.includes("pagead2.googlesyndication"),
  "Search-discovery task must not read database, payment or ads configuration");
console.log("INDEXNOW_STATIC_DISCOVERY=PASS;HOST_KEY_PUBLIC=YES;PRODUCTION_ONLY=YES;PRIVATE_URLS=NO");

console.log("SEO_LOCALE_GATE=PASS;BILINGUAL_CORE_PAIRS=4;EDUCATIONAL_GUIDE_LANGUAGES=6;OTHER_LANGUAGES_NOT_INDEXED=YES");


// Conversion from public tools remains voluntary, and public report sharing
// never contains a private report id, birth data, order id or checkout state.
const relevant = read("components/relevant-report-discovery.tsx");
for (const [route,topic] of [["tarot","tarot"],["numerology","numerology"],["weekly-love-horoscope","love"],["numerology-monthly-horoscope","numerology"]]) {
  assert.ok(read("app/"+route+"/page.tsx").includes('<RelevantReportDiscovery topic="'+topic+'" />'), "Missing relevant report discovery: "+route);
  assert.ok(indexNow.includes('"/'+route+'"'), "Public tool not included in safe search discovery: "+route);
}
assert.ok(relevant.includes('tarot: ["love-report", "career-report"]') &&
  relevant.includes('numerology: ["numerology-lo-shu-report"]') &&
  relevant.includes("different method from tarot") && relevant.includes("<OptionalReportNextStep"),
  "Do not misrepresent a paid astrology report as a tarot reading");
const reportDetails=read("app/reports/[slug]/page.tsx");
assert.ok(reportDetails.includes('productUrl={publicReportUrl} kind="report"') &&
  reportDetails.includes('canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL)') &&
  reportDetails.includes('href="/refund-policy"') &&
  reportDetails.includes('href="/blog/personalized-astrology-report-delivery-guide"'),
  "Missing public-only report referral or buyer guidance");
const relatedShop=read("app/shop/[slug]/page.tsx");
assert.ok(relatedShop.includes('item.status === "active"') && relatedShop.includes("Number.isSafeInteger(item.unitPricePaise)") &&
  relatedShop.includes("Compare other spiritual products") && relatedShop.includes("Each item is optional"),
  "Related products must use the current active priced catalogue");
assert.ok(read("components/analytics-preferences.tsx").includes("reportLink ? 'report_cta_clicked' : 'cta_link'") &&
  read("components/analytics-preferences.tsx").includes("choice!=='granted'"),
  "Public sales CTA counts must retain optional analytics consent");
for (const route of ["/free-kundli","/hi/free-kundli","/kundli-matching","/hi/kundli-milan","/tarot","/numerology","/weekly-love-horoscope","/numerology-monthly-horoscope","/reports","/reports/premium-kundli","/reports/couple-kundli","/reports/love-report","/reports/career-report","/reports/numerology-lo-shu-report"]) {
  assert.ok(indexNow.includes('"'+route+'"'), "Missing public discovery route: "+route);
}
console.log("ORGANIC_SALES_CONVERSION=PASS;RELEVANT_REPORTS=4;REPORT_SHARE=PUBLIC_ONLY;SHOP_PRICES=LIVE_CATALOGUE;CONSENT=PRESERVED");

const brandSchema=read("components/schema-markup.tsx");
const brandAnswers=read("components/seo/brand-answers.tsx");
const brandFacts=read("lib/seo-brand.ts");
assert.ok(brandSchema.includes("<JsonLd") && !brandSchema.includes("next/script") && !brandSchema.includes("afterInteractive"), "Brand entities must be in server-rendered HTML");
for(const id of ["#organization","#website","#webapplication"]) assert.ok(brandSchema.includes(id), "Missing stable brand graph node "+id);
assert.ok(brandSchema.includes('publisher: { "@id": organizationId }') && brandSchema.includes('isPartOf: { "@id": websiteId }'), "Missing linked brand entities");
assert.ok(!/sameAs|aggregateRating|reviewCount|foundingDate|founder:/.test(brandSchema), "Unverified brand proof");
assert.ok(brandFacts.includes("Naksharix is the name of this online platform") && brandFacts.includes("Naksharix और नक्षत्र में क्या अंतर है?") && brandAnswers.includes("brandAnswers[locale].map"), "Visible bilingual brand distinction missing");
assert.ok(read("app/about/page.tsx").includes('path: "/about"') && read("app/hi/about/page.tsx").includes('path: "/hi/about"'), "Missing self-canonical About metadata");
assert.ok(sitemap.includes('const route = rawRoute || "/"') && sitemap.includes("new URL(route, seoOrigin).toString()"), "Root sitemap must match canonical and use its full hreflang cluster");
const directory=read("public/llms.txt");
assert.ok(directory.includes("https://www.naksharix.com/about") && directory.includes("https://www.naksharix.com/hi/about") && directory.includes("optional human- and machine-readable"), "Public brand reference directory incomplete");
for(const match of directory.matchAll(/https:\/\/[^)\s]+/g)){
  const url=new URL(match[0]);
  assert.equal(url.origin,"https://www.naksharix.com");
  assert.ok(!/^(?:\/api|\/admin|\/dashboard|\/payment|\/report-request|\/saved-reports|\/profile)(?:\/|$)/.test(url.pathname) && !url.search && !url.hash,"Private link in public directory");
}
console.log("BRAND_ENTITY_DISCOVERY=PASS;SSR_SCHEMA=YES;BILINGUAL_ABOUT=YES;ROOT_HREFLANG=YES;RANKING=NOT_CLAIMED");

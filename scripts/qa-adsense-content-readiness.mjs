import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(path, "utf8");
const sitemap = read("app/sitemap.ts");
const puja = read("app/pujas/page.tsx");
const calendar = read("app/puja-calendar/page.tsx");
const home = read("components/home/approved-gallery-home.tsx");
const secondaryHome = read("components/home/editorial-home.tsx");
const heroStyles = read("app/editorial-home.css");
const nav = read("components/main-nav.tsx");

assert.ok(puja.includes("robots: { index: false, follow: true }"),
  "Puja must remain noindex while bookings are paused");
assert.ok(!sitemap.includes('"/pujas"') && !sitemap.includes("pujaTopics"),
  "Paused Puja pages must not appear in the indexable sitemap");
assert.ok(calendar.includes("New Naksharix Puja bookings and online Puja payments are currently paused"),
  "The date-planning calendar must not promise unavailable booking services");
assert.ok(!calendar.includes('href="/puja-enquiry"'),
  "The calendar must not funnel visitors to a disabled enquiry");
assert.ok(nav.includes('Link href="/learn">{locale === "hi"'),
  "The homepage learning promo must point to a genuinely available resource");

const h1Count = source => [...source.matchAll(/<h1\b/g)].length;
assert.equal(h1Count(home), 1, "Primary homepage section needs exactly one H1");
assert.equal(h1Count(secondaryHome), 0, "Secondary editorial homepage section must not add another H1");
assert.ok(heroStyles.includes(".nx-ed-hero h2") && !heroStyles.includes(".nx-ed-hero h1"),
  "Preserve original hero styling after semantic H2 conversion");

const guides = [
  ["dasha-calculator", ["120", "Mahadasha", "Antardasha", "birth time"]],
  ["name-number-calculator", ["RAM", "9 + 1 + 4", "birth date", "letter"]],
  ["guna-milan-calculator", ["36", "Varna", "Nadi", "Consent"]],
  ["nakshatra-calculator", ["27", "3°20", "Moon", "time zone"]]
];
for (const [slug, concepts] of guides) {
  const page = read("app/free-calculators/" + slug + "/page.tsx");
  for (const concept of concepts) assert.ok(page.includes(concept),
    "Missing practical, specific, usable content in " + slug + ": " + concept);
  assert.ok((page.match(/<h[234]\b/g) || []).length >= 3,
    "Calculator must explain its method and limitations: " + slug);
  assert.ok(page.includes("FocusedCalculatorContent"),
    "Calculator functionality must be preserved: " + slug);
}
console.log("NAKSHARIX_ADSENSE_CONTENT_READINESS_STATIC=PASS;PAUSED_SERVICES_NOT_INDEXED=YES;HOMEPAGE_H1=ONE;EDUCATIONAL_GUIDES=4;GOOGLE_APPROVAL_NOT_ASSERTED");

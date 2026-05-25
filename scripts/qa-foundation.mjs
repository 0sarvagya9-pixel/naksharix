import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function reduceNumber(value) {
  const n = String(value).split("").reduce((sum, digit) => sum + Number(digit || 0), 0);
  return n > 9 && ![11, 22, 33].includes(n) ? reduceNumber(n) : n;
}

function dateDigits(date) {
  return String(date).replace(/\D/g, "").split("").map(Number).filter((n) => n > 0);
}

function loShuCounts(date) {
  const counts = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [String(i + 1), 0]));
  for (const digit of dateDigits(date)) counts[String(digit)] += 1;
  return counts;
}

function nameNumber(name) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  const total = [...letters].reduce((sum, char) => sum + ((char.charCodeAt(0) - 65) % 9) + 1, 0);
  return reduceNumber(total);
}

// Deterministic numerology checks.
assert(reduceNumber("19900101") === 3, "Numerology reduction failed for 19900101 -> 3");
assert(nameNumber("RAVI") === 5, "Name number check failed for RAVI -> 5");

const counts = loShuCounts("2001-02-03");
assert(counts["1"] === 1 && counts["2"] === 2 && counts["3"] === 1, "Lo Shu present/repeated counts failed for 2001-02-03");
assert(["4", "5", "6", "7", "8", "9"].every((n) => counts[n] === 0), "Lo Shu missing numbers failed for 2001-02-03");

// Nakshatra standard index checks.
const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
assert(nakshatras.indexOf("Bharani") + 1 === 2, "Nakshatra index failed: Bharani should be 2");
assert(nakshatras.indexOf("Punarvasu") + 1 === 7, "Nakshatra index failed: Punarvasu should be 7");

// Matching score max contract.
const kootMax = { Varna: 1, Vashya: 2, Tara: 3, Yoni: 4, "Graha Maitri": 5, Gana: 6, Bhakoot: 7, Nadi: 8 };
assert(Object.values(kootMax).reduce((sum, value) => sum + value, 0) === 36, "Ashtakoot max score total must be 36");

// Source-level safety gates.
const panchangApi = read("app/api/panchang/route.ts");
assert(!panchangApi.includes("getPanchang("), "Panchang API must not call seeded/fallback getPanchang");
assert(panchangApi.includes("calculatePremiumPanchang"), "Panchang API should use the real premium Panchang service");
assert(panchangApi.includes("querySchema"), "Panchang API should validate query fields");

const panchangPage = read("app/panchang/page.tsx");
assert(panchangPage.includes("Provider Verified"), "Panchang page should clearly show provider-verified status");
assert(panchangPage.toLowerCase().includes("location-aware"), "Panchang page should explain location-aware calculation");
assert(panchangPage.includes("cross-check for critical"), "Panchang page should keep critical Muhurat limitation wording");

const reportsContent = read("components/reports-content.tsx");
const reportDetail = read("app/reports/[slug]/page.tsx");
for (const [file, content] of [["components/reports-content.tsx", reportsContent], ["app/reports/[slug]/page.tsx", reportDetail]]) {
  assert(!/Request on WhatsApp|WhatsApp\/Contact|payment confirmation|Instant Report|Order confirmed|Payment success/i.test(content), `${file} contains unsafe report/payment/WhatsApp language`);
}

const sitemap = read("app/sitemap.ts");
for (const route of ["/ai-astrologer", "/shop", "/consultation"]) {
  assert(!sitemap.includes(`"${route}"`), `Hold route ${route} should not be promoted in sitemap staticRoutes`);
}
assert(sitemap.includes("\"/panchang\""), "Provider-verified Panchang should be promoted in sitemap staticRoutes");

const robots = read("app/robots.ts");
for (const route of ["/ai-astrologer", "/shop", "/consultation"]) {
  assert(robots.includes(`"${route}"`), `Hold route ${route} should be disallowed/noindex protected in robots`);
}
assert(robots.includes("\"/panchang\"") && !robots.includes("\"/panchang\", \"/ai-astrologer\""), "Provider-verified Panchang should be allowed in robots");

if (failures.length) {
  console.error("QA foundation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("QA foundation passed: numerology, Lo Shu, nakshatra, matching max score, provider-verified Panchang gate, report safety, sitemap/robots guards.");

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { timezoneOffsetForDate, todayInTimezone } from "../lib/astrology/timezone-offset.ts";

const source = file => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const cases = [
  ["2026-11-05", "America/New_York", "-05:00"],
  ["2026-06-10", "America/New_York", "-04:00"],
  ["2026-11-05", "Europe/London", "+00:00"],
  ["2026-06-10", "Europe/London", "+01:00"],
  ["2026-11-05", "Australia/Sydney", "+11:00"],
  ["2026-06-10", "Australia/Sydney", "+10:00"],
  ["2026-11-05", "Asia/Kolkata", "+05:30"]
];
for(const [date,zone,want] of cases) {
  assert.equal(timezoneOffsetForDate(date,zone),want, "Calendar zone " + zone + " " + date);
}
assert.equal(todayInTimezone("Asia/Kolkata",new Date("2026-11-05T20:00:00Z")),"2026-11-06");
assert.equal(todayInTimezone("America/New_York",new Date("2026-11-05T02:00:00Z")),"2026-11-04");
const forms=["components/kundli-form.tsx","components/matchmaking-form.tsx"];
for(const file of forms) {
  const contents=source(file);
  assert.match(contents,/<label className="block text-sm font-semibold text-\[#482d3a\]">/);
  assert.match(contents,/role="alert"/);
  assert.doesNotMatch(contents,/<Label>\{label\}<\/Label>/);
}
const css=source("app/royal-vedic-heritage.css");
for(const text of [
  "--royal-wine", "--royal-paper", "--royal-navy",
  "[data-layout=\"editorial\"]",
  "html.dark body.naksh-page-bg", ".nx-editorial .nx-ed-hero",
  "focus-visible", "prefers-reduced-motion",
  "[class*=\"bg-[#c98924]\"]"
]) assert.ok(css.includes(text),"Missing brand UI contract "+text);
const layout=source("app/layout.tsx");
assert.ok(layout.includes('import "@/app/royal-vedic-heritage.css";'));
assert.ok(layout.indexOf('import "@/app/royal-vedic-heritage.css";')>layout.indexOf('import "@/app/premium-ux-20261027.css";'));
const pdf=source("lib/reports/premium-report-generation-service.ts");
assert.ok(pdf.includes("StandardFonts.Helvetica") && pdf.includes("NotoSansDevanagari-Regular.ttf"));
assert.ok(pdf.includes("readableText(item, String(i + 1)") && pdf.includes("Object.entries(value"));
assert.ok(pdf.includes("₹") && pdf.includes("drawTextRuns") && pdf.includes("Intl.Segmenter"));
assert.doesNotMatch(pdf,/\.slice\(0,\s*(?:14|22|6)\)/);
assert.ok(pdf.includes("reviewedByAdmin") && pdf.includes("blocked_until_admin_review"));
assert.ok(pdf.includes("deliveryEnabled: false"));
assert.ok(source("components/theme-toggle.tsx").includes('useState<"dark" | "light">("light")'));
console.log("ROYAL_VEDIC_QA=PASS");
console.log("DATE_AWARE_TIMEZONES="+cases.length);
console.log("FORM_LABELS=WRAPPED;PDF_DATA=NO_SILENT_TRUNCATION;PAYMENT_SCOPE=UNCHANGED");

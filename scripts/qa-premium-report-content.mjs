import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "lib/reports/premium-report-content-engine.ts"), "utf8");
const results = [];

function assert(condition, name, detail) {
  results.push({ status: condition ? "PASSED" : "FAILED", name, detail });
}

assert(source.includes("assemblePremiumReportContent"), "Report content assembler exists", "real internal content assembly");
assert(source.includes("premiumComplete: false"), "Premium completion stays false", "no fake complete report");
assert(source.includes("unavailableSections"), "Unavailable sections are tracked", "no fake sections");
assert(source.includes("available_unverified") && source.includes("partial_internal") && source.includes("unavailable"), "Section statuses exist", "truthful section metadata");
assert(source.includes("core-kundli-summary") && source.includes("lo-shu-section") && source.includes("chinese-zodiac-section") && source.includes("final-summary"), "Offline Kundli report sections exist", "full report structure");
assert(source.includes("must be reviewed before delivery"), "Trust note exists", "no automatic delivery claim");
assert(!/automatic delivery|payment successful|download now|premiumComplete:\s*true/i.test(source), "No fake delivery/payment language", "safe wording scan");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name} - ${result.detail}`);
console.log(`\nPremium report content QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);

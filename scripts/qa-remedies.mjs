import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "lib/astrology/remedies/rules.ts"), "utf8");
const results = [];

function assert(condition, name, detail) {
  results.push({ status: condition ? "PASSED" : "FAILED", name, detail });
}

assert(source.includes("generateSafeRemedies"), "Remedies generator exists", "safe starter remedies");
assert(source.includes("publicRemediesEnabled: false"), "Public remedies disabled", "safe boundary");
assert(source.includes("does not guarantee outcomes"), "No guarantee caution exists", "claim boundary");
assert(source.includes("Do not buy or wear gemstones based only on an automated result"), "Gemstone caution exists", "no sales pressure");
assert(!/forced purchase|guaranteed cure|must buy|bad luck/i.test(source), "No fear-selling wording", "safe wording scan");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name} - ${result.detail}`);
console.log(`\nRemedies QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);

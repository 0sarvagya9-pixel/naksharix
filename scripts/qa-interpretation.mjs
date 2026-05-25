import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "lib/astrology/interpretation/rule-engine.ts"), "utf8");
const results = [];

function assert(condition, name, detail) {
  results.push({ status: condition ? "PASSED" : "FAILED", name, detail });
}

assert(source.includes("generateStarterInterpretation"), "Interpretation generator exists", "starter rules");
assert(source.includes("missingInputs.push"), "Missing input behavior exists", "does not invent specificity");
assert(source.includes("publicPersonalizedPredictionEnabled: false"), "Public personalized prediction disabled", "safe boundary");
assert(source.includes("not replace professional medical, legal, financial, or mental-health advice"), "Safety boundary exists", "professional advice disclaimer");
assert(!/guaranteed\s+(success|wealth|marriage|result|outcome)|100%\s*accurate|will\s+definitely/i.test(source), "No deterministic prediction language", "safe wording scan");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name} - ${result.detail}`);
console.log(`\nInterpretation QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);

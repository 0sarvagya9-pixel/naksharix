import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

const readiness = source("docs/automation-layer-readiness.md");
const packageJson = JSON.parse(source("package.json"));

for (const section of ["Razorpay payment", "PDF storage", "Email delivery", "Report status automation", "Audit logs", "Rate limiting", "Monitoring"]) {
  assert(readiness.includes(section), `Automation readiness documents ${section}`, "docs/automation-layer-readiness.md");
}
for (const script of ["qa:storage", "qa:delivery", "qa:audit-security"]) {
  assert(Boolean(packageJson.scripts[script]), `${script} package script exists`, "stable automation QA");
}
assert(readiness.includes("No fake payment success") && readiness.includes("No fake email delivery"), "Readiness doc records no-fake boundaries", "public safety");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
console.log(`\nAutomation QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root })
  .toString("utf8")
  .split("\0")
  .filter(Boolean);

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".yml", ".yaml", ".css", ".prisma"]);
const ignoredPrefixes = ["docs/", "public/", "tests/", ".next/", "node_modules/"];
const ignoredFiles = new Set(["package-lock.json", "scripts/qa-source-hygiene.mjs"]);
const markerPatterns = [
  { name: "TODO", pattern: /\bTODO\b/i },
  { name: "FIXME", pattern: /\bFIXME\b/i },
  { name: "HACK", pattern: /\bHACK\b/i },
  { name: "XXX", pattern: /\bXXX\b/ },
  { name: "REMOVE BEFORE PROD", pattern: /REMOVE\s+BEFORE\s+PROD(?:UCTION)?/i }
];
const secretPatterns = [
  { name: "private key block", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "OpenAI-style live key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { name: "Razorpay live key", pattern: /\brzp_live_[A-Za-z0-9]{8,}\b/ },
  { name: "Stripe live secret", pattern: /\bsk_live_[A-Za-z0-9]{12,}\b/ },
  { name: "AWS access key", pattern: /\bAKIA[0-9A-Z]{16}\b/ }
];

const failures = [];
let scanned = 0;

for (const file of tracked) {
  const normalized = file.replaceAll("\\", "/");
  if (ignoredFiles.has(normalized) || ignoredPrefixes.some((prefix) => normalized.startsWith(prefix))) continue;
  if (!sourceExtensions.has(path.extname(normalized))) continue;
  const absolute = path.join(root, normalized);
  if (!fs.existsSync(absolute) || fs.statSync(absolute).size > 2_000_000) continue;
  const text = fs.readFileSync(absolute, "utf8");
  scanned += 1;

  for (const { name, pattern } of [...markerPatterns, ...secretPatterns]) {
    const lines = text.split("\n");
    for (let index = 0; index < lines.length; index += 1) {
      if (pattern.test(lines[index])) failures.push(`${normalized}:${index + 1} matched ${name}`);
    }
  }
}

console.log(`Source hygiene scanned ${scanned} tracked source/config files.`);
for (const failure of failures) console.log(`FAILED: ${failure}`);
if (failures.length) process.exit(1);
console.log("PASSED: no release-blocking markers or recognized live-secret patterns found");

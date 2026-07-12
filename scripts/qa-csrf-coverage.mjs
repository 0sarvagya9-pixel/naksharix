import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = ["app", "components", "lib"];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const ignored = new Set(["lib/security/csrf.ts"]);
const failures = [];
let clientFiles = 0;
let secureFetchFiles = 0;

function walk(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDir, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) return walk(relativePath);
    return sourceExtensions.has(path.extname(entry.name)) ? [relativePath] : [];
  });
}

for (const file of scanRoots.flatMap(walk)) {
  if (ignored.has(file)) continue;
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (!/^\s*["']use client["'];/m.test(text)) continue;
  clientFiles += 1;
  if (text.includes("secureFetch(")) secureFetchFiles += 1;

  const directMutationFetch = /(?<![\w])fetch\s*\([\s\S]{0,700}?method\s*:\s*["'](?:POST|PUT|PATCH|DELETE)["']/gi;
  for (const match of text.matchAll(directMutationFetch)) {
    const line = text.slice(0, match.index).split("\n").length;
    failures.push(`${file}:${line} uses direct fetch for a state-changing request; use secureFetch instead`);
  }
}

console.log(`CSRF coverage scanned ${clientFiles} client files; ${secureFetchFiles} use secureFetch.`);
for (const failure of failures) console.log(`FAILED: ${failure}`);
if (failures.length) process.exit(1);
console.log("PASSED: no direct client-side mutation fetch calls found");

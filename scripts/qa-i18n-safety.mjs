import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dictionary = fs.readFileSync(path.join(root, "lib/i18n.ts"), "utf8");
const overrides = fs.readFileSync(path.join(root, "lib/i18n-safe-overrides.ts"), "utf8");
const provider = fs.readFileSync(path.join(root, "components/language-provider.tsx"), "utf8");
const serverHelper = fs.readFileSync(path.join(root, "lib/i18n-server.ts"), "utf8");
const failures = [];
const riskyPatterns = [
  /Trusted by Millions/i,
  /AI-Powered Accuracy/i,
  /100% Secure/i,
  /Premium AI/i,
  /ask an AI astrologer/i,
  /Gemini-powered/i,
  /placeholder payments/i,
  /Advisor profile placeholder/i,
  /AI conversation/i,
  /AI-powered insights/i,
  /Personalized predictions/i,
  /positive career shift/i,
  /24\/7 Customer Support/i,
  /within 24 hours/i,
  /24 hours ke andar/i,
  /24 hours के अंदर/i,
  /Payments coming soon/i,
  /Payments jald/i,
  /Payments जल्द/i,
  /free AI messages/i,
  /AI is thinking/i,
  /AI aapki/i,
  /AI आपकी/i
];

for (const line of dictionary.split("\n")) {
  const keyMatch = line.match(/^\s*([A-Za-z0-9_]+):\s*["'`]/);
  if (!keyMatch) continue;
  if (!riskyPatterns.some((pattern) => pattern.test(line))) continue;
  const key = keyMatch[1];
  const overridePattern = new RegExp(`\\b${key}\\s*:`);
  if (!overridePattern.test(overrides)) failures.push(`risky translation key ${key} has no safe override`);
}

if (!provider.includes("safeTranslation(locale, key, t(locale, key))")) {
  failures.push("LanguageProvider does not route translations through safeTranslation");
}
if (!serverHelper.includes("safeTranslation(locale, key, t(locale, key))")) {
  failures.push("Server translation helper does not route translations through safeTranslation");
}

const scanRoots = ["app", "components", "lib"];
const allowedDirectT = new Set([
  "components/language-provider.tsx",
  "lib/i18n-safe-overrides.ts",
  "lib/i18n-server.ts",
  "lib/i18n.ts"
]);

function walk(relativeDir) {
  const absolute = path.join(root, relativeDir);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(relativeDir, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) return walk(relative);
    return /\.(?:ts|tsx|js|jsx)$/.test(entry.name) ? [relative] : [];
  });
}

for (const file of scanRoots.flatMap(walk)) {
  if (allowedDirectT.has(file)) continue;
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (/import\s*\{[^}]*\bt\b[^}]*\}\s*from\s*["']@\/lib\/i18n["']/.test(text)) {
    failures.push(`${file} imports raw t() instead of using the safe language provider or server helper`);
  }
}

for (const failure of [...new Set(failures)]) console.log(`FAILED: ${failure}`);
if (failures.length) process.exit(1);
console.log("PASSED: risky legacy translations are overridden and raw t() is restricted to safety helpers");

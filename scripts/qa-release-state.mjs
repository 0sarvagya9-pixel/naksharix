import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function absolute(file) {
  return path.join(root, file);
}

function exists(file) {
  return fs.existsSync(absolute(file));
}

function read(file) {
  return fs.readFileSync(absolute(file), "utf8");
}

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

const requiredFiles = [
  "docs/NAKSHARIX_CURRENT_HANDOFF.md",
  "docs/NAKSHARIX_PRODUCTION_ACCEPTANCE.md",
  "docs/NAKSHARIX_DATABASE_MIGRATION_RECOVERY.md",
  "app/shop/page.tsx",
  "components/shop-coming-soon-content.tsx",
  "app/ai-astrologer/page.tsx",
  "lib/ai/feature-status.ts",
  "lib/ai/gemini-chat.ts"
];

for (const file of requiredFiles) {
  assert(exists(file), `Required release-state file exists: ${file}`, file);
}

if (requiredFiles.every(exists)) {
  const handoff = read("docs/NAKSHARIX_CURRENT_HANDOFF.md");
  const acceptance = read("docs/NAKSHARIX_PRODUCTION_ACCEPTANCE.md");
  const acceptanceLower = acceptance.toLowerCase();
  const databaseRecovery = read("docs/NAKSHARIX_DATABASE_MIGRATION_RECOVERY.md");
  const shopPage = read("app/shop/page.tsx");
  const shopContent = read("components/shop-coming-soon-content.tsx");
  const aiPage = read("app/ai-astrologer/page.tsx");
  const aiFeatureStatus = read("lib/ai/feature-status.ts");
  const aiProvider = read("lib/ai/gemini-chat.ts");

  assert(handoff.includes("complete-production-polish"), "Handoff identifies the authoritative release branch", "complete-production-polish");
  assert(handoff.includes("PRODUCTION_NOT_VERIFIED"), "Handoff separates code completion from production proof", "production evidence remains explicit");
  assert(handoff.includes("DISABLED_SAFELY"), "Handoff records the safe AI default", "AI is not silently activated");

  assert(acceptanceLower.includes("informational spiritual catalogue"), "Production acceptance documents the current Shop state", "catalogue without ecommerce");
  assert(acceptanceLower.includes("readiness-gated gemini ai chat"), "Production acceptance documents the current AI state", "flag plus real provider key");
  assert(!acceptance.includes("Shop remains a noindex, non-transactional Coming Soon page"), "Production acceptance contains no stale Shop state", "old Coming Soon statement removed");
  assert(!acceptance.includes("Public AI input remains unavailable"), "Production acceptance contains no stale unconditional AI state", "AI availability is readiness-gated");

  assert(databaseRecovery.includes("Do not run migration commands against production"), "Database recovery document carries a production stop rule", "no blind baseline or reset");
  assert(databaseRecovery.includes("isolated disposable PostgreSQL database"), "Database recovery requires isolated rehearsal", "production schema is not used for experiments");

  assert(shopPage.includes("index: true") && shopContent.includes("Ask Availability"), "Shop source matches the documented informational catalogue", "indexable and enquiry-only");
  assert(!shopContent.includes("Add to Cart") && !shopContent.includes("Buy Now"), "Shop remains non-transactional", "no ecommerce control");

  assert(aiPage.includes("isAiAstrologerReady"), "AI page remains readiness-gated", "UI only renders when ready");
  assert(aiFeatureStatus.includes("AI_ASTROLOGER_ENABLED") && aiFeatureStatus.includes("isGeminiKeyConfigured"), "AI readiness requires an explicit flag and provider key", "fail-closed readiness");
  assert(aiProvider.includes("25_000") && aiProvider.includes("GeminiChatProviderError"), "AI provider keeps timeout and strict failure handling", "25-second timeout, no synthetic fallback");
}

const trackedEnv = execFileSync("git", ["ls-files", ".env", ".env.local", ".env.production"], { cwd: root })
  .toString("utf8")
  .trim();
assert(!trackedEnv, "Runtime environment files are not tracked", trackedEnv || "no tracked runtime env files");

const packageJson = JSON.parse(read("package.json"));
const scripts = Object.values(packageJson.scripts ?? {}).join("\n");
const forbiddenDatabaseCommands = ["prisma migrate reset", "prisma db push --force-reset", "prisma db push --accept-data-loss"];
for (const command of forbiddenDatabaseCommands) {
  assert(!scripts.includes(command), `Package scripts exclude destructive database command: ${command}`, "destructive command absent");
}

const migrationsPath = absolute("prisma/migrations");
if (!fs.existsSync(migrationsPath)) {
  record("WARNING", "Git-tracked Prisma migration history", "prisma/migrations is absent; follow docs/NAKSHARIX_DATABASE_MIGRATION_RECOVERY.md before any schema deployment");
} else {
  const migrationDirectories = fs.readdirSync(migrationsPath, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  record(migrationDirectories.length ? "PASSED" : "WARNING", "Git-tracked Prisma migration history", `${migrationDirectories.length} migration director${migrationDirectories.length === 1 ? "y" : "ies"} found`);
}

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nRelease-state QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

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
  "app/api/release/route.ts",
  "lib/ai/feature-status.ts",
  "lib/ai/gemini-chat.ts",
  "vercel.json",
  ".github/workflows/production-acceptance.yml",
  ".github/workflows/database-baseline-rehearsal.yml"
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
  const releaseRoute = read("app/api/release/route.ts");
  const vercel = JSON.parse(read("vercel.json"));
  const productionAcceptanceWorkflow = read(".github/workflows/production-acceptance.yml");
  const databaseBaselineWorkflow = read(".github/workflows/database-baseline-rehearsal.yml");

  assert(handoff.includes("complete-production-polish"), "Handoff identifies the authoritative release branch", "complete-production-polish");
  assert(handoff.includes("PRODUCTION_NOT_VERIFIED"), "Handoff separates deployment status from exact custom-domain proof", "production evidence remains explicit");
  assert(handoff.includes("ENABLED_NOT_VERIFIED"), "Handoff records approved AI activation without inventing readiness", "production readiness requires live evidence");
  assert(handoff.includes("Razorpay state: owner-confirmed complete"), "Handoff preserves Razorpay as completed and untouched", "no payment reconfiguration");

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
  assert(vercel?.env?.AI_ASTROLOGER_ENABLED === "true", "Vercel configuration enables the public AI feature flag", "Gemini key readiness is still checked at runtime");

  assert(releaseRoute.includes("VERCEL_GIT_COMMIT_SHA") && releaseRoute.includes("VERCEL_GIT_COMMIT_REF"), "Release endpoint exposes exact non-sensitive deployment identity", "/api/release");
  assert(!releaseRoute.includes("GEMINI_API_KEY") && !releaseRoute.includes("DATABASE_URL"), "Release endpoint exposes no provider secrets", "identity only");

  assert(productionAcceptanceWorkflow.includes("/api/release") && productionAcceptanceWorkflow.includes("EXPECTED_SHA"), "Production workflow proves the exact custom-domain SHA", "no preview-only acceptance");
  assert(productionAcceptanceWorkflow.includes("/api/health") && productionAcceptanceWorkflow.includes("/api/ai/status"), "Production workflow verifies database and AI readiness", "live acceptance gates");
  assert(productionAcceptanceWorkflow.includes("AI_ASTROLOGER_ENABLED is not active") && productionAcceptanceWorkflow.includes("Gemini key/readiness is not active"), "Production workflow fails closed on incomplete AI activation", "no false PASS");

  assert(databaseBaselineWorkflow.includes("postgres:16-alpine"), "Database rehearsal uses disposable PostgreSQL", "isolated service container");
  assert(databaseBaselineWorkflow.includes("--from-empty") && databaseBaselineWorkflow.includes("--to-schema-datamodel"), "Database rehearsal generates baseline SQL from the current schema", "reviewable artifact");
  assert(databaseBaselineWorkflow.includes("production_database_touched=false"), "Database rehearsal records that production is untouched", "non-production-only execution");
  assert(!databaseBaselineWorkflow.includes("migrate reset") && !databaseBaselineWorkflow.includes("db push"), "Database rehearsal contains no destructive Prisma command", "safe baseline generation");
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
  record("WARNING", "Git-tracked Prisma migration history", "prisma/migrations is absent; use the disposable rehearsal artifact and production drift evidence before adoption");
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

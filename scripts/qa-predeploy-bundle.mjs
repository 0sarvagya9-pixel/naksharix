import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

// Static source-bundle contract only. No DB connection, migration, network or deployment.
const root = process.cwd();
function read(relative) { return fs.readFileSync(path.join(root, relative), "utf8"); }
function has(relative, fragment) { assert.ok(read(relative).includes(fragment), relative + " missing "+fragment); }

const essential = [
  "deploy/sql/20261026-learning-progress.sql",
  "deploy/sql/20261026-puja-partner-registry.sql",
  "scripts/qa-disposable-db-rehearsal.sh",
  "scripts/qa-production-db-readonly.mjs",
  "lib/ops/schema-readiness.ts",
  "app/api/ops/readiness/route.ts",
  "app/api/admin/readiness/route.ts",
  "app/api/consultations/session-link/route.ts",
  "app/api/learn/progress/route.ts",
  "app/api/puja/partners/route.ts",
  "app/api/admin/puja-partners/route.ts",
  "components/learning-self-check.tsx",
  "components/home/editorial-home.tsx",
  "app/editorial-home.css",
  "docs/PREDEPLOY_SINGLE_CUTOVER_HANDOFF_20261026.md"
];
for (const file of essential) assert.ok(fs.existsSync(path.join(root, file)), "Missing release bundle file: " + file);
has("app/page.tsx", "<EditorialHome />");
has("lib/ops/schema-readiness.ts", 'to_regclass(\'public."LearningProgress"\')');
has("lib/ops/schema-readiness.ts", 'to_regclass(\'public."PujaPartner"\')');

// R2 schema must reject partial columns, wrong precision, absent validated FK,
// reversed indexes and invalid indexes before any production schema is accepted.
for (const field of ["lessonId", "userId", "completedAt", "createdAt", "updatedAt",
  "traditions", "evidenceUrl", "reviewedById", "reviewedAt", "reviewNote"]) {
  has("lib/ops/schema-readiness.ts", "'" + field + "'");
}
for (const contract of ["LearningProgress_userId_fkey",
  "LearningProgress_userId_lessonId_key", "LearningProgress_userId_completedAt_idx",
  "PujaPartner_reviewStatus_createdAt_idx", "f.confdeltype='c'", "f.confupdtype='c'",
  "i.indisvalid AND i.indisready"]) {
  has("lib/ops/schema-readiness.ts", contract);
}
for (const mandatory of ["c.data_type=required.data_type", "c.datetime_precision=3",
  "c.udt_name='_text'", "c.is_nullable='NO'", "f.convalidated",
  "LearningProgress_pkey", "PujaPartner_pkey", "i.indnkeyatts=2",
  "i.indkey[0]", "i.indkey[1]", "i.indpred IS NULL", "i.indexprs IS NULL"]) {
  has("lib/ops/schema-readiness.ts", mandatory);
}

has("scripts/qa-disposable-db-rehearsal.sh", "feature_sql_migrations_disposable_only=PASS");
has("scripts/qa-disposable-db-rehearsal.sh", "all database targets are disposable localhost");
has("scripts/qa-production-db-readonly.mjs", "DATABASE_WRITES_PERFORMED=ZERO");
has("app/api/cron/production-health/route.ts", "checks.databaseSchema &&");
has("app/api/ops/readiness/route.ts", "databaseSchema:");
has("app/api/learn/progress/route.ts", "userId_lessonId");
has("app/api/guidance-enquiries/route.ts", "bookingCreated: false");
has("app/api/puja/partners/route.ts", 'reviewStatus: "VERIFIED"');
has("app/api/consultations/session-link/route.ts", "providerReady: false");
has("components/learning-self-check.tsx", "not an accredited result");
has("lib/monitoring/logger.ts", 'provider: "console_safe_logger"');
has("deploy/vercel.md", "Payment remains deferred");
const packageFile = JSON.parse(read("package.json"));
assert.equal(packageFile.scripts["db:deploy"], undefined);
assert.equal(packageFile.scripts["qa:predeploy-bundle"], "node scripts/qa-predeploy-bundle.mjs");
assert.ok(!/prisma migrate deploy|vercel deploy|vercel --prod/.test(packageFile.scripts["qa:predeploy-bundle"]));
console.log("PREDEPLOY_CODE_BUNDLE=PASS");
console.log("LIVE_DEPLOYMENT_PERFORMED=NO");
console.log("PRODUCTION_DATABASE_WRITES=ZERO");
console.log("PAYMENT_ACTIVATION=NO");
console.log("LIVE_OPERATIONS_ACCEPTANCE=HELD_PENDING_BACKUP_MIGRATION_PROVIDER_EVIDENCE");

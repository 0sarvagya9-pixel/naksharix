import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source=path=>readFileSync(path,"utf8");
const worker=source("lib/ops/backup-worker.ts");
const runner=source("lib/ops/daily-recovery.ts");
assert.ok(worker.includes("process.umask(0o077)") &&
  worker.includes("default_transaction_read_only=on") &&
  worker.includes("url.hostname !== process.env.BACKUP_EXPECTED_SOURCE_HOST"),
  "Recovery export must retain fixed source host, permissions and read-only safeguards");
for(const category of [
  "CONNECTION_URL", "HOST_MISMATCH", "CLIENT_MISSING",
  "AUTH", "PERMISSION", "DNS", "NETWORK", "VERSION",
  "PG_OPTIONS", "PG_DUMP", "ARCHIVE_FILE", "ARCHIVE_SIZE"
]) assert.ok(worker.includes("'"+category+"'"),"Diagnostic enum missing "+category);
assert.ok(worker.includes("BACKUP_EXPORT_CODE="),"Worker does not provide sanitized diagnostic status");
assert.ok(!worker.includes("console.error(result.stderr)"),"Never log raw pg_dump errors");
assert.ok(runner.includes("await dump.stderr()") && runner.includes("new Set(["),"Controller must strictly whitelist diagnostic values");
assert.ok(runner.includes("BACKUP_FAILED_") && runner.includes("readonly_export"),"Stage must still be reported fail-closed");
assert.ok(runner.includes("encrypted:true")&&runner.includes("privateStore:true")&&runner.includes("restored:true"),
  "Recovery receipt must represent real ciphertext storage and independent restore");
console.log("BACKUP_DIAGNOSTIC_QA=PASS;NO_RAW_SECRET_LOGGING=PASS;READONLY_PRODUCTION=PASS;RESTORE_GUARD_PRESERVED=PASS");

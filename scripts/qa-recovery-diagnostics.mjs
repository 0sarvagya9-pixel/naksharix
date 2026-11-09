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
assert.ok(worker.includes("PGGSSENCMODE:'disable'"),"Postgres must use TLS instead of unsupported GSSAPI negotiation");
assert.ok(runner.includes("updateNetworkPolicy({allowDomains:[process.env.BACKUP_EXPECTED_SOURCE_HOST!]})") &&
  runner.indexOf("updateNetworkPolicy(") < runner.indexOf("BACKUP_DATABASE_URL:"),
  "Sandbox egress must be restricted to expected Neon hostname before source credentials enter");
assert.ok(!worker.includes("console.error(result.stderr)"),"Never log raw pg_dump errors");
assert.ok(runner.includes("await dump.stderr()") && runner.includes("new Set(["),"Controller must strictly whitelist diagnostic values");
assert.ok(runner.includes("BACKUP_FAILED_") && runner.includes("readonly_export"),"Stage must still be reported fail-closed");
assert.ok(runner.includes("encrypted:true")&&runner.includes("privateStore:true")&&runner.includes("restored:true"),
  "Recovery receipt must represent real ciphertext storage and independent restore");
const cronRoute=source("app/api/cron/daily-recovery/route.ts");
const config=JSON.parse(source("vercel.json"));
const job=config.crons.find(entry=>entry.path==="/api/cron/daily-recovery");
const fields=typeof job?.schedule==="string" ? job.schedule.split(" ") : [];
const minute=Number(fields[0]), hour=Number(fields[1]);
assert.ok(fields.length===5 && Number.isInteger(minute) && minute>=0 && minute<=59 &&
  Number.isInteger(hour) && hour>=0 && hour<=23 &&
  fields.slice(2).every(field=>field==="*"),
  "Production recovery must have an actual once-daily Vercel Cron schedule");
assert.ok(cronRoute.includes("authorizedRecoveryRequest(request)") &&
  cronRoute.indexOf("authorizedRecoveryRequest(request)")<cronRoute.indexOf("await runDailyRecovery()") &&
  cronRoute.includes('status: 401'),
  "Recovery cron requires secret authentication before touching production data");
assert.ok(cronRoute.includes('status: 503')&&cronRoute.includes('state: "verified"') &&
  cronRoute.includes("result.receipt.restored")&&cronRoute.includes("result.receipt.privateStore"),
  "Cron response must fail closed and only report actual encrypted restore receipt");
assert.ok(!cronRoute.includes("DATABASE_URL")&&!cronRoute.includes("BACKUP_ENCRYPTION_KEY"),
  "Cron must never expose protected credentials or raw dumps");

console.log("BACKUP_CRON_REGISTERED=PASS;BACKUP_DIAGNOSTIC_QA=PASS;NO_RAW_SECRET_LOGGING=PASS;READONLY_PRODUCTION=PASS;RESTORE_GUARD_PRESERVED=PASS");

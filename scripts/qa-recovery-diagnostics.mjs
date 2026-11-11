import { spawnSync } from "node:child_process";
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
  "PG_OPTIONS", "PG_DUMP", "ARCHIVE_FILE", "ARCHIVE_SIZE", "TLS", "LOCK_TIMEOUT", "QUERY_TIMEOUT", "CLIENT_TIMEOUT", "CONNECT_PROBE", "READONLY_GUARD"
]) assert.ok(worker.includes("'"+category+"'"),"Diagnostic enum missing "+category);
assert.ok(worker.includes("BACKUP_EXPORT_CODE="),"Worker does not provide sanitized diagnostic status");
assert.ok(worker.includes("SELECT current_setting('transaction_read_only')") &&
  worker.includes("String(probe.stdout || '').trim()!=='on'") &&
  worker.includes("PGGSSENCMODE:'disable'"),
  "Neon export must prove a read-only TLS connection before pg_dump");
assert.ok(worker.includes("for (let attempt=0; attempt<2; attempt++)") &&
  worker.includes("'NETWORK','DNS','CLIENT_TIMEOUT'") &&
  worker.includes("timeout:110000"),
  "Transient source-connect retries are bounded and archive export has an explicit deadline");
assert.ok(runner.includes("timeoutMs:150000") && runner.includes("timeout:285000") &&
  runner.includes("sudo:true,timeoutMs:60000") && runner.includes("timeoutMs:55000"),
  "Sandbox and worker deadlines must permit bounded cold-start retry");
assert.ok(worker.includes("PGGSSENCMODE:'disable'"),"Postgres must use TLS instead of unsupported GSSAPI negotiation");
assert.ok(runner.includes("region:'iad1'") && !runner.includes("region:'bom1'"),
  "Encrypted recovery sandbox must run in same US East region as Neon source");
assert.ok(runner.includes("updateNetworkPolicy({allow:[process.env.BACKUP_EXPECTED_SOURCE_HOST!]})") &&
  runner.indexOf("updateNetworkPolicy(") < runner.indexOf("BACKUP_DATABASE_URL:"),
  "Sandbox egress must be restricted to expected Neon hostname before source credentials enter");
assert.ok(!worker.includes("console.error(result.stderr)"),"Never log raw pg_dump errors");
assert.ok(runner.includes("await dump.stderr()") && runner.includes("new Set(["),"Controller must strictly whitelist diagnostic values");
assert.ok(runner.includes("BACKUP_FAILED_") && runner.includes("readonly_export"),"Stage must still be reported fail-closed");
assert.ok(runner.includes("BACKUP_FAILED_SANDBOX_QUOTA_EXHAUSTED") &&
  runner.includes("providerError?.response?.status===402") &&
  runner.includes("providerError?.code==='payment_required'"),
  "Monthly Hobby Sandbox usage exhaustion must be distinguished from database failure without logging provider secrets");
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

if (process.platform !== "win32") {
 const run=spawnSync(process.execPath,["scripts/qa-backup-worker-fixtures.mjs"],{encoding:"utf8",timeout:40000,maxBuffer:1048576});
 assert.equal(run.status,0,"Backup runtime fixture suite must pass");
 process.stdout.write(run.stdout||"");
}
// Owner-controlled manual backup verification must never create a public
// unauthenticated export route or claim success without a real restore receipt.
const ownerRoute=source("app/api/admin/ops/run-recovery/route.ts");
const ownerPage=source("app/admin/operations/page.tsx");
const control=source("components/admin/manual-encrypted-recovery-control.tsx");
const ownerGate=source("lib/ops/owner-recovery-authorization.ts");
assert.ok(ownerRoute.includes("getAdminApiUser()")&&
  ownerRoute.includes("await isOwnerRecoveryOperator(admin)")&&
  ownerRoute.indexOf("await isOwnerRecoveryOperator(admin)")<ownerRoute.indexOf("await runDailyRecovery()"),
  "Manual recovery requires current owner identity BEFORE source access");
assert.ok(ownerRoute.includes('z.literal("RUN_VERIFIED_RECOVERY")') &&
  ownerRoute.includes('request.headers.get("origin") !== new URL(request.url).origin') &&
  ownerRoute.includes('export const maxDuration = 300'),
  "Manual operation must require confirmation, same-origin CSRF, bounded function duration");
assert.ok(ownerRoute.includes("pg_advisory_xact_lock(")&&
  ownerRoute.includes("adminActionLog.count")&&
  ownerRoute.includes("attempts>=3")&&ownerRoute.includes("adminActionLog.create"),
  "Cross-instance owner attempts must be logged and rate-limited");
assert.ok(ownerRoute.includes("await recoveryHealth()")&&
  ownerRoute.includes('throw new Error("BACKUP_RECEIPT_NOT_VERIFIED")')&&
  ownerRoute.includes("proof.restoreVerified!==true")&&
  ownerRoute.includes("proof.encrypted!==true"),
  "Manual recovery cannot claim success without fresh independent restore");
assert.ok(ownerGate.includes('user.role === "SUPER_ADMIN"')&&
  ownerGate.includes("process.env.ADMIN_EMAIL") &&
  ownerGate.includes("admins===1") && ownerGate.includes("prisma.user.count"),
  "Run privilege restricted to SUPER_ADMIN or the configured owner mailbox");
assert.ok(control.includes('secureFetch("/api/admin/ops/run-recovery"')&&
  control.includes('"/api/ops/backup-status"')&&
  control.includes("RUN_VERIFIED_RECOVERY")&&
  ownerPage.includes("ownerAccess ? <ManualEncryptedRecoveryControl"),
  "Owner-only control must use protected CSRF request and independently check verification state");

console.log("BACKUP_CRON_REGISTERED=PASS;BACKUP_DIAGNOSTIC_QA=PASS;NO_RAW_SECRET_LOGGING=PASS;READONLY_PRODUCTION=PASS;RESTORE_GUARD_PRESERVED=PASS");

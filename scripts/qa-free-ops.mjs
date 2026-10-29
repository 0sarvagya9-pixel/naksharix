import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkPublicEndpoints } from "./ops/check-public-endpoints.mjs";

const read = path => readFileSync(path, "utf8");
const healthy = body => new Response(body, {status:200});
const fakeFetch = async url => {
  const path = new URL(url).pathname;
  if (path === "/api/health") return healthy(JSON.stringify({data:{status:"ok",checks:{app:"ok",database:"ok"}}}));
  if (path === "/api/release") return healthy(JSON.stringify({data:{environment:"production",branch:"complete-production-polish",commitSha:"a".repeat(40)}}));
  if (path === "/ads.txt") return healthy("google.com, pub-7848529669366564, DIRECT, f08c47fec0942fa0");
  return healthy("<html><body>"+("Naksharix authentic educational content ".repeat(35))+"</body></html>");
};
assert.equal((await checkPublicEndpoints(fakeFetch)).passed, true, "Valid site rejected");
const wrongSeller = await checkPublicEndpoints(async url =>
  new URL(url).pathname === "/ads.txt" ? healthy("google.com, pub-INVALID, DIRECT, f08c47fec0942fa0") : fakeFetch(url));
assert.equal(wrongSeller.passed,false,"Wrong advertising seller wrongly accepted");
const failingDatabase = await checkPublicEndpoints(async url =>
  new URL(url).pathname === "/api/health" ? healthy(JSON.stringify({data:{status:"degraded",checks:{app:"ok",database:"error"}}})) : fakeFetch(url));
assert.equal(failingDatabase.passed,false,"Database outage wrongly accepted");
const workflow = read(".github/workflows/free-public-uptime.yml");
const backup = read(".github/workflows/free-encrypted-db-backup.yml");
for(const required of ["schedule:","workflow_dispatch:","issues: write","gh issue create","gh issue close","check-public-endpoints.mjs"])
  assert.ok(workflow.includes(required), "Monitor missing: "+required);
for(const required of ["schedule:","workflow_dispatch:","secrets.BACKUP_DATABASE_URL","vars.BACKUP_AGE_RECIPIENT","postgres:17-alpine","age -r","retention-days: 7","if-no-files-found: error","set -euo pipefail"])
  assert.ok(backup.includes(required),"Encrypted-backup guard missing: "+required);
assert.ok(backup.includes("encrypted-backup/*.dump.age") && !backup.includes("encrypted-backup/*.dump\n"),
  "Only ciphertext may be uploaded");
assert.ok(!backup.includes("actions/cache"),"No production database caching");
assert.ok(read("scripts/ops/check-public-endpoints.mjs").includes("AbortSignal.timeout"),"Network timeout missing");
console.log("FREE_OPS_SOURCE_QA=PASS;OUTAGE_DETECTION=PASS;ENCRYPTED_ONLY=PASS;NO_FAKE_CONFIG=PASS");

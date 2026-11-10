import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {checkEncryptedRecovery} from "./ops/check-encrypted-recovery.mjs";
const read=f=>readFileSync(f,"utf8");
const time=Date.parse("2026-11-10T11:00:00Z");
const good={configured:true,operational:true,encrypted:true,restoreVerified:true,
  retentionDays:7,lastSuccessfulAt:new Date(time-2*3600000).toISOString()};
const respond=(status,data)=>async()=>({status,json:async()=>({data})});
assert.equal((await checkEncryptedRecovery(respond(200,good),time)).passed,true);
for(const [label,fetcher,reason] of [
  ["missing receipt",respond(503,{reason:"fresh_verified_receipt_missing"}),"STATUS_503"],
  ["unverified",respond(200,{...good,restoreVerified:false}),"UNVERIFIED_BACKUP"],
  ["stale",respond(200,{...good,lastSuccessfulAt:new Date(time-37*3600000).toISOString()}),"STALE_RECEIPT"],
  ["future",respond(200,{...good,lastSuccessfulAt:new Date(time+600000).toISOString()}),"FUTURE_TIMESTAMP"],
  ["malformed",async()=>({status:200,json:async()=>{throw Error("bad");}}),"INVALID_JSON"],
  ["offline",async()=>{throw Error("offline");},"FETCH_UNAVAILABLE"]
]){
  const result=await checkEncryptedRecovery(fetcher,time);
  assert.equal(result.passed,false,label);assert.equal(result.reason,reason,label);
}
const watcher=read(".github/workflows/encrypted-recovery-watch.yml");
const manual=read(".github/workflows/free-encrypted-db-backup.yml");
assert.ok(watcher.includes("cron: '17 6 * * *'")&&watcher.includes("check-encrypted-recovery.mjs"),
  "GitHub must check actual encrypted receipt after production Vercel Cron");
assert.ok(watcher.includes("issues: write")&&watcher.includes("gh issue create")&&watcher.includes("gh issue close"),
  "Watch must surface missing backup without claiming success");
assert.ok(manual.includes("workflow_dispatch:")&&!manual.includes("  schedule:"),
  "Independent GitHub encrypted export stays manual until required protected secrets are provisioned");
console.log("NAKSHARIX_RECOVERY_WATCH_FIXTURES=7/7_PASS;CANNOT_FAKE_SUCCESS=PASS");

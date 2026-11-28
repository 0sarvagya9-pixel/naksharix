import assert from "node:assert/strict";import {verifyRecoveryReceipt,receiptIsFresh,readRestoreCounts,sameRecoveryProof} from "../lib/ops/recovery-receipt.ts";
const key="a".repeat(16),day="2026-11-24",now=Date.parse(day+"T12:00:00Z"),max=64*1024*1024+64;
const good={version:1,day,completedAt:day+"T03:30:00.000Z",bytes:1000,sha256:"b".repeat(64),keyFingerprint:key,encrypted:true,privateStore:true,restored:true,tables:43,indexes:100,foreignKeys:40,emailAccepted:false};
const check=x=>verifyRecoveryReceipt(x,day,key,now,max);
assert.ok(check(good));assert.ok(receiptIsFresh(good,now));
for(const patch of [{completedAt:day+"T13:00:00.000Z"},{completedAt:"bad"},{day:"2026-11-25"},{bytes:0},{bytes:max+1},{indexes:99},{foreignKeys:39},{restored:false},{keyFingerprint:"c".repeat(16)},{emailAccepted:"false"}])assert.equal(check({...good,...patch}),null);
assert.equal(receiptIsFresh(good,Date.parse(good.completedAt)+36*3600000),false);
assert.equal(receiptIsFresh(good,Date.parse(good.completedAt)-1),false);
console.log("RECOVERY_RECEIPT_CONTRACT_PASS");

const minimum={tables:43,indexes:100,foreignKeys:40};
assert.deepEqual(readRestoreCounts({...minimum,restored:false,sha256:"wrong",emailAccepted:true,day:"wrong"}),minimum);
for(const invalid of [null,[],{}, {tables:43}, {...minimum,tables:42},{...minimum,indexes:99},{...minimum,foreignKeys:39},{...minimum,indexes:"100"},{...minimum,tables:43.5},{...minimum,indexes:NaN},{...minimum,foreignKeys:Infinity},{...minimum,tables:Number.MAX_SAFE_INTEGER+1}])assert.equal(readRestoreCounts(invalid),null);
assert.ok(sameRecoveryProof(good,{...good,emailAccepted:true}));
for(const patch of [{day:"2026-11-25"},{completedAt:day+"T04:00:00.000Z"},{sha256:"c".repeat(64)},{bytes:1001},{tables:44},{indexes:101},{foreignKeys:41},{keyFingerprint:"d".repeat(16)}])assert.equal(sameRecoveryProof(good,{...good,...patch}),false);
assert.equal(verifyRecoveryReceipt({...good,day:"2026-02-30",completedAt:"2026-03-02T03:30:00.000Z"},"2026-02-30",key,Date.parse("2026-03-02T12:00:00Z"),max),null);
console.log("RESTORE_COUNTS_AND_READBACK_PROOF_CONTRACT_PASS");

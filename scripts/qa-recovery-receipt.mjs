import assert from "node:assert/strict";import {verifyRecoveryReceipt,receiptIsFresh} from "../lib/ops/recovery-receipt.ts";
const key="a".repeat(16),day="2026-11-24",now=Date.parse(day+"T12:00:00Z"),max=64*1024*1024+64;
const good={version:1,day,completedAt:day+"T03:30:00.000Z",bytes:1000,sha256:"b".repeat(64),keyFingerprint:key,encrypted:true,privateStore:true,restored:true,tables:43,indexes:100,foreignKeys:40,emailAccepted:false};
const check=x=>verifyRecoveryReceipt(x,day,key,now,max);
assert.ok(check(good));assert.ok(receiptIsFresh(good,now));
for(const patch of [{completedAt:day+"T13:00:00.000Z"},{completedAt:"bad"},{day:"2026-11-25"},{bytes:0},{bytes:max+1},{indexes:99},{foreignKeys:39},{restored:false},{keyFingerprint:"c".repeat(16)},{emailAccepted:"false"}])assert.equal(check({...good,...patch}),null);
assert.equal(receiptIsFresh(good,Date.parse(good.completedAt)+36*3600000),false);
assert.equal(receiptIsFresh(good,Date.parse(good.completedAt)-1),false);
console.log("RECOVERY_RECEIPT_CONTRACT_PASS");

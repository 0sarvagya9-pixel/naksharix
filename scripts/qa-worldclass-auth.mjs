import assert from "node:assert/strict";
import {createResetToken,validResetToken,passwordResetDigest,resetRoleEligible,resetSessionIsStale} from "../lib/auth/password-reset-contract.ts";
const tokens=Array.from({length:100},()=>createResetToken());
assert.equal(new Set(tokens).size,100);assert.ok(tokens.every(validResetToken));
assert.equal(validResetToken("000000"),false);
assert.throws(()=>passwordResetDigest(tokens[0],"short"));
const secret="development-only-secret-for-test-123456789";
assert.equal(passwordResetDigest(tokens[0],secret),passwordResetDigest(tokens[0],secret));
assert.notEqual(passwordResetDigest(tokens[0],secret),passwordResetDigest(tokens[1],secret));
assert.ok(["USER","ASTROLOGER","CONSULTANT"].every(resetRoleEligible));
assert.ok(["ADMIN","SUPER_ADMIN","MODERATOR"].every(x=>!resetRoleEligible(x)));
assert.equal(resetSessionIsStale(100,101),true);
assert.equal(resetSessionIsStale(101,101),true);
assert.equal(resetSessionIsStale(102,101),false);
assert.equal(resetSessionIsStale(NaN,101),true);
console.log("WORLDCLASS_PASSWORD_RESET_CONTRACT=PASS;100_UNIQUE_TOKENS;ROLE_AND_SESSION_GUARDS");

import {passwordRecoveryCopy,recoveryErrorKey,recoveryPasswordLengthValid} from "../lib/auth/password-recovery-copy.ts";
const recoveryKeys=Object.keys(passwordRecoveryCopy.en).sort();
for(const locale of ["hi","hinglish"]){
 assert.deepEqual(Object.keys(passwordRecoveryCopy[locale]).sort(),recoveryKeys);
 assert.ok(Object.values(passwordRecoveryCopy[locale]).every(x=>typeof x==="string"&&x.trim().length>0));
}
assert.equal(recoveryErrorKey(400,"confirm"),"invalid");
assert.equal(recoveryErrorKey(422,"request"),"input");
assert.equal(recoveryErrorKey(429,"request"),"rate");
assert.equal(recoveryErrorKey(503,"confirm"),"unavailable");
assert.equal(recoveryPasswordLengthValid("a".repeat(72)),true);
assert.equal(recoveryPasswordLengthValid("a".repeat(73)),false);
assert.equal(recoveryPasswordLengthValid("क".repeat(25)),false);
assert.equal(recoveryPasswordLengthValid("क".repeat(24)),true);
assert.equal(recoveryPasswordLengthValid("short"),false);
console.log("PASSWORD_RECOVERY_LOCALIZATION_CONTRACT_PASS");


import {authFormCopy,authFormErrorKey,authResponseConfirmed} from "../lib/auth/auth-form-copy.ts";
const formKeys=Object.keys(authFormCopy.en).sort();
for(const locale of ["en","hi","hinglish"]){
  assert.deepEqual(Object.keys(authFormCopy[locale]).sort(),formKeys);
  assert.ok(Object.values(authFormCopy[locale]).every(v=>typeof v==="string"&&v.trim().length>0));
}
for(const [status,mode,professional,expected] of [
  [401,"login",false,"credentials"],[403,"login",true,"role"],[403,"login",false,"failed"],
  [409,"signup",false,"existing"],[400,"signup",false,"input"],[422,"login",false,"input"],
  [429,"signup",false,"rate"],[503,"login",false,"unavailable"],[500,"login",false,"failed"],
  [200,"login",false,"failed"]
]) assert.equal(authFormErrorKey(status,mode,professional),expected);
for(const effectiveRole of ["USER","ASTROLOGER","CONSULTANT","ADMIN"]) assert.equal(authResponseConfirmed("login",{data:{user:{id:"fixture",effectiveRole}}}),true);
for(const effectiveRole of ["SUPER_ADMIN","MODERATOR",null,["USER"],undefined]) assert.equal(authResponseConfirmed("login",{data:{user:{id:"fixture",effectiveRole}}}),false);
for(const value of [null,{},[],{data:{user:{id:"",effectiveRole:"USER"}}},{data:{user:{id:42,effectiveRole:"USER"}}}]) assert.equal(authResponseConfirmed("login",value),false);
assert.equal(authResponseConfirmed("signup",{data:{user:{id:"fixture"},verificationRequired:true}}),true);
assert.equal(authResponseConfirmed("signup",{data:{user:{id:"fixture"},verificationRequired:false}}),false);
assert.equal(authResponseConfirmed("signup",{data:{user:{id:"fixture"},verificationRequired:"true"}}),false);
console.log("AUTH_FORM_RESPONSE_AND_LOCALIZATION_CONTRACT_PASS");

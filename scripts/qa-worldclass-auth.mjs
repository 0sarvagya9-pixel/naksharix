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

import {otpRequestAccepted,otpVerificationConfirmed} from "../lib/auth/otp-response-contract.ts";
import {authPageCopy} from "../lib/auth/auth-page-copy.ts";
for(const locale of ["en","hi","hinglish"]){
  assert.deepEqual(Object.keys(authPageCopy[locale]).sort(),Object.keys(authPageCopy.en).sort());
  assert.ok(Object.values(authPageCopy[locale]).every(v=>typeof v==="string"&&v.trim().length>0));
}
assert.equal(otpRequestAccepted({data:{accepted:true}}),true);
for(const value of [null,{},[],{data:null},{data:{accepted:"true"}},{data:{accepted:false}},{accepted:true}])assert.equal(otpRequestAccepted(value),false);
const user={id:"fixture",email:"fixture@example.invalid",effectiveRole:"USER"};
const ack={data:{verified:true,user}};
assert.equal(otpVerificationConfirmed(ack,user.email),true);
assert.equal(otpVerificationConfirmed(ack," FIXTURE@example.invalid "),true);
for(const role of ["ASTROLOGER","CONSULTANT","ADMIN"])assert.equal(otpVerificationConfirmed({data:{verified:true,user:{...user,effectiveRole:role}}},user.email),true);
for(const value of [null,{},[],{data:null},{data:{verified:false,user}},{data:{verified:"true",user}},{data:{verified:true,user:null}},{data:{verified:true,user:{...user,id:""}}},{data:{verified:true,user:{...user,id:7}}},{data:{verified:true,user:{...user,email:"other@example.invalid"}}},{data:{verified:true,user:{...user,email:7}}},{data:{verified:true,user:{...user,effectiveRole:["USER"]}}},{data:{verified:true,user:{...user,effectiveRole:"UNKNOWN"}}}])assert.equal(otpVerificationConfirmed(value,user.email),false);
assert.equal(otpVerificationConfirmed({data:{verified:true,user:{...user,email:""}}},""),false);
console.log("OTP_ACK_IDENTITY_AND_AUTH_PAGE_LOCALE_CONTRACT_PASS");

import {isUnchangedCredential,sanitizeString} from "../lib/security/sanitize.ts";
for (const value of ["Secur3!Pass", "ordinary space inside", "कुंडली!2026", "A&B!<1234"]) assert.equal(isUnchangedCredential(value),true);
for (const value of [" password123", "password123 ", "<script>password123</script>", "javascript:password123", "abc onclick='x' pass123", null, 123]) assert.equal(isUnchangedCredential(value),false);
assert.equal(sanitizeString(" password123 "),"password123"); // preserve legacy login normalization
console.log("NEW_PASSWORD_NO_SILENT_NORMALIZATION_CONTRACT_PASS");

import {professionalApplicationCopy,professionalApplicationAcknowledged} from "../lib/auth/professional-application-copy.ts";
for(const locale of ["en","hi","hinglish"]){assert.deepEqual(Object.keys(professionalApplicationCopy[locale]),Object.keys(professionalApplicationCopy.en));assert.ok(Object.values(professionalApplicationCopy[locale]).every(v=>v.trim()));}
for(const role of ["ASTROLOGER","CONSULTANT"]){
 const data={role,effectiveRole:role,redirectTo:"/astrologer/profile",isAdminLogin:false,canBypassPayment:false};
 assert.equal(professionalApplicationAcknowledged({data},role),true);
 for(const patch of [{role:"USER"},{effectiveRole:"ADMIN"},{redirectTo:"https://example.invalid"},{isAdminLogin:true},{canBypassPayment:true},{canBypassPayment:undefined}])assert.equal(professionalApplicationAcknowledged({data:{...data,...patch}},role),false);
}
console.log("PROFESSIONAL_APPLICATION_ACK_CONTRACT_PASS");

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
import {randomUUID,createHmac} from "node:crypto";
const db=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
assert.equal(process.env.CI,"true");
assert.ok(["postgresql:","postgres:"].includes(db.protocol)&&["localhost","127.0.0.1"].includes(db.hostname)&&db.port==="5432"&&db.pathname==="/naksharix"&&db.username==="postgres","DISPOSABLE_DB_ONLY");
assert.notEqual(process.env.VERCEL_ENV,"production");assert.equal(process.env.EMAIL_PROVIDER,"disabled");
const run=randomUUID().replaceAll("-",""),mailbox="reset-"+run+"-owner@example.invalid",adminMailbox="reset-"+run+"-admin@example.invalid";
process.env.ADMIN_EMAIL=adminMailbox;process.env.NODE_ENV="test";
globalThis.fetch=async()=>{throw Error("EXTERNAL_NETWORK_FORBIDDEN");};
const require=createRequire(import.meta.url),ts=require("typescript"),messages=[];
let cookieClears=0,ready=true;
const oldResolve=Module._resolveFilename,oldLoad=Module._load;
Module._resolveFilename=function(name,...args){return oldResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){
 if(name==="server-only")return {};
 if(name==="@/lib/email/email-service")return {getEmailReadiness:()=>({emailEnabled:ready}),sendEmail:async message=>{assert.ok(message.to.endsWith("@example.invalid"));messages.push(message);return {sent:true,reason:"Isolated test only",missing:[]};}};
 if(name==="@/lib/auth/jwt")return {clearAuthCookie:async()=>{cookieClears++;}};
 return oldLoad.call(this,name,...args);
};
require.extensions[".ts"]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);};
const {prisma}=require("@/lib/db"),{env}=require("@/lib/env"),{hashPassword,verifyPassword}=require("@/lib/auth/password");
const {passwordResetDigest,validResetToken,PASSWORD_RESET_PURPOSE,PASSWORD_RESET_TTL_MS}=require("@/lib/auth/password-reset-contract");
const {POST:requestReset}=require("@/app/api/auth/password-reset/request/route"),{POST:confirmReset}=require("@/app/api/auth/password-reset/confirm/route");
const {claimPublicAuthQuota}=require("@/lib/auth/public-quota");
const ids=[],quotaTargets=new Set();let checks=0,ipCounter=0;
const secret=env.JWT_SECRET;
function quotaTarget(scope,key){quotaTargets.add(createHmac("sha256",secret).update("auth-quota-v1:"+scope+":"+key).digest("hex"));}
function req(route,body,key){
 const ip=key||"qa-reset-"+run+"-"+(++ipCounter);
 if(route==="request"){quotaTarget("password-reset-request-ip",ip);quotaTarget("password-reset-request-destination",body.email.toLowerCase().trim());}
 else quotaTarget("password-reset-confirm-ip",ip);
 return new Request("http://localhost:3000/api/auth/password-reset/"+route,{method:"POST",headers:{"content-type":"application/json","x-forwarded-for":ip},body:JSON.stringify(body)});
}
const oldPass="OldSynthetic!123",nextPass="NewSynthetic!456";
async function account(email,role="USER",verified=true,passwordHash=null){
 const row=await prisma.user.create({data:{email,name:"Synthetic reset QA",role,emailVerified:verified?new Date():null,passwordHash}});ids.push(row.id);return row;
}
const assertCheck=(condition,message)=>{assert.ok(condition,message);checks++;};
try{
 const oldHash=await hashPassword(oldPass);
 const owner=await account(mailbox,"USER",true,oldHash);
 const other=await account("reset-"+run+"-other@example.invalid","USER",true,oldHash);
 const admin=await account(adminMailbox,"ADMIN",true,oldHash);
 const unverified=await account("reset-"+run+"-unverified@example.invalid","USER",false,oldHash);
 const oauth=await account("reset-"+run+"-oauth@example.invalid");
 const expiry=new Date(Date.now()+86400000);
 const active=await prisma.session.create({data:{userId:owner.id,sessionToken:randomUUID(),expires:expiry,expiresAt:expiry}});
 const unrelated=await prisma.session.create({data:{userId:other.id,sessionToken:randomUUID(),expires:expiry,expiresAt:expiry}});
 for(const email of [admin.email,unverified.email,oauth.email,"reset-"+run+"-unknown@example.invalid"]){
   const response=await requestReset(req("request",{email}));assertCheck(response.status===200,"uniform response");assert.deepEqual(await response.json(),{data:{accepted:true}});
 }
 assertCheck(messages.length===0,"no email for privileged, unverified, OAuth-only or nonexistent account");
 ready=false;const unavailable=await requestReset(req("request",{email:other.email}));assertCheck(unavailable.status===503,"unconfigured email fails closed");ready=true;
 async function issue(){
  const before=messages.length;
  const response=await requestReset(req("request",{email:mailbox.toUpperCase()}));assert.equal(response.status,200);assert.deepEqual(await response.json(),{data:{accepted:true}});assert.equal(messages.length,before+1);
  const message=messages.at(-1);assert.equal(message.to,mailbox);
  const url=new URL(message.text.match(/https?:\/\/[^\s]+/)[0]);assert.equal(url.pathname,"/reset-password");assert.equal(url.search,"");
  const token=new URLSearchParams(url.hash.slice(1)).get("token");assert.ok(validResetToken(token));
  const rows=await prisma.otpToken.findMany({where:{userId:owner.id,purpose:PASSWORD_RESET_PURPOSE,consumedAt:null}});
  assert.equal(rows.length,1);assert.equal(rows[0].codeHash,passwordResetDigest(token,secret));assert.notEqual(rows[0].codeHash,token);
  assert.ok(rows[0].expiresAt.getTime()>Date.now());assert.ok(rows[0].expiresAt.getTime()<=Date.now()+PASSWORD_RESET_TTL_MS);
  return {token,id:rows[0].id};
 }
 const first=await issue(),second=await issue();assertCheck(first.token!==second.token,"rotation unique");
 assertCheck((await confirmReset(req("confirm",{token:first.token,password:nextPass}))).status===400,"superseded token denied");
 await prisma.otpToken.update({where:{id:second.id},data:{expiresAt:new Date(Date.now()-1000)}});
 assertCheck((await confirmReset(req("confirm",{token:second.token,password:nextPass}))).status===400,"expired token denied");
 const third=await issue();
 assertCheck((await confirmReset(req("confirm",{token:third.token,password:" "+nextPass}))).status===422,"silently normalized password rejected");
 const pair=await Promise.all([confirmReset(req("confirm",{token:third.token,password:nextPass})),confirmReset(req("confirm",{token:third.token,password:nextPass}))]);
 assert.deepEqual(pair.map(p=>p.status).sort(),[200,400]);assertCheck(cookieClears===1,"one atomic reset and one cookie clear");
 assertCheck((await confirmReset(req("confirm",{token:third.token,password:nextPass}))).status===400,"consumed token denied");
 const changed=await prisma.user.findUniqueOrThrow({where:{id:owner.id}});
 assertCheck(await verifyPassword(nextPass,changed.passwordHash),"new hash usable");
 assertCheck(!await verifyPassword(oldPass,changed.passwordHash),"old hash rejected");
 assertCheck(!!(await prisma.session.findUniqueOrThrow({where:{id:active.id}})).revokedAt,"old session revoked");
 assertCheck((await prisma.session.findUniqueOrThrow({where:{id:unrelated.id}})).revokedAt===null,"unrelated session retained");
 assertCheck(!!(await prisma.otpToken.findUniqueOrThrow({where:{id:third.id}})).consumedAt,"consumed marker durable");
 const denied=await requestReset(req("request",{email:mailbox}));assertCheck(denied.status===429,"fourth destination request denied");assertCheck(messages.length===3,"quota sent no extra message");
 const key="qa-concurrent-"+run;quotaTarget("password-reset-request-ip",key);
 const claims=await Promise.all(Array.from({length:7},()=>claimPublicAuthQuota({scope:"password-reset-request-ip",key,limit:6,windowSeconds:900})));
 assertCheck(claims.filter(Boolean).length===6&&claims.filter(x=>!x).length===1,"atomic IP quota");
 const rows=await prisma.auditLog.findMany({where:{targetId:{in:[...quotaTargets]}},select:{targetId:true,metadata:true}});
 assertCheck(rows.every(r=>/^[a-f0-9]{64}$/.test(r.targetId)&&r.metadata?.piiStored===false),"quota storage is digest only");
 console.log("PASSWORD_RESET_RUNTIME_PASS "+JSON.stringify({checks,mailAttempts:messages.length,atomicResetWinners:1,concurrentQuotaAttempts:7,quotaAdmitted:6,quotaDenied:1,oldSessionRevoked:true,unrelatedSessionPreserved:true,scope:"actual request/confirm handlers and disposable PostgreSQL; email and cookie adapters isolated; no external delivery or browser cookie proof"}));
}finally{await prisma.auditLog.deleteMany({where:{targetId:{in:[...quotaTargets]}}});for(const id of ids.reverse())await prisma.user.delete({where:{id}});await prisma.$disconnect();}

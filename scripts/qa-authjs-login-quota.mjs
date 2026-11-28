import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {createRequire} from "node:module";
import {fileURLToPath,pathToFileURL} from "node:url";
import * as crypto from "node:crypto";

// Actual installed Auth.js request processing and actual application handlers.
// Only configuration, persistence, email/cookies and the NextAuth wrapper are
// isolated; no provider request, production credential or real database is used.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(path.join(root,"package.json"));
const ts=require("typescript");
const {Auth}=await import(pathToFileURL(path.join(root,"node_modules/@auth/core/index.js")));
const {default:Credentials}=await import(pathToFileURL(path.join(root,"node_modules/@auth/core/providers/credentials.js")));
const env={ADMIN_EMAIL:"quota-admin@example.invalid",ADMIN_PASSWORD:"SyntheticOnly!493721",JWT_SECRET:"synthetic-shared-auth-quota-secret-with-at-least-32-bytes"};
const account={id:"synthetic-admin",email:env.ADMIN_EMAIL,name:"Synthetic Admin",role:"ADMIN"};
let config,clock=Date.now(),storageDown=false,comparisons=0,upserts=0,externalCalls=0,checks=0;
const counters=[],quotaInputs=[];
class FixtureDate extends Date {constructor(value){super(arguments.length?value:clock);}static now(){return clock;}}
const check=(condition,message)=>{assert.ok(condition,message);checks++;};
const db={
 async $transaction(work){if(storageDown)throw Error("SYNTHETIC_COUNTER_UNAVAILABLE");return work({
  $queryRaw:async()=>[{locked:""}],
  auditLog:{count:async({where})=>counters.filter(x=>x.action===where.action&&x.targetType===where.targetType&&x.targetId===where.targetId&&x.createdAt>=where.createdAt.gte).length,
   create:async({data})=>{const row={...data,createdAt:new Date(clock)};counters.push(row);return row;}}
 });},
 user:{upsert:async()=>{upserts++;return account;},findUnique:async()=>account,findFirst:async()=>null},
 otpToken:{findFirst:async()=>null}
};
const modules={
 "server-only":{},
 "node:crypto":{...crypto,timingSafeEqual:(...args)=>{comparisons++;return crypto.timingSafeEqual(...args);}},
 "next-auth":value=>{config=value;return {handlers:{},auth:()=>null,signIn:()=>null,signOut:()=>null};},
 "next-auth/providers/google":()=>{throw Error("GOOGLE_DISABLED_FOR_FIXTURE");},
 "next-auth/providers/credentials":Credentials,
 "@auth/prisma-adapter":{PrismaAdapter:()=>({})},
 "@prisma/client":{Role:{ADMIN:"ADMIN"}},
 "@/lib/db":{prisma:db},
 "@/lib/db-transient":{retryTransientDatabaseRead:work=>work()},
 "@/lib/env":{env},
 "@/lib/auth/password-reset-contract":{PASSWORD_RESET_PURPOSE:"PASSWORD_RESET",resetSessionIsStale:()=>false},
 "@/lib/auth/api-error-language":{authErrorResponses:()=>({fail:(error,status)=>Response.json({error},{status}),handleApiError:()=>Response.json({error:"unavailable"},{status:503})})},
 "@/lib/api":{ok:data=>Response.json({data}),validateJson:async request=>request.json()},
 "@/lib/validations/auth":{loginSchema:{}},
 "@/lib/auth/password":{verifyPassword:async()=>{throw Error("NO_CUSTOMER_PASSWORD_IN_FIXTURE");}},
 "@/lib/auth/jwt":{setAuthCookie:async()=>{throw Error("NO_CUSTOM_LOGIN_SUCCESS_IN_FIXTURE");}},
 "@/lib/auth/session":{createSession:async()=>{throw Error("NO_CUSTOM_LOGIN_SUCCESS_IN_FIXTURE");},revokeSession:async()=>{}}
};
function load(relative,extra={}){
 const source=fs.readFileSync(path.join(root,relative),"utf8");
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const compiled={exports:{}};
 vm.runInNewContext(js,{require:name=>{
  if(Object.hasOwn(modules,name))return modules[name];
  throw Error("UNEXPECTED_FIXTURE_IMPORT:"+name);
 },exports:compiled.exports,module:compiled,Buffer,Date,process:{env:{NODE_ENV:"test",VERCEL:"1"}},console,...extra},{filename:path.join(root,relative)});
 return compiled.exports;
}
const quota=load("lib/auth/public-quota.ts",{Date:FixtureDate});
modules["@/lib/auth/public-quota"]={...quota,claimPublicAuthQuota:input=>{quotaInputs.push(input);return quota.claimPublicAuthQuota(input);}};
load("auth.ts");
const {POST:customLogin}=load("app/api/auth/login/route.ts");
check(config?.providers?.length===1,"only the synthetic admin credentials provider is enabled");
const authConfig={...config,secret:"synthetic-auth-core-secret-more-than-32-bytes",trustHost:true,basePath:"/api/auth",useSecureCookies:false,logger:{error(){},warn(){},debug(){}}};
const originalFetch=globalThis.fetch;
globalThis.fetch=async()=>{externalCalls++;throw Error("EXTERNAL_REQUEST_FORBIDDEN");};
async function browser(){
 const response=await Auth(new Request("http://localhost:43127/api/auth/csrf"),authConfig);
 check(response.status===200,"actual Auth.js CSRF endpoint works");
 const {csrfToken}=await response.json();
 check(typeof csrfToken==="string"&&csrfToken.length>0,"actual CSRF token issued");
 return {csrfToken,cookie:response.headers.getSetCookie().map(x=>x.split(";")[0]).join("; ")};
}
async function callback(session,ip,password=env.ADMIN_PASSWORD,spoofedIp="203.0.113.211"){
 const response=await Auth(new Request("http://localhost:43127/api/auth/callback/admin-credentials",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded",cookie:session.cookie,"x-vercel-forwarded-for":ip,"x-forwarded-for":spoofedIp,origin:"http://localhost:43127"},body:new URLSearchParams({email:env.ADMIN_EMAIL,password,loginMode:"ADMIN",csrfToken:session.csrfToken,callbackUrl:"http://localhost:43127/admin"})}),authConfig);
 return {status:response.status,location:response.headers.get("location")||"",sessionIssued:response.headers.getSetCookie().some(x=>x.startsWith("authjs.session-token="))};
}
let result;
try{
 const first=await browser();const before=comparisons;
 for(let i=0;i<12;i++){
  const response=await callback(first,"198.51.100.10","X".repeat(env.ADMIN_PASSWORD.length-2)+String(i).padStart(2,"0"),"203.0.113."+(10+i));
  check(!response.sessionIssued&&response.location.includes("CredentialsSignin"),"wrong credentials rejected");
 }
 check(comparisons-before===8,"only first eight wrong passwords reach comparison; spoofed forwarded headers cannot reset quota");
 check(upserts===0,"invalid credentials cannot mutate the synthetic account");
 const second=await browser(),blocked=await callback(second,"198.51.100.10");
 check(!blocked.sessionIssued,"new CSRF/browser session cannot reset the same IP quota");
 check(comparisons-before===8,"over-quota correct password is not evaluated");
 const fresh=await callback(second,"198.51.100.11");
 check(fresh.sessionIssued&&upserts===1,"another client can log in normally");
 check(quotaInputs.every(x=>x.scope==="login-ip"&&x.limit===8&&x.windowSeconds===60),"Auth.js uses existing public login counter contract");
 for(let i=0;i<8;i++){
  const response=await customLogin(new Request("http://localhost:43127/api/auth/login",{method:"POST",headers:{"content-type":"application/json","x-vercel-forwarded-for":"198.51.100.12"},body:JSON.stringify({email:env.ADMIN_EMAIL,password:"CustomWrong!"+i,loginMode:"ADMIN"})}));
  check(response.status===401,"custom login retains invalid credential response");
 }
 const prior=comparisons;
 const shared=await callback(second,"198.51.100.12");
 check(!shared.sessionIssued&&comparisons===prior,"custom login quota also denies alternate Auth.js entry point");
 const customBlocked=await customLogin(new Request("http://localhost:43127/api/auth/login",{method:"POST",headers:{"content-type":"application/json","x-vercel-forwarded-for":"198.51.100.10"},body:JSON.stringify({email:env.ADMIN_EMAIL,password:env.ADMIN_PASSWORD,loginMode:"ADMIN"})}));
 check(customBlocked.status===429,"Auth.js attempts also consume custom login quota");
 storageDown=true;
 const failure=await callback(second,"198.51.100.13");
 check(!failure.sessionIssued&&comparisons===prior,"counter outage fails closed before password comparison");
 storageDown=false;clock+=60001;
 const renewed=await callback(second,"198.51.100.10");
 check(renewed.sessionIssued&&upserts===2,"same client can retry after the original 60-second window expires");
 check(externalCalls===0,"no external provider request occurred");
 check(counters.every(x=>/^[0-9a-f]{64}$/.test(x.targetId)&&x.metadata?.piiStored===false),"actual quota helper keeps keyed anonymous identifiers");
 result={checks,sourceSha256:crypto.createHash("sha256").update(fs.readFileSync(path.join(root,"auth.ts"))).digest("hex"),wrongRequests:12,passwordComparisonsBeforeQuota:8,sharedCounterBothDirections:true,newBrowserQuotaResetDenied:true,untrustedForwardedHeaderResetDenied:true,counterUnavailableFailsClosed:true,expiredWindowLoginWorks:true,externalRequests:externalCalls,scope:"Actual installed Auth.js core request handling, actual auth.ts authorization, public login handler and shared-quota implementation; synthetic in-memory persistence, configuration and cookie adapters; no production HTTP, real DB or provider proof"};
}finally{globalThis.fetch=originalFetch;}
if(process.env.NAKSHARIX_AUTH_QUOTA_QA_OUTPUT)fs.writeFileSync(process.env.NAKSHARIX_AUTH_QUOTA_QA_OUTPUT,JSON.stringify(result,null,2));
console.log("AUTHJS_LOGIN_QUOTA_PASS "+JSON.stringify(result));

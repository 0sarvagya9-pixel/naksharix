import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {createRequire} from "node:module";
import {fileURLToPath,pathToFileURL} from "node:url";
import * as crypto from "node:crypto";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(path.join(root,"package.json")),ts=require("typescript");
const core=await import(pathToFileURL(path.join(root,"node_modules/@auth/core/index.js")));
const {default:Credentials}=await import(pathToFileURL(path.join(root,"node_modules/@auth/core/providers/credentials.js")));
const origin="https://localhost:43127",legacyName="__Host-naksharix_session";
const env={ADMIN_EMAIL:"synthetic-logout@example.invalid",ADMIN_PASSWORD:"SyntheticOnly!842651",JWT_SECRET:"synthetic-logout-secret-with-more-than-32-bytes"};
const account={id:"synthetic-logout",email:env.ADMIN_EMAIL,name:"Synthetic "+"x".repeat(5000),role:"ADMIN"};
let config,authConfig,serverActions,legacyRevoked=false,forceAuthJsFailure=false,checks=0,externalCalls=0;
const jar=new Map(),calls=[];
const check=(value,message)=>{assert.ok(value,message);checks++;};
const cookieStore={get:name=>jar.has(name)?{name,value:jar.get(name)}:undefined,set:(name,value,options={})=>{
 calls.push({action:"cookie-set",name,deleted:options.maxAge===0});
 if(options.maxAge===0)jar.delete(name);else jar.set(name,value);
}};
function requestHeaders(){return new Headers({host:"localhost:43127","x-forwarded-host":"localhost:43127","x-forwarded-proto":"https",cookie:[...jar].map(([k,v])=>k+"="+v).join("; ")});}
function acceptCookies(response){for(const cookie of response.headers.getSetCookie()){
 const pair=cookie.split(";")[0],separator=pair.indexOf("="),name=pair.slice(0,separator),value=pair.slice(separator+1);
 if(/max-age=0(?:;|$)/i.test(cookie))jar.delete(name);else jar.set(name,value);
}}
const db={user:{upsert:async()=>account,findUnique:async()=>account,findFirst:async()=>account},otpToken:{findFirst:async()=>null},session:{findUnique:async()=>({revokedAt:legacyRevoked?new Date():null,expiresAt:new Date(Date.now()+3600000)}),updateMany:async()=>{calls.push({action:"legacy-revoke"});legacyRevoked=true;return {count:1};}}};
const modules={
 "server-only":{},"node:crypto":crypto,"@auth/core":core,
 "next/headers":{cookies:async()=>cookieStore,headers:async()=>requestHeaders()},
 "next/navigation":{redirect:()=>{throw Error("UNEXPECTED_REDIRECT");}},
 "next-auth":value=>{config=value;return {handlers:{},auth:()=>null,signIn:()=>null,signOut:()=>null};},
 "next-auth/providers/google":()=>{throw Error("GOOGLE_DISABLED_FOR_FIXTURE");},"next-auth/providers/credentials":Credentials,
 "@auth/prisma-adapter":{PrismaAdapter:()=>({})},"@prisma/client":{Role:{ADMIN:"ADMIN"}},
 "@/lib/db":{prisma:db},"@/lib/db-transient":{retryTransientDatabaseRead:work=>work()},"@/lib/env":{env},
 "@/lib/auth/password-reset-contract":{PASSWORD_RESET_PURPOSE:"PASSWORD_RESET",resetSessionIsStale:()=>false},
 "@/lib/auth/public-quota":{claimPublicAuthQuota:async()=>true,trustedPublicClientIp:()=>"198.51.100.41"},
 "@/lib/auth/token":{authCookieName:legacyName,signAuthToken:async()=>{throw Error("NOT_USED");},verifyAuthToken:async token=>token==="synthetic-legacy"?{...account,effectiveRole:"ASTROLOGER",isAdminLogin:true}:null,toEffectiveRole:role=>role},
 "@/lib/api":{ok:data=>Response.json({data}),handleApiError:()=>Response.json({error:"Could not confirm logout."},{status:500})}
};
function load(relative){
 const js=ts.transpileModule(fs.readFileSync(path.join(root,relative),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,allowJs:true}}).outputText;
 const compiled={exports:{}};
 vm.runInNewContext(js,{require:name=>{if(Object.hasOwn(modules,name))return modules[name];throw Error("UNEXPECTED_FIXTURE_IMPORT:"+name);},module:compiled,exports:compiled.exports,Buffer,Headers,Request,URLSearchParams,Date,process:{env:{NODE_ENV:"production",NEXTAUTH_URL:origin}},console},{filename:path.join(root,relative)});
 return compiled.exports;
}
load("auth.ts");
authConfig={...config,secret:"synthetic-auth-core-logout-secret-more-than-32-bytes",trustHost:true,basePath:"/api/auth",useSecureCookies:true,logger:{error(){},warn(){},debug(){}}};
serverActions=load("node_modules/next-auth/lib/actions.js");
async function authSession(){const response=await core.Auth(new Request(origin+"/api/auth/session",{headers:requestHeaders()}),authConfig);return response.json();}
modules["@/auth"]={auth:authSession,signOut:async options=>{calls.push({action:"authjs-signout",redirect:options?.redirect});if(forceAuthJsFailure)throw Error("SYNTHETIC_AUTHJS_FAILURE");return serverActions.signOut(options,authConfig);}};
modules["@/lib/auth/session"]=load("lib/auth/session.ts");
modules["@/lib/auth/jwt"]=load("lib/auth/jwt.ts");
const {getCurrentUser}=modules["@/lib/auth/jwt"];
const {POST:logout}=load("app/api/auth/logout/route.ts");
async function createAuthJsSession(){
 const csrfResponse=await core.Auth(new Request(origin+"/api/auth/csrf"),authConfig);acceptCookies(csrfResponse);
 const {csrfToken}=await csrfResponse.json();
 const headers=requestHeaders();headers.set("content-type","application/x-www-form-urlencoded");
 const response=await core.Auth(new Request(origin+"/api/auth/callback/admin-credentials",{method:"POST",headers,body:new URLSearchParams({email:env.ADMIN_EMAIL,password:env.ADMIN_PASSWORD,loginMode:"ASTROLOGER",csrfToken,callbackUrl:origin+"/astrologer/dashboard"})}),authConfig);
 acceptCookies(response);
 check([...jar.keys()].filter(x=>x.startsWith("__Secure-authjs.session-token.")).length>=2,"actual Auth.js emitted a chunked secure session cookie");
 check((await authSession())?.user?.effectiveRole==="ASTROLOGER","real Auth.js session can access the practitioner role");
}
const originalFetch=globalThis.fetch;globalThis.fetch=async()=>{externalCalls++;throw Error("EXTERNAL_REQUEST_FORBIDDEN");};
const observations=[];
try{
 for(const kind of ["authjs-only","legacy-only","both","none"]){
  jar.clear();calls.length=0;legacyRevoked=false;
  if(kind==="authjs-only"||kind==="both")await createAuthJsSession();
  if(kind==="legacy-only"||kind==="both")jar.set(legacyName,"synthetic-legacy");
  const before=await getCurrentUser();check(Boolean(before)===(kind!=="none"),"initial session matches fixture");
  const response=await logout(),body=await response.json(),after=await getCurrentUser();
  const observation={kind,status:response.status,acknowledged:body?.data?.loggedOut===true,authenticatedBefore:Boolean(before),authenticatedAfter:Boolean(after),remainingAuthJsChunks:[...jar.keys()].filter(x=>x.includes("authjs.session-token")).length,legacyCookieRemaining:jar.has(legacyName),legacyRevoked};observations.push(observation);
  if(after)console.log("DUAL_SESSION_LOGOUT_DEFECT "+JSON.stringify(observation));
  check(response.status===200&&body?.data?.loggedOut===true,"logout acknowledges both session operations");
  check(after===null,"confirmed logout prevents actual getCurrentUser Auth.js fallback");
  check(observation.remainingAuthJsChunks===0&&!observation.legacyCookieRemaining,"all secure cookie chunks and legacy cookie removed");
  if(kind==="legacy-only"||kind==="both")check(legacyRevoked,"legacy server session revoked");
  const repeated=await logout();check(repeated.status===200&&(await repeated.json()).data.loggedOut===true,"no-session logout remains idempotent");
 }
 jar.clear();legacyRevoked=false;await createAuthJsSession();forceAuthJsFailure=true;
 const failed=await logout(),failedBody=await failed.json();
 check(failed.status===500&&failedBody?.data?.loggedOut!==true,"Auth.js failure cannot acknowledge full logout");
 check(Boolean(await getCurrentUser()),"failed Auth.js logout is retained as an unconfirmed active session");
 forceAuthJsFailure=false;const recovered=await logout();check(recovered.status===200&&await getCurrentUser()===null,"explicit retry clears the retained session");
 check(externalCalls===0,"no provider requests occurred");
}finally{globalThis.fetch=originalFetch;}
const result={checks,observations,secureChunkedCookieCoverage:true,actualInstalledAuthJsServerSignOut:true,failedSignOutAcknowledged:false,idempotentNoSession:true,externalRequests:externalCalls,scope:"Actual auth.ts callbacks, installed Auth.js core/server signOut action, application logout handler and getCurrentUser; synthetic configuration, in-memory DB and Next request/cookie adapters; no production login or external provider request"};
if(process.env.NAKSHARIX_LOGOUT_QA_OUTPUT)fs.writeFileSync(process.env.NAKSHARIX_LOGOUT_QA_OUTPUT,JSON.stringify(result,null,2));
console.log("DUAL_SESSION_LOGOUT_PASS "+JSON.stringify(result));

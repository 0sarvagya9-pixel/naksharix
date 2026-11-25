import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
import {randomUUID} from "node:crypto";
const db=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
assert.equal(process.env.CI,"true");
assert.ok(["postgresql:","postgres:"].includes(db.protocol)&&["localhost","127.0.0.1"].includes(db.hostname)&&db.port==="5432"&&db.pathname==="/naksharix"&&db.username==="postgres","DISPOSABLE_DB_ONLY");
assert.notEqual(process.env.VERCEL_ENV,"production");
assert.equal(process.env.EMAIL_PROVIDER,"disabled");
process.env.NODE_ENV="test";
process.env.ASTROLOGY_PROVIDER="own_engine";
process.env.B2B_INTEGRATION_ENABLED="true";
globalThis.fetch=async()=>{throw Error("EXTERNAL_NETWORK_FORBIDDEN");};
const require=createRequire(import.meta.url),ts=require("typescript");
const originalResolve=Module._resolveFilename,originalLoad=Module._load;
Module._resolveFilename=function(name,...args){return originalResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){if(name==="server-only")return {};return originalLoad.call(this,name,...args);};
require.extensions[".ts"]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);};
const {prisma}=require("@/lib/db"),ledger=require("@/lib/business-integrations/ledger"),{tenantSchema,keySchema,businessCalculationSchema}=require("@/lib/business-integrations/input");
const {calculateBusinessResult}=require("@/lib/business-integrations/calculate"),{businessScopes,usagePeriod}=require("@/lib/business-integrations/contract");
const {issueWidgetGrant,readWidgetGrant}=require("@/lib/business-integrations/widget-grant");
const widgetRoute=require("@/app/api/partner/v1/widget/route");
const calculateRoute=require("@/app/api/partner/v1/calculate/route");
const ids=[];const run=randomUUID();
const verified=new Date(),expires=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
const birth={date:"1992-05-18",time:"08:15",latitude:28.6139,longitude:77.209,offsetMinutes:330};
const second={date:"1991-11-23",time:"17:20",latitude:19.076,longitude:72.8777,offsetMinutes:330};
const location={date:"2026-11-25",latitude:28.6139,longitude:77.209,offsetMinutes:330};
const fixture=(scope,requestId=randomUUID())=>({requestId,scope,...(scope==="chart"?{subjectPermission:true,birth}:scope==="matching"?{subjectPermission:true,first:birth,second}:{location})});
try{
 assert.equal(await ledger.businessSchemaReady(),true);
 async function user(suffix,role="USER"){const u=await prisma.user.create({data:{name:"QA synthetic "+suffix,email:"b2b-"+run+"-"+suffix+"@example.invalid",emailVerified:verified,role}});ids.push(u.id);return u;}
 const admin=await user("admin","SUPER_ADMIN"),owner=await user("owner"),other=await user("other");
 const request=tenantSchema.parse({ownerEmail:owner.email,displayName:"Synthetic partner",brandName:"QA <partner>",contractReference:"QA "+run,contractExpiresAt:expires,monthlyUnitLimit:8,unitPricePaise:100,scopes:[...businessScopes],ownerConfirmed:true});
 const tenant=await ledger.createTenant(admin.id,request);
 assert.ok(tenant);
 assert.equal(await ledger.createTenant(admin.id,request),null,"duplicate contract");
 assert.equal((await ledger.ownedBusinessTenants(other.id)).length,0);
 assert.ok((await ledger.ownedBusinessTenants(owner.id)).some(t=>t.id===tenant.id));
 const issue=(userId,scopes)=>ledger.issueBusinessKey(userId,keySchema.parse({tenantId:tenant.id,label:"Synthetic key",scopes}));
 assert.equal(await issue(other.id,["chart"]),null);
 const restricted=await issue(owner.id,["panchang"]);assert.ok(restricted?.key);
 assert.equal((await ledger.claimBusinessCalculation("Bearer "+restricted.key,"chart",randomUUID())).kind,"unauthorized");
 const key=await issue(owner.id,[...businessScopes]);assert.ok(key?.key);
 const auth="Bearer "+key.key;
 const stored=await prisma.businessApiKey.findUniqueOrThrow({where:{id:key.record.id}});
 assert.notEqual(stored.digest,key.key);assert.equal(stored.digest.length,64);
 assert.equal(JSON.stringify(await ledger.ownedBusinessTenants(owner.id)).includes(stored.digest),false);
 assert.equal((await ledger.claimBusinessCalculation(null,"chart",randomUUID())).kind,"unauthorized");
 assert.equal((await ledger.claimBusinessCalculation(auth.slice(0,-1)+(auth.endsWith("a")?"b":"a"),"chart",randomUUID())).kind,"unauthorized");
 assert.equal(businessCalculationSchema.safeParse({...fixture("chart"),subjectPermission:false}).success,false);
 assert.equal(businessCalculationSchema.safeParse({...fixture("matching"),subjectPermission:false}).success,false);
 assert.equal(businessCalculationSchema.safeParse({...fixture("chart"),birth:{...birth,date:"2026-02-30"}}).success,false);
 for(const scope of businessScopes){
  const input=businessCalculationSchema.parse(fixture(scope));
  const c=await ledger.claimBusinessCalculation(auth,scope,input.requestId);assert.equal(c.kind,"claimed");
  assert.equal((await ledger.claimBusinessCalculation(auth,scope,input.requestId)).kind,"duplicate");
  const result=await calculateBusinessResult(input,c.brandName);
  if(scope==="chart"){assert.equal(result.planets.length,9);assert.ok(result.planets.every(p=>Number.isFinite(p.absoluteLongitude)));}
  if(scope==="matching"){assert.equal(result.factors.length,8);assert.ok(result.score>=0&&result.score<=36);assert.ok(Math.abs(result.factors.reduce((s,f)=>s+f.score,0)-result.score)<1e-8);}
  if(scope==="panchang"||scope==="panchang-widget"){assert.equal(result.date,location.date);assert.ok(result.tithi&&result.nakshatra);}
  if(scope==="panchang-widget"){assert.ok(result.html.includes("QA &lt;partner&gt;"));assert.ok(!result.html.includes("QA <partner>"));assert.ok(result.html.includes("Powered by Naksharix"));}
  assert.equal(await ledger.finishBusinessCalculation(tenant.id,input.requestId,true),true);
  assert.equal(await ledger.finishBusinessCalculation(tenant.id,input.requestId,true),false,"duplicate finish");
 }
 // Five completed units; scope narrowing during a reservation must refuse completion.
 const midflight=randomUUID();assert.equal((await ledger.claimBusinessCalculation(auth,"chart",midflight)).kind,"claimed");
 await prisma.businessApiKey.update({where:{id:key.record.id},data:{scopes:["panchang"]}});
 assert.equal(await ledger.finishBusinessCalculation(tenant.id,midflight,true),false);
 await prisma.businessApiKey.update({where:{id:key.record.id},data:{scopes:[...businessScopes]}});
 // Six attempted units; two remain. Concurrent distinct reservations may not oversell.
 const requests=Array.from({length:5},()=>randomUUID());
 const claims=await Promise.all(requests.map(id=>ledger.claimBusinessCalculation(auth,"panchang",id)));
 assert.equal(claims.filter(c=>c.kind==="claimed").length,2);
 assert.equal(claims.filter(c=>c.kind==="limit").length,3);
 const reserved=requests.filter((_,i)=>claims[i].kind==="claimed");
 assert.equal(await ledger.finishBusinessCalculation(tenant.id,reserved[0],true),true);
 assert.equal(await ledger.revokeBusinessKey(other.id,tenant.id,key.record.id),false);
 assert.equal(await ledger.revokeBusinessKey(owner.id,tenant.id,key.record.id),true);
 assert.equal(await ledger.finishBusinessCalculation(tenant.id,reserved[1],true),false);
 assert.equal((await ledger.claimBusinessCalculation(auth,"panchang",randomUUID())).kind,"unauthorized");
 const month=await prisma.businessUsageMonth.findUniqueOrThrow({where:{tenantId_period:{tenantId:tenant.id,period:usagePeriod()}}});
 assert.equal(month.attemptedUnits,8);assert.equal(month.completedUnits,6);assert.equal(month.failedUnits,2);assert.equal(month.unitPricePaise,100);
 const rows=await prisma.businessUsageCall.findMany({where:{tenantId:tenant.id}});
 assert.equal(rows.length,7);assert.ok(rows.every(c=>c.state!=="RESERVED"));
 const serialized=JSON.stringify(rows);
 assert.ok(!serialized.includes(birth.date)&&!serialized.includes(String(birth.latitude))&&!serialized.includes(key.key));
 assert.equal(await ledger.revokeTenant(admin.id,tenant.id),true);
 assert.equal(await issue(owner.id,["panchang"]),null);
 assert.equal((await ledger.claimBusinessCalculation("Bearer "+restricted.key,"panchang",randomUUID())).kind,"unauthorized");
 const widgetTenant=await ledger.createTenant(admin.id,{...request,contractReference:"widget "+run,monthlyUnitLimit:3,scopes:["panchang-widget"]});assert.ok(widgetTenant);
 const widgetKey=await ledger.issueBusinessKey(owner.id,keySchema.parse({tenantId:widgetTenant.id,label:"Widget only",scopes:["panchang-widget"]}));assert.ok(widgetKey?.key);
 const origin="https://publisher.example",wrong="https://other.example";
 const mint=async()=>{const input={...fixture("panchang-widget"),browserOrigin:origin};const response=await calculateRoute.POST(new Request("http://localhost/api/partner/v1/calculate",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+widgetKey.key},body:JSON.stringify(input)}));assert.equal(response.status,200);const {data}=await response.json();assert.equal(data.status,"RESERVED");assert.ok(data.grant);assert.ok(!JSON.stringify(data).includes(widgetKey.key));return data.grant;};
 const redeem=(grant,site=origin)=>widgetRoute.POST(new Request("http://localhost/api/partner/v1/widget",{method:"POST",headers:{"Content-Type":"application/json",Origin:site},body:JSON.stringify({grant})}));
 assert.equal(widgetRoute.OPTIONS(new Request("http://localhost/api/partner/v1/widget",{method:"OPTIONS",headers:{Origin:origin,"Access-Control-Request-Method":"POST","Access-Control-Request-Headers":"content-type"}})).status,204);
 assert.equal(widgetRoute.OPTIONS(new Request("http://localhost/api/partner/v1/widget",{method:"OPTIONS",headers:{Origin:origin,"Access-Control-Request-Method":"POST","Access-Control-Request-Headers":"authorization"}})).status,403);
 const grant=await mint();const decoded=readWidgetGrant(grant,origin);assert.ok(decoded);assert.equal(decoded.location.date,location.date);assert.equal(readWidgetGrant(grant,wrong),null);
 assert.equal(readWidgetGrant(grant,origin,new Date((decoded.exp+1)*1000)),null);
 assert.equal((await redeem(grant,wrong)).status,401);
 assert.equal((await redeem(grant.slice(0,-1)+(grant.endsWith("a")?"b":"a"))).status,401);
 const results=await Promise.all([redeem(grant),redeem(grant)]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 const good=results.find(r=>r.status===200);assert.equal(good.headers.get("access-control-allow-origin"),origin);assert.equal(good.headers.get("access-control-allow-credentials"),null);const result=(await good.json()).data.result;assert.equal(result.date,location.date);assert.ok(result.html.includes("Powered by Naksharix"));
 assert.equal((await redeem(grant)).status,409);
 const secondGrant=await mint();assert.equal(await ledger.revokeBusinessKey(owner.id,widgetTenant.id,widgetKey.record.id),true);assert.equal((await redeem(secondGrant)).status,409);
 const widgetMonth=await prisma.businessUsageMonth.findUniqueOrThrow({where:{tenantId_period:{tenantId:widgetTenant.id,period:usagePeriod()}}});assert.equal(widgetMonth.attemptedUnits,2);assert.equal(widgetMonth.completedUnits,1);
 console.log("B2B_WIDGET_RUNTIME_PASS "+JSON.stringify({signedOrigin:true,originMismatchDenied:true,expiredDenied:true,tamperDenied:true,concurrentReplayDenied:true,revokedKeyDenied:true,completedUnits:1,attemptedUnits:2,scope:"local request handlers and disposable database; external publisher integration not active"}));
 console.log("B2B_RUNTIME_PASS "+JSON.stringify({scopes:4,attemptedUnits:8,completedUnits:6,failedUnits:2,concurrentReservations:5,acceptedReservations:2,tenantIsolation:true,revocation:true,scopeNarrowing:true,privacy:true,syntheticContract:true}));
}finally{
 for(const id of ids.reverse())await prisma.user.delete({where:{id}});
 await prisma.$disconnect();
}

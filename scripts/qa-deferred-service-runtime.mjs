import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
import {randomUUID} from "node:crypto";
const db=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
assert.equal(process.env.CI,"true");
assert.ok(["postgresql:","postgres:"].includes(db.protocol)&&["localhost","127.0.0.1"].includes(db.hostname)&&db.port==="5432"&&db.pathname==="/naksharix"&&db.username==="postgres","DISPOSABLE_DB_ONLY");
assert.notEqual(process.env.VERCEL_ENV,"production");assert.equal(process.env.EMAIL_PROVIDER,"disabled");
process.env.NODE_ENV="test";
globalThis.fetch=async()=>{throw Error("EXTERNAL_NETWORK_FORBIDDEN");};
const require=createRequire(import.meta.url),ts=require("typescript");
let identity=null;
const oldResolve=Module._resolveFilename,oldLoad=Module._load;
Module._resolveFilename=function(name,...args){return oldResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){
 if(name==="server-only")return {};
 if(name==="@/lib/auth/jwt")return {getCurrentUser:async()=>identity};
 return oldLoad.call(this,name,...args);
};
require.extensions[".ts"]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);};
const {prisma}=require("@/lib/db"),{POST}=require("@/app/api/deferred-services/requests/route"),{SERVICES,REQUEST_TERMS}=require("@/lib/deferred-services/contract");
const ids=[],run=randomUUID();let checks=0;
function check(v,m){assert.ok(v,m);checks++;}
function body(s){return {kind:s.kind,units:s.min,target:s.target==="none"?"":s.target==="country"?"IN":"Delhi",preferredDate:"",consent:REQUEST_TERMS,requestId:randomUUID()};}
function post(input){return POST(new Request("http://localhost:3000/api/deferred-services/requests",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)}));}
async function account(label,role="USER",verified=true){const row=await prisma.user.create({data:{name:"Synthetic review QA",email:run+"-"+label+"@example.invalid",role,emailVerified:verified?new Date():null}});ids.push(row.id);return {...row,isAdminLogin:false};}
try{
 const owner=await account("owner"),other=await account("other"),admin=await account("admin","ADMIN"),unverified=await account("unverified","USER",false);
 const first=body(SERVICES[0]);
 delete process.env.DEFERRED_SERVICE_REQUESTS_ENABLED;
 check((await post(first)).status===404,"closed by default");
 process.env.DEFERRED_SERVICE_REQUESTS_ENABLED="true";
 check((await post(first)).status===401,"anonymous denied");
 identity=admin;check((await post(first)).status===403,"admin denied");
 identity=unverified;check((await post(first)).status===403,"unverified denied");
 identity=owner;
 for(const service of SERVICES){
   const input=body(service),result=await post(input);
   assert.equal(result.status,201);
   const {data}=await result.json();
   check(result.headers.get("cache-control")==="private, no-store","private response");
   check(["paymentRequired","orderCreated","bookingCreated","entitlementGranted","capacityReserved","fulfillmentConfirmed"].every(k=>data[k]===false),"no commercial effects");
   const ticket=await prisma.supportTicket.findUniqueOrThrow({where:{id:data.ticket.id}});
   check(ticket.userId===owner.id&&ticket.subject.startsWith("["+service.id+" REVIEW]"),"owner-bound persistence");
   const replay=await post(input);check(replay.status===200&&(await replay.json()).data.ticket.id===ticket.id,"retry deduplicated");
   check((await post({...input,units:input.units+1})).status===409||input.units===service.max,"changed retry rejected");
 }
 check((await post({...body(SERVICES[4]),target:"ZZ"})).status===422,"unsupported destination");
 check((await post({...body(SERVICES[0]),preferredDate:"2020-01-01"})).status===422,"past date");
 const concurrent=body(SERVICES[0]),pair=await Promise.all([post(concurrent),post(concurrent)]);
 check(pair.map(p=>p.status).sort().join(",")==="200,201","concurrent retry deduplicated");
 const rows=await Promise.all(pair.map(p=>p.json()));check(rows[0].data.ticket.id===rows[1].data.ticket.id,"single ticket");
 identity=other;const cross=await post(concurrent);check(cross.status===201&&(await cross.json()).data.ticket.id!==rows[0].data.ticket.id,"separate account scope");
 check(await prisma.supportTicket.count({where:{userId:owner.id}})===8,"eight owner tickets");
 check(await prisma.payment.count({where:{userId:{in:ids}}})===0,"zero payments");
 console.log("DEFERRED_SERVICE_RUNTIME_PASS "+JSON.stringify({checks,serviceKinds:7,ownerTickets:8,syntheticPayments:0,scope:"actual handler and disposable PostgreSQL; identity adapter isolated"}));
}finally{delete process.env.DEFERRED_SERVICE_REQUESTS_ENABLED;for(const id of ids.reverse())await prisma.user.delete({where:{id}});await prisma.$disconnect();}

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
import {randomUUID} from "node:crypto";
const db=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
assert.equal(process.env.CI,"true");assert.ok(["localhost","127.0.0.1"].includes(db.hostname)&&db.port==="5432"&&db.pathname==="/naksharix"&&db.username==="postgres");assert.notEqual(process.env.VERCEL_ENV,"production");assert.equal(process.env.EMAIL_PROVIDER,"disabled");
process.env.NODE_ENV="test";globalThis.fetch=async()=>{throw Error("EXTERNAL_NETWORK_FORBIDDEN")};
const require=createRequire(import.meta.url),ts=require("typescript");let identity=null;
const oldResolve=Module._resolveFilename,oldLoad=Module._load;
Module._resolveFilename=function(name,...args){return oldResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args)};
Module._load=function(name,...args){if(name==="server-only")return {};if(name==="@/lib/auth/jwt")return {getCurrentUser:async()=>identity};return oldLoad.call(this,name,...args)};
require.extensions[".ts"]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file)};
const {prisma}=require("@/lib/db"),{SERVICES,REQUEST_TERMS}=require("@/lib/deferred-services/contract"),{PLAN_TERMS}=require("@/lib/deferred-services/planning-contract");
const intake=require("@/app/api/deferred-services/requests/route"),admin=require("@/app/api/admin/deferred-services/route"),customer=require("@/app/api/deferred-services/allocations/route");
const ids=[],plans=[],run=randomUUID();let checks=0;
function check(v,m){assert.ok(v,m);checks++;}
async function account(label,role="USER"){const row=await prisma.user.create({data:{name:"Synthetic planning QA",email:run+"-"+label+"@example.invalid",role,emailVerified:new Date()}});ids.push(row.id);return {...row,isAdminLogin:false}}
async function post(handler,input){return handler(new Request("http://localhost:3000/isolated",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)}))}
async function success(response){assert.equal(response.status,200,await response.clone().text());return (await response.json()).data}
function requestBody(service,units=service.min){return {kind:service.kind,units,target:service.target==="none"?"":service.target==="country"?"IN":"Delhi",preferredDate:"",consent:REQUEST_TERMS,requestId:randomUUID()}}
async function makeTicket(who,s,units){identity=who;const response=await post(intake.POST,requestBody(s,units));assert.equal(response.status,201,await response.clone().text());return (await response.json()).data.ticket.id}
function createBody(s,capacity=s.min){return {action:"CREATE_PLAN",mutationId:randomUUID(),kind:s.kind,target:s.target==="none"?"":s.target==="country"?"IN":"Delhi",label:"Synthetic "+s.title,providerRef:"fixture-provider",evidenceRef:"fixture-evidence",termsRef:"fixture-terms",capacity,startsAt:new Date(Date.now()-60000).toISOString(),endsAt:new Date(Date.now()+86400000).toISOString()}}
try{
 const operator=await account("operator","ADMIN"),owner=await account("owner"),other=await account("other"),third=await account("third");
 delete process.env.DEFERRED_SERVICE_OPERATIONS_ENABLED;
 identity=operator;check((await admin.GET()).status===404,"disabled by default");
 process.env.DEFERRED_SERVICE_OPERATIONS_ENABLED="true";process.env.DEFERRED_SERVICE_REQUESTS_ENABLED="true";
 identity=null;check((await admin.GET()).status===404,"anonymous admin denied");
 identity=owner;check((await admin.GET()).status===404,"customer admin denied");
 for(const s of SERVICES){
  const t=await makeTicket(owner,s),b=createBody(s);identity=operator;
  const p=(await success(await post(admin.POST,b))).plan;plans.push(p.id);check(p.state==="DRAFT","draft");
  check((await success(await post(admin.POST,b))).duplicate===true,"idempotent draft");
  check((await post(admin.POST,{...b,label:"Different label"})).status===409,"conflicting draft replay");
  check((await post(admin.POST,{action:"ALLOCATE",planId:p.id,ticketId:t})).status===409,"unreviewed plan refused");
  check((await success(await post(admin.POST,{action:"REVIEW_PLAN",planId:p.id,acknowledge:true}))).plan.state==="REVIEWED","operator review");
  const a=(await success(await post(admin.POST,{action:"ALLOCATE",planId:p.id,ticketId:t}))).allocation;
  check(a.state==="HELD"&&a.units===s.min,"real held units");
  check((await success(await post(admin.POST,{action:"ALLOCATE",planId:p.id,ticketId:t}))).duplicate===true,"allocation replay");
  identity=other;check((await post(customer.POST,{action:"ACCEPT",allocationId:a.id,version:a.version,consent:PLAN_TERMS})).status===409,"foreign customer denied");
  identity=owner;const accepted=(await success(await post(customer.POST,{action:"ACCEPT",allocationId:a.id,version:a.version,consent:PLAN_TERMS}))).allocation;check(accepted.state==="ACCEPTED","owner acknowledgement");
  identity=operator;const event={action:"RECORD_PROGRESS",allocationId:a.id,version:accepted.version,operationId:randomUUID(),units:s.min,evidenceRef:"fixture-receipt",occurredAt:new Date().toISOString()};
  check((await post(admin.POST,{...event,units:s.min+1})).status===409,"oversubscription rejected");
  const complete=(await success(await post(admin.POST,event))).allocation;check(complete.state==="COMPLETED"&&complete.completedUnits===s.min,"exact completion recorded");
  check((await success(await post(admin.POST,event))).duplicate===true,"receipt replay");
  check((await post(admin.POST,{...event,evidenceRef:"changed"})).status===409,"conflicting receipt replay");
  check(await prisma.deferredServiceReceipt.count({where:{allocationId:a.id}})===1,"one immutable receipt");
 }
 const service=SERVICES.find(s=>s.kind==="webinar"),t1=await makeTicket(other,service),t2=await makeTicket(third,service);
 identity=operator;const p=(await success(await post(admin.POST,createBody(service,1)))).plan;plans.push(p.id);await success(await post(admin.POST,{action:"REVIEW_PLAN",planId:p.id,acknowledge:true}));
 const results=await Promise.all([post(admin.POST,{action:"ALLOCATE",planId:p.id,ticketId:t1}),post(admin.POST,{action:"ALLOCATE",planId:p.id,ticketId:t2})]);check(results.map(r=>r.status).sort().join(",")==="200,409","atomic capacity race");
 const a=(await success(results.find(r=>r.status===200))).allocation;
 const winner=await prisma.deferredServiceAllocation.findUniqueOrThrow({where:{id:a.id}});
 identity=winner.userId===other.id?other:third;check((await success(await post(customer.POST,{action:"CANCEL",allocationId:a.id,version:a.version}))).allocation.state==="CANCELED","customer cancellation");
 identity=operator;const second=winner.ticketId===t1?t2:t1;check((await success(await post(admin.POST,{action:"ALLOCATE",planId:p.id,ticketId:second}))).allocation.state==="HELD","unused capacity released");
 const adminView=await success(await admin.GET());check(adminView.plans.some(x=>x.id===p.id&&x.remaining===0),"admin persisted capacity");
 // The old unique ticket allocation prevented recovery after cancellation.
 // Reissue must never bypass capacity, prior receipt, ownership or version gates.
 const old=await prisma.deferredServiceAllocation.findUniqueOrThrow({where:{id:a.id}});
 check((await post(admin.POST,{action:"REISSUE",allocationId:a.id,planId:p.id,version:old.version})).status===409,"full plan reissue refused");
 const replacement=(await success(await post(admin.POST,createBody(service,1)))).plan;plans.push(replacement.id);
 check((await post(admin.POST,{action:"REISSUE",allocationId:a.id,planId:replacement.id,version:old.version})).status===409,"draft replacement denied");
 await success(await post(admin.POST,{action:"REVIEW_PLAN",planId:replacement.id,acknowledge:true}));
 const wrong=(await success(await post(admin.POST,createBody(SERVICES.find(s=>s.kind==="prasad"),1)))).plan;plans.push(wrong.id);
 await success(await post(admin.POST,{action:"REVIEW_PLAN",planId:wrong.id,acknowledge:true}));
 check((await post(admin.POST,{action:"REISSUE",allocationId:a.id,planId:wrong.id,version:old.version})).status===409,"different service scope refused");
 const retryInput={action:"REISSUE",allocationId:a.id,planId:replacement.id,version:old.version};
 const reissueRace=await Promise.all([post(admin.POST,retryInput),post(admin.POST,retryInput)]);
 check(reissueRace.map(r=>r.status).sort().join(",")==="200,409","one reissue despite concurrent stale operations");
 const reissued=(await success(reissueRace.find(r=>r.status===200))).allocation;
 check(reissued.id===a.id&&reissued.state==="HELD"&&reissued.version===old.version+1&&reissued.acceptedAt===null,"fresh hold and version");
 const moved=await prisma.deferredServiceAllocation.findUniqueOrThrow({where:{id:a.id}});
 check(moved.planId===replacement.id&&moved.acceptedAt===null&&moved.canceledAt===null&&moved.completedUnits===0,"persisted consent reset");
 const reissueAudit=await prisma.adminActionLog.findMany({where:{action:"deferred_allocation.reissued",targetId:a.id}});
 check(reissueAudit.length===1&&reissueAudit[0].metadata.previous.planId===p.id&&reissueAudit[0].metadata.next.planId===replacement.id,"prior state audited");
 identity=winner.userId===other.id?other:third;
 check((await post(customer.POST,{action:"ACCEPT",allocationId:a.id,version:old.version,consent:PLAN_TERMS})).status===409,"stale acknowledgement refused");
 const fresh=(await success(await post(customer.POST,{action:"ACCEPT",allocationId:a.id,version:reissued.version,consent:PLAN_TERMS}))).allocation;
 check(fresh.state==="ACCEPTED","fresh customer acknowledgement");
 identity=operator;check((await post(admin.POST,{action:"REISSUE",allocationId:a.id,planId:replacement.id,version:fresh.version})).status===409,"accepted proposal cannot be reissued");
 const completeRow=await prisma.deferredServiceAllocation.findFirstOrThrow({where:{userId:owner.id,state:"COMPLETED"}});
 check((await post(admin.POST,{action:"REISSUE",allocationId:completeRow.id,planId:replacement.id,version:completeRow.version})).status===409,"completed work cannot be reissued");
 const held=await prisma.deferredServiceAllocation.findUniqueOrThrow({where:{ticketId:second}});
 await success(await post(admin.POST,{action:"CLOSE_PLAN",planId:p.id}));
 identity=held.userId===other.id?other:third;
 const closedView=await success(await customer.GET());
 check(closedView.allocations.some(x=>x.id===held.id&&x.state==="EXPIRED"),"closed-plan hold correctly displayed as expired");
 check((await post(customer.POST,{action:"ACCEPT",allocationId:held.id,version:held.version,consent:PLAN_TERMS})).status===409,"closed plan cannot be acknowledged");
 identity=operator;
 check((await post(admin.POST,{action:"REISSUE",allocationId:held.id,planId:replacement.id,version:held.version})).status===409,"replacement capacity enforced");
 const available=(await success(await post(admin.POST,createBody(service,1)))).plan;plans.push(available.id);
 await success(await post(admin.POST,{action:"REVIEW_PLAN",planId:available.id,acknowledge:true}));
 check((await success(await post(admin.POST,{action:"REISSUE",allocationId:held.id,planId:available.id,version:held.version}))).allocation.state==="HELD","closed-plan unacknowledged hold may be reissued safely");
 identity=owner;const view=await success(await customer.GET());check(view.allocations.length===7&&view.allocations.every(x=>x.state==="COMPLETED"),"customer private readback");
 check(await prisma.payment.count({where:{userId:{in:ids}}})===0,"zero payment records");
 console.log("DEFERRED_PLANNING_RUNTIME_PASS "+JSON.stringify({checks,serviceKinds:7,plans:plans.length,capacityRace:true,reissueRace:true,consentReset:true,paymentRecords:0,scope:"disposable PostgreSQL, real handlers, synthetic operator attestations and isolated identity"}));
}finally{
 delete process.env.DEFERRED_SERVICE_OPERATIONS_ENABLED;delete process.env.DEFERRED_SERVICE_REQUESTS_ENABLED;
 await prisma.deferredServiceAllocation.deleteMany({where:{planId:{in:plans}}});
 await prisma.deferredServicePlan.deleteMany({where:{id:{in:plans}}});
 for(const id of ids.reverse())await prisma.user.delete({where:{id}});await prisma.$disconnect();
}

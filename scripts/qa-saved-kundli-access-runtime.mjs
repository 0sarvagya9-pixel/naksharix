import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
import {randomUUID} from "node:crypto";
const db=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
assert.equal(process.env.CI,"true");
assert.ok(["postgresql:","postgres:"].includes(db.protocol)&&db.hostname==="localhost"&&db.port==="5432"&&db.pathname==="/naksharix"&&db.username==="postgres","DISPOSABLE_DB_ONLY");
assert.notEqual(process.env.VERCEL_ENV,"production");assert.equal(process.env.EMAIL_PROVIDER,"disabled");
process.env.NODE_ENV="test";process.env.ASTROLOGY_PROVIDER="own_engine";
process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_SavedQAOnly";
process.env.RAZORPAY_KEY_ID=process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
process.env.RAZORPAY_KEY_SECRET="isolated-test-not-a-secret";
process.env.RAZORPAY_WEBHOOK_SECRET="isolated-test-not-a-webhook-secret";
globalThis.fetch=async()=>{throw Error("EXTERNAL_NETWORK_FORBIDDEN")};
const require=createRequire(import.meta.url),ts=require("typescript");
let identity=null,renderCalls=0,merchantCalls=0;
const cache=new Map(),cacheWrites=[];
const oldResolve=Module._resolveFilename,oldLoad=Module._load;
Module._resolveFilename=function(name,...args){return oldResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args)};
const gateway={orders:{create:async input=>{merchantCalls++;return {id:"order_QA"+randomUUID().replaceAll("-",""),amount:input.amount,currency:input.currency}}}};
Module._load=function(name,...args){
 if(name==="server-only")return {};
 if(name==="@/lib/auth/jwt")return {getCurrentUser:async()=>identity};
 if(name==="@/lib/payments/razorpay")return {razorpay:gateway};
 if(name==="@/lib/payments/readiness")return {getRazorpayReadiness:()=>({enabled:true})};
 if(name==="@/lib/pdf/kundli-renderer")return {renderBundledKundliPdf:async(data,language,type)=>{renderCalls++;return Buffer.from("%PDF-1.4\n"+JSON.stringify({data,language,type}))}};
 if(name==="@/lib/kundli/pdf-data")return {normalizeKundliPdfData:data=>data};
 if(name==="@/lib/cache")return {cacheGet:async key=>cache.get(key)??null,cacheSet:async(key,v,ttl)=>{cacheWrites.push({key,ttl});cache.set(key,v)},cacheIncrement:async()=>1};
 return oldLoad.call(this,name,...args);
};
require.extensions[".ts"]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file)};
const {prisma}=require("@/lib/db"),{POST:pdf}=require("@/app/api/kundli/pdf/route"),{POST:order}=require("@/app/api/payments/razorpay/order/route");
const {savedKundliAccessMap}=require("@/lib/reports/saved-kundli-access"),{recordSignedRefundReceipt}=require("@/lib/payments/refund-evidence");
const {matchesSavedKundliPayment}=require("@/lib/reports/saved-kundli-contract");
const ids=[],receiptIds=[],run=randomUUID().replaceAll("-","");let checks=0;
function check(v,m){assert.ok(v,m);checks++}
function payload(marker){return {profile:{name:marker},birthDetails:{dateOfBirth:"1990-01-15",timeOfBirth:"10:30",birthPlace:"Delhi, India"},reportHash:"synthetic-same-untrusted-hash"}}
async function account(label,admin=false){const row=await prisma.user.create({data:{name:"Synthetic saved Kundli QA",email:run+"-"+label+"@example.invalid",role:admin?"ADMIN":"USER",emailVerified:new Date()}});ids.push(row.id);return {...row,effectiveRole:admin?"ADMIN":"USER",isAdminLogin:admin}}
async function saved(who,label){return prisma.kundliReport.create({data:{userId:who.id,name:label,dateOfBirth:new Date("1990-01-15T00:00:00Z"),timeOfBirth:"10:30",birthPlace:"Delhi, India",latitude:28.6139,longitude:77.209,timezone:"Asia/Kolkata",reportJson:payload(label)}})}
async function payment(who,row,label,overrides={}){return prisma.payment.create({data:{userId:who.id,provider:"RAZORPAY",purpose:"KUNDLI_REPORT",status:"PAID",amount:799,currency:"INR",providerPaymentId:"pay_QA"+run+label,metadata:{savedReportId:row.id,reportId:"kundli-pro",gatewayStatus:"captured"},...overrides}})}
function post(handler,input){return handler(new Request("http://localhost:3000/api/isolated",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)}))}
async function status(handler,input,expected,label){const r=await post(handler,input);check(r.status===expected,label+" expected "+expected+" got "+r.status);return r}
const payInput=(id,sku="kundli-pro",purpose="KUNDLI_REPORT")=>({purpose,reportId:sku,savedReportId:id});
try{
 const owner=await account("owner"),other=await account("other"),admin=await account("admin",true);
 const paid=await saved(owner,"SYNTHETIC_PAID"),unpaid=await saved(owner,"SYNTHETIC_UNPAID"),wrong=await saved(owner,"SYNTHETIC_WRONG_SKU"),refunded=await saved(owner,"SYNTHETIC_PARTIAL_REFUND"),legacy=await saved(owner,"SYNTHETIC_UNVERIFIED"),foreign=await saved(other,"SYNTHETIC_FOREIGN"),adminSaved=await saved(admin,"SYNTHETIC_ADMIN");
 const captured=await payment(owner,paid,"paid");await payment(owner,wrong,"wrong",{amount:399,metadata:{savedReportId:wrong.id,reportId:"fortune-personalized",gatewayStatus:"captured"}});
 const partial=await payment(owner,refunded,"partial");await payment(owner,legacy,"legacy",{metadata:{savedReportId:legacy.id,reportId:"kundli-pro"}});
 const receiptId="rfnd_QA"+run;receiptIds.push("razorpay-refund:"+receiptId);
 check(await recordSignedRefundReceipt({id:receiptId,payment_id:partial.providerPaymentId,amount:100,status:"processed"})===100,"real persisted synthetic partial refund");
 const map=await savedKundliAccessMap(owner.id,[paid.id,unpaid.id,wrong.id,refunded.id,legacy.id]);
 check(map.get(paid.id)==="UNLOCKED"&&map.get(unpaid.id)==="LOCKED"&&map.get(wrong.id)==="REVIEW"&&map.get(refunded.id)==="REVIEW"&&map.get(legacy.id)==="REVIEW","exact access/readback");
 check(matchesSavedKundliPayment(captured,owner.id,paid.id,799)&&!matchesSavedKundliPayment(captured,other.id,paid.id,799)&&!matchesSavedKundliPayment(captured,owner.id,unpaid.id,799),"identity binding");
 identity=null;
 await status(pdf,{report:payload("forged"),pdfType:"PREMIUM"},401,"anonymous premium rejected");
 check(renderCalls===0&&cacheWrites.length===0,"denied before renderer/cache");
 const a=await status(pdf,{report:payload("FREE_A"),pdfType:"FREE"},200,"public free PDF");
 const b=await status(pdf,{report:payload("FREE_B"),pdfType:"FREE"},200,"different payload with identical claimed hash");
 check((await a.text()).includes("FREE_A")&&(await b.text()).includes("FREE_B"),"server-derived content cache separation");
 check(cacheWrites.length===2&&cacheWrites[0].key!==cacheWrites[1].key&&cacheWrites.every(x=>x.key.includes("v2:")&&x.ttl===86400),"versioned short-lived free cache");
 identity=owner;
 await status(pdf,{pdfType:"PREMIUM",savedReportId:"missing-id"},404,"unknown saved row");
 await status(pdf,{pdfType:"PREMIUM",savedReportId:foreign.id},404,"foreign saved row");
 for(const row of [unpaid,wrong,refunded,legacy])await status(pdf,{pdfType:"PREMIUM",savedReportId:row.id},403,"unpaid or review entitlement");
 await status(pdf,{pdfType:"PREMIUM",report:payload("forged")},403,"missing saved id");
 const beforeRender=renderCalls,beforeCache=cacheWrites.length;
 const p=await status(pdf,{pdfType:"PREMIUM",savedReportId:paid.id,report:payload("FORGED_PREMIUM")},200,"legitimate captured entitlement");
 const contents=await p.text();check(contents.includes("SYNTHETIC_PAID")&&!contents.includes("FORGED_PREMIUM"),"authoritative saved content");
 check(renderCalls===beforeRender+1&&cacheWrites.length===beforeCache&&p.headers.get("cache-control")==="no-store","paid PDF uncached");
 check(p.headers.get("content-disposition").includes("premium-kundli"),"correct paid filename");
 identity=admin;await status(pdf,{pdfType:"PREMIUM",savedReportId:adminSaved.id},200,"admin review owns saved chart");await status(pdf,{pdfType:"PREMIUM",savedReportId:paid.id},404,"admin cannot use foreign saved chart");
 identity=owner;
 await status(order,payInput("missing-id"),404,"arbitrary saved id cannot bypass preflight");
 await status(order,payInput(foreign.id),404,"foreign saved chart cannot be charged");
 await status(order,payInput(unpaid.id,"fortune-personalized"),422,"cheaper SKU cannot unlock Kundli Pro");
 await status(order,{...payInput(unpaid.id),reportRequestId:"other-request"},422,"mixed checkout contexts");
 await status(order,payInput(wrong.id),409,"prior mismatched paid record requires review");
 await status(order,payInput(paid.id),409,"duplicate paid purchase refused");
 check(merchantCalls===0,"invalid checkouts never reach gateway fixture");
 const oldReq=await prisma.reportRequest.create({data:{userId:owner.id,planType:"PREMIUM",reportSlug:"wealth-report",status:"PENDING_REVIEW",paymentStatus:"PENDING",deliveryEmail:owner.email,fullName:"Synthetic legacy review",dateOfBirth:"1990-01-15",timeOfBirth:"10:30",birthPlace:"Delhi, India",concern:"Synthetic question"}});
 await status(order,{purpose:"KUNDLI_REPORT",reportId:"career-report",reportRequestId:oldReq.id},422,"same-price wrong legacy SKU refused");
 check(merchantCalls===0,"legacy mismatch never reaches gateway");
 const ok=await status(order,payInput(unpaid.id),200,"owned valid saved report can reserve legitimate exact SKU");
 const ack=await ok.json(),created=await prisma.payment.findUniqueOrThrow({where:{id:ack.data.paymentId}});
 check(merchantCalls===1&&created.status==="PENDING"&&Number(created.amount)===799&&created.metadata.reportId==="kundli-pro"&&created.metadata.savedReportId===unpaid.id,"isolated gateway order with exact pending record only");
 console.log("SAVED_KUNDLI_ACCESS_RUNTIME_PASS "+JSON.stringify({checks,isolatedMerchantOrders:merchantCalls,renderCalls,freeCacheWrites:cacheWrites.length,scope:"real API handlers and disposable PostgreSQL; isolated identity, cache, PDF renderer and merchant transport; zero real charges"}));
}finally{
 await prisma.auditLog.deleteMany({where:{id:{in:receiptIds}}});
 await prisma.user.deleteMany({where:{id:{in:ids}}});await prisma.$disconnect();
}

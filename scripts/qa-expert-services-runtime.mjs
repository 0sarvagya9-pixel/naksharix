import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
import {randomUUID,createHash} from "node:crypto";
const db=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
assert.equal(process.env.CI,"true");
assert.ok(["postgresql:","postgres:"].includes(db.protocol)&&["localhost","127.0.0.1"].includes(db.hostname)&&db.port==="5432"&&db.pathname==="/naksharix"&&db.username==="postgres","DISPOSABLE_DB_ONLY");
assert.notEqual(process.env.VERCEL_ENV,"production");
assert.equal(process.env.EMAIL_PROVIDER,"disabled");
process.env.NODE_ENV="test";
process.env.ASTROLOGY_PROVIDER="own_engine";
process.env.EXPERT_SERVICE_INTAKE_ENABLED="true";
process.env.EXPERT_SERVICE_SALES_ENABLED="true";
process.env.RAZORPAY_KEY_ID="rzp_test_QAonly";
process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID=process.env.RAZORPAY_KEY_ID;
process.env.RAZORPAY_KEY_SECRET="synthetic-not-a-merchant-secret";
process.env.RAZORPAY_WEBHOOK_SECRET="synthetic-not-a-webhook-secret";
globalThis.fetch=async()=>{throw Error("EXTERNAL_NETWORK_FORBIDDEN");};
const require=createRequire(import.meta.url),ts=require("typescript");
const originalResolve=Module._resolveFilename,originalLoad=Module._load;
Module._resolveFilename=function(name,...args){return originalResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){if(name==="server-only")return {};if(name==="razorpay")return class {constructor(){}};return originalLoad.call(this,name,...args);};
require.extensions[".ts"]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);};
const {prisma}=require("@/lib/db"),ledger=require("@/lib/expert-services/ledger"),{requestSchema,adminSchema,providerSchema}=require("@/lib/expert-services/input");
const {EXPERT_TERMS_VERSION}=require("@/lib/expert-services/contract"),{getManualReportCheckout}=require("@/lib/reports/checkout-catalogue"),{recordSignedRefundReceipt}=require("@/lib/payments/refund-evidence"),{PDFDocument}=require("pdf-lib");
const ids=[],receiptIds=[],reportIds=[];const run=randomUUID().replaceAll("-","");
const makeReceipt=async paymentId=>{const id="rfnd_QA"+randomUUID().replaceAll("-","");receiptIds.push("razorpay-refund:"+id);assert.equal(await recordSignedRefundReceipt({id,payment_id:paymentId,amount:100,status:"processed"}),100);};
try{
 assert.equal(await ledger.expertSchemaReady(),true);
 assert.equal(ledger.expertSalesEnabled(),true);
 async function user(suffix,role="USER"){const u=await prisma.user.create({data:{name:"Synthetic QA "+suffix,email:"expert-"+run+"-"+suffix+"@example.invalid",emailVerified:new Date(),role}});ids.push(u.id);return u;}
 const admin=await user("admin","SUPER_ADMIN"),customer=await user("customer"),provider=await user("provider","ASTROLOGER"),stranger=await user("stranger","ASTROLOGER");
 const profile=await prisma.astrologerProfile.create({data:{userId:provider.id,displayName:"Synthetic QA practitioner",status:"APPROVED",approvedAt:new Date()}});
 await prisma.astrologerProfile.create({data:{userId:stranger.id,displayName:"Synthetic unrelated practitioner",status:"APPROVED",approvedAt:new Date()}});
 const doc=await PDFDocument.create();doc.addPage([300,300]);const bytes=await doc.save(),checksum=createHash("sha256").update(bytes).digest("hex");
 const product=getManualReportCheckout("premium-kundli");
 async function source(suffix){
 const p=await prisma.payment.create({data:{userId:customer.id,provider:"RAZORPAY",purpose:product.purpose,status:"PAID",amount:product.amount,currency:"INR",providerPaymentId:"pay_QA"+run+suffix,metadata:{reportId:product.reportId,gatewayStatus:"captured"}}});
 const row=await prisma.reportRequest.create({data:{userId:customer.id,paymentId:p.id,planType:"PREMIUM",reportSlug:"premium-kundli",status:"DELIVERED",paymentStatus:"PAID",deliveryEmail:customer.email,fullName:"Synthetic QA customer",dateOfBirth:"1992-05-18",timeOfBirth:"08:15",birthPlace:"Delhi, India",latitude:28.6139,longitude:77.209,timezone:5.5,generatedPdfBytes:bytes,generatedPdfChecksum:checksum,generatedPdfSize:bytes.length,generatedPdfStorageDriver:"database"}});
 reportIds.push(row.id);return {row,p};
 }
 const s=await source("base"),refundedSource=await source("refund");
 await makeReceipt(refundedSource.p.providerPaymentId);
 function input(kind,sourceReportId){return requestSchema.parse({clientIntent:randomUUID(),kind,question:"Synthetic question for isolated entitlement workflow verification only.",language:"en",...(sourceReportId?{sourceReportId}:{}),consent:true,consentVersion:EXPERT_TERMS_VERSION});}
 assert.equal(await ledger.createExpertRequest(customer.id,input("REPORT_REVIEW",refundedSource.row.id)),null);
 assert.equal(await ledger.createExpertRequest(stranger.id,input("REPORT_REVIEW",s.row.id)),null);
 const response="Synthetic test response. This is not professional advice or a real consultation. It is generated only to exercise the authorization, response and settlement workflow in a disposable database.";
 async function purchase(kind,sourceId,suffix){
 const request=input(kind,sourceId),row=await ledger.createExpertRequest(customer.id,request);assert.ok(row);
 assert.equal((await ledger.createExpertRequest(customer.id,request)).id,row.id);
 assert.equal(await ledger.createExpertRequest(customer.id,{...request,question:request.question+" changed"}),null);
 const assign=adminSchema.parse({action:"ASSIGN",id:row.id,profileId:profile.id,pricePaise:10000,expertFeePaise:6000,dueAt:new Date(Date.now()+86400000).toISOString(),confirmed:true});
 assert.equal(await ledger.actExpertAdmin(admin.id,assign),true);
 const accept=providerSchema.parse({action:"ACCEPT",id:row.id,quoteVersion:1,confirmed:true});
 assert.equal(await ledger.actExpertProvider(stranger.id,accept),false);
 assert.equal(await ledger.actExpertProvider(provider.id,accept),true);
 assert.equal(await ledger.resolveExpertCheckout(stranger.id,row.id,1,10000),null);
 assert.equal(await ledger.resolveExpertCheckout(customer.id,row.id,2,10000),null);
 const checkout=await ledger.resolveExpertCheckout(customer.id,row.id,1,10000);assert.ok(checkout);
 const payment=await prisma.payment.create({data:{userId:customer.id,provider:"RAZORPAY",purpose:"EXPERT_SERVICE",status:"PAID",amount:100,currency:"INR",providerPaymentId:"pay_QA"+run+suffix,metadata:{...checkout.metadata,gatewayStatus:"captured"}}});
 await prisma.expertServiceRequest.update({where:{id:row.id},data:{paymentId:payment.id,status:"PAYMENT_PENDING"}});
 const capture=await prisma.$transaction(tx=>ledger.validateExpertCapture(tx,payment,"captured"));
 assert.equal(capture.status,"PAID");await prisma.expertServiceRequest.update({where:{id:row.id},data:{status:capture.status}});
 return {row,payment};
 }
 const review=await purchase("REPORT_REVIEW",s.row.id,"review");
 const deliver=id=>providerSchema.parse({action:"DELIVER",id,response,confirmedHumanReview:true});
 assert.equal(await ledger.actExpertProvider(provider.id,deliver(review.row.id)),false,"source must first be read");
 assert.equal(await ledger.providerSourceForDownload(stranger.id,review.row.id),null);
 const original=await ledger.providerSourceForDownload(provider.id,review.row.id);assert.ok(original);assert.equal(original.expectedChecksum,checksum);
 assert.equal(await ledger.recordExpertSourceRead(provider.id,review.row.id,"b".repeat(64)),false);
 assert.equal(await ledger.recordExpertSourceRead(provider.id,review.row.id,checksum),true);
 assert.equal(await ledger.actExpertProvider(provider.id,deliver(review.row.id)),true);
 assert.equal(await ledger.actExpertProvider(provider.id,deliver(review.row.id)),false,"duplicate delivery denied");
 assert.equal((await ledger.listExpertCustomer(customer.id)).requests.find(r=>r.id===review.row.id).response,response);
 // Signed source refund must hide the delivered review and block settlement even before dependent state reconciliation.
 await makeReceipt(s.p.providerPaymentId);
 assert.equal((await ledger.listExpertCustomer(customer.id)).requests.find(r=>r.id===review.row.id).response,null);
 const providerView=(await ledger.listExpertProvider(provider.id)).find(r=>r.id===review.row.id);assert.equal(providerView.response,null);assert.equal(providerView.question,null);
 assert.equal(await ledger.actExpertAdmin(admin.id,adminSchema.parse({action:"SETTLED",id:review.row.id,reference:"SYNTHETIC-QA-"+run,confirmed:true})),false);
 const written=await purchase("WRITTEN",undefined,"written");
 await makeReceipt(written.payment.providerPaymentId);
 assert.equal(await ledger.actExpertProvider(provider.id,deliver(written.row.id)),false);
 assert.equal((await ledger.listExpertProvider(provider.id)).find(r=>r.id===written.row.id).question,null);
 const allowed=await purchase("WRITTEN",undefined,"writtenok");
 assert.equal(await ledger.actExpertProvider(provider.id,deliver(allowed.row.id)),true);
 assert.equal((await ledger.listExpertCustomer(customer.id)).requests.find(r=>r.id===allowed.row.id).response,response);
 assert.equal((await ledger.listExpertCustomer(stranger.id)).requests.length,0);
 console.log("EXPERT_RUNTIME_PASS "+JSON.stringify({kinds:2,syntheticRequests:3,duplicateIntent:true,wrongOwnerDenied:true,wrongPractitionerDenied:true,sourceReadRequired:true,sourceRefundGuard:true,serviceRefundGuard:true,responseDelivery:true,payoutBlockedAfterRefund:true,scope:"disposable PostgreSQL; synthetic profiles and payment records only; no practitioner or merchant activity"}));
}finally{
 await prisma.auditLog.deleteMany({where:{id:{in:receiptIds}}});
 await prisma.reportRequest.deleteMany({where:{id:{in:reportIds}}});
 for(const id of ids.reverse())await prisma.user.delete({where:{id}});
 await prisma.$disconnect();
}

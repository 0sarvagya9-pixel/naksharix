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
process.env.REPORT_STORAGE_DRIVER="database";
process.env.DIGITAL_PACKAGE_SALES_ENABLED="true";
process.env.DIGITAL_PACKAGE_GENERATION_ENABLED="true";
// Isolated price and credentials, not merchant transactions or approved public prices.
process.env.RAZORPAY_KEY_ID="rzp_test_qa_fixture_never_live";
process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID=process.env.RAZORPAY_KEY_ID;
process.env.RAZORPAY_KEY_SECRET="isolated-fixture-not-a-real-key";
process.env.RAZORPAY_WEBHOOK_SECRET="isolated-fixture-not-a-real-webhook-secret";
const defs=["business-name-numerology","complete-life","family-three","marriage-planning","astrology-course","astrology-workbook"];
process.env.DIGITAL_PACKAGE_APPROVED_OFFERS=JSON.stringify(defs.map(key=>({key,version:"v1",pricePaise:10000})));
globalThis.fetch=async()=>{throw Error("LIVE_NETWORK_FORBIDDEN_IN_PACKAGE_QA");};
const require=createRequire(import.meta.url),ts=require("typescript");
const oldResolve=Module._resolveFilename,oldLoad=Module._load;
Module._resolveFilename=function(name,...args){return oldResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){if(name==="server-only")return {};if(name==="razorpay")return class{constructor(){}};return oldLoad.call(this,name,...args);};
require.extensions[".ts"]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);};
const {prisma}=require("@/lib/db"),ledger=require("@/lib/digital-packages/ledger"),{packageDraftSchema}=require("@/lib/digital-packages/input"),{packageDefinitions,PACKAGE_TERMS_VERSION}=require("@/lib/digital-packages/catalogue");
const {renderPackageItem}=require("@/lib/digital-packages/render"),{PDFDocument}=require("pdf-lib");
const {readPaidCourse,assessPaidCourse}=require("@/lib/learning/paid-course"),{courseModules}=require("@/lib/learning/paid-course-contract");
const id=randomUUID().replaceAll("-",""),userIds=[],receiptIds=[];
const subject=(name,date,time,latitude,longitude,birthPlace)=>({birth:{name,gender:"not_specified",dateOfBirth:date,timeOfBirth:time,birthPlace,latitude,longitude,timezone:5.5},permission:true,romanName:name});
const subjects=[subject("Synthetic Asha","1992-05-18","08:15",28.6139,77.209,"Delhi, India"),subject("Synthetic Ravi","1991-11-23","17:20",19.076,72.8777,"Mumbai, India"),subject("Synthetic Mira","1985-01-10","10:30",22.7196,75.8577,"Indore, India")];
const draft=def=>packageDraftSchema.parse({clientIntent:randomUUID(),productKey:def.key,version:"v1",pricePaise:10000,termsVersion:PACKAGE_TERMS_VERSION,accepted:true,language:"en",subjects:subjects.slice(0,def.subjects),names:def.key==="business-name-numerology"?["Fixture Alpha","Fixture Beta"]:[],question:def.subjects?"Synthetic QA reflection.":""});
const proof=[];let docs=0;
try{
 const user=await prisma.user.create({data:{email:"package-"+id+"@example.invalid",name:"Synthetic Package QA",emailVerified:new Date()}});
 userIds.push(user.id);
 const other=await prisma.user.create({data:{email:"package-other-"+id+"@example.invalid",name:"Synthetic Other QA",emailVerified:new Date()}});
 userIds.push(other.id);
 assert.equal((await ledger.availablePackageOffers()).length,6);
 const cancellation=await ledger.preparePackage(user.id,draft(packageDefinitions.find(d=>d.key==="family-three")));
 assert.equal(cancellation.kind,"saved");
 assert.equal(await ledger.cancelPackageDraft(other.id,cancellation.order.id),false);
 assert.equal(await ledger.cancelPackageDraft(user.id,cancellation.order.id),true);
 const canceled=await prisma.digitalPackageOrder.findUniqueOrThrow({where:{id:cancellation.order.id},include:{items:true}});
 assert.equal(canceled.status,"CANCELED");assert.ok(canceled.items.every(i=>i.privateInput===null));
 for(const def of packageDefinitions){
  const input=draft(def),saved=await ledger.preparePackage(user.id,input);
  assert.equal(saved.kind,"saved",def.key);const order=saved.order;
  assert.deepEqual(order.items.map(i=>i.kind),[...def.kinds]);
  assert.ok(await ledger.resolvePackageCheckout(user.id,order.id,"v1",10000));
  assert.equal(await ledger.resolvePackageCheckout(user.id,order.id,"v1",10001),null);
  assert.equal(await ledger.resolvePackageCheckout(other.id,order.id,"v1",10000),null);
  const duplicate=await ledger.preparePackage(user.id,input);assert.equal(duplicate.order.id,order.id);
  const changed=await ledger.preparePackage(user.id,{...input,language:def.language==="multilingual"?"hi":"en",...(def.key==="business-name-numerology"?{names:["Fixture Delta","Fixture Gamma"]}:{}),...(def.key==="astrology-course"||def.key==="astrology-workbook"?{question:""}:{})});
  if(def.language==="multilingual"||def.key==="business-name-numerology")assert.equal(changed.kind,"conflict");
  const metadata={digitalPackageId:order.id,digitalPackageKey:def.key,digitalPackageVersion:"v1",digitalPackagePricePaise:10000,digitalPackageTermsVersion:PACKAGE_TERMS_VERSION,gatewayStatus:"captured"};
  const payment=await prisma.payment.create({data:{userId:user.id,provider:"RAZORPAY",purpose:"DIGITAL_PACKAGE",status:"PAID",amount:100,currency:"INR",providerPaymentId:"pay_QA"+id+docs,metadata}});
  await prisma.digitalPackageOrder.update({where:{id:order.id},data:{status:"PAID",paymentId:payment.id}});
  for(const item of order.items){
   assert.equal((await ledger.claimPackageItem(other.id,order.id,item.id)).kind,"denied");
   assert.equal(await ledger.loadPackageItemForDownload(user.id,order.id,item.id),null);
   const claims=await Promise.all([ledger.claimPackageItem(user.id,order.id,item.id),ledger.claimPackageItem(user.id,order.id,item.id)]);
   assert.deepEqual(claims.map(c=>c.kind).sort(),["busy","claimed"]);
   const claim=claims.find(c=>c.kind==="claimed");
   const bytes=await renderPackageItem(claim.item,claim.createdAt);
   const pdf=await PDFDocument.load(bytes);assert.ok(pdf.getPageCount()>=1);assert.ok(pdf.getTitle());
   assert.equal(await ledger.completePackageItem(user.id,order.id,item.id,randomUUID(),bytes),false);
   assert.equal(await ledger.completePackageItem(user.id,order.id,item.id,claim.leaseToken,bytes),true);
   const row=await prisma.digitalPackageItem.findUniqueOrThrow({where:{id:item.id}});
   assert.equal(row.privateInput,null);assert.equal(row.pdfChecksum,createHash("sha256").update(bytes).digest("hex"));assert.equal(row.attempts,1);
   const file=await ledger.loadPackageItemForDownload(user.id,order.id,item.id);
   assert.deepEqual(file.bytes,bytes);
   assert.equal(await ledger.loadPackageItemForDownload(other.id,order.id,item.id),null);
   assert.equal((await ledger.claimPackageItem(user.id,order.id,item.id)).kind,"ready");
   if(process.env.PACKAGE_QA_DIR){fs.mkdirSync(process.env.PACKAGE_QA_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.PACKAGE_QA_DIR,def.key+"-"+item.position+"-"+item.kind+".pdf"),bytes);}
   docs++;
  }
  if(def.key==="astrology-course"){
   for(const m of courseModules){
    assert.equal(await readPaidCourse(other.id,order.id,m.id),null);
    const lesson=await readPaidCourse(user.id,order.id,m.id);
    assert.ok(lesson.lesson.questions.every(q=>!("correct" in q)&&!("explanation" in q)));
    const wrong=m.questions.map(q=>(q.correct+1)%3),right=m.questions.map(q=>q.correct);
    assert.equal((await assessPaidCourse(user.id,order.id,m.id,wrong)).passed,false);
    assert.equal((await assessPaidCourse(user.id,order.id,m.id,right)).passed,true);
    await assessPaidCourse(user.id,order.id,m.id,wrong);
   }
   assert.ok((await readPaidCourse(user.id,order.id,undefined)).modules.every(m=>m.completed));
  }
  const receipt=await prisma.auditLog.create({data:{id:"razorpay-refund:rfnd_QA"+id+docs,action:"payment.razorpay_refund_processed_receipt",targetType:"RazorpayPayment",targetId:payment.providerPaymentId,metadata:{amountPaise:100}}});
  receiptIds.push(receipt.id);
  assert.equal(await ledger.loadPackageItemForDownload(user.id,order.id,order.items[0].id),null,"Signed receipt denies before ledger reconcile");
  assert.equal((await ledger.claimPackageItem(user.id,order.id,order.items[0].id)).kind,"denied");
  if(def.key==="astrology-course"){assert.equal(await readPaidCourse(user.id,order.id,undefined),null);assert.equal(await assessPaidCourse(user.id,order.id,courseModules[0].id,[1,0]),null);}
  proof.push({product:def.key,documents:order.items.length,ownerOnly:true,replaySafe:true,privateInputErased:true,refundGuard:true});
 }
 assert.equal(docs,13);
 console.log("DIGITAL_PACKAGE_DATABASE_RUNTIME_PASS "+JSON.stringify({products:proof.length,documents:docs,courseModules:7,proof,scope:"disposable PostgreSQL and isolated internal renderer; synthetic paid ledger; no actual merchant transaction"}));
}finally{
 await prisma.auditLog.deleteMany({where:{id:{in:receiptIds}}});
 for(const userId of userIds)await prisma.user.delete({where:{id:userId}});
 await prisma.$disconnect();
}

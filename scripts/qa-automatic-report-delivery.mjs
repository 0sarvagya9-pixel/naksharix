import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const dbMode=process.argv.includes("--database");
if(dbMode){
 const url=new URL(process.env.DATABASE_URL??"");
 assert.equal(process.env.CI,"true");
 assert.equal(url.hostname,"localhost");
 assert.equal(url.port,"5432");
 assert.equal(url.pathname,"/naksharix");
}
process.env.NODE_ENV="test";
process.env.ASTROLOGY_PROVIDER="own_engine";
process.env.AUTO_REPORT_DELIVERY_ENABLED="true";
process.env.REPORT_STORAGE_DRIVER="database";
process.env.EMAIL_PROVIDER="smtp";
process.env.SMTP_HOST="smtp.resend.com";
process.env.SMTP_USER="resend";
process.env.SMTP_PASS="test-only-not-a-real-key";
process.env.SMTP_FROM="Naksharix QA <qa@example.invalid>";
process.env.NEXT_PUBLIC_APP_URL="http://localhost:3000";
const originalResolve=Module._resolveFilename, originalLoad=Module._load;
Module._resolveFilename=function(name,...args){
 return originalResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);
};
Module._load=function(name,...args){
 if(name==="server-only")return {};
 return originalLoad.call(this,name,...args);
};
require.extensions[".ts"]=function(module,file){
 const result=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
 module._compile(result.outputText,file);
};
const input=require("@/lib/reports/automatic-report-input");
const {assembleAutomaticPaidReport}=require("@/lib/reports/automatic-report-content");
const {generatePremiumReportPdf}=require("@/lib/reports/premium-report-generation-service");
const {getManualReportCheckout}=require("@/lib/reports/checkout-catalogue");
const {PDFDocument}=require("pdf-lib");
const birth={name:"Asha Test",gender:"female",dateOfBirth:"1992-05-18",timeOfBirth:"08:15",birthPlace:"Delhi, India",latitude:28.6139,longitude:77.209,timezone:5.5};
const partner={...birth,name:"Ravi Test",gender:"male",dateOfBirth:"1991-11-23",timeOfBirth:"17:20",birthPlace:"Mumbai, India",latitude:19.076,longitude:72.8777};
const extra={confirmed:true,partner,partnerPermission:true,romanName:"Asha Test",candidateNames:["Aasha Test","Asha T"]};
const question="Test fixture: reflective personal planning.";
const sections={
 "premium-kundli":"planets","couple-kundli":"guna","career-report":"career-houses","wealth-report":"wealth-houses","love-report":"relationship-houses","baby-name-report":"name-options","sade-sati-report":"sade-sati-months","manglik-kaal-sarp-report":"manglik","numerology-lo-shu-report":"lo-shu","name-correction-report":"name-comparison","yearly-horoscope-report":"yearly-months","transit-report":"transit-months","rahu-ketu-report":"node-transits","jupiter-transit-report":"jupiter-transits","fortune-report":"fortune-houses"
};
let sent=[];
let emailStatus=200;
globalThis.fetch=async(url,options)=>{
 assert.equal(String(url),"https://api.resend.com/emails","Test must never use live network");
 assert.equal(options.headers.Authorization,"Bearer test-only-not-a-real-key");
 sent.push({payload:JSON.parse(options.body),key:options.headers["Idempotency-Key"]});
 return new Response(JSON.stringify({id:"isolated-test"}),{status:emailStatus});
};
if(!dbMode){
 assert.equal(input.AUTO_REPORT_SLUGS.length,15);
 assert.equal(new Set(input.AUTO_REPORT_SLUGS).size,15);
 const { automaticReportPublicPreview } = require("@/lib/reports/public-preview");
 for (const locale of ["en", "hi", "hinglish"]) {
   const previews = input.AUTO_REPORT_SLUGS.map(slug => automaticReportPublicPreview(slug, locale));
   assert.equal(new Set(previews.map(p=>p.summary)).size,15,"Each report must have distinct public product copy");
   for(const p of previews){assert.ok(p.summary.length>20);assert.equal(p.features.length,3);assert.ok(p.features.every(x=>x.length>5));}
 }
 assert.equal(automaticReportPublicPreview("unknown-slug","en"),null);
 assert.equal(automaticReportPublicPreview("__proto__","en"),null);
 assert.equal(input.checkAutomaticInputs("couple-kundli",birth,{confirmed:true}).ok,false);
 assert.equal(input.checkAutomaticInputs("name-correction-report",birth,{confirmed:true}).ok,false);
 assert.equal(input.checkAutomaticInputs("premium-kundli",{...birth,timezone:99},extra).ok,false);
 assert.equal(input.decodeAutomaticReportInput(input.encodeAutomaticReportInput(question,extra)).question,question);
 for(const slug of input.AUTO_REPORT_SLUGS){
   assert.ok(getManualReportCheckout(slug),slug+" has a paid SKU");
   const {title,content}=await assembleAutomaticPaidReport({slug,birth,extra,question,language:"en",now:new Date("2026-11-24T12:00:00Z")});
   assert.ok(content.sections.some(s=>s.key===sections[slug]),slug+" specific content");
   assert.ok(content.sections.length>=5);
   const result=await generatePremiumReportPdf({requestId:"fixture-"+slug,templateId:slug,status:"ready_for_generation",content,automatedInputValidated:true,reportTitle:title,customerName:birth.name,language:"en"});
   assert.equal(result.generated,true,slug+" PDF generated");
   const doc=await PDFDocument.load(result.bytes);
   assert.ok(doc.getPageCount()>=4 && doc.getPageCount()<=30,"Editorial pagination "+slug+": "+doc.getPageCount());
   assert.ok(content.sections.some(s=>s.key==="editorial-insights"));
   if(process.env.REPORT_VISUAL_QA_DIR){fs.mkdirSync(process.env.REPORT_VISUAL_QA_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.REPORT_VISUAL_QA_DIR,slug+"-en.pdf"),result.bytes);}
   assert.equal(doc.getAuthor(),"NAKSHARIX");
   assert.ok(doc.getTitle().includes(title));
   console.log("PASS "+slug+" "+doc.getPageCount()+" pages / "+result.bytes.length+" bytes");
 }
 for(const language of ["hi","hinglish"]){
   for(const slug of input.AUTO_REPORT_SLUGS){
   const {title,content}=await assembleAutomaticPaidReport({slug,birth,extra,question,language});
   const result=await generatePremiumReportPdf({requestId:"fixture-"+language,templateId:slug,status:"ready_for_generation",content,automatedInputValidated:true,reportTitle:title,customerName:birth.name,language});
   assert.equal(result.generated,true);const localized=await PDFDocument.load(result.bytes);assert.ok(localized.getPageCount()>=4&&localized.getPageCount()<=35,slug+" "+language+" pagination");
   if(process.env.REPORT_VISUAL_QA_DIR)fs.writeFileSync(path.join(process.env.REPORT_VISUAL_QA_DIR,slug+"-"+language+".pdf"),result.bytes);
   console.log("PASS "+slug+" "+language+" editorial PDF "+localized.getPageCount()+" pages");
   }
 }
 const {buildFictionalReportSample}=require("@/lib/reports/fictional-sample");
 for(const slug of input.AUTO_REPORT_SLUGS){
   const preview=await PDFDocument.load(await buildFictionalReportSample(slug));
   assert.ok(preview.getPageCount()>0&&preview.getPageCount()<=3);
   assert.match(preview.getTitle(),/FICTIONAL SAMPLE/);
   assert.equal(preview.getAuthor(),"NAKSHARIX");
 }
 await assert.rejects(()=>buildFictionalReportSample("unknown-slug"));
 const mail=require("@/lib/reports/report-delivery-service");
 const result=await mail.sendReportDeliveryEmail({to:"test@example.invalid",fullName:"Asha <Test>",reportName:"Test Kundli",reportRequestId:"test-fixture",downloadUrl:"http://localhost:3000/report-request/success?id=test-fixture"});
 assert.equal(result.sent,true);assert.equal(sent.length,1);
 assert.equal(sent[0].payload.to[0],"test@example.invalid");assert.match(sent[0].payload.html,/NAKSHARIX/);assert.match(sent[0].payload.html,/Asha &lt;Test&gt;/);assert.equal(sent[0].key,"naksharix/report-delivery/test-fixture");
 console.log("PASS 15/15 distinct reports, localized PDFs, isolated branded email");
}else{
 const {prisma}=require("@/lib/db");
 const {processAutomaticReport}=require("@/lib/reports/automatic-report-worker");
 const user=await prisma.user.create({data:{name:birth.name,email:"auto-report-fixture@example.invalid",emailVerified:new Date()}});
 const ids=[];
 try{
  async function make(slug,status="PAID"){
   const product=getManualReportCheckout(slug);
   const n=ids.length;
   const payment=await prisma.payment.create({data:{userId:user.id,provider:"RAZORPAY",status,purpose:product.purpose,amount:product.amount,currency:"INR",providerPaymentId:"qa_isolated_"+n,metadata:{reportId:product.reportId}}});
   const row=await prisma.reportRequest.create({data:{userId:user.id,paymentId:payment.id,planType:"PREMIUM",reportSlug:slug,status:"PAID",paymentStatus:"PAID",deliveryStatus:"auto_queued",deliveryEmail:user.email,fullName:birth.name,gender:birth.gender,dateOfBirth:birth.dateOfBirth,timeOfBirth:birth.timeOfBirth,birthPlace:birth.birthPlace,latitude:birth.latitude,longitude:birth.longitude,timezone:birth.timezone,concern:input.encodeAutomaticReportInput(question,extra),language:"en"}});
   ids.push(row.id);return row.id;
  }
  const id=await make("numerology-lo-shu-report");
  const outcomes=await Promise.all([processAutomaticReport(id),processAutomaticReport(id)]);
  const row=await prisma.reportRequest.findUniqueOrThrow({where:{id}});
  assert.ok(outcomes.includes("delivered"),JSON.stringify(outcomes)+" "+row.deliveryError);
  assert.equal(row.status,"DELIVERED");assert.equal(row.deliveryStatus,"email_sent");assert.ok(row.generatedPdfBytes?.length);assert.ok(row.emailSentAt);
  assert.equal(sent.length,1);assert.equal(sent[0].payload.to[0],user.email);assert.match(sent[0].payload.html,/report-request\/success/);
  assert.equal(await processAutomaticReport(id),"skipped");assert.equal(sent.length,1);
  const retry=await make("career-report");emailStatus=503;
  assert.equal(await processAutomaticReport(retry),"pending");let failed=await prisma.reportRequest.findUniqueOrThrow({where:{id:retry}});
  assert.equal(failed.status,"READY_FOR_DELIVERY");assert.equal(failed.emailSentAt,null);assert.ok(failed.generatedPdfBytes?.length);
  const checksum=failed.generatedPdfChecksum;
  emailStatus=200;assert.equal(await processAutomaticReport(retry),"delivered");
  failed=await prisma.reportRequest.findUniqueOrThrow({where:{id:retry}});assert.equal(failed.generatedPdfChecksum,checksum);
  const unpaid=await make("love-report","PENDING");assert.equal(await processAutomaticReport(unpaid),"skipped");
  console.log("PASS disposable DB worker, one-time send, retry without regeneration, unpaid rejection");
 }finally{
  await prisma.reportRequest.deleteMany({where:{id:{in:ids}}});
  await prisma.user.delete({where:{id:user.id}});
  await prisma.$disconnect();
 }
}

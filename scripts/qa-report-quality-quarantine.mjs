import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
import {randomUUID} from "node:crypto";

const db=new URL(process.env.DATABASE_URL??"");
assert.deepEqual([process.env.CI,db.hostname,db.port,db.pathname],["true","localhost","5432","/naksharix"]);
Object.assign(process.env,{NODE_ENV:"test",ASTROLOGY_PROVIDER:"own_engine",AUTO_REPORT_DELIVERY_ENABLED:"true",REPORT_STORAGE_DRIVER:"database",EMAIL_PROVIDER:"disabled"});
const require=createRequire(import.meta.url), ts=require("typescript");
const resolve=Module._resolveFilename,load=Module._load;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){return name==="server-only"?{}:load.call(this,name,...args);};
require.extensions[".ts"]=(m,name)=>m._compile(ts.transpileModule(fs.readFileSync(name,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,name);
globalThis.fetch=async()=>{throw Error("Network is disabled in quality quarantine test");};
const {prisma}=require("@/lib/db");
const {encodeAutomaticReportInput}=require("@/lib/reports/automatic-report-input");
const assembly=require("@/lib/reports/automatic-report-content"),assemble=assembly.assembleAutomaticPaidReport;
let expectedFailure;
assembly.assembleAutomaticPaidReport=async input=>{
  const result=await assemble(input);
  if(expectedFailure==="INPUT_MISMATCH")result.content.metadata.binding.inputHash="0".repeat(64);
  if(expectedFailure==="CONTENT_CHANGED")result.content.sections.at(-1).title+=" altered";
  return result;
};
const {processAutomaticReport,runAutomaticReportRecovery}=require("@/lib/reports/automatic-report-worker");
const runId=randomUUID();
const user=await prisma.user.create({data:{name:"Quality Test",email:runId+"@example.invalid",emailVerified:new Date()}});
try{
  for(const failure of ["INPUT_MISMATCH","CONTENT_CHANGED"]){
    expectedFailure=failure;
    const p=await prisma.payment.create({data:{userId:user.id,provider:"RAZORPAY",status:"PAID",purpose:"KUNDLI_REPORT",amount:599,currency:"INR",providerPaymentId:"pay_"+randomUUID().replaceAll("-",""),metadata:{reportId:"career-report"}}});
    const row=await prisma.reportRequest.create({data:{userId:user.id,planType:"PREMIUM",reportSlug:"career-report",paymentId:p.id,
      paymentStatus:"PAID",status:"PAID",deliveryStatus:"auto_queued",deliveryEmail:user.email,fullName:user.name,dateOfBirth:"1992-05-18",timeOfBirth:"08:15",
      birthPlace:"Delhi",latitude:28.6139,longitude:77.209,timezone:5.5,language:"en",concern:encodeAutomaticReportInput("",{confirmed:true})}});
    assert.equal(await processAutomaticReport(row.id),"pending");
    const quarantined=await prisma.reportRequest.findUniqueOrThrow({where:{id:row.id}});
    assert.equal(quarantined.deliveryStatus,"auto_quality_review");
    assert.equal(quarantined.deliveryError,"REPORT_QC_"+failure);
    assert.equal(quarantined.generatedPdfBytes,null);
    assert.equal(quarantined.generatedPdfStorageKey,null);
    assert.equal(quarantined.emailSentAt,null);
    assert.equal(await processAutomaticReport(row.id),"skipped");
    console.log("PASS quality mismatch quarantined in PostgreSQL:",failure);
  }
  assert.equal((await runAutomaticReportRecovery()).selected,0,"Scheduled recovery must not process quarantined fixtures");
}finally{
  await prisma.reportRequest.deleteMany({where:{userId:user.id}});
  await prisma.user.delete({where:{id:user.id}});
  await prisma.$disconnect();
}

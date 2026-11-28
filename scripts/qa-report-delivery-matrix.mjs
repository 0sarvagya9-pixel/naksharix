import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash,randomUUID } from "node:crypto";
import Module,{createRequire} from "node:module";
import {execFileSync} from "node:child_process";

const db=new URL(process.env.DATABASE_URL??"");
assert.deepEqual([process.env.CI,db.hostname,db.port,db.pathname],["true","localhost","5432","/naksharix"]);
Object.assign(process.env,{NODE_ENV:"test",ASTROLOGY_PROVIDER:"own_engine",AUTO_REPORT_DELIVERY_ENABLED:"true",REPORT_STORAGE_DRIVER:"database",
  NEXT_PUBLIC_APP_URL:"http://localhost:3000",EMAIL_PROVIDER:"smtp",SMTP_HOST:"smtp.resend.com",SMTP_USER:"resend",
  SMTP_PASS:"local-rehearsal-only",SMTP_FROM:"Fixture <fixture@example.invalid>"});
const require=createRequire(path.join(process.cwd(),"package.json")),ts=require("typescript");
const resolve=Module._resolveFilename,load=Module._load;
let identity;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){if(name==="server-only")return {};if(name==="@/lib/auth/jwt")return {getCurrentUser:async()=>identity};return load.call(this,name,...args);};
require.extensions[".ts"]=(m,name)=>m._compile(ts.transpileModule(fs.readFileSync(name,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,name);
const {prisma}=require("@/lib/db"),{getManualReportCheckout}=require("@/lib/reports/checkout-catalogue"),{AUTO_REPORT_SLUGS,checkNewReportInputs,encodeAutomaticReportInput}=require("@/lib/reports/automatic-report-input"),
  {reportIntakeScope}=require("@/lib/reports/public-intake"),{processAutomaticReport}=require("@/lib/reports/automatic-report-worker"),
  {GET:download}=require("@/app/api/report-requests/[id]/download/route"),{PDFDocument}=require("pdf-lib");
const emails=[];
globalThis.fetch=async(url,options)=>{
  assert.equal(String(url),"https://api.resend.com/emails","Live transport disallowed");
  const body=JSON.parse(options.body),key=options.headers["Idempotency-Key"],receipt="synthetic-"+randomUUID();
  emails.push({body,key,receipt});
  return Response.json({id:receipt});
};
const runId=randomUUID(),results=[],userIds=[],reportIds=[],paymentIds=[];
const birth={name:"Asha Review",dateOfBirth:"1992-05-18",timeOfBirth:"08:15",birthPlace:"Delhi",latitude:28.6139,longitude:77.209,timezone:5.5};
const partner={name:"Ravi Review",dateOfBirth:"1993-08-12",timeOfBirth:"14:30",birthPlace:"Mumbai",latitude:19.07,longitude:72.87,timezone:5.5};
const sha=execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim();
const receiptPath=process.argv[2];
assert.ok(receiptPath,"Pass a local JSON receipt path; this suite never contacts a provider or real inbox.");
let cleanup;
const writeReceipt=()=>fs.writeFileSync(receiptPath,JSON.stringify({source:sha,scope:"Synthetic provider-verified-state fixtures and intercepted provider transport; real PostgreSQL/worker/storage/download, no provider or inbox evidence",results,cleanup},null,2));
try{
  for (const [i,slug] of AUTO_REPORT_SLUGS.entries()) {
    const product=getManualReportCheckout(slug),scope=reportIntakeScope(slug);
    const user=await prisma.user.create({data:{name:birth.name,email:`sku-${i}-${runId}@example.invalid`,emailVerified:new Date()}});
    userIds.push(user.id);
    // Use an actual, distinct foreign account per SKU. Reusing the first
    // customer across all 45 denial probes incorrectly trips its production
    // rate limit and masks the authorization result on fast test machines.
    const foreign=await prisma.user.create({data:{name:"Foreign fixture",email:`foreign-${i}-${runId}@example.invalid`,emailVerified:new Date()}});
    userIds.push(foreign.id);
    for(const language of ["en","hi","hinglish"]){
      const result={slug,language,source:sha};
      try{
        const b=scope.babyName?{...birth,dateOfBirth:"2026-08-14"}:birth;
        const exactBirth=scope.dateNameOnly?{name:b.name,dateOfBirth:b.dateOfBirth}:b;
        const extra={confirmed:true,...(scope.romanName?{romanName:"Asha Review"}:{}),...(scope.babyName?{guardianPermission:true}:{}),
          ...(scope.candidateNames?{candidateNames:["Aasha Review","Asha Reva"]}:{}),...(scope.couple?{partner,partnerPermission:true}:{})};
        assert.equal(checkNewReportInputs(slug,exactBirth,extra).ok,true,"input");
        const payment=await prisma.payment.create({data:{userId:user.id,provider:"RAZORPAY",status:"PAID",purpose:product.purpose,amount:product.amount,currency:"INR",
          providerPaymentId:"pay_"+randomUUID().replaceAll("-",""),metadata:{reportId:product.reportId}}});
        paymentIds.push(payment.id);
        const row=await prisma.reportRequest.create({data:{userId:user.id,paymentId:payment.id,planType:"PREMIUM",reportSlug:slug,paymentStatus:"PAID",status:"PAID",deliveryStatus:"auto_queued",
          deliveryEmail:user.email,fullName:b.name,dateOfBirth:b.dateOfBirth,timeOfBirth:scope.dateNameOnly?"":b.timeOfBirth,birthPlace:scope.dateNameOnly?"":b.birthPlace,
          latitude:scope.dateNameOnly?null:b.latitude,longitude:scope.dateNameOnly?null:b.longitude,timezone:scope.dateNameOnly?null:b.timezone,
          language,concern:encodeAutomaticReportInput("",extra)}});
        reportIds.push(row.id);
        const before=emails.length;
        const outcome=await processAutomaticReport(row.id);
        const saved=await prisma.reportRequest.findUniqueOrThrow({where:{id:row.id}});
        assert.equal(outcome,"delivered",saved.deliveryError??"worker");
        assert.equal(saved.deliveryStatus,"email_sent");
        assert.ok(saved.emailSentAt);
        assert.equal(emails.length,before+1);
        assert.equal(emails[before].body.to[0],user.email);
        assert.equal(emails[before].key,"naksharix/report-delivery/"+row.id);
        assert.ok(emails[before].body.html.includes("http://localhost:3000/report-request/success?id="+row.id));
        assert.ok(!emails[before].body.html.includes(b.dateOfBirth));
        const history=await prisma.reportStatusHistory.findMany({where:{reportRequestId:row.id}});
        assert.ok(history.some(h=>h.metadata?.inputHash && h.metadata.pdfChecksum===saved.generatedPdfChecksum));
        assert.ok(history.some(h=>h.metadata?.providerMessageId===emails[before].receipt));
        assert.equal(await processAutomaticReport(row.id),"skipped");
        assert.equal(emails.length,before+1,"A completed delivery must not send another message");
        identity=user;
        const link=new Request("http://localhost:3000/api/report-requests/"+row.id+"/download"),params={params:Promise.resolve({id:row.id})};
        const resp=await download(link,params);assert.equal(resp.status,200);
        assert.match(resp.headers.get("cache-control"),/no-store/);
        const bytes=Buffer.from(await resp.arrayBuffer()), checksum=createHash("sha256").update(bytes).digest("hex");
        assert.equal(checksum,saved.generatedPdfChecksum);
        const doc=await PDFDocument.load(bytes);assert.ok(doc.getPageCount()>=3);assert.match(doc.getKeywords(),/naksharix-royal-qc-v1/);
        identity=foreign;
        assert.equal((await download(link,params)).status,403);
        identity=user;
        await prisma.payment.update({where:{id:payment.id},data:{status:"REFUNDED"}});
        assert.equal((await download(link,params)).status,403);
        assert.equal(await processAutomaticReport(row.id),"skipped");
        assert.equal(emails.length,before+1);
        Object.assign(result,{pass:true,pages:doc.getPageCount(),pdfChecksum:checksum});
      }catch(e){Object.assign(result,{pass:false,reason:e.message});}
      results.push(result);console.log(result.pass?"PASS":"FAIL",slug,language,result.reason??result.pages);
      writeReceipt();
    }
  }
}finally{
  identity=undefined;
  const auditWhere={targetType:"ReportRequest",targetId:{in:reportIds}};
  try{
    // Audit actors are SetNull and generation audits have no actor. Delete
    // only this run's known report targets before their fixtures disappear.
    await prisma.$transaction([
      prisma.auditLog.deleteMany({where:auditWhere}),
      prisma.reportRequest.deleteMany({where:{id:{in:reportIds}}}),
      prisma.payment.deleteMany({where:{id:{in:paymentIds}}}),
      prisma.user.deleteMany({where:{id:{in:userIds}}})
    ]);
    const [users,payments,reports,revisions,history,audits]=await Promise.all([
      prisma.user.count({where:{id:{in:userIds}}}),
      prisma.payment.count({where:{id:{in:paymentIds}}}),
      prisma.reportRequest.count({where:{id:{in:reportIds}}}),
      prisma.reportRevision.count({where:{reportRequestId:{in:reportIds}}}),
      prisma.reportStatusHistory.count({where:{reportRequestId:{in:reportIds}}}),
      prisma.auditLog.count({where:auditWhere})
    ]);
    const remaining={users,payments,reports,revisions,history,audits};
    assert.deepEqual(remaining,{users:0,payments:0,reports:0,revisions:0,history:0,audits:0},"Synthetic delivery fixtures must be removed");
    cleanup={pass:true,tracked:{users:userIds.length,payments:paymentIds.length,reports:reportIds.length},remaining};
    console.log("REPORT_DELIVERY_MATRIX_CLEANUP_PASS",JSON.stringify(cleanup));
  }catch(error){
    cleanup={pass:false,reason:error instanceof Error?error.message:String(error)};
    throw error;
  }finally{
    try{writeReceipt();}finally{await prisma.$disconnect();}
  }
}
if(results.some(x=>!x.pass)||results.length!==45)process.exitCode=1;

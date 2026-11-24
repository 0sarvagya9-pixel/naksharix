// One-off owner-authorized QA; do not deploy or merge. All output lives in
// RUNNER_TEMP and is encrypted before upload. Never log personal inputs.
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
import assert from "node:assert/strict";
const require=createRequire(import.meta.url),ts=require("typescript");
assert.equal(process.env.CI,"true");
assert.ok(process.env.RUNNER_TEMP);
process.env.NODE_ENV="test";
process.env.ASTROLOGY_PROVIDER="own_engine";
process.env.EMAIL_PROVIDER="disabled";
const oldResolve=Module._resolveFilename,oldLoad=Module._load;
Module._resolveFilename=function(name,...args){return oldResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args)};
Module._load=function(name,...args){return name==="server-only"?{}:oldLoad.call(this,name,...args)};
require.extensions[".ts"]=function(mod,file){mod._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file)};
const log=console.log.bind(console);
// Own-engine benchmark comparison can contain personal chart data. Suppress
// all library diagnostics, including stack traces; print only QA counts.
for(const method of ["log","info","table","warn","debug","error"])console[method]=()=>{};
globalThis.fetch=async()=>{throw new Error("QA_NETWORK_DISABLED")};
const {AUTO_REPORT_SLUGS}=require("@/lib/reports/automatic-report-input");
const {assembleAutomaticPaidReport}=require("@/lib/reports/automatic-report-content");
const {generatePremiumReportPdf}=require("@/lib/reports/premium-report-generation-service");
const {astrosageSarvagyaPandeyInput:existingOwnerFixture}=require("@/lib/astrology/test-cases/astrosage-sarvagya-pandey");
const {PDFDocument}=require("pdf-lib");
const {createHash}=require("node:crypto");
const {language:unusedLanguage,...sourceBirth}=existingOwnerFixture;
const birth={...sourceBirth,dateOfBirth:String(sourceBirth.dateOfBirth).slice(0,10),timeOfBirth:sourceBirth.timeOfBirth.slice(0,5),timezone:Number(sourceBirth.timezone)};
const out=path.join(process.env.RUNNER_TEMP,"owner-report-qa","reports");
fs.mkdirSync(out,{recursive:true,mode:0o700});
const summary=[];
for(const slug of AUTO_REPORT_SLUGS){
 try{
  const extra={confirmed:true,romanName:birth.name,candidateNames:[birth.name,birth.name.replace(/Pandey$/i,"Panday")]};
  let question="Owner-requested report quality sample; no specific question was provided. This is a test PDF, not a paid customer order.";
  if(slug==="couple-kundli"){
   extra.partner={name:"Synthetic QA Partner",gender:"female",dateOfBirth:"1991-11-23",timeOfBirth:"17:20",birthPlace:"Mumbai, India",latitude:19.076,longitude:72.8777,timezone:5.5};
   extra.partnerPermission=true;
   question="QA DEMONSTRATION ONLY. The second person's data are fictional test inputs, not an actual partner. Do not use the matching result for a real relationship.";
  }
  if(slug==="baby-name-report"){extra.candidateNames=[];question="QA DEMONSTRATION ONLY. Uses the supplied adult birth details to exercise the baby-name generator; not a real child's naming recommendation."}
  if(slug==="name-correction-report")question="QA DEMONSTRATION ONLY. Alternative Roman spelling is illustrative and was not supplied or endorsed by the report subject.";
  const {title,content}=await assembleAutomaticPaidReport({slug,birth,extra,question,language:"en"});
  const marked=["couple-kundli","baby-name-report","name-correction-report"].includes(slug)?"QA DEMO — "+title:title;
  const result=await generatePremiumReportPdf({requestId:"owner-qa-"+slug,templateId:slug,status:"ready_for_generation",content,automatedInputValidated:true,reportTitle:marked,customerName:birth.name,language:"en"});
  assert.equal(result.generated,true);
  const pdf=await PDFDocument.load(result.bytes);
  assert.equal(pdf.getAuthor(),"NAKSHARIX");assert.ok(pdf.getPageCount()>0);
  const filename=slug+".pdf";
  fs.writeFileSync(path.join(out,filename),result.bytes,{mode:0o600});
  summary.push({report:slug,pages:pdf.getPageCount(),bytes:result.bytes.length,sha256:createHash("sha256").update(result.bytes).digest("hex")});
  log("PASS "+slug+" "+pdf.getPageCount()+" pages");
 }catch{log("FAIL "+slug+" (sanitized; no personal details logged)");process.exitCode=1}
}
if(summary.length!==15)process.exit(1);
fs.writeFileSync(path.join(out,"QA-READ-ME.txt"),[
 "NAKSHARIX owner-requested quality review. All PDFs use the deployed report content and PDF renderer.",
 "No customer purchase, payment, order, sale or production delivery record was created.",
 "Couple report contains fictional partner data; baby-name and name-spelling reports are illustrative demos.",
 "Normal production delivery uses registered-email secure account links. This archive is an isolated PDF quality test.",
 "Report details and page counts:",...summary.map(s=>s.report+" | "+s.pages+" pages | SHA256 "+s.sha256)
].join("\n"),{mode:0o600});
log("VERIFIED_REPORTS="+summary.length);

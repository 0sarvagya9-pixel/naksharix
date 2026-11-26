import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const resolve = Module._resolveFilename;
const load = Module._load;
Module._resolveFilename = function(name, ...args) {
  return resolve.call(this, name.startsWith("@/") ? path.resolve(name.slice(2)) : name, ...args);
};
Module._load = function(name, ...args) {
  return name === "server-only" ? {} : load.call(this, name, ...args);
};
require.extensions[".ts"] = function(module, file) {
  const result = ts.transpileModule(readFileSync(file, "utf8"), {compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true
  }});
  module._compile(result.outputText, file);
};
process.env.ASTROLOGY_PROVIDER = "own_engine";
const { AUTO_REPORT_SLUGS, checkNewReportInputs } = require("@/lib/reports/automatic-report-input");
const { reportIntakeScope } = require("@/lib/reports/public-intake");
const { assembleAutomaticPaidReport } = require("@/lib/reports/automatic-report-content");
const { editorialTerm } = require("@/lib/reports/editorial-display");
const { generatePremiumReportPdf } = require("@/lib/reports/premium-report-generation-service");
const { PDFDocument } = require("pdf-lib");
const profiles = [
  {name:"Asha Mehra",gender:"female",dateOfBirth:"1992-05-18",timeOfBirth:"08:15",birthPlace:"Delhi, India",latitude:28.6139,longitude:77.209,timezone:5.5},
  {name:"Robin Ellis",gender:"male",dateOfBirth:"1987-07-05",timeOfBirth:"14:40",birthPlace:"London, United Kingdom",latitude:51.5074,longitude:-0.1278,timezone:1},
  {name:"Meera Shah",gender:"female",dateOfBirth:"1998-12-21",timeOfBirth:"22:55",birthPlace:"Kathmandu, Nepal",latitude:27.7172,longitude:85.324,timezone:5.75}
];
const zones = ["Asia/Kolkata","Europe/London","Asia/Kathmandu"];
const questions = [
  {en:"What can I learn about balancing family responsibilities?",hi:"पारिवारिक जिम्मेदारियों में संतुलन कैसे रखूँ?",hinglish:"Family responsibilities mein balance kaise rakhoon?"},
  {en:"Which habits can help me reflect on my career?",hi:"अपने करियर पर विचार करने के लिए कौन सी आदतें अपनाऊँ?",hinglish:"Career par sochne ke liye kaunsi habits apnaoon?"},
  {en:"How can I track progress in my studies?",hi:"अपनी पढ़ाई की प्रगति कैसे देखूँ?",hinglish:"Apni padhai ki progress kaise track karoon?"}
];
const root = process.env.REPORT_MATRIX_DIR;
if (!root) throw Error("Set REPORT_MATRIX_DIR to a private output directory for the fictional customer files.");
const chosen = process.env.REPORT_MATRIX_PROFILE;
const rows = [];
const sourceRevision = execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim();
const sourceDirty = execFileSync("git",["status","--porcelain"],{encoding:"utf8"}).length>0;
const now = new Date(process.env.REPORT_MATRIX_AS_OF || "2026-11-26T12:00:00Z");
for (const [index, profile] of profiles.entries()) {
  if (chosen && Number(chosen) !== index + 1) continue;
  const output = path.join(root, "profile-" + (index + 1));
  await fs.mkdir(output, {recursive:true});
  for (const language of ["en","hi","hinglish"]) {
    if(process.env.REPORT_MATRIX_LANG && process.env.REPORT_MATRIX_LANG!==language) continue;
    for (const slug of AUTO_REPORT_SLUGS) {
      if(process.env.REPORT_MATRIX_SKU && process.env.REPORT_MATRIX_SKU!==slug) continue;
      const started = performance.now();
      const row = {sourceRevision,sourceDirty,profile:index+1,name:profile.name,language,slug};
      try {
        const scope = reportIntakeScope(slug);
        const birth = scope.dateNameOnly ? {name:profile.name,dateOfBirth:profile.dateOfBirth}
          : scope.babyName ? {...profile,dateOfBirth:["2026-11-03","2026-09-14","2026-08-22"][index]} : profile;
        const extra = {confirmed:true};
        if (!scope.dateNameOnly) extra.birthZone = zones[index];
        if (scope.babyName) extra.guardianPermission = true;
        if (scope.romanName) extra.romanName = profile.name;
        if (scope.candidateNames) extra.candidateNames = [["Aasha Mehra","Asha Mira"],["Robyn Ellis","Robin Ellise"],["Mira Shah","Meera Shaah"]][index];
        if (scope.couple) {
          extra.partner = profiles[(index+1)%profiles.length];
          extra.partnerPermission = true;
          extra.partnerZone = zones[(index+1)%profiles.length];
        }
        assert.equal(checkNewReportInputs(slug,birth,extra).ok,true,"new intake rejected fixture");
        const question = scope.babyName
          ? {en:"Which proposed name matches the traditional birth syllable?",hi:"कौन सा प्रस्तावित नाम पारंपरिक जन्म ध्वनि से मेल खाता है?",hinglish:"Kaunsa proposed naam traditional janm sound se match karta hai?"}[language]
          : questions[index][language];
        const {content,title} = await assembleAutomaticPaidReport({slug,birth,extra,question,language,now});
        if (!scope.dateNameOnly) {
          const calculated = content.sections.find(section=>section.key==="birth").data;
          row.profileCards = [
            ["Lagna",calculated.ascendant],["Moon sign",calculated.moonSign],
            ["Nakshatra",calculated.nakshatra],["Sun sign",calculated.sunSign],
          ].map(([label,value])=>({label:editorialTerm(label,language).toUpperCase(),value:editorialTerm(value,language)}));
        }
        const requestId = ["royal",index+1,slug,language].join("-");
        const rendered = await generatePremiumReportPdf({requestId,templateId:slug,status:"ready_for_generation",content,automatedInputValidated:true,reportTitle:title,customerName:profile.name,language});
        assert.equal(rendered.generated,true);
        const pdf = await PDFDocument.load(rendered.bytes);
        assert.ok(pdf.getPageCount() >= 3);
        assert.ok(pdf.getTitle().endsWith(requestId));
        const filename = slug+"-"+language+".pdf";
        await fs.writeFile(path.join(output,filename),rendered.bytes);
        Object.assign(row,{pass:true,filename,requestId,pages:pdf.getPageCount(),bytes:rendered.bytes.length,sha256:createHash("sha256").update(rendered.bytes).digest("hex"),sections:content.sections.map(section=>section.key)});
      } catch (error) { Object.assign(row,{pass:false,error:String(error)}); }
      row.elapsedMs = Math.round(performance.now()-started);
      rows.push(row);
      console.log(row.pass?"PASS":"FAIL",row.profile,slug,language,row.pages??row.error,row.elapsedMs+"ms");
    }
  }
  await fs.writeFile(path.join(output,"generation.json"),JSON.stringify(rows.filter(row=>row.profile===index+1),null,2));
}
if (!rows.length || rows.some(row=>!row.pass)) process.exitCode = 1;

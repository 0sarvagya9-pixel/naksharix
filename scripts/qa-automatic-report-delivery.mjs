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
const extra={confirmed:true,partner,partnerPermission:true,guardianPermission:true,romanName:"Asha Test",candidateNames:["Aasha Test","Asha T"]};
const question="Test fixture: reflective personal planning.";
// Compare the response with the actual report table, including when only illustrative names match.
async function checkBabyNameQuestions(){
 const assemble=(language,question,candidateNames)=>assembleAutomaticPaidReport({slug:"baby-name-report",birth,extra:{confirmed:true,guardianPermission:true,candidateNames},question,language,now:new Date("2026-11-26T12:00:00Z")});
 const questions={en:"Which proposed name matches the traditional birth syllable?",hi:"कौन सा प्रस्तावित नाम पारंपरिक जन्म ध्वनि से मेल खाता है?",hinglish:"Kaunsa proposed naam traditional janm sound se match karta hai?"};
 const read=(report,key)=>report.content.sections.find(s=>s.key===key).data;
 const seed=await assemble("en",questions.en,[]);
 const {traditionalSound:sound}=read(seed,"naming");
 const matching=sound+"vani", other=sound.startsWith("Z")?"Anika":"Zenia";
 for(const [language,prompt] of Object.entries(questions)){
   for(const [names,phrase] of [
     [[matching,other],matching],
     [[other],{en:"None of your proposed",hi:"किसी की वर्तनी",hinglish:"kisi ki spelling"}[language]],
     [[],{en:"No candidate spelling",hi:"आपने कोई नाम",hinglish:"Aapne koi naam"}[language]]
   ]){
     const report=await assemble(language,prompt,names), table=read(report,"name-options"), answer=read(report,"editorial-insights").question;
     assert.ok(answer.body.includes(sound)&&answer.body.includes(phrase),language+" candidate answer");
     assert.deepEqual(table.filter(item=>names.includes(item.name)&&item.startsWithTraditionalSound).map(item=>item.name),names.includes(matching)?[matching]:[]);
     assert.ok(!answer.body.includes(other));
   }
 }
 const unrelated=await assemble("en","What routines help my family?",[matching]);
 assert.notEqual(read(unrelated,"editorial-insights").question.title,"Traditional starting sound");
 console.log("BABY_NAME_QUESTION_PASS 9 localized answers and 1 unrelated routing case");
}
await checkBabyNameQuestions();
if(process.argv.includes("--baby-name-question"))process.exit(0);
if(process.argv.includes("--couple-order")){
 const p1={...birth,name:"Robin Ellis",gender:"male",dateOfBirth:"1987-07-05",timeOfBirth:"14:40",birthPlace:"London",latitude:51.5074,longitude:-0.1278,timezone:1};
 const p2={...birth,name:"Meera Shah",gender:"female",dateOfBirth:"1998-12-21",timeOfBirth:"22:55",birthPlace:"Kathmandu",latitude:27.7172,longitude:85.324,timezone:5.75};
 let cases=0;
 for(const language of ["en","hi","hinglish"])for(const swapped of [false,true]){
  const primary=swapped?p2:p1,partner=swapped?p1:p2;
  const result=await assembleAutomaticPaidReport({slug:"couple-kundli",birth:primary,extra:{confirmed:true,partner,partnerPermission:true},question,language,now:new Date("2026-11-26T12:00:00Z")});
  const guna=result.content.sections.find(s=>s.key==="guna").data;
  const tara=guna.ashtakoot.find(f=>f.kootKey==="tara");
  const expected=swapped?[21,8]:[8,21];
  assert.deepEqual(tara.explanation.match(/(?<!Person )\b\d+\b/g).map(Number),expected);
  assert.equal(tara.score,1.5);
  assert.equal(guna.totalScore,guna.ashtakoot.reduce((n,f)=>n+f.score,0));
  assert.ok(!guna.ashtakoot.some(f=>/bride|groom|वधू|वर का वर्ण/i.test(f.explanation)));
  assert.equal(guna.ashtakoot.length,8);
  cases++;
 }
 console.log("COUPLE_ORDER_PASS",{localizedOrderedPairs:cases});process.exit(0);
}
async function checkDateNameStudyQuestions(){
 const messages={
  en:["How can I track progress in my studies?","Tracking your studies","a week apart","cannot measure learning ability"],
  hi:["अपनी पढ़ाई की प्रगति कैसे देखूँ?","पढ़ाई की प्रगति","एक सप्ताह के अंतर","सीखने की क्षमता या परीक्षा का परिणाम तय नहीं होता"],
  hinglish:["Apni padhai ki progress kaise track karoon?","Padhai ki progress","Ek hafte ke fark","learning ability ya exam results nahi bata sakte"]
 };
 const asOf=new Date("2026-11-26T12:00:00Z");
 const {calculateCalendarNumbers}=require("@/lib/numerology/calendar");
 const expectedMonth=calculateCalendarNumbers(new Date("1992-05-18T00:00:00Z"),asOf).personalMonth;
 for(const slug of ["numerology-lo-shu-report","name-correction-report"]){
  for(const [language,[question,title,practice,limit]] of Object.entries(messages)){
   const result=await assembleAutomaticPaidReport({slug,birth:{name:"Asha Test",dateOfBirth:"1992-05-18"},extra,question,language,now:asOf});
   const answer=result.content.sections.find(s=>s.key==="editorial-insights").data.question;
   assert.equal(answer.title,title);
   assert.ok(answer.body.includes(`${expectedMonth} (2026-11)`));
   assert.ok(answer.body.includes(practice)&&answer.body.includes(limit));
   assert.equal(result.content.sections.find(s=>s.key==="your-question").data.focus,answer.body);
  }
  const family=await assembleAutomaticPaidReport({slug,birth:{name:"Asha Test",dateOfBirth:"1992-05-18"},extra,question:"पारिवारिक जिम्मेदारियों में संतुलन कैसे रखूँ?",language:"hi",now:asOf});
  assert.equal(family.content.sections.find(s=>s.key==="editorial-insights").data.question.title,"संबंध और संवाद");
 }
 console.log("DATE_NAME_STUDY_QUESTION_PASS 2 products × 3 locales, checked month, practical comparison, study-outcome limit and customer answer; 2 Hindi family adjective cases");
}
await checkDateNameStudyQuestions();
if(process.argv.includes("--date-name-study"))process.exit(0);
if(process.argv.includes("--transit-civil-noon")){
 const london={...birth,dateOfBirth:"1987-07-05",timeOfBirth:"14:40",birthPlace:"London",latitude:51.5074,longitude:-0.1278,timezone:1};
 const chart=async(zone,when,localBirth=london)=>{
  const result=await assembleAutomaticPaidReport({slug:"transit-report",birth:localBirth,extra:{confirmed:true,...(zone?{birthZone:zone}:{})},question,language:"en",now:new Date(when+"T12:00:00Z")});
  const section=key=>result.content.sections.find(s=>s.key===key).data;
  const moon=section("current-transit").positions.find(p=>p.planet==="Moon");
  const sign=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"].indexOf(moon.sign);
  return {longitude:sign*30+moon.degree,basis:section("birth").transitTimeBasis,zone:section("birth").transitTimezone};
 };
 // Sidereal geocentric lunar longitudes from standalone Swiss Ephemeris 2.10.03 Moshier/Lahiri.
 for(const [zone,day,wanted,basis] of [
  ["Europe/London","2026-11-26",66.48522479,"civil_noon"],
  ["Europe/London","2027-07-01",38.18574756,"civil_noon"],
  [undefined,"2026-11-26",65.85731115,"fixed_offset_noon"],
  ["Europe/Moscow","2026-11-26",65.85731115,"fixed_offset_noon"]]){
  const result=await chart(zone,day);
  assert.equal(result.basis,basis);assert.equal(result.zone,basis==="civil_noon"?zone:"1");
  assert.ok(Math.abs(result.longitude-wanted)<0.02,JSON.stringify({zone,day,result,wanted}));
 }
 let disclosureCases=0;
 for(const slug of ["sade-sati-report","yearly-horoscope-report","transit-report","rahu-ketu-report","jupiter-transit-report"]){
  for(const language of ["en","hi","hinglish"])for(const birthZone of ["Europe/London",undefined]){
   const result=await assembleAutomaticPaidReport({slug,birth:london,extra:{confirmed:true,birthZone},question,language,now:new Date("2026-11-26T12:00:00Z")});
   const section=key=>result.content.sections.find(s=>s.key===key).data;
   const chapter=section("editorial-depth").find(c=>c.key==="transit-context");
   assert.ok(chapter,slug+" missing transit context");
   const topic=chapter.intro;
   assert.ok(topic.includes("12:00") && topic.includes(birthZone??"UTC+1"),slug+" "+language+" "+birthZone);
   assert.equal(section("birth").transitTimeBasis,birthZone?"civil_noon":"fixed_offset_noon");
   assert.ok(!/Noon is at the supplied birth|Noon birth UTC|दोपहर जन्म के UTC/.test(topic));
   disclosureCases++;
  }
 }
 const apia={...london,dateOfBirth:"2000-01-15",timeOfBirth:"10:00",birthPlace:"Apia",latitude:-13.84,longitude:-171.75,timezone:-11};
 await assert.rejects(chart("Pacific/Apia","2011-12-30",apia),/ambiguous or nonexistent/);
 console.log("TRANSIT_CIVIL_NOON_PASS",{datedLunarComparisons:4,skippedCivilDateRejections:1,disclosureCases});
 process.exit(0);
}
const sections={
 "premium-kundli":"planets","couple-kundli":"guna","career-report":"career-houses","wealth-report":"wealth-houses","love-report":"relationship-houses","baby-name-report":"name-options","sade-sati-report":"sade-sati-months","manglik-kaal-sarp-report":"manglik","numerology-lo-shu-report":"lo-shu","name-correction-report":"name-comparison","yearly-horoscope-report":"yearly-months","transit-report":"transit-months","rahu-ketu-report":"node-transits","jupiter-transit-report":"jupiter-transits","fortune-report":"fortune-houses"
};
// Independent crosswalk: each of the three published promises per SKU must
// be backed by populated renderer sections in every supported language.
const promiseSections={
  "premium-kundli": [
    [
      "planets",
      "houses"
    ],
    [
      "dasha",
      "panchang"
    ],
    [
      "yoga-dosha",
      "numerology"
    ]
  ],
  "couple-kundli": [
    [
      "birth",
      "partner"
    ],
    [
      "guna"
    ],
    [
      "match-dosha",
      "compatibility-guidance"
    ]
  ],
  "career-report": [
    [
      "career-houses"
    ],
    [
      "career-planets",
      "career-dasha"
    ],
    [
      "career-plan"
    ]
  ],
  "wealth-report": [
    [
      "wealth-houses"
    ],
    [
      "wealth-planets",
      "wealth-dasha"
    ],
    [
      "money-plan"
    ]
  ],
  "love-report": [
    [
      "relationship-houses",
      "relationship-planets"
    ],
    [
      "relationship-timing"
    ],
    [
      "relationship-plan"
    ]
  ],
  "baby-name-report": [
    [
      "naming"
    ],
    [
      "name-options"
    ],
    [
      "birth-numerology"
    ]
  ],
  "sade-sati-report": [
    [
      "sade-sati-basis"
    ],
    [
      "sade-sati-months"
    ],
    [
      "sade-sati-guidance"
    ]
  ],
  "manglik-kaal-sarp-report": [
    [
      "dosha-positions"
    ],
    [
      "manglik"
    ],
    [
      "kaal-sarp",
      "dosha-guidance"
    ]
  ],
  "numerology-lo-shu-report": [
    [
      "numerology-profile"
    ],
    [
      "lo-shu"
    ],
    [
      "numerology-guidance"
    ]
  ],
  "name-correction-report": [
    [
      "current-name"
    ],
    [
      "name-comparison"
    ],
    [
      "name-guidance"
    ]
  ],
  "yearly-horoscope-report": [
    [
      "yearly-dasha"
    ],
    [
      "yearly-months"
    ],
    [
      "yearly-houses",
      "yearly-plan"
    ]
  ],
  "transit-report": [
    [
      "current-transit"
    ],
    [
      "transit-months"
    ],
    [
      "transit-context"
    ]
  ],
  "rahu-ketu-report": [
    [
      "natal-nodes"
    ],
    [
      "node-transits"
    ],
    [
      "node-guidance"
    ]
  ],
  "jupiter-transit-report": [
    [
      "natal-jupiter"
    ],
    [
      "jupiter-transits"
    ],
    [
      "jupiter-guidance"
    ]
  ],
  "fortune-report": [
    [
      "fortune-houses"
    ],
    [
      "fortune-planets",
      "fortune-dasha"
    ],
    [
      "fortune-plan"
    ]
  ]
};
let promiseChecks=0,requiredDisclosureChecks=0;
function verifyPromiseCoverage(slug,language,content){
 const {automaticReportPublicPreview}=require("@/lib/reports/public-preview");
 const {publicReportRequiredDetails,reportIntakeScope}=require("@/lib/reports/public-intake");
 const preview=automaticReportPublicPreview(slug,language),expected=promiseSections[slug];
 assert.equal(expected.length,preview.features.length,slug+" promise coverage");
 const sections=new Map(content.sections.map(s=>[s.key,s]));
 assert.equal(sections.size,content.sections.length,slug+" duplicate section");
 for(const [index,keys] of expected.entries()){
  for(const key of keys){
   const section=sections.get(key);
   assert.ok(section&&section.title.trim().length>0&&section.data!==null&&section.data!==undefined,slug+" "+language+" missing "+key);
   assert.ok(typeof section.data==="string"?section.data.trim().length>0:Array.isArray(section.data)?section.data.length>0:typeof section.data==="object"&&Object.keys(section.data).length>0,slug+" "+key+" empty data");
  }
  assert.ok(preview.features[index].trim().length>5);
  promiseChecks++;
 }
 if(slug==="premium-kundli"){assert.equal(sections.get("planets").data.length,9);assert.equal(sections.get("houses").data.lagna.length,12);}
 if(slug==="couple-kundli"){assert.equal(sections.get("partner").data.positions.length,9);assert.equal(sections.get("guna").data.ashtakoot.length,8);assert.equal(sections.get("guna").data.maxScore,36);}
 if(slug==="career-report")assert.equal(sections.get("career-plan").data.length,3);
 if(slug==="yearly-horoscope-report"){assert.equal(sections.get("yearly-months").data.length,12);assert.equal(sections.get("yearly-plan").data.length,4);}
 if(slug==="sade-sati-report")assert.equal(sections.get("sade-sati-months").data.length,13);
 if(slug==="transit-report")assert.equal(sections.get("transit-months").data.length,6);
 if(slug==="rahu-ketu-report")assert.equal(sections.get("node-transits").data.length,13);
 if(slug==="jupiter-transit-report")assert.equal(sections.get("jupiter-transits").data.length,13);
 if(slug==="name-correction-report")assert.ok(sections.get("name-comparison").data.length>=2);
 const fields=publicReportRequiredDetails(slug,language),scope=reportIntakeScope(slug);
 assert.equal(fields.length,(scope.dateNameOnly?2:5)+(scope.couple?2:0)+(scope.numerologyName?1:0)+(scope.nameCorrection?2:0)+(scope.babyName?2:0));
 if(scope.babyName)assert.ok(fields.includes(require("@/lib/reports/report-request-copy").reportRequestCopy[language].guardianPermission));
 assert.ok(fields.every(x=>x.trim().length>0));assert.equal(new Set(fields).size,fields.length);
 requiredDisclosureChecks++;
}
let depthChecks=0;const measurements=[];
function verifyDepth(slug,content){const depth=content.sections.find(s=>s.key==="editorial-depth")?.data;assert.ok(Array.isArray(depth)&&depth.length&&depth.every(x=>x.cards.length&&x.cards.every(c=>c.label&&c.title&&c.body.length>30)),slug+" missing depth");depthChecks++;return depth.flatMap(x=>x.cards).length;}
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
   assert.equal(new Set(previews.map(p=>p.audience)).size,15,"Each report identifies its intended reader");
   for(const p of previews){assert.ok(p.summary.length>20);assert.equal(p.features.length,3);assert.ok(p.features.every(x=>x.length>5));}
 }
 assert.equal(automaticReportPublicPreview("unknown-slug","en"),null);
 assert.equal(automaticReportPublicPreview("__proto__","en"),null);
 assert.equal(input.checkAutomaticInputs("couple-kundli",birth,{confirmed:true}).ok,false);
 assert.equal(input.checkAutomaticInputs("name-correction-report",birth,{confirmed:true}).ok,false);
 assert.equal(input.checkAutomaticInputs("premium-kundli",{...birth,timezone:99},extra).ok,false);
 const {isFullRomanNumerologyName}=require("@/lib/reports/roman-name");
 for(const valid of ["Asha Test","Anne-Marie","O’Neil","A. Kumar"])assert.equal(isFullRomanNumerologyName(valid),true);
 for(const invalid of ["आशा Test","José","Asha 123","李 Asha","",null,123])assert.equal(isFullRomanNumerologyName(invalid),false);
 for(const invalid of ["आशा Test","José","Asha 123"]){
  assert.equal(input.checkAutomaticInputs("numerology-lo-shu-report",birth,{confirmed:true,romanName:invalid}).ok,false);
  assert.equal(input.checkAutomaticInputs("name-correction-report",birth,{confirmed:true,romanName:"Asha",candidateNames:[invalid]}).ok,false);
  assert.equal(input.checkAutomaticInputs("baby-name-report",birth,{confirmed:true,candidateNames:[invalid]}).ok,false);
 }
 assert.equal(input.decodeAutomaticReportInput(input.encodeAutomaticReportInput(question,extra)).question,question);
 for(const slug of input.AUTO_REPORT_SLUGS){
   assert.ok(getManualReportCheckout(slug),slug+" has a paid SKU");
   const started=performance.now();const {title,content}=await assembleAutomaticPaidReport({slug,birth,extra,question,language:"en",now:new Date("2026-11-24T12:00:00Z")});const assemblyMs=performance.now()-started,depthCards=verifyDepth(slug,content);
   verifyPromiseCoverage(slug,"en",content);
   assert.ok(content.sections.some(s=>s.key===sections[slug]),slug+" specific content");
   assert.ok(content.sections.length>=5);
   const result=await generatePremiumReportPdf({requestId:"fixture-"+slug,templateId:slug,status:"ready_for_generation",content,automatedInputValidated:true,reportTitle:title,customerName:birth.name,language:"en"});
   assert.equal(result.generated,true,slug+" PDF generated");
   const doc=await PDFDocument.load(result.bytes);
   assert.ok(doc.getPageCount()>=4 && doc.getPageCount()<=30,"Editorial pagination "+slug+": "+doc.getPageCount());
   assert.ok(content.sections.some(s=>s.key==="editorial-insights"));
   if(process.env.REPORT_VISUAL_QA_DIR){fs.mkdirSync(process.env.REPORT_VISUAL_QA_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.REPORT_VISUAL_QA_DIR,slug+"-en.pdf"),result.bytes);}
   measurements.push({slug,language:"en",assemblyMs:Math.round(assemblyMs),totalMs:Math.round(performance.now()-started),pages:doc.getPageCount(),bytes:result.bytes.length,depthCards});
   assert.equal(doc.getAuthor(),"NAKSHARIX");
   assert.ok(doc.getTitle().includes(title));
   console.log("PASS "+slug+" "+doc.getPageCount()+" pages / "+result.bytes.length+" bytes");
 }
 for(const language of ["hi","hinglish"]){
   for(const slug of input.AUTO_REPORT_SLUGS){
   const started=performance.now();const {title,content}=await assembleAutomaticPaidReport({slug,birth,extra,question,language,now:new Date("2026-11-24T12:00:00Z")});const assemblyMs=performance.now()-started,depthCards=verifyDepth(slug,content);
   verifyPromiseCoverage(slug,language,content);
   const result=await generatePremiumReportPdf({requestId:"fixture-"+language,templateId:slug,status:"ready_for_generation",content,automatedInputValidated:true,reportTitle:title,customerName:birth.name,language});
   assert.equal(result.generated,true);const localized=await PDFDocument.load(result.bytes);assert.ok(localized.getPageCount()>=4&&localized.getPageCount()<=35,slug+" "+language+" pagination");
   if(process.env.REPORT_VISUAL_QA_DIR)fs.writeFileSync(path.join(process.env.REPORT_VISUAL_QA_DIR,slug+"-"+language+".pdf"),result.bytes);
   measurements.push({slug,language,assemblyMs:Math.round(assemblyMs),totalMs:Math.round(performance.now()-started),pages:localized.getPageCount(),bytes:result.bytes.length,depthCards});
   console.log("PASS "+slug+" "+language+" editorial PDF "+localized.getPageCount()+" pages");
   }
 }
 assert.equal(promiseChecks,135);assert.equal(requiredDisclosureChecks,45);assert.equal(depthChecks,45);
 const alt={...birth,name:"Synthetic second profile",dateOfBirth:"2001-02-28",timeOfBirth:"23:45",birthPlace:"New York, USA",latitude:40.7128,longitude:-74.006,timezone:-5};
 const altExtra={...extra,romanName:"Ravi Test",candidateNames:["Ravi","Raavi"]};let pairs=0;
 for(const slug of input.AUTO_REPORT_SLUGS){const now=new Date("2026-11-24T12:00:00Z");const a=await assembleAutomaticPaidReport({slug,birth,extra,question,language:"en",now}),b=await assembleAutomaticPaidReport({slug,birth:alt,extra:altExtra,question,language:"en",now});assert.notDeepEqual(a.content.sections.find(s=>s.key==="editorial-depth").data,b.content.sections.find(s=>s.key==="editorial-depth").data,slug+" differentiation");pairs++;}
 const {calculateNumerologyReport}=require("@/lib/numerology"),oldZone=process.env.TZ;
 // Date/name products must run without birth time, coordinates or a chart.
 const {calculateCalendarNumbers}=require("@/lib/numerology/calendar");
 const reference=new Date("2026-11-23T00:00:00Z");
 for(const [language,questions] of Object.entries({
   en:["What can I learn about balancing family responsibilities?","How can I track progress in my studies?"],
   hi:["पारिवारिक जिम्मेदारियों में संतुलन कैसे रखूँ?","अपनी पढ़ाई की प्रगति कैसे देखूँ?"],
   hinglish:["Parivaar ki responsibilities mein balance kaise rakhoon?","Apni padhai ki progress kaise track karoon?"]
 })){
   for(const [index,question] of questions.entries()){
     const report=await assembleAutomaticPaidReport({slug:"yearly-horoscope-report",birth,extra:{confirmed:true},question,language,now:reference});
     const expectedHouse=index===0?4:5;
     const houses=report.content.sections.find(s=>s.key==="yearly-houses").data;
     const printedHouse=houses.find(h=>h.house===expectedHouse);
     const answer=report.content.sections.find(s=>s.key==="editorial-insights").data.question;
     assert.ok(printedHouse);
     assert.equal(answer.title,printedHouse.title);
     assert.ok(answer.body.includes(printedHouse.interpretation));
     assert.match(answer.body,new RegExp("(?:house |भाव )"+expectedHouse+"(?: |\\.)"));
   }
 }
 console.log("YEARLY_QUESTION_HOUSE_PASS 6/6 across English, Hindi and Hinglish");
 const bounded=(date,at=reference)=>calculateCalendarNumbers(new Date(date+"T00:00:00Z"),at);
 const published=bounded("1980-05-05");
 assert.deepEqual([published.personalYear,published.personalMonth,published.personalDay],[2,4,9]);
 assert.deepEqual(bounded("1962-07-03").challenges,[4,6,2,2]);
 assert.deepEqual(bounded("2007-09-09").challenges,[0,0,0,0]);
 assert.deepEqual(bounded("2000-02-29").birthRoots,{month:2,day:2,year:2});
 assert.equal(bounded("1980-05-05",new Date("2027-01-01T00:00:00Z")).personalYear,3);
 assert.equal(bounded("2001-05-05").personalYear,published.personalYear);
 assert.throws(()=>bounded("invalid"));
 const dateNameBirth={name:"Asha Test",dateOfBirth:"1992-05-18"};
 for(const slug of ["numerology-lo-shu-report","name-correction-report"])for(const language of ["en","hi","hinglish"]){
   const options=slug==="name-correction-report"?{confirmed:true,romanName:"SKY",candidateNames:["AEIOU"]}:{confirmed:true,romanName:"SKY"};
   const args={slug,birth:dateNameBirth,extra:options,question:"",language,now:reference};
   const make=(a)=>assembleAutomaticPaidReport(a);
   const minimal=await make(args);
   assert.deepEqual(minimal,await make({...args,birth:{...birth,...dateNameBirth}}));
   const basis=minimal.content.sections.find(s=>s.key==="birth").data;
   assert.deepEqual(Object.keys(basis).sort(),["name","dateOfBirth","romanName","generatedOn","calculationBasis","nameMethod","calendarMethod"].sort());
   assert.equal(basis.calculationBasis,"date_name_only");
   assert.deepEqual(minimal.content.metadata.providerVerifiedSections,[]);
   assert.equal(minimal.content.sections.some(s=>["planets","houses","dasha","panchang"].includes(s.key)),false);
   const chapters=minimal.content.sections.find(s=>s.key==="editorial-depth").data;
   if(slug==="name-correction-report"){
     const methods=chapters.find(c=>c.key==="name-method-comparison").cards;
     assert.deepEqual(methods.map(c=>c.title),["SKY","AEIOU"]);
     assert.match(methods[0].body,/S=3 \+ K=2 \+ Y=1 = 6/);
     assert.match(methods[1].body,/A=1 \+ E=5 \+ I=1 \+ O=7 \+ U=6 = 20/);
     assert.ok(methods[1].body.endsWith(" 2."));
   }
   assert.ok(chapters.some(c=>c.key==="numerology-cycles"));
   assert.ok(chapters.every(c=>c.key!=="house-lords"));
   const months=chapters.find(c=>c.key==="numerology-next-twelve-months").cards;
   assert.equal(months.length,12);
   assert.deepEqual([months[0].label,months[11].label],["2026-12","2027-11"]);
   assert.ok(months[0].title.endsWith("9")&&months[1].title.endsWith("8"));
 }
 let questionCases=0;
 for(const language of ["en","hi","hinglish"]){
   const questions=[
     ["",false],["career ka next step?",true],["financial planning?",true],
     ["relationship mein baat kaise karun?",true],["medical concern?",false],["Compare name AEIOU",true],
     ["मेरे लक्ष्य के लिए क्या विचार है?",true]
   ];
   const answers=new Set();
   for(const [question,usesNumber] of questions){
     const report=await assembleAutomaticPaidReport({slug:"name-correction-report",birth:dateNameBirth,
       extra:{confirmed:true,romanName:"SKY",candidateNames:["AI","AEIOU"]},question,language,now:reference});
     const section=report.content.sections.find(s=>s.key==="editorial-insights").data.question;
     answers.add(section.body);
     if(usesNumber)assert.match(section.body,/\d/);
     if(question.includes("AEIOU"))assert.ok(section.body.includes("AEIOU (24 -> 6)")&&section.body.includes("SKY (10 -> 1)"));
     questionCases++;
   }
   assert.equal(answers.size,questions.length);
 }
 for(const [spelling,expected] of [[undefined,0],["Asha Test",1]]){
   const fortune=await assembleAutomaticPaidReport({slug:"fortune-report",birth,extra:{confirmed:true,romanName:spelling},language:"en",question:"",now:reference});
   const facts=fortune.content.sections;
   const nameCards=facts.find(s=>s.key==="editorial-depth").data.find(c=>c.key==="numerology-arithmetic").cards;
   assert.equal(nameCards.length,1+expected);
   const profile=facts.find(s=>s.key==="numerology-profile");
   assert.equal(Boolean(profile.data.nameNumber),Boolean(expected));
   assert.equal(profile.limitations.length,expected?0:1);
   assert.ok(require("@/lib/reports/report-quality").verifyReportContent(fortune.content,{requestId:"historic-fortune",templateId:"fortune-report",language:"en",customerName:birth.name}));
   assert.equal(facts.find(s=>s.key==="lo-shu").data.grid.length,9);
   assert.equal(facts.find(s=>s.key==="editorial-depth").data.find(c=>c.key==="numerology-next-twelve-months").cards.length,12);
 }
 console.log("DATE_NAME_REPORTS_PASS",JSON.stringify({minimalLocalizedReports:6,calendarBoundariesAndExamples:7,fortuneNameConsentCases:2,questionCases}));
 try{for(const zone of ["UTC","America/Los_Angeles","Asia/Kolkata","Pacific/Auckland"]){process.env.TZ=zone;const r=calculateNumerologyReport({name:"Asha Test",dateOfBirth:"1992-05-18",locale:"en"});assert.equal(r.dateOfBirth,"1992-05-18");assert.equal(r.moolank.value,9);assert.equal(r.lifePath.value,8);assert.equal(r.loShuGrid.find(x=>x.number===8).count,1);}}finally{if(oldZone===undefined)delete process.env.TZ;else process.env.TZ=oldZone;}
 assert.throws(()=>calculateNumerologyReport({name:"Asha Test",dateOfBirth:"1990-02-30",locale:"en"}));
 const noRoman=await assembleAutomaticPaidReport({slug:"premium-kundli",birth:{...birth,name:"आशा"},extra:{confirmed:true},question,language:"hi",now:new Date("2026-11-24T12:00:00Z")});
 const noRomanNumber=noRoman.content.sections.find(s=>s.key==="numerology").data;assert.equal(noRomanNumber.nameNumber,null);assert.ok(noRomanNumber.nameNumberUnavailableReason);
 const mixedRoman=await assembleAutomaticPaidReport({slug:"premium-kundli",birth:{...birth,name:"आशा Test"},extra:{confirmed:true},question,language:"hi",now:new Date("2026-11-24T12:00:00Z")});
 assert.equal(mixedRoman.content.sections.find(s=>s.key==="numerology").data.nameNumber,null);
 assert.equal(mixedRoman.content.sections.find(s=>s.key==="editorial-depth").data.find(c=>c.key==="numerology-arithmetic").cards.length,1);
 const timing=await assembleAutomaticPaidReport({slug:"premium-kundli",birth,extra,question,language:"en",now:new Date("2026-11-24T12:00:00Z")});
 const dashaData=timing.content.sections.find(s=>s.key==="dasha").data;assert.ok(dashaData.periods.length>0&&dashaData.nextTwelveMonths.length>0);assert.ok(dashaData.nextTwelveMonths.every(p=>Date.parse(p.endsAtUtc)>Date.parse(dashaData.asOf)&&Date.parse(p.startsAtUtc)<Date.parse(dashaData.asOf)+365.2425*86400000&&Date.parse(p.endsAtUtc)>Date.parse(p.startsAtUtc)&&p.major&&p.planet));
 for(let i=1;i<dashaData.periods.length;i++)assert.equal(dashaData.periods[i-1].endsAtUtc,dashaData.periods[i].startsAtUtc,"major periods must remain contiguous");
 let periodCases=0;
 for(const language of ["en","hi","hinglish"])for(const [slug,key] of [["career-report","career-dasha"],["wealth-report","wealth-dasha"],["love-report","relationship-timing"],["fortune-report","fortune-dasha"],["yearly-horoscope-report","yearly-dasha"]]){
  const assembled=await assembleAutomaticPaidReport({slug,birth,extra,question,language,now:new Date("2026-11-24T12:00:00Z")});
  const periods=assembled.content.sections.find(s=>s.key===key).data.nextTwelveMonths;
  const exact=p=>[p.major,p.planet,p.startsAtUtc,p.endsAtUtc];
  assert.deepEqual(periods.map(exact),dashaData.nextTwelveMonths.map(exact),slug+" exact cross-report periods");
  const cards=assembled.content.sections.find(s=>s.key==="editorial-depth").data.find(c=>c.key==="period-lord-context").cards;
  assert.equal(cards.length,periods.length);
  for(let i=0;i<periods.length;i++)assert.ok(cards[i].label.includes(periods[i].startsAtUtc)&&cards[i].label.includes(periods[i].endsAtUtc));
  periodCases++;
 }
 const allSubs=dashaData.allAntardashas,third=dashaData.pratyantarWindow;
 assert.ok(Array.isArray(allSubs)&&allSubs.length>50);
 assert.equal(allSubs[0].startsAtUtc,dashaData.periods[0].startsAtUtc);
 for(let i=1;i<allSubs.length;i++)assert.equal(allSubs[i-1].endsAtUtc,allSubs[i].startsAtUtc);
 assert.equal(allSubs.at(-1).endsAtUtc,dashaData.periods.at(-1).endsAtUtc);
 assert.ok(third.length>0&&third.every(p=>Date.parse(p.endsAt)>Date.parse(dashaData.asOf)&&Date.parse(p.startsAt)<Date.parse(dashaData.asOf)+365.2425*86400000&&p.lord&&p.antardashaLord&&p.mahadashaLord));
 for(let i=1;i<third.length;i++)assert.equal(third[i-1].endsAt,third[i].startsAt);
 let thirdCases=0;
 for(const language of ["en","hi","hinglish"])for(const [slug,key] of [["career-report","career-dasha"],["wealth-report","wealth-dasha"],["love-report","relationship-timing"],["fortune-report","fortune-dasha"],["yearly-horoscope-report","yearly-dasha"]]){
  const assembled=await assembleAutomaticPaidReport({slug,birth,extra,question,language,now:new Date("2026-11-24T12:00:00Z")});
  assert.deepEqual(assembled.content.sections.find(s=>s.key===key).data.pratyantarWindow,third);thirdCases++;
 }
 const {calculateRomanNameEvidence}=require("@/lib/reports/roman-name");
 const arithmetic=calculateRomanNameEvidence("Asha Test");
 assert.equal(arithmetic.all.sum,21);assert.equal(arithmetic.all.number,3);assert.equal(arithmetic.vowels.sum,7);assert.equal(arithmetic.consonants.sum,14);
 assert.equal(calculateRomanNameEvidence("SKY").vowels,null);assert.equal(calculateRomanNameEvidence("AEIOU").consonants,null);assert.equal(calculateRomanNameEvidence("आशा Test"),null);
 let depthContractCases=0;
 const depthFor=(c,key)=>c.content.sections.find(s=>s.key==="editorial-depth").data.find(x=>x.key===key);
 for(const language of ["en","hi","hinglish"]){
  const get=(slug,extraData=extra)=>assembleAutomaticPaidReport({slug,birth,extra:extraData,question,language,now:new Date("2026-11-24T12:00:00Z")});
  const match=await get("couple-kundli");assert.equal(depthFor(match,"two_person_house_context").cards.length,5);depthContractCases++;
  for(const slug of ["premium-kundli","career-report","wealth-report","love-report","fortune-report"]){const r=await get(slug);assert.ok(depthFor(r,"ruler_network").cards.length>0);depthContractCases++;}
  const yearly=await get("yearly-horoscope-report");const months=yearly.content.sections.find(s=>s.key==="yearly-months").data;
  assert.deepEqual(depthFor(yearly,"monthly_natal_review").cards.map(c=>c.label),months.map(m=>m.date));depthContractCases++;
  for(const slug of ["transit-report","sade-sati-report","rahu-ketu-report","jupiter-transit-report"]){const r=await get(slug);assert.ok(depthFor(r,"sampled_transition_windows").cards.length>0);depthContractCases++;}
  const numerology=await get("numerology-lo-shu-report",{confirmed:true,romanName:"SKY"});
  assert.equal(numerology.content.sections.find(s=>s.key==="numerology-profile").data.soulUrge,null);
  const grid=numerology.content.sections.find(s=>s.key==="lo-shu").data.grid;
  assert.equal(grid.find(c=>c.number===9).count,2);
  assert.equal(depthFor(numerology,"lo_shu_geometry").cards.length,8);depthContractCases++;
  const names=await get("name-correction-report",{confirmed:true,romanName:"SKY",candidateNames:["AEIOU"]});
  const nameRows=names.content.sections.find(s=>s.key==="name-comparison").data;
  assert.equal(nameRows[0].soulUrge,null);assert.equal(nameRows[1].personality,null);
  assert.equal(depthFor(names,"numerology-arithmetic").cards.length,3);depthContractCases++;
 }
 for(const language of ["en","hi","hinglish"]){
  const report=await assembleAutomaticPaidReport({slug:"manglik-kaal-sarp-report",birth,extra,question,language,now:new Date("2026-11-24T12:00:00Z")});
  assert.equal(depthFor(report,"manglik-reference-evidence").cards.length,3);
  assert.equal(depthFor(report,"nodal-geometry-evidence").cards.length,7);
  depthContractCases++;
 }
 console.log("P0_REPORT_DEPTH_AND_ARITHMETIC_PASS "+JSON.stringify({depthContractCases,nameArithmeticChecks:7,scope:"calculation-grounded content and empty-group safety; not independent editorial scoring"}));
 console.log("P0_PRATYANTAR_REPORT_CONTRACT_PASS "+JSON.stringify({thirdCases,allSubPeriods:allSubs.length,thirdLevelPeriods:third.length,scope:"calculated boundaries, not prediction"}));
 console.log("P0_SPECIALTY_PERIOD_AND_NAME_CONTRACT_PASS",JSON.stringify({periodCases,nameCases:22,scientificPrediction:false}));
 console.log("REPORT_TIMING_AND_NAME_EVIDENCE_PASS; NON_ROMAN_NO_INVENTED_NAME_NUMBER; EXACT_UPCOMING_SUBPERIODS; MAJOR_BOUNDARIES");
 assert.equal(pairs,15);assert.equal(measurements.length,45);
 console.log("REPORT_DEPTH_QUALIFICATION_PASS "+JSON.stringify({depthChecks,personalizationPairs:pairs,timezoneCases:4,measurements,scope:"synthetic generation measurements; not live cost or expert review"}));
 if(process.env.REPORT_VISUAL_QA_DIR)fs.writeFileSync(path.join(process.env.REPORT_VISUAL_QA_DIR,"report-production-measurements.json"),JSON.stringify(measurements,null,2));
 console.log("REPORT_PROMISE_OUTPUT_CROSSWALK_PASS "+JSON.stringify({products:15,languages:3,promiseChecks,requiredDisclosureChecks,scope:"reviewed section-to-feature mapping and real computed content; PDF render follows each assembly; no predictive or live delivery claim"}));
 // Same process, bounded concurrent requests (no claim of multicore or
 // production load). Render each SKU with an independent synthetic marker.
 // Existing 45 baseline artifact PDFs are not overwritten.
 const concurrentRows=[],concurrentStart=performance.now(),cpuStart=process.cpuUsage(),heapBefore=process.memoryUsage().heapUsed;
 const {groupEditorialCardBodies}=require("@/lib/reports/editorial-layout");
 let renderedDuplicateBodies=0,consolidatedBodies=0;
 const normalText=v=>String(v??"").replace(/\s+/g," ").trim();
 let repeatedCardBodies=0,duplicateCards=0;
 for(let offset=0;offset<input.AUTO_REPORT_SLUGS.length;offset+=3){
  const slugs=input.AUTO_REPORT_SLUGS.slice(offset,offset+3);
  const batch=await Promise.all(slugs.map(async(slug,i)=>{
   const serial=offset+i,language=["en","hi","hinglish"][serial%3],marker="QAConcurrent"+String(serial).padStart(2,"0"),otherMarker="QA Partner "+serial;
   const profile={...(serial%2?alt:birth),name:marker};
   const extraData={...extra,partner:{...partner,name:otherMarker},romanName:marker.replace(/\d/g,"")+" Test",candidateNames:["Asha Test","Ravi Test"]};
   const started=performance.now(),assembled=await assembleAutomaticPaidReport({slug,birth:profile,extra:extraData,question:"Synthetic concurrent request "+serial,language,now:new Date("2026-11-24T12:00:00Z")});
   const assemblyMs=performance.now()-started,sec=assembled.content.sections;
   assert.equal(sec.find(s=>s.key==="birth").data.name,marker);
   assert.equal(sec.find(s=>s.key==="birth").data.dateOfBirth,profile.dateOfBirth);
   const serialized=JSON.stringify(sec);
   for(let j=0;j<input.AUTO_REPORT_SLUGS.length;j++)if(j!==serial)assert.ok(!serialized.includes("QAConcurrent"+String(j).padStart(2,"0")),"Cross-request content leakage");
   if(slug==="couple-kundli")assert.equal(sec.find(s=>s.key==="partner").data.name,otherMarker);
   const cards=sec.find(s=>s.key==="editorial-depth").data.flatMap(c=>c.cards);
   const unique=new Set(cards.map(c=>[c.label,c.title,c.body].map(normalText).join("\u0000"))),bodies=new Set(cards.map(c=>normalText(c.body)));
   assert.equal(unique.size,cards.length,slug+" duplicate complete depth card");
   duplicateCards+=cards.length-unique.size;repeatedCardBodies+=cards.length-bodies.size;
   for(const chapter of sec.find(s=>s.key==="editorial-depth").data){
    const grouped=groupEditorialCardBodies(chapter.cards);
    const original=chapter.cards.map(c=>JSON.stringify(c)).sort(),preserved=grouped.flatMap(g=>g.members.map(c=>JSON.stringify(c))).sort();
    assert.deepEqual(preserved,original,slug+" grouped references preserved");
    const normalizedBodies=grouped.map(g=>normalText(g.body));
    renderedDuplicateBodies+=normalizedBodies.length-new Set(normalizedBodies).size;
    consolidatedBodies+=chapter.cards.length-grouped.length;
   }
   const out=await generatePremiumReportPdf({requestId:"concurrent-"+serial,templateId:slug,status:"ready_for_generation",content:assembled.content,automatedInputValidated:true,reportTitle:assembled.title,customerName:marker,language});
   assert.equal(out.generated,true);const parsed=await PDFDocument.load(out.bytes);
   assert.equal(parsed.getAuthor(),"NAKSHARIX");assert.ok(parsed.getTitle().includes(assembled.title));assert.ok(parsed.getPageCount()>=4);
   return {slug,language,assemblyMs:Math.round(assemblyMs),totalMs:Math.round(performance.now()-started),pages:parsed.getPageCount(),bytes:out.bytes.length};
  }));
  concurrentRows.push(...batch);
 }
 assert.equal(concurrentRows.length,15);assert.equal(duplicateCards,0);assert.equal(renderedDuplicateBodies,0);
 const cpu=process.cpuUsage(cpuStart),concurrentEvidence={requests:15,maxSimultaneousPromises:3,passed:concurrentRows.length,duplicateCards,repeatedCardBodies,renderedDuplicateBodies,consolidatedBodies,wallMs:Math.round(performance.now()-concurrentStart),cpuUserMicros:cpu.user,cpuSystemMicros:cpu.system,heapBeforeBytes:heapBefore,heapAfterBytes:process.memoryUsage().heapUsed,measurements:concurrentRows,scope:"one isolated Node process, synthetic profiles, actual PDF output; no production capacity, cost or privacy certification"};
 console.log("P0_CONCURRENT_REPORT_RENDER_PASS "+JSON.stringify(concurrentEvidence));
 if(process.env.REPORT_VISUAL_QA_DIR)fs.writeFileSync(path.join(process.env.REPORT_VISUAL_QA_DIR,"report-concurrent-measurements.json"),JSON.stringify(concurrentEvidence,null,2));

 // Worst-case validated, fictional Latin/Devanagari birth details must
 // remain renderable rather than failing the cover layout.
 for(const language of ["en","hi","hinglish"]){
  const longBirth={...birth,name:language==="hi"?"अनन्या ".repeat(12).trim():"Alexandria ".repeat(9).trim(),birthPlace:language==="hi"?"लंबा जन्मस्थान विवरण ".repeat(10).trim():"Long fictional locality name ".repeat(7).trim()};
  assert.ok(longBirth.name.length<=100&&longBirth.birthPlace.length<=220);
  const {title,content}=await assembleAutomaticPaidReport({slug:"premium-kundli",birth:longBirth,extra,question,language});
  const result=await generatePremiumReportPdf({requestId:"long-fixture-"+language,templateId:"premium-kundli",status:"ready_for_generation",content,automatedInputValidated:true,reportTitle:title,customerName:longBirth.name,language});
  assert.equal(result.generated,true,"Long valid birth fields must render: "+language);
  assert.ok((await PDFDocument.load(result.bytes)).getPageCount()>=4);
  if(process.env.REPORT_EDGE_QA_DIR){fs.mkdirSync(process.env.REPORT_EDGE_QA_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.REPORT_EDGE_QA_DIR,"long-cover-"+language+".pdf"),result.bytes);}
 }
 console.log("LONG_VALID_REPORT_COVER_PASS=3/3");
 const {prepareReviewedSpecialistInput}=require("@/lib/reports/reviewed-report-input");
 const reviewRow={reportSlug:"couple-kundli",fullName:birth.name,gender:birth.gender,dateOfBirth:birth.dateOfBirth,timeOfBirth:birth.timeOfBirth,birthPlace:birth.birthPlace,latitude:birth.latitude,longitude:birth.longitude,timezone:birth.timezone,concern:input.encodeAutomaticReportInput(question,extra),language:"hi"};
 assert.equal(prepareReviewedSpecialistInput({...reviewRow,concern:"Missing partner input"}).kind,"invalid");
 assert.equal(prepareReviewedSpecialistInput({...reviewRow,reportSlug:"name-correction-report",concern:"Missing alternate names"}).kind,"invalid");
 assert.equal(prepareReviewedSpecialistInput({...reviewRow,reportSlug:"premium-kundli",concern:question}).kind,"specialist");
 for(const slug of input.AUTO_REPORT_SLUGS){
  const reviewed=prepareReviewedSpecialistInput({...reviewRow,reportSlug:slug});
  assert.equal(reviewed.kind,"specialist",slug);
  const assembled=await assembleAutomaticPaidReport(reviewed);
  assert.ok(assembled.content.sections.some(s=>s.key===sections[slug]),slug+" reviewed specialty section");
  if(slug==="couple-kundli"||slug==="name-correction-report"){
   const pdf=await generatePremiumReportPdf({requestId:"reviewed-fixture-"+slug,templateId:slug,status:"ready_for_generation",content:assembled.content,reviewedByAdmin:true,specialistInputValidated:true,reportTitle:assembled.title,customerName:birth.name,language:"hi"});
   assert.equal(pdf.generated,true);const parsed=await PDFDocument.load(pdf.bytes);assert.ok(parsed.getPageCount()>=4);assert.ok(parsed.getTitle().includes(assembled.title));
  }
 }
 console.log("REVIEWED_SPECIALIST_REPORT_PASS;15 differentiated assemblies; 2 localized editorial PDF renders; missing specialist inputs rejected");
 const {buildFictionalReportSample}=require("@/lib/reports/fictional-sample");
 if(process.env.REPORT_SAMPLE_QA_DIR)fs.mkdirSync(process.env.REPORT_SAMPLE_QA_DIR,{recursive:true});
 for(const slug of input.AUTO_REPORT_SLUGS){
   const bytes=await buildFictionalReportSample(slug);
   const preview=await PDFDocument.load(bytes);
   assert.ok(preview.getPageCount()>0&&preview.getPageCount()<=3);
   assert.match(preview.getTitle(),/FICTIONAL SAMPLE/);
   assert.equal(preview.getAuthor(),"NAKSHARIX");
   assert.ok(preview.getSubject().includes("fixed fictional inputs"));
   if(process.env.REPORT_SAMPLE_QA_DIR)fs.writeFileSync(path.join(process.env.REPORT_SAMPLE_QA_DIR,slug+"-fictional-sample.pdf"),bytes);
 }
 console.log("PUBLIC_SAMPLE_PDF_QA=15/15_PASS;ACTUAL_RENDERER;FICTIONAL_ONLY");
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
   const payment=await prisma.payment.create({data:{userId:user.id,provider:"RAZORPAY",status,purpose:product.purpose,amount:product.amount,currency:"INR",providerPaymentId:"pay_QAisolated"+n,metadata:{reportId:product.reportId}}});
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
  const refunded=await make("love-report");
  const refundedRow=await prisma.reportRequest.findUniqueOrThrow({where:{id:refunded},include:{payment:true}});
  const receipt=await prisma.auditLog.create({data:{id:"razorpay-refund:rfnd_QAisolated"+ids.length,action:"payment.razorpay_refund_processed_receipt",targetType:"RazorpayPayment",targetId:refundedRow.payment.providerPaymentId,metadata:{amountPaise:100}}});
  try{
    const before=sent.length;
    assert.equal(await processAutomaticReport(refunded),"skipped","Signed refund receipt must stop automatic delivery even before status reconciliation");
    assert.equal(sent.length,before);
    const unchanged=await prisma.reportRequest.findUniqueOrThrow({where:{id:refunded}});
    assert.equal(unchanged.generatedPdfSize,null);
    assert.equal(unchanged.emailSentAt,null);
  }finally{await prisma.auditLog.delete({where:{id:receipt.id}});}
  console.log("PASS disposable DB worker, one-time send, retry without regeneration, unpaid rejection and refund-receipt guard");
 }finally{
  await prisma.reportRequest.deleteMany({where:{id:{in:ids}}});
  await prisma.user.delete({where:{id:user.id}});
  await prisma.$disconnect();
 }
}

import assert from "node:assert/strict";
import {editorialTerm,editorialDate,EDITORIAL_TERM_COUNT,EDITORIAL_HOUSE_TABLE_FRACTIONS} from "../lib/reports/editorial-display.ts";
import {PDFDocument,StandardFonts} from "pdf-lib";
const samples=[
 ["Graha","ग्रह","Graha"],["Koot","कूट","Koot"],["Traditional rule","पारंपरिक नियम","Traditional niyam"],["Lagna","लग्न","Lagna"],["Aries","मेष","Mesh"],["Mercury","बुध","Budh"],["Jyeshtha","ज्येष्ठा","Jyeshtha"],["Current","वर्तमान","Current"],["NAME COMPARISON","नाम तुलना","Naam comparison"],["TIMING FRAMEWORK","दशा समयरेखा","Dasha timeline"],["Not available","उपलब्ध नहीं","Available nahi"],["Mild","हल्का","Halka"],["Moderate","मध्यम","Madhyam"],["Severe","गंभीर","Gambhir"],["High","उच्च","Zyada"],["Low","कम","Kam"],["Near station","स्थिरता के निकट","Station ke paas"],["Not clearly detected","स्पष्ट रूप से नहीं पाया गया","Spasht roop se nahi mila"],["Current Mahadasha","वर्तमान महादशा","Vartaman Mahadasha"],["Current Antardasha","वर्तमान अंतर्दशा","Vartaman Antardasha"]
];let checks=0;
for(const [key,hi,hg] of samples){
 assert.equal(editorialTerm(key,"en"),key);assert.equal(editorialTerm(key,"hi"),hi);assert.equal(editorialTerm(key,"hinglish"),hg);checks+=3;
}
for(const value of ["__proto__","constructor","Asha Test","Delhi, India","User-written question","12.34°"]){for(const lang of ["en","hi","hinglish"]){assert.equal(editorialTerm(value,lang),value);checks++;}}
assert.equal(editorialDate("2026-11-25","en"),"25 Nov 2026");checks++;
assert.match(editorialDate("2026-11-25","hi"),/25.*[\u0900-\u097f].*2026/);checks++;
assert.equal(editorialDate("2026-02-31","hi"),"2026-02-31");checks++;
assert.ok(EDITORIAL_TERM_COUNT>=130);checks++;
const pdf=await PDFDocument.create();
const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
const [house]=EDITORIAL_HOUSE_TABLE_FRACTIONS;
const available=(595.28-88)*house/EDITORIAL_HOUSE_TABLE_FRACTIONS.reduce((a,b)=>a+b,0)-18;
for(const word of ["HOUSE","BHAV"]){assert.ok(bold.widthOfTextAtSize(word,8)<=available,word+" must fit without mid-word wrapping");checks++;}
assert.ok(Math.abs(EDITORIAL_HOUSE_TABLE_FRACTIONS.reduce((a,b)=>a+b,0)-6.21)<1e-9);checks++;
console.log("EDITORIAL_DISPLAY_CONTRACT_PASS="+JSON.stringify({checks,terms:EDITORIAL_TERM_COUNT,scope:"display vocabulary and date localization only; not complete human translation acceptance"}));

{
 const {planEditorialTableFragment:plan,groupEditorialCardBodies:group}=await import("../lib/reports/editorial-layout.ts");
 let cases=0,fragments=0;
 assert.deepEqual(plan(7,90,570,12,36),{kind:"page_break"});cases++;
 assert.deepEqual(plan(7,570,570,12,36),{kind:"draw",lines:7,height:100});cases++;
 for(const fresh of [320,480,600])for(const line of [9,12,14.5])for(const minimum of [24,30,36,45])for(let rows=1;rows<=100;rows++)for(const remaining of [0,15,35,70,120,200,fresh]){
  let n=rows,space=remaining,tries=0;
  while(n){const r=plan(n,space,fresh,line,minimum);assert.ok(++tries<120);
   if(r.kind==="page_break"){assert.ok(space<fresh);space=fresh;continue;}
   assert.ok(r.lines>=1&&r.lines<=n&&r.height<=space+1e-8);
   if(Math.max(minimum,n*line+16)<=fresh)assert.equal(r.lines,n);
   n-=r.lines;space-=r.height;fragments++;
  }cases++;
 }
 for(const args of [[0,50,500,12,30],[1,50,500,0,30],[1,50,10,12,30],[1,NaN,500,12,30]])assert.throws(()=>plan(...args));
 const cards=[{label:"A",title:"T1",body:"same text"},{label:"B",title:"T2",body:"same\ntext"},{label:"C",title:"T3",body:"different"}];
 const grouped=group(cards);assert.equal(grouped.length,2);assert.deepEqual(grouped.flatMap(g=>g.members),cards);assert.equal(group([]).length,0);
 console.log("P0_ROW_PAGINATION_AND_REPETITION_PASS "+JSON.stringify({cases,fragments,invalidCases:4,groupCases:3}));
}

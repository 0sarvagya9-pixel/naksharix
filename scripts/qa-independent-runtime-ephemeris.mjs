import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
const require=createRequire(import.meta.url),ts=require("typescript");
const originalResolve=Module._resolveFilename;
Module._resolveFilename=function(name,...args){return originalResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
require.extensions[".ts"]=function(module,file){
 const code=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
 module._compile(code.outputText,file);
};
const {calculateInternalChart}=require("@/lib/astrology/premium-engine/chart");
const {calculatePremiumPanchang}=require("@/lib/astrology/premium-engine/panchang");
const {normalizeBirthTime}=require("@/lib/astrology/own-engine/time");
const {provenance,fixtures}=JSON.parse(fs.readFileSync(new URL("../fixtures/astrology/independent-runtime-swiss-reference.json",import.meta.url),"utf8"));
assert.equal(fixtures.length,10);assert.equal(provenance.angularToleranceDegrees,0.02);assert.equal(provenance.riseSetToleranceMinutes,3);
assert.equal(normalizeBirthTime("12:00:59"),"12:00:59");
assert.equal(normalizeBirthTime("12:00:00"),"12:00");
const distance=(a,b)=>Math.abs(((a-b+540)%360)-180);
const toMin=s=>{assert.match(s,/^\d{2}:\d{2}$/);const [h,m]=s.split(":").map(Number);assert.ok(h<24&&m<60);return h*60+m;};
const signs=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const nak=["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const away=(v,step,tol=.02)=>Math.min(v%step,step-v%step)>tol;
let angular=0,labels=0,riseSet=0,nearBoundary=0,maxDegrees=0,maxMinutes=0;
const actualCharts=new Map();
for(const f of fixtures){
 const chart=calculateInternalChart({...f.input,ayanamsa:"lahiri",houseSystem:"whole_sign"});
 const expected=f.longitudeDegrees,actual={ascendant:chart.ascendant.absoluteLongitude,...Object.fromEntries(chart.planets.map(p=>[p.planet,p.absoluteLongitude]))};
 actualCharts.set(f.id,actual);
 assert.equal(Object.keys(actual).length,10);
 assert.equal(chart.metadata.verified,false,"Numerical fixtures are not professional certification");
 for(const [key,value] of Object.entries(expected)){
  assert.ok(Number.isFinite(actual[key])&&actual[key]>=0&&actual[key]<360,f.id+":"+key);
  const error=distance(actual[key],value);
  assert.ok(error<=.02,f.id+":"+key+" angular error "+error);
  maxDegrees=Math.max(maxDegrees,error);angular++;
  if(away(value,30)&&away(expected.ascendant,30)){
   if(key==="ascendant")assert.equal(chart.ascendant.sign,signs[Math.floor(value/30)]);
   else{
    const p=chart.planets.find(p=>p.planet===key);
    assert.equal(p.sign,signs[Math.floor(value/30)]);
    assert.equal(p.house,(Math.floor(value/30)-Math.floor(expected.ascendant/30)+12)%12+1);
   }
   labels++;
  }else nearBoundary++;
 }
 const span=360/27;
 if(away(expected.Moon,span/4)){
  assert.equal(chart.nakshatra.name,nak[Math.floor(expected.Moon/span)]);
  assert.equal(chart.nakshatra.pada,Math.floor((expected.Moon%span)/(span/4))+1);
  labels+=2;
 }else nearBoundary++;
 if(f.panchangRiseSet){
  const p=calculatePremiumPanchang(f.input);
  assert.equal(p.date,f.input.date);assert.equal(p.metadata.verified,false);
  for(const [field,value] of Object.entries(f.panchangRiseSet)){
   if(value===null)assert.equal(p[field],null,f.id+":"+field+" must not borrow an adjacent civil-day event");
   else{assert.ok(p[field],f.id+":"+field+" missing");const delta=Math.abs(toMin(p[field])-toMin(value));assert.ok(delta<=3,f.id+":"+field+" error "+delta+" minutes, actual "+p[field]+" reference "+value);maxMinutes=Math.max(maxMinutes,delta);}
   riseSet++;
  }
  if(away(expected.Moon,span/4)){assert.equal(p.nakshatra,nak[Math.floor(expected.Moon/span)]);assert.equal(p.nakshatraPada,Math.floor((expected.Moon%span)/(span/4))+1);labels+=2;}
 }
}
const observed=distance(actualCharts.get("delhi-noon").ascendant,actualCharts.get("delhi-seconds").ascendant);
assert.ok(observed>.25,"Same-minute birth seconds were discarded");
assert.equal(angular,100);assert.equal(riseSet,32);
console.log("INDEPENDENT_RUNTIME_EPHEMERIS_PASS "+JSON.stringify({charts:fixtures.length,angular,riseSet,labels,nearBoundary,maxDegrees,maxMinutes,sameMinuteAscendantDelta:observed,scope:"actual chart and Panchang runtime; independent synthetic reference; no predictive certification"}));

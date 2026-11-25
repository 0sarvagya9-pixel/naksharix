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
let angular=0,labels=0,riseSet=0,nearBoundary=0,maxDegrees=0,maxMinutes=0,muhuratEndpoints=0,maxMuhuratMinutes=0;
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
  // Compare with daylight segments derived from independent Swiss reference rise/set values.
  // Abhijit is interval 8 of 15. The other windows use traditional weekday-dependent eighths.
  const r=toMin(f.panchangRiseSet.sunrise),s=toMin(f.panchangRiseSet.sunset);
  const weekday=new Date(f.input.date+"T12:00:00Z").getUTCDay();
  const segments={rahuKaal:[7,1,6,4,5,3,2][weekday],yamaganda:[4,3,2,1,0,6,5][weekday],gulikaKaal:[6,5,4,3,2,1,0][weekday]};
  for(const [key,index] of Object.entries({...segments,abhijitMuhurat:7})){
   const divisor=key==="abhijitMuhurat"?15:8;
   const actual=p[key]?.split(" - ");assert.equal(actual?.length,2,f.id+":"+key);
   const expectedBounds=[r+(s-r)*index/divisor,r+(s-r)*(index+1)/divisor];
   for(let i=0;i<2;i++){const delta=Math.abs(toMin(actual[i])-Math.round(expectedBounds[i]));assert.ok(delta<=3,f.id+":"+key+" endpoint "+i+" error "+delta);maxMuhuratMinutes=Math.max(maxMuhuratMinutes,delta);muhuratEndpoints++;}
  }
  if(away(expected.Moon,span/4)){assert.equal(p.nakshatra,nak[Math.floor(expected.Moon/span)]);assert.equal(p.nakshatraPada,Math.floor((expected.Moon%span)/(span/4))+1);labels+=2;}
 }
}
const observed=distance(actualCharts.get("delhi-noon").ascendant,actualCharts.get("delhi-seconds").ascendant);
assert.ok(observed>.25,"Same-minute birth seconds were discarded");
assert.equal(angular,100);assert.equal(riseSet,32);assert.equal(muhuratEndpoints,64);
console.log("INDEPENDENT_RUNTIME_EPHEMERIS_PASS "+JSON.stringify({charts:fixtures.length,angular,riseSet,labels,nearBoundary,maxDegrees,maxMinutes,muhuratEndpoints,maxMuhuratMinutes,sameMinuteAscendantDelta:observed,scope:"actual chart and Panchang runtime; independent synthetic reference; no predictive certification"}));

// Annual-guide numerical and localized interpretation acceptance, separate from prediction claims.
const originalLoad=Module._load;
Module._load=function(name,...args){if(name==="server-only")return {};return originalLoad.call(this,name,...args);};
const {calculateInternalTransitSnapshot}=require("@/lib/astrology/transit/engine");
const {getAnnualSnapshots,getAnnualGuide}=require("@/lib/horoscope/annual");
const {createHash}=require("node:crypto");
const annual=JSON.parse(fs.readFileSync(new URL("../fixtures/astrology/independent-2027-annual-swiss-reference.json",import.meta.url),"utf8"));
assert.equal(createHash("sha256").update(JSON.stringify(annual.rows)).digest("hex"),annual.provenance.sha256CompactRows);
assert.equal(annual.rows.length,12);
let annualPositions=0,annualHouseChecks=0,annualMaxDegrees=0;
const annualExpected=annual.rows.map(row=>{
 const snap=calculateInternalTransitSnapshot({date:row.date,timezone:"+05:30",latitude:28.6139,longitude:77.209,place:"New Delhi, India",ayanamsa:"lahiri"});
 for(const planet of ["Jupiter","Saturn"]){
  const p=snap.positions.find(x=>x.planet===planet);
  assert.ok(p&&Number.isFinite(p.absoluteLongitude));
  const error=distance(p.absoluteLongitude,row[planet]);annualMaxDegrees=Math.max(annualMaxDegrees,error);
  assert.ok(error<=annual.provenance.angularToleranceDegrees,row.date+" "+planet+" discrepancy "+error);
  assert.ok(away(row[planet],30));assert.equal(p.sign,signs[Math.floor(row[planet]/30)]);
  annualPositions++;
 }
 return {date:row.date,jupiter:signs[Math.floor(row.Jupiter/30)],saturn:signs[Math.floor(row.Saturn/30)]};
});
assert.deepEqual(getAnnualSnapshots(2027),annualExpected);
const cachedCopy=getAnnualSnapshots(2027);cachedCopy[0].jupiter="invalid";assert.deepEqual(getAnnualSnapshots(2027),annualExpected);
for(const locale of ["en","hi","hinglish"])for(const [i,sign] of signs.entries()){
 const guide=getAnnualGuide(2027,sign,locale);assert.equal(guide.year,2027);assert.equal(guide.referenceSign,sign);assert.equal(guide.personalPrediction,false);
 assert.equal(guide.rows.length,12);
 for(const [n,row] of guide.rows.entries()){
  const e=annualExpected[n];assert.equal(row.date,e.date);
  assert.equal(row.growthHouse,(signs.indexOf(e.jupiter)-i+12)%12+1);
  assert.equal(row.structureHouse,(signs.indexOf(e.saturn)-i+12)%12+1);
  assert.ok(row.growthTheme&&row.structureTheme);annualHouseChecks+=2;
 }
}
assert.equal(annualPositions,24);assert.equal(annualHouseChecks,864);
console.log("ANNUAL_2027_REFERENCE_PASS "+JSON.stringify({annualPositions,annualHouseChecks,annualMaxDegrees,localizedGuides:36,scope:"monthly numeric reference and sign-relative educational guide; not prediction certification"}));

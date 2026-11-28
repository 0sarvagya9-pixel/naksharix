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
const {normalizeBirthTime,julianDayFromUtc}=require("@/lib/astrology/own-engine/time");
const {provenance,fixtures}=JSON.parse(fs.readFileSync(new URL("../fixtures/astrology/independent-runtime-swiss-reference.json",import.meta.url),"utf8"));
assert.equal(fixtures.length,10);assert.equal(provenance.angularToleranceDegrees,0.02);assert.equal(provenance.riseSetToleranceMinutes,3);
assert.equal(normalizeBirthTime("12:00:59"),"12:00:59");
assert.equal(normalizeBirthTime("12:00:00"),"12:00");
// Published USNO Gregorian/UT examples. Additional half-second at J2000
// checks that Date precision survives in the Julian day passed to the engine.
const julianExamples=[
 ["1877-08-11T07:30:00Z",2406842.8125],
 ["1978-01-01T00:00:00Z",2443509.5],
 ["1978-07-21T15:00:00Z",2443711.125],
 ["2000-01-01T12:00:00.500Z",2451545+0.5/86400]
];
for(const [utc,jd] of julianExamples)assert.ok(Math.abs(julianDayFromUtc(new Date(utc))-jd)<=1e-9,utc);
console.log("JULIAN_REFERENCE_PASS",julianExamples.length);
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

// Motion uses an independently generated Swiss speed reference, not an
// expected value calculated by the implementation under test.
const {calculateOwnEngineBirthChart}=require("@/lib/astrology/own-engine");
const {estimateSiderealMotion}=require("@/lib/astrology/own-engine/motion");
const motionFixture=JSON.parse(fs.readFileSync(new URL("../fixtures/astrology/independent-motion-swiss-reference.json",import.meta.url),"utf8"));
assert.equal(motionFixture.rows.length,15);
assert.equal(estimateSiderealMotion(d=>(359.99+d*1+360)%360).motionState,"direct");
assert.equal(estimateSiderealMotion(d=>(0.01-d*1+360)%360).motionState,"retrograde");
assert.equal(estimateSiderealMotion(()=>23).motionState,"near_station");
assert.throws(()=>estimateSiderealMotion(()=>NaN),/INVALID_MOTION_LONGITUDE/);
let motionChecks=0,motionDirectionChecks=0,stationChecks=0,motionMaxError=0,referenceRetrogrades=0;
for(const row of motionFixture.rows){
 const input=row.input??fixtures.find(f=>f.id===row.id)?.input;assert.ok(input,row.id);
 const baseInput={...input,name:"Synthetic reference",gender:"not_specified",birthPlace:"Synthetic reference location",language:"en",dateOfBirth:input.date,timeOfBirth:input.time};
 const canonical=calculateInternalChart({...baseInput,ayanamsa:"lahiri",houseSystem:"whole_sign"}).planets;
 const natal=calculateOwnEngineBirthChart(baseInput).planetPositions;
 for(const positions of [canonical,natal]){
  assert.equal(positions.length,9);
  for(const p of positions){
   const expected=row.speedDegreesPerDay[p.planet];
   assert.ok(Number.isFinite(expected)&&Number.isFinite(p.speedDegreesPerDay),row.id+" "+p.planet);
   const error=Math.abs(p.speedDegreesPerDay-expected);assert.ok(error<=motionFixture.provenance.speedToleranceDegreesPerDay,row.id+" "+p.planet+" speed error "+error);
   motionMaxError=Math.max(motionMaxError,error);motionChecks++;
   if(Math.abs(expected)>.02){assert.equal(p.retrograde,expected<0,row.id+" "+p.planet+" wrong direction");assert.equal(p.motionState,expected<0?"retrograde":"direct");motionDirectionChecks++;if(expected<0)referenceRetrogrades++;}
   if(row.stationPlanet===p.planet){assert.ok(Math.abs(expected)<.001);assert.equal(p.motionState,"near_station",row.id+" near station");stationChecks++;}
  }
 }
 assert.deepEqual(natal.map(p=>[p.planet,p.retrograde,p.motionState,p.speedDegreesPerDay]),canonical.map(p=>[p.planet,p.retrograde,p.motionState,p.speedDegreesPerDay]),row.id+" public/canonical motion mismatch");
}
assert.equal(motionChecks,270);assert.equal(stationChecks,10);assert.ok(referenceRetrogrades>0);
console.log("INDEPENDENT_PLANETARY_MOTION_PASS "+JSON.stringify({charts:motionFixture.rows.length,enginePaths:2,motionChecks,motionDirectionChecks,stationChecks,referenceRetrogrades,motionMaxError,scope:"sampled speed and direction, not exact event timing"}));


const {calculateRefinedTransitTimeline}=require("@/lib/astrology/transit/engine");
const eventRef=JSON.parse(fs.readFileSync(new URL("../fixtures/astrology/independent-transit-events-swiss-reference.json",import.meta.url),"utf8"));
const residuals=[];let ingressChecks=0,eventStationChecks=0;
const baseTransit={timezone:"UTC",ayanamsa:"lahiri",latitude:0,longitude:0};
for(const row of eventRef.rows){
 const target=Date.parse(row.utc),date=new Date(target-86400000).toISOString().slice(0,10);
 const events=calculateRefinedTransitTimeline({...baseTransit,date},3);
 const matches=events.filter(e=>e.planet===row.planet&&e.eventType===row.eventType&&e.from===row.from&&e.to===row.to);
 assert.ok(matches.length,row.planet+" "+row.eventType+" missing reference event");
 const event=matches.sort((a,b)=>Math.abs(Date.parse(a.occurredAt)-target)-Math.abs(Date.parse(b.occurredAt)-target))[0];
 const errorMinutes=Math.abs(Date.parse(event.occurredAt)-target)/60000;
 residuals.push({planet:row.planet,eventType:row.eventType,referenceUtc:row.utc,internalUtc:event.occurredAt,errorMinutes,toleranceMinutes:row.toleranceMinutes});
 assert.ok(errorMinutes<=row.toleranceMinutes,row.planet+" "+row.eventType+" external discrepancy "+errorMinutes+" minutes, tolerance "+row.toleranceMinutes);
 assert.ok(event.bracketSeconds>0&&event.bracketSeconds<=60);
 assert.equal(Date.parse(event.bracketEndUtc)-Date.parse(event.bracketStartUtc),event.bracketSeconds*1000);
 assert.equal(event.externalValidationRequired,true);assert.equal(event.verificationLevel,"needs_external_validation");
 assert.ok(events.every((e,i)=>i===0||e.occurredAt>=events[i-1].occurredAt));
 if(row.eventType==="sign_ingress")ingressChecks++;else eventStationChecks++;
}
for(const input of [{date:"2025-02-30"},{date:"bad"},{date:"2025-01-01",ayanamsa:"raman"}]){
 assert.throws(()=>calculateRefinedTransitTimeline({...baseTransit,...input},3));
}
for(const days of [0,181,1.5,NaN])assert.throws(()=>calculateRefinedTransitTimeline({...baseTransit,date:"2025-01-01"},days));
assert.equal(ingressChecks,9);assert.equal(eventStationChecks,10);
console.log("INDEPENDENT_TRANSIT_EVENTS_PASS "+JSON.stringify({ingressChecks,eventStationChecks,residuals,maximumIngressErrorMinutes:Math.max(...residuals.filter(r=>r.eventType==="sign_ingress").map(r=>r.errorMinutes)),maximumStationErrorMinutes:Math.max(...residuals.filter(r=>r.eventType!=="sign_ingress").map(r=>r.errorMinutes)),scope:"19 bounded numerical event references, no public exact event or prediction certification"}));

// Published IANA rules include transitions at midnight and an entire skipped local date.
// Swiss rise/set references below were generated with Python zoneinfo, independently of Intl.
const civilReference = JSON.parse(fs.readFileSync("fixtures/astrology/heldout-civil-day-panchang.json", "utf8"));
let civilEndpoints = 0, absentEvents = 0, invalidDates = 0, maxCivilMinutes = 0, sumCivilMinutes = 0;
for (const {id, input, nonexistent, expected} of civilReference.cases) {
  if (nonexistent) {
    assert.throws(() => calculatePremiumPanchang(input), /ambiguous or nonexistent/, id);
    invalidDates++;
    continue;
  }
  const daily = calculatePremiumPanchang(input);
  for (const [field, target] of Object.entries(expected)) {
    if (target === null) {
      assert.equal(daily[field], null, id + " / " + field);
      absentEvents++;
      continue;
    }
    const times = daily[field]?.split(" - ");
    const referenceTimes = target.split(" - ");
    assert.equal(times?.length, referenceTimes.length, id + " / " + field);
    for (const [index, referenceTime] of referenceTimes.entries()) {
      const difference = Math.abs(toMin(times[index]) - toMin(referenceTime));
      assert.ok(difference <= provenance.riseSetToleranceMinutes, id + " / " + field + ": " + difference);
      civilEndpoints++;
      sumCivilMinutes += difference;
      maxCivilMinutes = Math.max(maxCivilMinutes, difference);
    }
  }
}
console.log("CIVIL_PANCHANG", JSON.stringify({cases: civilReference.cases.length, civilEndpoints, absentEvents, invalidDates,
  toleranceMinutes: provenance.riseSetToleranceMinutes, maxCivilMinutes, meanCivilMinutes: sumCivilMinutes / civilEndpoints}));

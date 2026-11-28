import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
const require=createRequire(import.meta.url),ts=require("typescript"),resolve=Module._resolveFilename;
Module._resolveFilename=function(n,...a){return resolve.call(this,n.startsWith("@/")?path.resolve(n.slice(2)):n,...a)};
require.extensions[".ts"]=function(m,f){m._compile(ts.transpileModule(fs.readFileSync(f,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f)};
const {calculateVargaChart}=require("@/lib/astrology/varga/engine");
const {buildD9Chart,navamsaSignFromLongitude}=require("@/lib/astrology/own-engine/charts");
const {fixtures}=JSON.parse(fs.readFileSync(new URL("../fixtures/astrology/independent-runtime-swiss-reference.json",import.meta.url),"utf8"));
const signs=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const charts=["D1","D2","D3","D9","D10","D12"];let placements=0,boundaries=0,negative=0;
const mod=(x,n)=>((x%n)+n)%n;
function independent(lon,chart){
 const x=lon>=0&&lon<360?lon:mod(lon,360),base=Math.floor(x/30),local=x-base*30,n=Number(chart.slice(1)),segment=Math.min(n-1,Math.floor(local*n/30));
 const result=chart==="D1"?base:chart==="D2"?(base%2===0?[4,3]:[3,4])[segment]:chart==="D3"?mod(base+segment*4,12):chart==="D9"?Math.floor(x*9/30)%12:chart==="D10"?mod(base+(base%2===1?8:0)+segment,12):mod(base+segment,12);
 return {sign:signs[result],degree:local*n-segment*30};
}
function check(lon,chart){
 const a=calculateVargaChart(chart,[{planet:"Moon",absoluteLongitude:lon}]).placements[0],b=independent(lon,chart);
 assert.equal(a.sign,b.sign,chart+" "+lon+" sign");assert.ok(a.degree>=0&&a.degree<30,chart+" "+lon+" half-open degree");
 assert.ok(Math.abs(a.degree-b.degree)<=.0000011,chart+" "+lon+" degree");
 if(chart==="D9"){const c=navamsaSignFromLongitude(lon);assert.equal(c.rashi,a.sign);assert.ok(Math.abs(c.degreeInSign-a.degree)<=.0000011);}
}
for(const f of fixtures)for(const [key,lon] of Object.entries(f.longitudeDegrees))if(key!=="ascendant")for(const chart of charts){check(lon,chart);placements++;}
for(const chart of charts){const divisor=Number(chart.slice(1));for(let sign=0;sign<12;sign++)for(let part=0;part<divisor;part++){
 const x=sign*30+part*30/divisor;
 // Each representable exact whole-degree boundary, plus two near-boundary
 // samples where decimal rounding must never change the selected sign.
 for(const lon of [x-.00000001,x+.00000001,...(Number.isInteger(x)?[x]:[])]){check(lon,chart);boundaries++;}
}}
for(const x of [10,20,40,50]){assert.equal(calculateVargaChart("D9",[{planet:"Moon",absoluteLongitude:x}]).placements[0].degree,0);boundaries++;}
for(const lon of [null,undefined,NaN,Infinity,-Infinity]){
 const a=calculateVargaChart("D9",[{planet:"Moon",absoluteLongitude:lon}]);assert.equal(a.placements[0].verified,false);assert.equal(a.placements[0].sign,null);assert.equal(a.verificationLevel,"needs_external_validation");negative++;
}
assert.throws(()=>buildD9Chart(0,[{planet:"Sun",sign:"Cancer"}]),/LONGITUDE_REQUIRED/);negative++;
assert.throws(()=>navamsaSignFromLongitude(NaN),/INVALID_DIVISION_LONGITUDE/);negative++;
const derived=buildD9Chart(0,[{planet:"Sun",sign:"Cancer",degree:10}]);
const explicit=buildD9Chart(0,[{planet:"Sun",sign:"Cancer",absoluteLongitude:100}]);
assert.deepEqual(derived,explicit);negative++;
assert.equal(placements,540);
console.log("VARGA_DIVISION_RUNTIME_PASS="+JSON.stringify({placements,boundaries,negative,scope:"six supported divisions; actual TS runtime using independent Swiss longitudes and explicit arithmetic reference; no new public activation"}));

{
 const {classicalVargaCoordinates:actual}=require("@/lib/astrology/varga/partition");
 const published=JSON.parse(fs.readFileSync(new URL("../fixtures/astrology/independent-d7-worked-reference.json",import.meta.url),"utf8"));
 let arcsecondCases=0,publishedCases=0;
 // Independent integer rational formulation: sevenfold harmonic.
 // No production division helpers or vendor-calibrated offsets in expected values.
 for(let arcsec=0;arcsec<1296000;arcsec++){
  assert.equal(actual("D7",arcsec/3600).signIndex,Math.floor(7*arcsec/108000)%12);
  arcsecondCases++;
 }
 for(const [planet,s,d,m,a,expected] of published.rows){
  assert.equal(actual("D7",s*30+d+m/60+a/3600).signIndex,expected,planet);
  publishedCases++;
 }
 const vendor=JSON.parse(fs.readFileSync(new URL("../fixtures/astrology/published-classical-comparison.json",import.meta.url),"utf8"));
 const sourceConflicts=[];
 for(const [i,[s,d,m,a]] of vendor.positionsDms.entries()){
  const arcsec=((s-1)*30+d)*3600+m*60+a,expected=Math.floor(7*arcsec/108000)%12;
  const computed=actual("D7",arcsec/3600).signIndex;
  assert.equal(computed,expected);
  if(computed+1!==vendor.divisions.D7[i])sourceConflicts.push({point:vendor.order[i],computed:computed+1,printed:vendor.divisions.D7[i]});
 }
 assert.deepEqual(sourceConflicts,[{point:"Moon",computed:9,printed:8},{point:"Saturn",computed:10,printed:9}]);
 console.log("P0_D7_INDEPENDENT_FORMULA_PASS "+JSON.stringify({arcsecondCases,publishedCases,sourceConflicts,scope:"exact equal-sevenths Parashari sign mapping; vendor discrepancies retained; no public activation or predictive certification"}));
}

{
 const T=require("@/lib/astrology/own-engine/time"),N=require("@/lib/astrology/own-engine/nakshatra"),Z=require("@/lib/astrology/own-engine/zodiac");
 let arcsecondCases=0,nearBoundaries=0;
 for(let a=0;a<1296000;a++){const lon=a/3600,x=N.nakshatraFromLongitude(lon),sector=Math.floor(a/12000);assert.equal(x.name,N.nakshatras[Math.floor(sector/4)]);assert.equal(x.pada,sector%4+1);arcsecondCases++;}
 for(let sector=0;sector<108;sector++)for(const delta of [-1e-8,1e-8]){const x=sector*10/3+delta,result=N.nakshatraFromLongitude(x),e=(sector+(delta<0?-1:0)+108)%108;assert.equal(result.name,N.nakshatras[Math.floor(e/4)]);assert.equal(result.pada,e%4+1);nearBoundaries++;}
 for(let s=1;s<=12;s++)for(const dx of [1e-7,1e-8,1e-10]){const x=s*30-dx,r=Z.longitudeToRashi(x);assert.equal(T.normalizeDegrees(x),x);assert.equal(r.rashiNumber,s);for(const digits of [4,6])assert.ok(Z.boundedDegreeDisplay(r.degreeInSign,digits)<30);nearBoundaries++;}
 assert.deepEqual(N.nakshatraFromLongitude(359.9999999999),{name:"Revati",pada:4});
 assert.deepEqual(N.nakshatraFromLongitude(360),{name:"Ashwini",pada:1});
 assert.equal(T.normalizeDegrees(-1e-15)<360,true);
 const ownSource=fs.readFileSync("lib/astrology/own-engine/index.ts","utf8"),premiumSource=fs.readFileSync("lib/astrology/premium-engine/chart.ts","utf8");
 assert.ok(ownSource.includes("degree: boundedDegreeDisplay(rashi.degreeInSign,4)")&&!ownSource.includes("absoluteLongitude: Number(absoluteLongitude.toFixed(6))"));
 assert.ok(premiumSource.includes("const absoluteLongitude = longitudes[planet];")&&premiumSource.includes("absoluteLongitude: ascendantLongitude"));
 console.log("P0_UNROUNDED_COORDINATES_AND_PADA_PASS "+JSON.stringify({arcsecondCases,nearBoundaries,specialCases:3,sourceContracts:2}));
}

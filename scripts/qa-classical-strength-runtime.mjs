import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
const require=createRequire(import.meta.url),ts=require("typescript"),resolve=Module._resolveFilename;
Module._resolveFilename=function(n,...a){return resolve.call(this,n.startsWith("@/")?path.resolve(n.slice(2)):n,...a)};
require.extensions[".ts"]=function(m,f){m._compile(ts.transpileModule(fs.readFileSync(f,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f)};
const {calculateVargaChart,calculateSupportedVargaCharts,calculateInternalClassicalVargas}=require("@/lib/astrology/varga/engine");
const {calculateInternalAshtakvarga,reduceAiyarAshtakvarga}=require("@/lib/astrology/strength/ashtakvarga");
const {calculateClassicalStrengthBasis,calculateInternalShadbala,shadbalaSaptavargaSigns}=require("@/lib/astrology/strength/shadbala");
const ref=JSON.parse(fs.readFileSync("fixtures/astrology/classical-strength-reference.json","utf8"));
const {fixtures}=JSON.parse(fs.readFileSync("fixtures/astrology/independent-runtime-swiss-reference.json","utf8"));
const signs=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const classical=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"],references=[...classical,"Ascendant"];
const keys=["D1","D2","D3","D4","D7","D9","D10","D12","D16","D20","D24","D27","D30","D40","D45","D60"];
const vectors=[["124789AB","36AB","124789AB","3569ABC","569B","67C","124789AB","346ABC"],["3678AB","1367AB","23569AB","134578AB","1478ABC","34579AB","356B","36AB"],["356AB","36B","12478AB","356B","6ABC","68BC","14789AB","136AB"],["569BC","2468AB","124789AB","13569ABC","68BC","1234589B","124789AB","12468AB"],["1234789AB","2579B","12478AB","124569AB","123478AB","2569AB","356C","1245679AB"],["8BC","1234589BC","3569BC","3569B","589AB","1234589AB","34589AB","1234589B"],["12478AB","36B","356ABC","689ABC","56BC","6BC","356B","1346AB"]];
let vargaChecks=0,contributionChecks=0,reductionChecks=0,strengthChecks=0,negative=0;
const point=(planet,lon)=>({planet,sign:signs[Math.floor(((lon%360)+360)%360/30)],degree:((lon%30)+30)%30,absoluteLongitude:lon});
const signAt=(chart,lon)=>calculateVargaChart(chart,[point("Sun",lon)]).placements[0]?.sign;
function expectedSign(chart,x){
 const normalized=x>=0&&x<360?x:((x%360)+360)%360;
 const s=Math.floor(normalized/30),local=normalized-s*30,n=Number(chart.slice(1)),p=Math.min(n-1,Math.floor(local*n/30));
 if(chart==="D30"){const row=ref.trimshamshaExamples[s%2?"even":"odd"];return row.filter(v=>v.degree<=local).at(-1).sign;}
 // Independently expressed first-sign sequence by natal sign; no
 // production constants or division helper imported into reference.
 const starts={D1:[0,1,2,3,4,5,6,7,8,9,10,11],D7:[0,7,2,9,4,11,6,1,8,3,10,5],D9:[0,9,6,3,0,9,6,3,0,9,6,3],D10:[0,9,2,11,4,1,6,3,8,5,10,7],D12:[0,1,2,3,4,5,6,7,8,9,10,11],D16:[0,4,8,0,4,8,0,4,8,0,4,8],D20:[0,8,4,0,8,4,0,8,4,0,8,4],D24:[4,3,4,3,4,3,4,3,4,3,4,3],D27:[0,3,6,9,0,3,6,9,0,3,6,9],D40:[0,6,0,6,0,6,0,6,0,6,0,6],D45:[0,4,8,0,4,8,0,4,8,0,4,8],D60:Array(12).fill(0)};
 if(chart==="D2")return s%2?["Cancer","Leo"][p]:["Leo","Cancer"][p];
 if(chart==="D3")return signs[(s+4*p)%12];
 if(chart==="D4")return signs[(s+3*p)%12];
 return signs[(starts[chart][s]+p)%12];
}
function verify(chart,lon){
 const actual=calculateVargaChart(chart,[point("Sun",lon)]);const p=actual.placements[0];
 assert.equal(p.sign,expectedSign(chart,lon),chart+" "+lon);
 assert.ok(Number.isFinite(p.degree)&&p.degree>=0&&p.degree<30,chart+" bounded degree");
 assert.equal(actual.publicEnabled,false);
 if(!["D1","D2","D3","D9","D10","D12"].includes(chart)){assert.equal(actual.verificationLevel,"implemented_unverified");assert.equal(p.verified,false);}
 vargaChecks++;
}
for(const chart of keys)for(let s=0;s<12;s++){
 const divisor=Number(chart.slice(1)),bounds=chart==="D30"?ref.trimshamshaExamples[s%2?"even":"odd"].map(v=>v.degree):Array.from({length:divisor},(_,j)=>30*j/divisor);
 for(const x of bounds){const absolute=s*30+x;for(const lon of [absolute-0.00000001,absolute+0.00000001,...(Number.isInteger(absolute)?[absolute]:[])])verify(chart,lon);}
}
for(const fixture of fixtures)for(const [k,lon] of Object.entries(fixture.longitudeDegrees))for(const chart of keys)verify(chart,lon);
assert.equal(calculateSupportedVargaCharts([point("Sun",10)]).length,6);
assert.equal(calculateInternalClassicalVargas([point("Sun",10)]).length,16);
assert.equal(calculateVargaChart("D64",[point("Sun",10)]).verificationLevel,"blocked_until_verified_formula");
for(const invalid of [NaN,Infinity,-Infinity,null])for(const chart of keys){assert.equal(calculateVargaChart(chart,[{planet:"Sun",absoluteLongitude:invalid}]).placements[0].sign,null);negative++;}
const sample=ref.publishedSample,positions=classical.map(planet=>({planet,sign:sample.referenceSigns[planet],degree:null}));
function checkRaw(p,asc){
 const r=calculateInternalAshtakvarga(p,asc);assert.equal(r.method,"brihat_jataka_aiyar_raw");assert.equal(r.checksums.Sarva,337);
 assert.equal(r.publicEnabled,false);
 const map=Object.fromEntries(p.filter(x=>classical.includes(x.planet)).map(x=>[x.planet,x.sign]));map.Ascendant=asc;
 for(const [i,score] of r.scores.entries()){
  assert.equal(score.planet,classical[i]);assert.equal(score.contributions.length,8);
  for(let s=0;s<12;s++){
   const expected=references.map((name,j)=>Number(vectors[i][j].includes((1+(s-signs.indexOf(map[name])+12)%12).toString(16).toUpperCase())));
   // Hexadecimal A/B/C denote 10/11/12 in the independent text vectors.
   assert.equal(score.bhinna[s],expected.reduce((a,b)=>a+b,0),score.planet+" "+signs[s]);
   for(let j=0;j<8;j++){assert.equal(score.contributions[j].reference,references[j]);assert.equal(score.contributions[j].bindus[s],expected[j]);contributionChecks++;}
  }
 }
 return r;
}
const raw=checkRaw(positions,sample.referenceSigns.Ascendant);
assert.deepEqual(raw.scores[0].bhinna,sample.sun);
const observed=raw.sarva.flatMap((n,i)=>n===sample.sarva[i]?[]:[{sign:signs[i],aiyar:n,published:sample.sarva[i]}]);
assert.deepEqual(observed,sample.knownSarvaDifferences);
for(let rotation=0;rotation<12;rotation++){
 const shifted=positions.map(p=>({...p,sign:signs[(signs.indexOf(p.sign)+rotation)%12]}));
 checkRaw(shifted,signs[(11+rotation)%12]);
}
for(const fixture of fixtures){
 const p=classical.map(planet=>point(planet,fixture.longitudeDegrees[planet.toLowerCase()]??fixture.longitudeDegrees[planet]));
 const asc=fixture.longitudeDegrees.ascendant;
 assert.ok(p.every(x=>Number.isFinite(x.absoluteLongitude))&&Number.isFinite(asc),"independent reference keys");
 checkRaw(p,point("Sun",asc).sign);
}
for(const input of [[...positions,{planet:"Sun",sign:"Aries",degree:null}],positions.slice(1),positions.map((p,i)=>i? p:{...p,sign:"Unknown"}),positions.map((p,i)=>i?p:{...p,absoluteLongitude:NaN}),positions.map((p,i)=>i?p:{...p,absoluteLongitude:0}),positions.map((p,i)=>i?p:{...p,degree:30})]){
 const r=calculateInternalAshtakvarga(input,"Pisces");assert.equal(r.sarva,undefined);assert.equal(r.verificationLevel,"blocked_until_verified_formula");negative++;
}
assert.equal(calculateInternalAshtakvarga(positions,"Unknown").sarva,undefined);negative++;
const example=ref.aiyarMarsReduction,reduced=reduceAiyarAshtakvarga(example.raw,example.occupiedSigns);
assert.deepEqual(reduced.trikona,example.trikona);assert.deepEqual(reduced.ekadhipatya,example.ekadhipatya);assert.equal(reduced.total,15);reductionChecks+=3;
// Exhaustive three-sign Trikona cells in the published 0..8 range.
for(let a=0;a<=8;a++)for(let b=0;b<=8;b++)for(let c=0;c<=8;c++){
 const r=Array(12).fill(0);r[0]=a;r[4]=b;r[8]=c;const result=reduceAiyarAshtakvarga(r,[]),v=[a,b,c],nonzero=v.filter(x=>x>0).length;
 const expected=nonzero<=1?[0,0,0]:nonzero===2?v:v.map(x=>x-Math.min(...v));
 assert.deepEqual([result.trikona[0],result.trikona[4],result.trikona[8]],expected);assert.deepEqual(result.raw,r);reductionChecks++;
}
for(const x of [[],Array(12).fill(-1),Array(12).fill(9),Array(12).fill(.5)]){assert.throws(()=>reduceAiyarAshtakvarga(x,[]));negative++;}
assert.throws(()=>reduceAiyarAshtakvarga(Array(12).fill(1),["bad"]));negative++;
for(const ex of ref.uchchaExamples){const p={...point(ex.planet,ex.longitude),house:1};const r=calculateClassicalStrengthBasis(p);assert.ok(Math.abs(r.uchchaVirupas-ex.expected)<0.0001);strengthChecks++;}
for(const [i,planet] of ["Saturn","Mars","Mercury","Jupiter","Venus","Moon","Sun"].entries()){
 for(const house of [1,2,3,4,5,6,7,8,9,10,11,12]){
  const p={...point(planet,7),house};const r=calculateClassicalStrengthBasis(p);
  assert.ok(Math.abs(r.naisargikaVirupas-60*(i+1)/7)<1e-10);
  assert.equal(r.kendradiVirupas,[60,30,15][(house-1)%3]);
  assert.equal(r.fullShadbalaVerified,false);assert.equal(r.saptavargaSigns.at(-1),"Aquarius");
  strengthChecks+=3;
 }
 for(const lon of [0,7,15,25,30,35,44,55,359.9]){
  const r=calculateClassicalStrengthBasis({...point(planet,lon),house:1});
  const odd=planet!=="Moon"&&planet!=="Venus";
  const expected=(Number(signs.indexOf(expectedSign("D1",lon))%2===0)===Number(odd)?15:0)+(Number(signs.indexOf(expectedSign("D9",lon))%2===0)===Number(odd)?15:0);
  assert.equal(r.ojayugmaVirupas,expected);
  assert.deepEqual(shadbalaSaptavargaSigns(lon),["D1","D2","D3","D7","D9","D12","D30"].map(k=>expectedSign(k,lon)));strengthChecks+=2;
 }
}
assert.equal(calculateClassicalStrengthBasis(point("Rahu",7)),null);negative++;
assert.equal(calculateClassicalStrengthBasis({planet:"Sun",sign:"Aries",absoluteLongitude:NaN}),null);negative++;
const incomplete=calculateInternalShadbala([{...point("Sun",7),house:1}],{ascendantLongitude:0});
assert.ok(incomplete.scores.every(x=>x.total===null)&&!incomplete.publicEnabled);negative++;
console.log("CLASSICAL_STRENGTH_RUNTIME_PASS "+JSON.stringify({vargaChecks,contributionChecks,reductionChecks,strengthChecks,negative,traditionalDivisions:16,publishedSunCells:12,publishedSarvaCells:12-observed.length,publishedSarvaDifferences:observed,scope:"textual arithmetic plus independent Swiss source longitudes; no public activation or predictive certification; full Shadbala/Bhavabala remain unqualified"}));

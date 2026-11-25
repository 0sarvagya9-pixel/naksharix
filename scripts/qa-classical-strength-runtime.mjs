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


// P0: directed friendship, seven-division dignity, actual midpoint geometry
// and precise angular aspect arithmetic. Reference rules transcribed from
// BPHS 3.51–58, 26.6–12 and 27.1–7, 26–31. Not software parity.
const C=require("@/lib/astrology/strength/classical-components");
let friendshipChecks=0,dignityChecks=0,angleChecks=0,aspectChecks=0,bhavaChecks=0,strictNegative=0;
const traditional=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
// Directed natural relationship matrix, columns in the same stated order.
// 1=friendly, 0=neutral, -1=hostile. Self intentionally not evaluated.
const natalMatrix=[
 [0,1,1,0,1,-1,-1],
 [1,0,0,1,0,0,0],
 [1,1,0,-1,1,0,0],
 [1,-1,0,0,0,1,0],
 [1,1,1,-1,0,-1,0],
 [-1,-1,0,1,0,0,1],
 [-1,-1,-1,1,0,1,0]
];
for(const [a,from] of traditional.entries())for(const [b,to] of traditional.entries())if(a!==b)for(let x=0;x<12;x++)for(let y=0;y<12;y++){
 const r=C.classicalRelationship(from,to,x,y),gap=Math.abs(x-y),temporary=Math.min(gap,12-gap)>=1&&Math.min(gap,12-gap)<=3?1:-1;
 assert.equal(r.natural,natalMatrix[a][b]);assert.equal(r.temporary,temporary);
 assert.equal(r.compound,natalMatrix[a][b]+temporary);assert.equal(r.virupas,[2,4,10,15,20][r.compound+2]);friendshipChecks++;
}
const synthetic=traditional.map((planet,i)=>({...point(planet,[130,40,5,166,245,190,310][i]),house:i+1}));
const relationship=C.calculateFivefoldFriendship(synthetic);assert.equal(relationship.relationships.length,42);
for(const p of synthetic){
 const result=C.calculateSaptavargajaEvidence(synthetic,p.planet);
 assert.equal(result.rows.length,7);assert.equal(result.rows[0].dignity,"moolatrikona");
 assert.equal(result.rows[0].virupas,45);
 assert.equal(result.totalVirupas,result.rows.reduce((a,b)=>a+b.virupas,0));
 // independently select the natal sign lord from the conventional list and
 // verify every division's grade without using the production lookup table.
 for(const r of result.rows){
  const expected=expectedSign(r.chart,p.absoluteLongitude),lord=["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"][signs.indexOf(expected)];
  assert.equal(r.sign,expected);assert.equal(r.lord,lord);
  if(r.chart==="D1")assert.equal(r.virupas,45);
  else if(lord===p.planet)assert.equal(r.virupas,30);
  else{
   const gap=Math.abs(signs.indexOf(p.sign)-signs.indexOf(synthetic.find(x=>x.planet===lord).sign));
   const temp=Math.min(gap,12-gap)>=1&&Math.min(gap,12-gap)<=3?1:-1;
   const n=natalMatrix[traditional.indexOf(p.planet)][traditional.indexOf(lord)];
   assert.equal(r.virupas,[2,4,10,15,20][n+temp+2]);
  }
  dignityChecks++;
 }
}
const boundaries=[
 ["Sun",120,140],["Moon",33,60],["Mars",0,12],["Mercury",165,170],["Jupiter",240,250],["Venus",180,195],["Saturn",300,320]
];
for(const [planet,start,end] of boundaries)for(const [lon,expected] of [[start,true],[end-1e-6,true],[end,false],[start-1e-6,false]]){
 const canonicalLon=(lon%360+360)%360;
 const p=synthetic.map(p=>p.planet===planet?{...point(planet,canonicalLon),house:p.house}:p);
 const r=C.calculateSaptavargajaEvidence(p,planet);
 assert.equal(r.rows[0].dignity==="moolatrikona",expected,planet+" moola "+lon);dignityChecks++;
}
for(const p of [synthetic.slice(1),[...synthetic,synthetic[0]],synthetic.map((p,i)=>i?p:{...p,absoluteLongitude:NaN}),synthetic.map((p,i)=>i?p:{...p,sign:"Aries"})]){
 assert.equal(C.calculateFivefoldFriendship(p).available,false);
 assert.equal(C.calculateSaptavargajaEvidence(p,"Sun"),null);strictNegative++;
}
// Deliberately unequal angles: Asc=20, MC=310, IC=130, Desc=200.
const mid=C.buildQuadrantBhavaMidpoints(20,310).midpoints;
const expectedMid=[20,56.666666666666664,93.33333333333333,130,153.33333333333334,176.66666666666666,200,236.66666666666666,273.3333333333333,310,333.3333333333333,356.6666666666667];
for(let i=0;i<12;i++){
 assert.ok(Math.abs(mid[i]-expectedMid[i])<1e-8);
 assert.equal(C.assignMidpointBhava(mid[i],mid),i+1);angleChecks++;
}
const weak={Sun:4,Mars:4,Mercury:7,Jupiter:7,Saturn:1,Moon:10,Venus:10};
for(const g of traditional)for(const gap of [0,30,60,90,120,150,180,210,240,270,300,330]){
 const lon=(mid[weak[g]-1]+gap)%360;
 const r=C.calculateExactDirectionalBala(g,lon,mid);
 assert.equal(r.weakHouse,weak[g]);assert.ok(Math.abs(r.virupas-Math.min(gap,360-gap)/3)<1e-8);
 angleChecks++;
}
// Specified verse values at the exact aspect anchors and one published
// worked example; independent piecewise check between anchor points.
const ordinary=[[0,0],[30,0],[45,7.5],[60,15],[75,30],[90,45],[105,37.5],[120,30],[135,15],[150,0],[165,30],[180,60],[195,52.5],[210,45],[240,30],[270,15],[300,0],[359,0]];
for(const g of ["Sun","Moon","Mercury","Venus"])for(const [a,v] of ordinary){
 assert.equal(C.classicalAspectVirupas(g,0,a).virupas,v);
 assert.equal(C.classicalAspectVirupas(g,350,(350+a)%360).virupas,v);aspectChecks+=2;
}
const special={
 Saturn:[[30,0],[45,30],[60,60],[75,52.5],[90,45],[240,30],[255,45],[270,60],[285,30],[300,0]],
 Mars:[[60,15],[75,37.5],[90,60],[105,45],[120,30],[180,60],[195,60],[210,60],[225,45],[240,30]],
 Jupiter:[[90,45],[105,52.5],[120,60],[135,30],[150,0],[210,45],[225,52.5],[240,60],[255,30],[270,15]]
};
for(const [g,values] of Object.entries(special))for(const [a,v] of values){assert.equal(C.classicalAspectVirupas(g,0,a).virupas,v);aspectChecks++;}
for(const g of traditional)for(let a=0;a<360;a+=.5){
 const v=C.classicalAspectVirupas(g,0,a).virupas;assert.ok(v>=0&&v<=60);aspectChecks++;
}
assert.ok(Math.abs(C.classicalAspectVirupas("Saturn",266+9/60,48+55/60).virupas-(7+14/60))<1e-9);aspectChecks++;
const classes=[[0,4],[30,4],[60,7],[90,1],[120,4],[150,7],[180,7],[210,1],[240,7],[255,4],[270,4],[285,10],[300,7],[330,10]];
for(const [lon,house] of classes){assert.equal(C.classifyBhavaDirection(lon).weakHouse,house);bhavaChecks++;}
const incompleteBhava=C.calculateBhavaBalaEvidence(synthetic,mid);
assert.equal(incompleteBhava.houses.length,12);assert.ok(incompleteBhava.houses.every(h=>h.arithmeticTotalVirupas===null));assert.ok(incompleteBhava.missingDependencies.length>0);
const polarity={Sun:"malefic",Moon:"benefic",Mars:"malefic",Mercury:"benefic",Jupiter:"benefic",Venus:"benefic",Saturn:"malefic"};
const lordStrengthVirupas=Object.fromEntries(traditional.map((g,i)=>[g,300+i*10]));
for(const aspectReading of ["additional_full_mercury_jupiter","full_instead_of_quarter"])for(const birthPhase of ["day","twilight","night"]){
 const r=C.calculateBhavaBalaEvidence(synthetic,mid,{polarity,aspectReading,birthPhase,lordStrengthVirupas});
 assert.equal(r.publicEnabled,false);assert.equal(r.verified,false);assert.equal(r.missingDependencies.length,0);
 assert.equal(r.houses.flatMap(h=>h.occupants).length,7);
 for(const h of r.houses){
  const d=Math.abs(h.midpoint-mid[h.weakHouse-1]),dir=Math.min(d,360-d)/3;
  assert.ok(Math.abs(h.directionalVirupas-dir)<1e-8);
  const aspects=h.aspect.rows.reduce((sum,a)=>sum+((aspectReading==="full_instead_of_quarter"&&["Jupiter","Mercury"].includes(a.planet))?a.virupas:(polarity[a.planet]==="benefic"?1:-1)*a.virupas/4+(["Jupiter","Mercury"].includes(a.planet)?a.virupas:0)),0);
  assert.ok(Math.abs(h.aspect.virupas-aspects)<1e-8);
  assert.ok(Math.abs(h.arithmeticTotalVirupas-(dir+h.occupantVirupas+aspects+h.birthPhaseVirupas+lordStrengthVirupas[h.lord]))<1e-8);
  bhavaChecks++;
 }
}
assert.equal(C.calculateAspectStrengthEvidence(synthetic,0,{},"additional_full_mercury_jupiter"),null);strictNegative++;
for(const bad of [[],Array(12).fill(0),[...mid.slice(0,11),NaN]]){assert.throws(()=>C.calculateBhavaBalaEvidence(synthetic,bad));strictNegative++;}
assert.throws(()=>C.buildQuadrantBhavaMidpoints(20,200));strictNegative++;
assert.throws(()=>C.classicalRelationship("Sun","Sun",0,0));strictNegative++;
assert.throws(()=>C.classicalAspectVirupas("Sun",NaN,60));strictNegative++;
const fixed=calculateInternalShadbala(synthetic,{ascendantLongitude:20,bhavaMidpoints:mid});
for(const p of fixed.scores){
 const basis=calculateClassicalStrengthBasis(synthetic.find(x=>x.planet===p.planet));
 const sapta=C.calculateSaptavargajaEvidence(synthetic,p.planet);
 assert.ok(Math.abs(p.components.sthanaBala-(basis.uchchaVirupas+basis.ojayugmaVirupas+basis.kendradiVirupas+basis.drekkanaVirupas+sapta.totalVirupas))<.00011);
 assert.ok(Math.abs(p.components.digBala-C.calculateExactDirectionalBala(p.planet,synthetic.find(x=>x.planet===p.planet).absoluteLongitude,mid).virupas)<.00011);
 dignityChecks+=2;
}
console.log("CLASSICAL_POSITIONAL_BHAVA_EVIDENCE_PASS "+JSON.stringify({friendshipChecks,dignityChecks,angleChecks,aspectChecks,bhavaChecks,strictNegative,scope:"named traditional arithmetic, supplied midpoint/polarity/lord context; independent full Shadbala and Bhava Bala software parity still required"}));


const birthGeometry=require("@/lib/astrology/strength/birth-context");
const midRef=JSON.parse(fs.readFileSync("fixtures/astrology/independent-bhava-midpoints-swiss-reference.json","utf8"));
let midpointComparisons=0,midpointMaxError=0,actualHouseAssignments=0,geometryNegative=0;
for(const row of midRef.rows){
 const [date,time]=row.utc.slice(0,-1).split("T");
 const input={date,time,timezone:"UTC",latitude:row.latitude,longitude:row.longitude,ayanamsa:"lahiri",houseSystem:"whole_sign",name:"Synthetic independent geometry",language:"en"};
 const result=birthGeometry.calculateBirthStrengthEvidence(input);
 const g=result.geometry;
 assert.equal(g.utc,new Date(row.utc).toISOString());
 assert.equal(g.publicEnabled,false);assert.equal(result.fullShadbalaVerified,false);assert.equal(result.fullBhavaBalaVerified,false);
 assert.equal(result.positional.length,7);assert.equal(result.friendship.relationships.length,42);
 assert.equal(result.bhava.houses.length,12);assert.ok(result.bhava.houses.every(h=>h.arithmeticTotalVirupas===null));
 for(let i=0;i<12;i++){
  const e=Math.abs(((g.midpoints[i]-row.midpoints[i]+540)%360)-180);
  midpointMaxError=Math.max(midpointMaxError,e);assert.ok(e<=midRef.provenance.toleranceDegrees,row.id+" midpoint "+(i+1)+" discrepancy "+e);midpointComparisons++;
 }
 for(const planet of g.chart.planets){
  assert.equal(planet.house,(Math.floor(planet.absoluteLongitude/30)-Math.floor(g.ascendant/30)+12)%12+1,"D1 must remain whole sign");
  if(traditional.includes(planet.planet)){
   const house=C.assignMidpointBhava(planet.absoluteLongitude,g.midpoints);
   const refHouse=C.assignMidpointBhava(planet.absoluteLongitude,row.midpoints);
   // The separately qualified geometric convention is tested against
   // independent midpoints; avoid falsely claiming categorical parity
   // for a point closer than angular tolerance to a boundary.
   const close=row.midpoints.some((m,i)=>Math.abs(((planet.absoluteLongitude-((m+((row.midpoints[(i+1)%12]-m+360)%360)/2)%360)+540)%360)-180)<=midRef.provenance.toleranceDegrees);
   if(!close){assert.equal(house,refHouse,row.id+" "+planet.planet+" independent house assignment");actualHouseAssignments++;}
  }
 }
}
assert.equal(midpointComparisons,144);assert.ok(actualHouseAssignments>=80);
const basicInput={date:"2000-01-01",time:"12:00",timezone:"UTC",latitude:28,longitude:77};
for(const patch of [{latitude:66},{latitude:NaN},{longitude:181},{latitude:null},{ayanamsa:"raman"},{houseSystem:"placidus"}]){
 assert.throws(()=>birthGeometry.calculateBirthBhavaGeometry({...basicInput,...patch}));geometryNegative++;
}
console.log("INDEPENDENT_BHAVA_GEOMETRY_PASS "+JSON.stringify({charts:midRef.rows.length,midpointComparisons,midpointMaxError,actualHouseAssignments,geometryNegative,scope:"Swiss Porphyry division points used as named quadrant midpoints, independent astronomical geometry only; full Bhava Bala not certified"}));


const T=require("@/lib/astrology/strength/temporal-components");
const solarRef=JSON.parse(fs.readFileSync("fixtures/astrology/independent-solar-strength-swiss-reference.json","utf8"));
let declinationChecks=0,solarTimeChecks=0,solarEventChecks=0,temporalChecks=0,cheshtaChecks=0,temporalNegative=0;
let maxDeclinationError=0,maxSolarTimeSeconds=0,maxSolarEventSeconds=0;
for(const row of solarRef.rows){
 const b=midRef.rows.find(x=>x.id===row.id),utc=new Date(b.utc);
 const actual=T.calculateSolarStrengthContext(utc,b.latitude,b.longitude);
 const diff=Math.abs(actual.apparentSolarHours-row.apparentSolarHours),timeError=Math.min(diff,24-diff)*3600;
 assert.ok(timeError<=solarRef.provenance.apparentSolarTimeToleranceSeconds,row.id+" solar time "+timeError);
 maxSolarTimeSeconds=Math.max(maxSolarTimeSeconds,timeError);solarTimeChecks++;
 for(const [i,planet] of traditional.entries()){
  const err=Math.abs(actual.declinations[planet]-row.declinations[i]);
  assert.ok(err<=solarRef.provenance.declinationToleranceDegrees,row.id+" "+planet+" declination "+err);
  maxDeclinationError=Math.max(maxDeclinationError,err);declinationChecks++;
 }
 for(const key of ["sunriseUtc","sunsetUtc","nextSunriseUtc"]){
  assert.ok(actual[key],row.id+" "+key);
  const err=Math.abs(Date.parse(actual[key])-Date.parse(row[key]))/1000;
  assert.ok(err<=solarRef.provenance.riseSetToleranceSeconds,row.id+" "+key+" error "+err);
  maxSolarEventSeconds=Math.max(maxSolarEventSeconds,err);solarEventChecks++;
 }
 const [date,time]=b.utc.slice(0,-1).split("T");
 const result=birthGeometry.calculateBirthStrengthEvidence({date,time,timezone:"UTC",latitude:b.latitude,longitude:b.longitude});
 assert.equal(result.temporal.rows.length,7);assert.ok(result.temporal.rows.every(x=>x.conditionalKalaVirupas===null));
 assert.ok(result.bhava.houses.every(h=>h.arithmeticTotalVirupas===null));
 assert.ok(result.temporal.missingDependencies.some(x=>x.includes("year and month")));
 const expectedDay=utc.getTime()<Date.parse(row.sunsetUtc);
 assert.equal(actual.dayNight,expectedDay?"day":"night");
 const fraction=expectedDay?(utc-Date.parse(row.sunriseUtc))/(Date.parse(row.sunsetUtc)-Date.parse(row.sunriseUtc)):(utc-Date.parse(row.sunsetUtc))/(Date.parse(row.nextSunriseUtc)-Date.parse(row.sunsetUtc));
 const expectedThird=(expectedDay?["Mercury","Sun","Saturn"]:["Moon","Venus","Mars"])[Math.floor(fraction*3)];
 assert.equal(actual.thirdLord,expectedThird);assert.equal(result.temporal.rows.filter(p=>p.components.tribhaga===60).length,2);
 temporalChecks+=5;
}
for(const g of traditional)for(const h of [0,3,6,9,12,15,18,21,23.99]){
 const day=5*Math.min(h,24-h);
 assert.ok(Math.abs(T.classicalNatonnata(g,h)-(g==="Mercury"?60:["Sun","Jupiter","Venus"].includes(g)?day:60-day))<1e-10);
 temporalChecks++;
}
for(const g of traditional)for(const d of [-28,-24,-12,0,12,24,28]){
 const x=g==="Mercury"?Math.abs(d):g==="Moon"||g==="Saturn"?-d:d;
 assert.equal(T.classicalAyanaBase(g,d),Math.max(0,Math.min(60,30+1.25*x)));temporalChecks++;
}
for(const g of traditional)for(const moon of [0,45,90,135,180,225,270,315,359]){
 for(const polarity of ["benefic","malefic"]){
  const bright=Math.min(moon,360-moon)/3,expected=polarity==="benefic"?bright:60-bright;
  const p=T.classicalPaksha(g,0,moon,polarity);
  assert.equal(p.undoubledVirupas,expected);assert.equal(p.virupas,g==="Moon"?2*expected:expected);temporalChecks++;
 }
}
for(const [motion,v] of [["vakra",60],["anuvakra",30],["vikala",15],["manda",30],["mandatara",15],["sama",7.5],["chara",45],["atichara",30]]){
 assert.equal(T.classicalMotionClassVirupas(motion),v);cheshtaChecks++;
}
for(const [mean,trueLon,seeghrocha,midpoint,expected] of [[350,10,180,0,60],[10,350,90,0,30],[30,50,40,40,0],[90,110,280,100,60]]){
 const r=T.classicalCheshtaFromMeanTrue(mean,trueLon,seeghrocha);assert.ok(Math.abs(r.midpoint-midpoint)<1e-10);assert.equal(r.virupas,expected);cheshtaChecks++;
}
assert.throws(()=>T.classicalCheshtaFromMeanTrue(0,180,30));temporalNegative++;
assert.throws(()=>T.classicalMotionClassVirupas("unknown"));temporalNegative++;
assert.throws(()=>T.classicalAyanaBase("Sun",NaN));temporalNegative++;
const polar=T.calculateSolarStrengthContext(new Date("2025-06-21T12:00:00Z"),89,0);
assert.equal(polar.solarDayLord,null);assert.equal(polar.thirdLord,null);assert.equal(polar.sunriseUtc,null);temporalNegative++;
console.log("INDEPENDENT_TEMPORAL_STRENGTH_PASS "+JSON.stringify({declinationChecks,solarTimeChecks,solarEventChecks,temporalChecks,cheshtaChecks,temporalNegative,maxDeclinationError,maxSolarTimeSeconds,maxSolarEventSeconds,scope:"actual astronomy context and named arithmetic; year/month epoch, war transfer, complete motion and full independent strength parity remain open"}));

const CAL=require("@/lib/astrology/strength/calendar-lords");
const calendarCases=[
 ["1860-01-01",714404108572,"Sun","Saturn","Jupiter"],
 ["1827-05-02",714404096640,"Mercury","Mercury","Mercury"],
 ["1970-01-01",714404148749,"Jupiter","Mercury","Moon"],
 ["2000-01-01",714404159706,"Saturn","Sun","Mercury"],
 ["2026-01-07",714404169209,"Mercury","Mars","Jupiter"],
 ["2026-01-08",714404169210,"Jupiter","Jupiter","Jupiter"],
 ["2026-01-09",714404169211,"Venus","Jupiter","Jupiter"],
 ["2026-06-06",714404169359,"Saturn","Venus","Jupiter"],
 ["2026-06-07",714404169360,"Sun","Sun","Sun"],
 ["2026-06-08",714404169361,"Moon","Sun","Sun"],
 ["2026-11-25",714404169531,"Mercury","Mercury","Sun"],
];
let calendarChecks=0,calendarIntegrationChecks=0;
for(const [date,elapsedDays,dayLord,monthLord,yearLord] of calendarCases){
 const r=CAL.calculateClassicalCalendarCandidate(date+"T06:00:00Z",0,dayLord);
 assert.deepEqual([r.elapsedDays,r.dayLord,r.monthLord,r.yearLord,r.localSolarDate,r.publicEnabled,r.verified],[elapsedDays,dayLord,monthLord,yearLord,date,false,false]);calendarChecks++;
}
assert.equal(CAL.calculateClassicalCalendarCandidate("2026-06-06T18:30:00Z",90,"Sun").localSolarDate,"2026-06-07");calendarChecks++;
assert.equal(CAL.calculateClassicalCalendarCandidate("2026-06-07T05:00:00Z",-90,"Saturn").localSolarDate,"2026-06-06");calendarChecks++;
for(const args of [[null,0],["bad",0],["2026-02-30T06:00:00Z",0],["2026-06-07T06:00:00Z",181],["2026-06-07T06:00:00Z",NaN],["2026-06-07T06:00:00Z",0,"Moon"],["2026-06-07T06:00:00Z",0,null]]){
 assert.equal(CAL.calculateClassicalCalendarCandidate(...args),null);calendarChecks++;
}
for(const row of solarRef.rows){
 const b=midRef.rows.find(x=>x.id===row.id),[date,time]=b.utc.slice(0,-1).split("T");
 const result=birthGeometry.calculateBirthStrengthEvidence({date,time,timezone:"UTC",latitude:b.latitude,longitude:b.longitude});
 const c=result.calendarCandidate, candidate=result.temporalWithCalendarCandidate;
 assert.ok(c&&candidate,b.id+" calendar candidate");assert.equal(c.dayLord,result.solar.solarDayLord);
 assert.equal(candidate.rows.reduce((s,r)=>s+r.components.year,0),15);
 assert.equal(candidate.rows.reduce((s,r)=>s+r.components.month,0),30);
 for(const r of candidate.rows){assert.equal(r.components.year,r.planet===c.yearLord?15:0);assert.equal(r.components.month,r.planet===c.monthLord?30:0);}
 assert.ok(result.temporal.rows.every(r=>r.components.year===null&&r.components.month===null));
 assert.equal(result.fullShadbalaVerified,false);assert.equal(candidate.verified,false);assert.equal(candidate.publicEnabled,false);
 calendarIntegrationChecks++;
}
console.log("CLASSICAL_CALENDAR_CANDIDATE_PASS "+JSON.stringify({calendarChecks,calendarIntegrationChecks,scope:"named 30/360 local-mean-sunrise arithmetic; independent expert convention review pending; no public activation"}));

const M=require("@/lib/astrology/strength/motional-epoch"),TOTAL=require("@/lib/astrology/strength/strength-total");
const historical=new Date("1918-10-16T08:56:00Z"),v=M.calculateRamanEpochMeanCandidate(historical);
const publishedMean={Mars:266.34,Mercury:181.2275,Jupiter:66.91,Venus:181.2275,Saturn:111.23};
const publishedApogee={Mars:181.2275,Mercury:174.49,Jupiter:181.2275,Venus:158.35,Saturn:181.2275};
let motionChecks=0,maxMean=0,maxSeeghrocha=0,maxBala=0;
function closeMotion(a,b,tol){const e=Math.abs(a-b);assert.ok(e<=tol,`${a} vs ${b} (${e})`);motionChecks++;return e;}
closeMotion(v.days,6862.583333333333,1e-8);
for(const g of M.STAR_GRAHAS){maxMean=Math.max(maxMean,closeMotion(v.mean[g],publishedMean[g],.1));maxSeeghrocha=Math.max(maxSeeghrocha,closeMotion(v.seeghrocha[g],publishedApogee[g],.03));}
const motion=M.calculateMotionalEpochCandidate(historical,{Mars:229+49/60,Mercury:180+33/60,Jupiter:83+35/60,Venus:170+4/60,Saturn:124+51/60});
const expectedMotion={Mars:22.28,Mercury:2.13,Jupiter:35.33,Venus:5.76,Saturn:21.06};
for(const r of motion.rows)maxBala=Math.max(maxBala,closeMotion(r.virupas,expectedMotion[r.planet],.03));
const other=M.calculateRamanEpochMeanCandidate(new Date("1912-08-08T06:56:00Z"));
closeMotion(other.meanSun,113.693,.01);closeMotion(other.mean.Mars,162.02,.02);closeMotion(other.mean.Saturn,35.65,.02);
// The printed worked example on p.115 selected the tens column for 2 days
// and miscopied 4,000 days. Retain original and corrected references.
const jupiter1912Error=Math.abs(other.mean.Jupiter-240.48);assert.ok(jupiter1912Error>1);motionChecks++;
const correctedJupiter1912=332.39+49.86+0.17+0.04+220.04-3.41-360;
const correctedJupiterError=closeMotion(other.mean.Jupiter,correctedJupiter1912,.02);
assert.ok(Math.abs(correctedJupiter1912-239.09)<1e-9);motionChecks++;
for(const d of [new Date(NaN),new Date("1899-01-01"),new Date("2051-01-01")]){assert.equal(M.calculateRamanEpochMeanCandidate(d),null);motionChecks++;}
for(const data of [{},{Mars:NaN,Mercury:2,Jupiter:3,Venus:4,Saturn:5},{Mars:360,Mercury:2,Jupiter:3,Venus:4,Saturn:5}]){assert.equal(M.calculateMotionalEpochCandidate(historical,data),null);motionChecks++;}
for(const d of ["1900-01-01T00:00:00Z","2000-02-29T12:00:00Z","2026-11-25T00:00:00Z","2050-12-30T00:00:00Z"]){const r=M.calculateMotionalEpochCandidate(new Date(d),{Mars:359.9,Mercury:0,Jupiter:359,Venus:1,Saturn:90});assert.ok(r&&r.rows.length===5&&r.rows.every(x=>x.virupas>=0&&x.virupas<=60)&&!r.verified&&!r.publicEnabled);motionChecks++;}
const syntheticRows=TOTAL.GRAHAS.map((planet,i)=>({planet,components:{sthana:100+i*10,dig:30,kalaBeforeWar:100,cheshta:20,naisargika:30,drik:-10}}));
const sumStrength=r=>r.rows.reduce((n,x)=>n+x.total,0);
const baseStrength=TOTAL.assembleClassicalStrengthCandidate(syntheticRows,[],{});assert.equal(baseStrength.completeArithmetic,true);assert.equal(baseStrength.verified,false);assert.equal(baseStrength.publicEnabled,false);assert.equal(baseStrength.rows[0].total,270);assert.ok(baseStrength.rows.every(r=>r.warVirupas===0));let totalChecks=5;
for(const [i,a] of TOTAL.GRAHAS.slice(2).entries())for(const b of TOTAL.GRAHAS.slice(i+3))for(const north of [a,b]){
 const x=TOTAL.assembleClassicalStrengthCandidate(syntheticRows,[[a,b]],{[a]:north===a?2:-2,[b]:north===b?2:-2});assert.equal(x.completeArithmetic,true);assert.equal(x.winners[0].winner,north);assert.equal(sumStrength(x),sumStrength(baseStrength));assert.equal(x.rows.reduce((s,r)=>s+r.warVirupas,0),0);const w=x.rows.find(r=>r.planet===north);assert.equal(w.total,w.prewar+x.winners[0].transfer);totalChecks+=5;
}
for(const [p,d] of [[null,{}],[[["Sun","Mars"]],{Sun:10,Mars:2}],[[["Mars","Mars"]],{Mars:1}],[[["Mars","Mercury"],["Mars","Jupiter"]],{Mars:1,Mercury:2,Jupiter:3}],[[["Mars","Mercury"]],{Mars:1,Mercury:1.001}],[[["Mars","Mercury"]],{Mars:NaN,Mercury:1}],[[["Mars","Mercury"]],{Mars:92,Mercury:1}]]){const r=TOTAL.assembleClassicalStrengthCandidate(syntheticRows,p,d);assert.equal(r.completeArithmetic,false);assert.ok(r.rows.every(x=>x.total===null));totalChecks+=2;}
for(const r of [syntheticRows.slice(1),[...syntheticRows,syntheticRows[0]],syntheticRows.map((r,i)=>i?r:{...r,components:{...r.components,cheshta:null}})]){assert.equal(TOTAL.assembleClassicalStrengthCandidate(r,[],{}).completeArithmetic,false);totalChecks++;}
const disjoint=TOTAL.assembleClassicalStrengthCandidate(syntheticRows,[["Mars","Mercury"],["Jupiter","Saturn"]],{Mars:1,Mercury:2,Jupiter:3,Saturn:4});assert.equal(disjoint.completeArithmetic,true);assert.equal(disjoint.winners.length,2);assert.equal(sumStrength(disjoint),sumStrength(baseStrength));totalChecks+=3;
// Independently generated Swiss Ephemeris 2.10.03 Moshier, Lahiri apparent ecliptic and tropical equatorial coordinates; synthetic noon UTC dates.
const warReference=[
 ["2020-01-01",[],[]],["2020-01-02",[["Mercury","Jupiter"]],["Jupiter"]],["2020-01-12",[["Mercury","Saturn"]],["Saturn"]],
 ["2020-03-19",[["Mars","Jupiter"]],["Jupiter"]],["2020-03-30",[["Mars","Saturn"]],["Saturn"]],["2020-05-22",[["Mercury","Venus"]],["Venus"]],
 ["2020-12-13",[["Jupiter","Saturn"]],["Saturn"]],["2021-02-05",[["Venus","Saturn"]],["Saturn"]],["2021-02-11",[["Jupiter","Venus"]],["Jupiter"]],
 ["2021-07-12",[["Mars","Venus"]],["Venus"]],["2021-08-18",[["Mars","Mercury"]],["Mercury"]],["2022-03-02",[["Mars","Venus"],["Mercury","Saturn"]],["Venus","Saturn"]]
];
let chartChecks=0;
for(const [date,pairs,winners] of warReference){
 const r=birthGeometry.calculateBirthStrengthEvidence({date,time:"12:00:00",timezone:"UTC",latitude:23.18,longitude:76});
 assert.deepEqual(r.temporal.warPairs,pairs);assert.equal(r.motionalCandidate?.rows.length,5);
 const strength=r.classicalStrengthCandidate;
 assert.equal(strength.completeArithmetic,true,JSON.stringify(strength.issues));assert.deepEqual(strength.winners.map(w=>w.winner),winners);
 assert.equal(strength.verified,false);assert.equal(strength.publicEnabled,false);assert.equal(r.fullShadbalaVerified,false);assert.equal(r.fullBhavaBalaVerified,false);
 assert.ok(Math.abs(strength.rows.reduce((n,x)=>n+x.warVirupas,0))<1e-8);assert.ok(strength.rows.every(x=>typeof x.total==="number"&&Number.isFinite(x.total)));
 assert.ok(r.bhava.houses.every(h=>h.arithmeticTotalVirupas===null));assert.equal(r.bhavaCandidate.verified,false);
 if(strength.rows.every(x=>x.total>=0))assert.ok(r.bhavaCandidate.houses.every(h=>Number.isFinite(h.arithmeticTotalVirupas)));
 chartChecks++;
}
console.log("P0_CLASSICAL_CANDIDATE_ARITHMETIC "+JSON.stringify({motionChecks,totalChecks,chartChecks,maxMean,maxSeeghrocha,maxBala,jupiter1912Error,correctedJupiter1912,correctedJupiterError,printedReferenceDiscrepancy:"Raman Table VI p.114 versus example p.115; original printed 240.48 retained",publicEnabled:false,certified:false}));

/** Keep the Aiyar mismatch evidence. Resolve the cause by selecting a named
 * independently published BPHS convention rather than overriding cells. */
const bphsRef=JSON.parse(fs.readFileSync("fixtures/astrology/independent-bphs-ashtakavarga-reference.json","utf8"));
let bphsChecks=0,bphsRotationChecks=0;
const bphsOld=calculateInternalAshtakvarga(positions,sample.referenceSigns.Ascendant,"bphs_66_rekhaprada_raw");
assert.equal(bphsOld.method,"bphs_66_rekhaprada_raw");
for(let i=0;i<12;i++){assert.equal(bphsOld.sarva[i],sample.sarva[i],"published SAV "+signs[i]);assert.equal(bphsOld.scores[0].bhinna[i],sample.sun[i]);bphsChecks+=2;}
const bphsPositions=classical.map(planet=>({planet,sign:bphsRef.referenceSigns[planet],degree:null}));
const bphsAsc=signs.indexOf(bphsRef.referenceSigns.Ascendant);
const bphsResult=calculateInternalAshtakvarga(bphsPositions,bphsRef.referenceSigns.Ascendant,"bphs_66_rekhaprada_raw");
assert.equal(bphsResult.publicEnabled,false);assert.equal(bphsResult.verificationLevel,"needs_external_validation");
for(const row of bphsResult.scores){assert.equal(row.verified,false);for(let i=0;i<12;i++){assert.equal(row.bhinna[(bphsAsc+i)%12],bphsRef.houseOrderedBAV[row.planet][i],row.planet+" published BAV "+i);bphsChecks++;}}
for(let i=0;i<12;i++){assert.equal(bphsResult.sarva[(bphsAsc+i)%12],bphsRef.houseOrderedSAV[i],"published SAV "+i);bphsChecks++;}
for(let rotation=0;rotation<12;rotation++){
 const shifted=bphsPositions.map(p=>({...p,sign:signs[(signs.indexOf(p.sign)+rotation)%12]}));
 const asc=(bphsAsc+rotation)%12;
 const out=calculateInternalAshtakvarga(shifted,signs[asc],"bphs_66_rekhaprada_raw");
 assert.equal(out.checksums.Sarva,337);
 for(const row of out.scores)for(let h=0;h<12;h++){assert.equal(row.bhinna[(asc+h)%12],bphsRef.houseOrderedBAV[row.planet][h]);bphsRotationChecks++;}
 for(let h=0;h<12;h++){assert.equal(out.sarva[(asc+h)%12],bphsRef.houseOrderedSAV[h]);bphsRotationChecks++;}
}
assert.throws(()=>calculateInternalAshtakvarga(bphsPositions,"Leo","unknown"),/UNSUPPORTED_ASHTAKAVARGA_TRADITION/);
assert.equal(calculateInternalAshtakvarga(bphsPositions.slice(1),"Leo","bphs_66_rekhaprada_raw").sarva,undefined);
assert.equal(calculateInternalAshtakvarga(bphsPositions,"Leo").method,"brihat_jataka_aiyar_raw");
assert.deepEqual(calculateInternalAshtakvarga(positions,sample.referenceSigns.Ascendant).sarva,raw.sarva);
console.log("P0_ASHTAKAVARGA_NAMED_PARITY "+JSON.stringify({publishedCells:bphsChecks,rotatedCells:bphsRotationChecks,negativeAndPreservation:4,priorSAVDiscrepanciesExplained:4,publicEnabled:false,expertCertified:false}));

const PATTERN=require("@/lib/astrology/strength/traditional-patterns");
const CORE=require("@/lib/astrology/core-calculations");
const chartAt=(offsets,rahu=0,ketu=180)=>[...traditional.map((planet,i)=>point(planet,offsets[i])),point("Rahu",rahu),point("Ketu",ketu)];
const complete=chartAt([10,20,40,60,80,100,120]);
let nodalChecks=0,yogaPatternChecks=0;
assert.equal(PATTERN.evaluateNodalContainment(complete).contained,true);nodalChecks++;
assert.equal(PATTERN.evaluateNodalContainment(chartAt([190,200,210,230,250,280,340])).contained,true);nodalChecks++;
assert.equal(PATTERN.evaluateNodalContainment(chartAt([10,20,40,60,80,100,220])).contained,false);nodalChecks++;
assert.equal(PATTERN.evaluateNodalContainment(chartAt([0,20,40,60,80,100,180])).boundary,true);nodalChecks++;
for(const bad of [[],complete.slice(1),[...complete,complete[0]],complete.map((p,i)=>i===2?{...p,absoluteLongitude:NaN}:p),complete.map((p,i)=>i===2?{...p,sign:"Aries"}:p),chartAt([10,20,40,60,80,100,120],0,179),[...complete,complete.at(-1)]]){
 assert.equal(PATTERN.evaluateNodalContainment(bad),null);const d=CORE.calculateDoshaAnalysis(bad,"Aries","Aries").kaalSarp;assert.equal(d.present,false);assert.equal(d.available,false);nodalChecks+=3;
}
for(let rotate=0;rotate<12;rotate++){const shifted=complete.map(p=>point(p.planet,(p.absoluteLongitude+rotate*30)%360));assert.equal(PATTERN.evaluateNodalContainment(shifted).contained,true);assert.equal(CORE.calculateDoshaAnalysis(shifted,signs[rotate],signs[rotate]).kaalSarp.present,true);nodalChecks+=2;}
const dignities={Mars:["Aries","Scorpio","Capricorn"],Mercury:["Gemini","Virgo"],Jupiter:["Sagittarius","Pisces","Cancer"],Venus:["Taurus","Libra","Pisces"],Saturn:["Capricorn","Aquarius","Libra"]};
for(let a=0;a<12;a++)for(let m=0;m<12;m++)for(let j=0;j<12;j++){
 const p=chartAt([15,m*30+15,j*30+15,j*30+15,j*30+15,j*30+15,j*30+15]);
 const r=PATTERN.evaluateTraditionalPatterns(p,signs[a]);assert.ok(r);assert.equal(r.publicEnabled,false);
 for(const row of r.mahapurusha){const eligible=dignities[row.planet].includes(signs[j]);assert.equal(row.fromLagna,eligible&&[0,3,6,9].includes((j-a+12)%12));assert.equal(row.fromMoon,eligible&&[0,3,6,9].includes((j-m+12)%12));yogaPatternChecks+=2;}
 const expectedLunar=(j-m+12)%12;assert.equal(r.lunar.sunapha,expectedLunar===1);assert.equal(r.lunar.anapha,expectedLunar===11);assert.equal(r.lunar.kemadrumaUnderNamedCancellation,![1,11,0,3,6,9].includes(expectedLunar)&&![0,3,6,9].includes((m-a+12)%12));assert.equal(r.gajakesari.fullTraditionalVerdict,null);yogaPatternChecks+=4;
}
const dual=PATTERN.evaluateTraditionalPatterns(chartAt([15,15,45,345,75,105,135]),"Taurus");
assert.equal(dual.lunar.durudhara,true);assert.equal(dual.lunar.sunapha,false);assert.equal(dual.lunar.anapha,false);
assert.equal(PATTERN.evaluateTraditionalPatterns(complete,"Unknown"),null);assert.equal(PATTERN.evaluateTraditionalPatterns(complete.slice(1),"Aries"),null);yogaPatternChecks+=5;
console.log("P0_TRADITIONAL_PATTERN_EVIDENCE "+JSON.stringify({nodalChecks,yogaPatternChecks,scope:"Phaladeepika 6.1–5 placement conditions; Gajakesari full verdict withheld; complete nodal geometry and invalid data safety; no independent expert certification"}));

{
 const F=JSON.parse(fs.readFileSync("fixtures/astrology/published-classical-comparison.json","utf8"));
 const V=require("@/lib/astrology/varga/partition"),B=require("@/lib/astrology/strength/classical-components"),S=require("@/lib/astrology/strength/shadbala"),birth=require("@/lib/astrology/strength/birth-context");
 const dms=([s,d,m,a])=>30*(s-1)+d+m/60+a/3600;
 const positions=F.positionsDms.map(dms),midpoints=B.buildQuadrantBhavaMidpoints(positions[0],dms(F.midpointDms[9])).midpoints;
 const mismatches=[],originalMismatches=[];let publishedDivisions=0,geometryChecks=0,strengthChecks=0;
 for(const [key,expected] of Object.entries(F.divisions))for(const [i,lon] of positions.entries()){
  const original=V.classicalVargaCoordinates(key,lon).signIndex+1;
  const actual=key==="D60"?V.natalSeedD60Coordinates(lon).signIndex+1:original;
  if(original!==expected[i])originalMismatches.push({key,point:F.order[i],actual:original,expected:expected[i]});
  if(actual!==expected[i])mismatches.push({key,point:F.order[i],actual,expected:expected[i]});publishedDivisions++;
 }
 assert.equal(publishedDivisions,160);assert.equal(originalMismatches.length,12);
 assert.deepEqual(mismatches,[{key:"D7",point:"Moon",actual:9,expected:8},{key:"D7",point:"Saturn",actual:10,expected:9}]);
 // BPHS 6.10–11 equal sevenths independently give the two D7 values;
 // preserve source disagreements rather than fitting to competitor output.
 assert.equal(Math.floor((positions[2]%30)*7/30),4);
 assert.equal(Math.floor((positions[7]%30)*7/30),5);
 for(let i=0;i<12;i++){assert.ok(Math.abs(midpoints[i]-dms(F.midpointDms[i]))<1/3600);geometryChecks++;}
 const planets=positions.slice(1).map((lon,i)=>({planet:F.order[i+1],sign:signs[Math.floor(lon/30)],degree:lon%30,absoluteLongitude:lon,house:(Math.floor(lon/30)-Math.floor(positions[0]/30)+12)%12+1}));
 for(const [i,p] of planets.slice(0,7).entries()){
  assert.ok(Math.abs(S.calculateClassicalStrengthBasis(p).uchchaVirupas-F.strength.uchcha[i])<=.006);
  assert.ok(Math.abs(B.calculateExactDirectionalBala(p.planet,p.absoluteLongitude,midpoints).virupas-F.strength.dig[i])<=.006);strengthChecks+=2;
 }
 // Independent published full totals comparison is deliberately separate
 // from arithmetic regression. A failed comparison is never scored as a
 // passed certification or used to enable a public module.
 const actual=birth.calculateBirthStrengthEvidence(F.birth);
 const residuals=[];
 function compare(scope,point,component,actual,expected){
  const delta=typeof actual==="number"&&Number.isFinite(actual)?actual-expected:null;
  residuals.push({scope,point,component,actual:delta===null?null:actual,expected,delta,matched:delta!==null&&Math.abs(delta)<=.25});
 }
 for(const [i,planet] of F.order.slice(1,8).entries()){
  const row=actual.classicalStrengthCandidate.rows.find(r=>r.planet===planet),components=row?.components;
  const values={sthana:components?.sthana,dig:components?.dig,kala:typeof components?.kalaBeforeWar==="number"&&typeof row?.warVirupas==="number"?components.kalaBeforeWar+row.warVirupas:null,cheshta:components?.cheshta,naisargika:components?.naisargika,drik:components?.drik,total:row?.total};
  for(const key of Object.keys(values))compare("shadbala",planet,key,values[key],F.strength[key][i]);
 }
 for(const [i,h] of actual.bhavaCandidate.houses.entries()){
  for(const [key,value] of Object.entries({lord:h.lordStrengthVirupas,direction:h.directionalVirupas,aspect:h.aspect?.virupas,total:h.arithmeticTotalVirupas}))compare("bhava",i+1,key,value,F.bhava[key][i]);
 }
 assert.equal(residuals.length,97);assert.equal(actual.fullShadbalaVerified,false);assert.equal(actual.fullBhavaBalaVerified,false);
 console.log("P0_PUBLISHED_REFERENCE_DIAGNOSTIC "+JSON.stringify({publishedDivisions,matchedWithNamedD60:publishedDivisions-mismatches.length,originalMatched:publishedDivisions-originalMismatches.length,mismatches,geometryChecks,strengthChecks,fullComponentComparisons:residuals.length,fullComponentMatches:residuals.filter(r=>r.matched).length,fullComponentMismatches:residuals.filter(r=>!r.matched).length,toleranceVirupas:.25,fullParityAccepted:false,residuals}));
}

{
 const F=JSON.parse(fs.readFileSync("fixtures/astrology/published-classical-comparison.json","utf8")),C=require("@/lib/astrology/strength/classical-components");
 const dms=([s,d,m,a])=>30*(s-1)+d+m/60+a/3600;
 const mid=F.midpointDms.map(dms);
 assert.deepEqual(mid.map((l,i)=>C.calculateRamanBhavaDirectionalCandidate(i+1,l).virupas),F.bhava.direction);
 let checks=12;
 for(let h=1;h<=12;h++)for(let s=0;s<12;s++)for(const d of [0,14.999,15,29.999]){
  const peak=[2,5,6,10].includes(s)||s===8&&d<15?1:[0,1,4].includes(s)||s===8&&d>=15||s===9&&d<15?10:s===7?7:4;
  const r=C.calculateRamanBhavaDirectionalCandidate(h,s*30+d);const dist=Math.abs(h-peak);
  assert.equal(r.virupas,60-10*Math.min(dist,12-dist));assert.equal(r.publicEnabled,false);checks+=2;
 }
 for(const [h,d] of [[0,0],[13,0],[1,360],[1,-1],[1,NaN],[1.5,0]]){assert.throws(()=>C.calculateRamanBhavaDirectionalCandidate(h,d));checks++;}
 console.log("P0_RAMAN_BHAVA_DIRECTION_PASS "+JSON.stringify({publishedDirection:12,checks,method:"named Raman candidate; not certified"}));
}

{
 const C=require("@/lib/astrology/strength/classical-components");
 const B=require("@/lib/astrology/strength/birth-context");
 const F=JSON.parse(fs.readFileSync("fixtures/astrology/published-classical-comparison.json","utf8"));
 const R=JSON.parse(fs.readFileSync("fixtures/astrology/raman-aspect-worked-reference.json","utf8"));
 const dms=([s,d,m,a])=>30*(s-1)+d+m/60+a/3600;
 const dm=([d,m])=>d+m/60;
 let publishedChecks=0,workedChecks=0,negativeChecks=0,boundaryChecks=0,maxPublished=0,maxRamanPlanet=0,maxRamanHouse=0;
 const verify=(actual,expected,tol)=>{assert.ok(typeof actual==="number"&&Math.abs(actual-expected)<=tol,actual+" vs "+expected);return Math.abs(actual-expected);};
 const std=R.planetDegreesMinutes.map((x,i)=>point(R.planetOrder[i],dm(x)));
 for(const [i,g] of R.planetOrder.entries()){maxRamanPlanet=Math.max(maxRamanPlanet,verify(C.calculateRamanDrikCandidate(std,g).virupas,R.planetDrik[i],R.planetTolerance));workedChecks++;}
 for(const [i,x] of R.midpointDegreesMinutes.entries()){maxRamanHouse=Math.max(maxRamanHouse,verify(C.calculateRamanHouseAspectCandidate(std,dm(x)).virupas,R.houseDrik[i],R.houseTolerance));workedChecks++;}
 const positions=F.positionsDms.map(dms),p=positions.slice(1).map((l,i)=>point(F.order[i+1],l)),midpoints=F.midpointDms.map(dms);
 const supplied=Object.fromEntries(F.order.slice(1,8).map((g,i)=>[g,F.strength.total[i]]));
 const out=C.calculateRamanBhavaCandidate(p,midpoints,{lordConvention:"whole_sign_lagna",lordStrengthVirupas:supplied});
 for(const [i,g] of F.order.slice(1,8).entries()){maxPublished=Math.max(maxPublished,verify(C.calculateRamanDrikCandidate(p,g).virupas,F.strength.drik[i],.02));publishedChecks++;}
 for(const [i,h] of out.houses.entries()){
  for(const [key,value] of Object.entries({lord:h.lordStrengthVirupas,direction:h.directionalVirupas,aspect:h.aspect.virupas,total:h.arithmeticTotalVirupas})){
   maxPublished=Math.max(maxPublished,verify(value,F.bhava[key][i],.02));publishedChecks++;
  }
 }
 assert.equal(out.verified,false);assert.equal(out.publicEnabled,false);
 const pure=C.calculateRamanBhavaCandidate(p,midpoints,{lordStrengthVirupas:supplied});
 assert.notEqual(pure.houses[3].lord,out.houses[3].lord);assert.equal(pure.houses[3].lordConvention,undefined);
 const unavailable=C.calculateRamanBhavaCandidate(p,midpoints);
 assert.ok(unavailable.houses.every(h=>h.arithmeticTotalVirupas===null));
 for(const bad of [p.slice(1),[...p,p[0]],p.map((v,i)=>i?v:{...v,absoluteLongitude:NaN})]){
  assert.equal(C.calculateRamanDrikCandidate(bad,"Sun"),null);assert.equal(C.calculateRamanHouseAspectCandidate(bad,45),null);
  assert.ok(C.calculateRamanBhavaCandidate(bad,midpoints,{lordStrengthVirupas:supplied}).houses.every(h=>h.arithmeticTotalVirupas===null));negativeChecks+=3;
 }
 assert.throws(()=>C.calculateRamanBhavaCandidate(p,midpoints,{lordConvention:"unknown"}));negativeChecks++;
 for(const [g,offsets,bonus] of [["Mars",[90,210],15],["Jupiter",[120,240],30],["Saturn",[60,270],45]])for(const start of offsets){
  for(const [d,v] of [[start-.0001,0],[start,bonus],[start+29.9999,bonus],[start+30,0]]){
   assert.equal(C.calculateRamanAspectVirupas(g,0,d).special,v);boundaryChecks++;
  }
 }
 for(const [elongation,expected] of [[83.9999,"malefic"],[84,"benefic"],[180,"benefic"],[263.9999,"benefic"],[264,"malefic"]]){
  const test=R.planetOrder.map((g,i)=>point(g,i===0?0:i===1?elongation:30*i+1));
  assert.equal(C.calculateRamanPolarityCandidate(test).polarity.Moon,expected);boundaryChecks++;
 }
 const actual=B.calculateBirthStrengthEvidence(F.birth);
 const residuals=[];
 for(const [i,g] of F.order.slice(1,8).entries()){
  const row=actual.aspectVariantStrength.rows.find(r=>r.planet===g),c=row?.components;
  for(const [key,value] of Object.entries({sthana:c?.sthana,dig:c?.dig,kala:typeof c?.kalaBeforeWar==="number"&&typeof row?.warVirupas==="number"?c.kalaBeforeWar+row.warVirupas:null,cheshta:c?.cheshta,naisargika:c?.naisargika,drik:c?.drik,total:row?.total})){
   const delta=typeof value==="number"?value-F.strength[key][i]:null;residuals.push({scope:"shadbala",point:g,key,value,expected:F.strength[key][i],delta,matched:delta!==null&&Math.abs(delta)<=.25});
  }
 }
 for(const [i,h] of actual.wholeSignLordBhavaCandidate.houses.entries()){
  for(const [key,value] of Object.entries({lord:h.lordStrengthVirupas,direction:h.directionalVirupas,aspect:h.aspect?.virupas,total:h.arithmeticTotalVirupas})){
   const delta=typeof value==="number"?value-F.bhava[key][i]:null;residuals.push({scope:"bhava",point:i+1,key,value,expected:F.bhava[key][i],delta,matched:delta!==null&&Math.abs(delta)<=.25});
  }
 }
 assert.equal(residuals.length,97);assert.equal(actual.fullShadbalaVerified,false);assert.equal(actual.fullBhavaBalaVerified,false);
 console.log("P0_RAMAN_ASPECT_AND_BHAVA_CONDITIONAL_PASS "+JSON.stringify({publishedChecks,workedChecks,negativeChecks,boundaryChecks,maxPublished,maxRamanPlanet,maxRamanHouse,actualBirthMatched:residuals.filter(r=>r.matched).length,actualBirthMismatches:residuals.filter(r=>!r.matched).length,fullParityAccepted:false,residuals}));
}

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
const require=createRequire(import.meta.url),ts=require("typescript");
const resolve=Module._resolveFilename;
Module._resolveFilename=function(n,...a){return resolve.call(this,n.startsWith("@/")?path.resolve(n.slice(2)):n,...a)};
require.extensions[".ts"]=function(m,f){m._compile(ts.transpileModule(fs.readFileSync(f,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f)};
const {calculateVimshottariDasha:legacy,resolveDashaBirthInstant}=require("@/lib/astrology/core-calculations");
const {calculateVimshottariDasha:precise}=require("@/lib/astrology/premium-engine/dasha");
const order=["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"],weights=[7,20,6,10,7,18,16,19,17],year=365.2425*86400000;
const birth=new Date("2000-01-01T00:00:00.000Z"),base=birth.getTime(),span=360/27;
let cases=0,assertions=0;
const eq=(a,b,message)=>{assert.equal(a,b,message);assertions++};
const ok=(v,message)=>{assert.ok(v,message);assertions++};
const time=(x)=>Date.parse(x);
function expected(lon,at){
 const index=Math.floor(lon/span),first=index%9,progress=(lon-index*span)/span;
 let start=base-Math.round(progress*weights[first]*year);
 for(let i=0;i<12;i++){
  const idx=(first+i)%9,end=start+Math.round(weights[idx]*year);
  if(at>=start&&at<end){
   let cumulative=0,childStart=start;
   for(let j=0;j<9;j++){
    const sub=(idx+j)%9;cumulative+=weights[sub];
    const childEnd=j===8?end:start+Math.round((end-start)*cumulative/120);
    if(at>=childStart&&at<childEnd)return {major:order[idx],sub:order[sub],majorEnd:end,childEnd,childStart};
    childStart=childEnd;
   }
  }
  start=end;
 }
 return null;
}
for(let n=0;n<27;n++)for(const f of [.005,.25,.5,.9,.9999]){
 const lon=(n+f)*span,planet={planet:"Moon",sign:"Aries",absoluteLongitude:lon};
 const current=new Date(base+Math.round((n%5)*13.25*year));
 const canonical=precise({moonLongitude:lon,birthDateTime:birth,currentDate:current,includePratyantar:true});
 const pub=legacy([planet],birth,"en",current),ref=expected(lon,current.getTime());
 eq(canonical.current.mahadasha?.lord,ref.major,"canonical major");
 eq(canonical.current.antardasha?.lord,ref.sub,"canonical sub");
 eq(pub.currentMahadasha?.planet,ref.major,"public major");
 eq(pub.currentAntardasha?.planet,ref.sub,"public sub");
 ok(Math.abs(time(pub.currentMahadasha.endsAtUtc)-ref.majorEnd)<=2,"exact major boundary");
 ok(Math.abs(time(pub.currentAntardasha.endsAtUtc)-ref.childEnd)<=2,"exact sub boundary");
 eq(time(pub.mahadashas[0].startsAtUtc),base,"customer timeline begins at birth");
 for(const m of pub.mahadashas){
  eq(m.antardashas[0].startsAtUtc,m.startsAtUtc,"children begin at clipped parent");
  eq(m.antardashas.at(-1).endsAtUtc,m.endsAtUtc,"children end at parent");
  for(let j=1;j<m.antardashas.length;j++)eq(m.antardashas[j-1].endsAtUtc,m.antardashas[j].startsAtUtc,"no subperiod gap");
 }
 const parts=canonical.pratyantarDashas;
 eq(parts[0].startsAt,canonical.current.antardasha.startsAt,"nested start");
 eq(parts.at(-1).endsAt,canonical.current.antardasha.endsAt,"nested end");
 for(let i=1;i<parts.length;i++)eq(parts[i-1].endsAt,parts[i].startsAt,"nested contiguous");
 cases++;
}
const lateMoon=[{planet:"Moon",sign:"Aries",absoluteLongitude:12}];
eq(legacy(lateMoon,birth,"en",birth).currentAntardasha.planet,"Mercury","reproduce original 90%-elapsed first major bug");
eq(legacy(lateMoon,birth,"en",new Date(base-1)).currentMahadasha,undefined,"no invented prebirth current period");
eq(legacy(lateMoon,birth,"en",new Date("2300-01-01")).currentMahadasha,undefined,"no invented out-of-range period");
eq(resolveDashaBirthInstant({dateOfBirth:"2000-01-01",timeOfBirth:"05:30:59",timezone:"5.5"}).toISOString(),"2000-01-01T00:00:59.000Z","birth seconds and timezone preserved");
const canonical=precise({moonLongitude:12,birthDateTime:birth,currentDate:birth});
const transition=time(canonical.current.mahadasha.endsAt);
eq(legacy(lateMoon,birth,"en",new Date(transition-1)).currentMahadasha.planet,"Ketu","half-open boundary before");
eq(legacy(lateMoon,birth,"en",new Date(transition)).currentMahadasha.planet,"Venus","half-open boundary at");
console.log("DASHA_TIMELINE_RUNTIME_PASS="+JSON.stringify({cases,assertions,yearDays:365.2425,scope:"independent arithmetic reference for fixed year convention, actual canonical and public functions; no predictive certification"}));

{
 const D=require("@/lib/astrology/premium-engine/dasha"),V=require("@/lib/astrology/varga/partition"),C=require("@/lib/astrology/core-calculations");
 let windowCases=0,windowChecks=0,d60Checks=0,chalitChecks=0;
 // Independent cumulative integer-millisecond partition, beginning with the
 // original complete parent rather than a clipped report period.
 for(let n=0;n<27;n++)for(const f of [.005,.25,.5,.9,.9999]){
  const moonLongitude=(n+f)*span,d=D.calculateVimshottariDasha({moonLongitude,birthDateTime:birth,currentDate:birth});
  for(const m of d.mahadashas.slice(0,3)){
   const t=Date.parse(m.endsAt),from=new Date(Math.max(base,t-30*86400000)),to=new Date(t+40*86400000);
   const actual=D.calculateVimshottariPratyantarWindow({moonLongitude,birthDateTime:birth,from,to}),reference=[];
   for(const p of d.antardashas){
    const start=Date.parse(p.startsAt),end=Date.parse(p.endsAt);if(end<=from.getTime()||start>=to.getTime())continue;
    const i=order.indexOf(p.lord);let cumulative=0,last=start;
    for(let j=0;j<9;j++){const idx=(i+j)%9;cumulative+=weights[idx];const next=j===8?end:start+Math.round((end-start)*cumulative/120);
     if(next>from.getTime()&&last<to.getTime())reference.push([p.mahadashaLord,p.lord,order[idx],last,next]);last=next;}
   }
   assert.deepEqual(actual.map(p=>[p.mahadashaLord,p.antardashaLord,p.lord,Date.parse(p.startsAt),Date.parse(p.endsAt)]),reference);
   assert.ok(actual.length&&Date.parse(actual[0].startsAt)<=from.getTime()&&Date.parse(actual.at(-1).endsAt)>=to.getTime());windowChecks+=2;windowCases++;
   for(let i=1;i<actual.length;i++){assert.equal(actual[i].startsAt,actual[i-1].endsAt);windowChecks++;}
  }
 }
 assert.throws(()=>D.calculateVimshottariPratyantarWindow({moonLongitude:1,birthDateTime:birth,from:birth,to:birth}));
 assert.deepEqual(D.calculateVimshottariPratyantarWindow({moonLongitude:1,birthDateTime:birth,from:new Date("1999-01-01"),to:birth}),[]);windowChecks+=2;
 for(let s=0;s<12;s++)for(let part=0;part<60;part++){
  const lon=s*30+part/2;assert.equal(V.natalSeedD60Coordinates(lon).signIndex,(s+part)%12);
  assert.equal(V.classicalVargaCoordinates("D60",lon).signIndex,part%12);d60Checks+=2;
 }
 assert.equal(V.natalSeedD60Coordinates(222+58/60).signIndex,8);d60Checks++;
 const zodiac=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
 for(let a=0;a<12;a++){
  const asc=a*30+15,p=zodiac.map((sign,i)=>({planet:String(i),sign,degree:7,absoluteLongitude:i*30+7,house:(i-a+12)%12+1}));
  for(const input of [p,[...p].reverse(),p.slice(3),[]]){
   const result=C.calculateChalitChart(input,asc);
   assert.deepEqual(result.houses.map(h=>h.sign),Array.from({length:12},(_,i)=>zodiac[(a+i)%12]));
   assert.equal(result.houses.flatMap(h=>h.planets).length,input.length);chalitChecks+=2;
  }
 }
 console.log("P0_NESTED_TIMELINE_D60_CHALIT_PASS "+JSON.stringify({windowCases,windowChecks,d60Checks,chalitChecks,scope:"fixed-year arithmetic, named D60 convention and existing equal-house Chalit labels; not professional astrology certification"}));
}

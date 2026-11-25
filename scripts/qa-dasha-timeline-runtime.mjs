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

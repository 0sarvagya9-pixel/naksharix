import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calculateChartForFixture} from "../lib/astrology/testing/chart-adapter.mjs";
const {provenance,fixtures}=JSON.parse(readFileSync(new URL("../fixtures/astrology/independent-swiss-moshier-reference.json",import.meta.url),"utf8"));
const keys=["ascendant","Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
assert.equal(fixtures.length,5);
assert.equal(provenance.toleranceDegrees,0.02);
const angularDistance=(a,b)=>Math.abs(((a-b+540)%360)-180);
let count=0,max=0;
for(const fixture of fixtures){
 const chart=await calculateChartForFixture(fixture.input);
 const actual={ascendant:chart.ascendant.absoluteLongitude,...Object.fromEntries(chart.planets.map(p=>[p.planet,p.absoluteLongitude]))};
 assert.equal(Object.keys(actual).length,10);
 for(const key of keys){
  const a=actual[key],b=fixture.longitudeDegrees[key];
  assert.ok(Number.isFinite(a)&&a>=0&&a<360&&Number.isFinite(b)&&b>=0&&b<360,fixture.id+":"+key+" invalid longitude");
  const delta=angularDistance(a,b);
  assert.ok(delta<=provenance.toleranceDegrees,fixture.id+":"+key+" error "+delta+" exceeds tolerance");
  max=Math.max(max,delta);count++;
 }
}
assert.equal(count,50);
console.log(JSON.stringify({check:"independent_numeric_reference",count,maxErrorDegrees:max,toleranceDegrees:provenance.toleranceDegrees,scope:"fixture adapter only, no professional or predictive certification"}));

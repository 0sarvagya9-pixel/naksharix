import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const data=JSON.parse(readFileSync(new URL("../fixtures/astrology/position-strength-crosschecks.json",import.meta.url),"utf8"));
const prior=JSON.parse(readFileSync(new URL("../fixtures/astrology/published-classical-comparison.json",import.meta.url),"utf8"));
const signs=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const unitTolerance=.25;
const printedRounding=.00501;
const degree=([d,m,s])=>d+m/60+s/3600;
const longitude=([r,d,m,s])=>30*(r-1)+degree([d,m,s]);
const makePoints=longitudes=>data.planetOrder.map((planet,i)=>({planet,absoluteLongitude:longitudes[i]}));

export function verifyPublishedPositionStrength(calculate) {
  const gold=data.raman;
  const points=makePoints(gold.longitudeDms.map(degree));
  const errors=[];
  for (const [i,point] of points.entries()) {
    const result=calculate(points,point.planet,degree(gold.ascendantLongitudeDms));
    assert.deepEqual(result.dignity.rows.map(r=>r.chart),data.vargaOrder);
    assert.deepEqual(result.dignity.rows.map(r=>r.virupas),gold.weights[i],point.planet+" per-varga weights");
    assert.equal(result.dignity.totalVirupas,gold.saptavargaja[i],point.planet+" Saptavargaja");
    const error=Math.abs(result.virupas-gold.sthana[i]);
    assert.ok(error<=unitTolerance,point.planet+" Sthana Bala");
    errors.push(error);
  }
  const original={name:"AstroSage 1979",positionsDms:prior.positionsDms,
    divisions:Object.fromEntries(data.vargaOrder.map(k=>[k,prior.divisions[k].slice(1,8)])),
    saptavargaja:prior.strength.saptavargaja};
  const comparisons=[];
  for (const ref of [...data.software,original]) {
    const input=ref.positionsDms.map(longitude);
    const chart=makePoints(input.slice(1));
    const signMismatches=[],strengthMismatches=[];
    for (const [i,point] of chart.entries()) {
      const result=calculate(chart,point.planet,input[0]);
      for (const row of result.dignity.rows) {
        const raw=ref.divisions[row.chart][i];
        assert.ok(Number.isInteger(raw)&&raw>=0&&raw<=12);
        if(raw===0)assert.equal(row.chart,"D7","source zero representation is limited to Saptamsa");
        const expected=signs[(raw||12)-1];
        if(row.sign!==expected)signMismatches.push({planet:point.planet,chart:row.chart,actual:row.sign,expected});
      }
      const actual=result.dignity.totalVirupas,expected=ref.saptavargaja[i];
      if(Math.abs(actual-expected)>printedRounding)strengthMismatches.push({planet:point.planet,actual,expected,delta:actual-expected});
    }
    // Original vendor discrepancies remain visible, while previously matching cells
    // stay protected. An independently justified repair may remove a discrepancy.
    const knownSignDifferences=ref.name==="AstroSage 1979"?["Moon/D7","Saturn/D7"]:[];
    const knownStrengthDifferences=ref.name==="AstroSage 1979"?["Saturn"]:
      ref.name==="Dhruv Astro Software 2025"?["Mercury","Jupiter","Saturn"]:[];
    for(const row of signMismatches){
      assert.ok(knownSignDifferences.includes(row.planet+"/"+row.chart),ref.name+" sign regression "+JSON.stringify(row));
    }
    for(const row of strengthMismatches){
      assert.ok(knownStrengthDifferences.includes(row.planet),ref.name+" strength regression "+JSON.stringify(row));
    }
    comparisons.push({source:ref.name,signs:{tested:49,matched:49-signMismatches.length,mismatches:signMismatches},
      saptavargaja:{tested:7,matched:7-strengthMismatches.length,mismatches:strengthMismatches}});
  }
  console.log("P0_PUBLISHED_POSITION_STRENGTH "+JSON.stringify({
    ramanWorked:{individualDignityWeights:49,sevenVargaTotals:7,sthanaTotals:7,maximumSthanaResidual:Math.max(...errors)},
    comparisons,scope:"Published-coordinate formula isolations. The 1979 and 2025 mismatches remain visible. Independent birth-pipeline qualification is reported separately."
  }));
}

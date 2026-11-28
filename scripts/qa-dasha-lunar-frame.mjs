import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const typescript = require("typescript");
const Astronomy = require("astronomy-engine");
const originalResolve = Module._resolveFilename;
const originalLoad = Module._load;
Module._resolveFilename = function(specifier, ...args) {
  return originalResolve.call(this, specifier.startsWith("@/") ? path.resolve(specifier.slice(2)) : specifier, ...args);
};
Module._load = function(specifier, ...args) {
  return specifier === "server-only" ? {} : originalLoad.call(this, specifier, ...args);
};
require.extensions[".ts"] = function(module, file) {
  const code = typescript.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {module:typescript.ModuleKind.CommonJS, target:typescript.ScriptTarget.ES2022, esModuleInterop:true}
  });
  module._compile(code.outputText,file);
};

const {calculateOwnEngineBirthChart} = require("@/lib/astrology/own-engine");
const {calculateInternalChart} = require("@/lib/astrology/premium-engine/chart");
const {calculateVimshottariDasha,resolveDashaBirthInstant} = require("@/lib/astrology/core-calculations");
const {lahiriAyanamsa} = require("@/lib/astrology/own-engine/zodiac");
const {meanLahiriOfDate,terrestrialTimeForCivilEphemeris} = require("@/lib/astrology/own-engine/lahiri-reference");
const fixture = JSON.parse(fs.readFileSync(new URL("../fixtures/astrology/independent-dasha-lunar-frames.json",import.meta.url)));
const signedDegrees = (a,b) => ((a-b+540)%360)-180;
const DAY = 86400000;
const results = [];
const perChartTolerance = 0.002;
for (const test of fixture.reference) {
  const [dateOfBirth,timeOfBirth] = test.local.split(" ");
  const input = {dateOfBirth,timeOfBirth,timezone:test.zone,name:"Synthetic fixture",gender:"not_specified",
    birthPlace:test.zone,latitude:0,longitude:0,language:"en",ayanamsa:"lahiri",houseSystem:"whole_sign"};
  const utc = resolveDashaBirthInstant(input);
  assert.equal(utc.getTime(),Date.parse(test.utc),test.id+" UTC");
  const clock = Astronomy.MakeTime(utc);
  const tropical = Astronomy.EclipticGeoMoon(clock).lon;
  const legacy = (tropical-lahiriAyanamsa(test.jdu)+360)%360;
  const own = calculateOwnEngineBirthChart(input);
  const canonical = calculateInternalChart(input);
  const moon = own.planetPositions.find(p=>p.planet==="Moon");
  assert.equal(moon.absoluteLongitude, canonical.moon.absoluteLongitude,test.id+" runtime paths");
  const dasha = calculateVimshottariDasha(own.planetPositions,utc,"en",utc);
  assert.equal(canonical.dasha.startingMahadashaLord, test.lord,test.id+" canonical lord");
  assert.equal(dasha.mahadashas[0].planet,test.lord,test.id+" public lord");
  assert.equal(canonical.nakshatra.pada,test.pada,test.id+" pada");
  assert.equal(moon.pada,test.pada,test.id+" public pada");
  assert.equal(dasha.mahadashas[0].endsAtUtc,canonical.dasha.transitions[0].endsAt,test.id+" end paths");
  const currentFrame = terrestrialTimeForCivilEphemeris(clock);
  if (test.ttMinusUtc !== null) {
    assert.ok(Math.abs((currentFrame.tt-clock.ut)*86400-test.ttMinusUtc)<0.001,test.id+" TT-UTC");
    assert.ok(Math.abs(signedDegrees(moon.absoluteLongitude,test.civilTtMoon))<=perChartTolerance,test.id+" terrestrial Moon");
  }
  const deltaDegrees = signedDegrees(moon.absoluteLongitude,test.moon);
  const deltaDays = (Date.parse(dasha.mahadashas[0].endsAtUtc)-Date.parse(test.firstEndUtc))/DAY;
  const firstDelta = (Date.parse(canonical.dasha.transitions[0].startsAt)-Date.parse(test.firstStartUtc))/DAY;
  const modeledDays = -deltaDegrees * 27/360 * test.durationYears * 365.2425;
  assert.ok(Math.abs(deltaDays-modeledDays)*DAY < 3,test.id+" UTC arithmetic using corrected Moon");
  assert.ok(Math.abs(firstDelta-deltaDays)*DAY < 3,test.id+" uniform birth-period displacement");
  results.push({id:test.id,group:test.group,utc:test.utc,zone:test.zone,
    signedLegacyDegrees:signedDegrees(legacy,test.moon),
    legacyBoundaryDays:-signedDegrees(legacy,test.moon)*27/360*test.durationYears*365.2425,
    signedFixedDegrees:deltaDegrees,fixedBoundaryDays:deltaDays,
    legacyMeanZeroErrorDegrees:lahiriAyanamsa(test.jdu)-test.meanAyanamsa,
    fixedMeanZeroErrorDegrees:meanLahiriOfDate(currentFrame)-test.meanAyanamsa,
    fixedTrueTimeTropicalDifference:signedDegrees(Astronomy.EclipticGeoMoon(currentFrame).lon,test.tropical),
    ttMoonErrorDegrees:test.civilTtMoon===null?null:signedDegrees(moon.absoluteLongitude,test.civilTtMoon),
    ttMinusUtcSeconds:test.ttMinusUtc,
    engineNutationDegrees:Astronomy.e_tilt(clock).dpsi/3600,
    referenceNutationDegrees:test.trueAyanamsa-test.meanAyanamsa,
    trueTropicalMoonDifference:signedDegrees(tropical,test.tropical)});
}
const invalid=[
 ["America/New_York","2024-03-10","02:30"],["America/New_York","2024-11-03","01:30"],
 ["Australia/Lord_Howe","2024-10-06","02:15"],["Australia/Lord_Howe","2024-04-07","01:45"],
 ["Pacific/Chatham","2024-09-29","03:00"],["Pacific/Kiritimati","1994-12-31","12:00"]
];
for (const [timezone,dateOfBirth,timeOfBirth] of invalid) assert.throws(
  ()=>resolveDashaBirthInstant({timezone,dateOfBirth,timeOfBirth}),/ambiguous or nonexistent/);
const groups = {};
for (const key of ["reproduction","civil_boundary","development","held_out","untouched_final"]) {
  const rows = results.filter(r=>r.group===key);
  groups[key]={count:rows.length,maxLegacyDegrees:Math.max(...rows.map(r=>Math.abs(r.signedLegacyDegrees))),
    maxFixedDegrees:Math.max(...rows.map(r=>Math.abs(r.signedFixedDegrees))),
    maxLegacyDays:Math.max(...rows.map(r=>Math.abs(r.legacyBoundaryDays))),
    maxFixedDays:Math.max(...rows.map(r=>Math.abs(r.fixedBoundaryDays)))};
}
const summary={frozenDegreeTarget:perChartTolerance,originalDegreeTarget:0.02,groups,invalidCivilCases:invalid.length,
  fixedWithinOriginal:results.filter(r=>Math.abs(r.signedFixedDegrees)<=.02).length,
  fixedWithinTighterTarget:results.filter(r=>Math.abs(r.signedFixedDegrees)<=perChartTolerance).length,
  improvedDirections:results.filter(r=>Math.abs(r.signedFixedDegrees)<Math.abs(r.signedLegacyDegrees)).length,
  results};
console.log("DASHA_LUNAR_FRAME "+JSON.stringify(summary));
assert.equal(results.length,123);
assert.equal(groups.held_out.count,20);
assert.equal(groups.untouched_final.count,36);
assert.equal(summary.fixedWithinOriginal,123);
assert.equal(summary.fixedWithinTighterTarget,123);
assert.ok(Math.abs(results[0].fixedBoundaryDays)<0.25,"Delhi previously differed by 2.3867 days");

const physicalFixture = JSON.parse(fs.readFileSync(new URL("../fixtures/astrology/independent-physical-frame.json", import.meta.url)));
assert.equal(physicalFixture.originalAngularToleranceDegrees,0.02);
assert.equal(physicalFixture.originalSpeedToleranceDegreesPerDay,0.02);
const measurements = [];
const errors = [];
// Astronomy Engine may reuse cached Earth orientation at machine precision.
// Compare the unrounded longitude to 10^-10 degrees and every published field exactly.
function samePoint(left, right) {
  const {absoluteLongitude:a, ...first} = left;
  const {absoluteLongitude:b, ...second} = right;
  assert.ok(Math.abs(signedDegrees(a,b)) < 1e-10, "Unchanged longitude");
  assert.deepEqual(first,second);
}
for (const test of physicalFixture.reference) {
  const [dateOfBirth,timeOfBirth] = test.local.split(" ");
  const input = {dateOfBirth,timeOfBirth,timezone:test.zone,latitude:0,longitude:0,ayanamsa:"lahiri"};
  const baseline = calculateInternalChart(input);
  const explicitHistorical = calculateInternalChart({...input,physicalLongitudeMethod:"historical_nonlunar"});
  const candidate = calculateInternalChart({...input,physicalLongitudeMethod:"apparent_iae_p03"});
  for (let i=0;i<baseline.planets.length;i++) samePoint(explicitHistorical.planets[i],baseline.planets[i]);
  assert.deepEqual(explicitHistorical.ayanamsa,baseline.ayanamsa);
  assert.deepEqual(candidate.ascendant,baseline.ascendant);
  samePoint(candidate.moon,baseline.moon);
  assert.deepEqual(candidate.dasha,baseline.dasha);
  for (const body of ["Moon","Rahu","Ketu"]) {
    samePoint(baseline.planets.find(p=>p.planet===body),candidate.planets.find(p=>p.planet===body));
  }
  assert.equal(candidate.ayanamsa.degree,baseline.ayanamsa.degree);
  assert.ok(Number.isFinite(candidate.ayanamsa.physicalMeanDegree));
  assert.equal(candidate.metadata.physicalLongitudeMethod,"apparent_iae_p03");
  for (const [i,body] of physicalFixture.planets.entries()) {
    const expected = test.longitudeAndSpeed[i];
    const comparison = {group:test.group, id:test.id, body};
    for (const [key, chart] of [["baseline",baseline],["candidate",candidate]]) {
      const p = chart.planets.find(planet=>planet.planet===body);
      comparison[key+"Angle"] = Math.abs(signedDegrees(p.absoluteLongitude,expected[0]));
      comparison[key+"Speed"] = Math.abs(p.speedDegreesPerDay-expected[1]);
    }
    measurements.push(comparison);
    if (comparison.candidateAngle > 0.02 || comparison.candidateSpeed > 0.02) errors.push(comparison);
  }
}
function physicalSummary(rows) {
  const summary = {count:rows.length};
  for (const key of ["baselineAngle","candidateAngle","baselineSpeed","candidateSpeed"]) {
    summary[key] = {max:Math.max(...rows.map(row=>row[key])),
      rms:Math.sqrt(rows.reduce((total,row)=>total+row[key]**2,0)/rows.length),
      withinOriginal:rows.filter(row=>row[key]<=0.02).length,
      within005:rows.filter(row=>row[key]<=0.005).length};
  }
  summary.improvedAngle=rows.filter(row=>row.candidateAngle<row.baselineAngle).length;
  return summary;
}
const physicalSummaryBy = key => Object.fromEntries([...new Set(measurements.map(row=>row[key]))]
  .map(value=>[value,physicalSummary(measurements.filter(row=>row[key]===value))]));
const guardInput={dateOfBirth:"2000-01-01",timeOfBirth:"12:00",timezone:"UTC",latitude:0,longitude:0};
assert.throws(()=>calculateInternalChart({...guardInput,physicalLongitudeMethod:"unsupported"}),/Unsupported physical/);
assert.throws(()=>calculateInternalChart({...guardInput,physicalLongitudeMethod:"apparent_iae_p03",ayanamsa:"raman"}),/requires Lahiri/);
console.log("OPTIONAL_PHYSICAL_FRAME "+JSON.stringify({charts:physicalFixture.reference.length,
  summary:physicalSummary(measurements),byPlanet:physicalSummaryBy("body"),bySample:physicalSummaryBy("group"),errors}));
assert.equal(physicalFixture.reference.length,147);
assert.equal(measurements.length,882);
assert.equal(physicalFixture.reference.filter(t=>t.group==="nonlunar_reserve").length,24);
assert.equal(errors.length,0,"Original physical angle and velocity tolerance");

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
const {meanLahiriForMoon,terrestrialTimeForCivilMoon} = require("@/lib/astrology/own-engine/lahiri-moon");
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
  const currentFrame = terrestrialTimeForCivilMoon(clock);
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
    fixedMeanZeroErrorDegrees:meanLahiriForMoon(currentFrame)-test.meanAyanamsa,
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

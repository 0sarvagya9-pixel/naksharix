import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const numericSource = fs.readFileSync(path.join(root, "mobile-app/src/native/numerology.ts"), "utf8");
const compiled = ts.transpileModule(numericSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;
const exports = {};
new Function("exports", compiled)(exports);
const { digitalRoot, computeBirthNumber } = exports;

assert.equal(digitalRoot("99"), 9);
assert.equal(digitalRoot("16"), 7);
assert.equal(digitalRoot("000"), null);
assert.equal(digitalRoot("not a number"), null);
assert.deepEqual(computeBirthNumber("1988-12-03"), { dayNumber: 3, lifePath: 5 });
assert.equal(computeBirthNumber("2026-02-29"), null);
assert.equal(computeBirthNumber("2024-02-29")?.dayNumber, 2);
assert.equal(computeBirthNumber("1900-02-29"), null);
assert.equal(computeBirthNumber("2101-01-01"), null);
assert.equal(computeBirthNumber("2026-04-31"), null);
assert.equal(computeBirthNumber("2000-01-00"), null);
assert.equal(computeBirthNumber(""), null);
assert.equal(computeBirthNumber("2000-01-01junk"), null);

const app = fs.readFileSync(path.join(root, "mobile-app/App.tsx"), "utf8");
const screen = fs.readFileSync(path.join(root, "mobile-app/src/native/NumerologyScreen.tsx"), "utf8");
assert.ok(app.includes("NumerologyScreen") && app.includes('screen === "numerology"'));
assert.ok(screen.includes("Nothing you enter is transmitted or saved."));
assert.ok(!/fetch\(|secureFetch\(|axios|AsyncStorage/.test(screen));
console.log("MOBILE_NATIVE_NUMEROLOGY_TESTS=PASS");


const horoscopeSource=fs.readFileSync(path.join(root,"mobile-app/src/native/horoscope-contract.ts"),"utf8");
const horoscopeExports={};
new Function("exports",ts.transpileModule(horoscopeSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(horoscopeExports);
const {indiaCalendarYear,nativeAnnualYears,nativeHoroscopePath,validateNativeHoroscope}=horoscopeExports;
let annualChecks=0;
function check(value){assert.ok(value);annualChecks++;}
check(indiaCalendarYear(new Date("2026-12-31T18:29:59Z"))===2026);
check(indiaCalendarYear(new Date("2026-12-31T18:30:00Z"))===2027);
check(nativeAnnualYears(new Date("2026-12-31T18:29:59Z")).join(",")==="2025,2026,2027");
check(nativeAnnualYears(new Date("2028-01-01T00:00:00Z")).join(",")==="2027,2028,2029");
check(nativeAnnualYears(new Date("2032-01-01T00:00:00Z")).includes(2027));
const selection={sign:"aries",period:"yearly",year:2027};
check(nativeHoroscopePath(selection)==="/api/mobile/horoscope?zodiac=aries&period=yearly&locale=en&year=2027");
check(!nativeHoroscopePath({...selection,period:"daily"}).includes("&year="));
const ref=JSON.parse(fs.readFileSync("fixtures/astrology/independent-2027-annual-swiss-reference.json","utf8")).rows;
const labels=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const rows=ref.map(r=>({date:r.date,jupiter:labels[Math.floor(r.Jupiter/30)],saturn:labels[Math.floor(r.Saturn/30)],growthHouse:Math.floor(r.Jupiter/30)+1,structureHouse:Math.floor(r.Saturn/30)+1,growthTheme:"Traditional reflection",structureTheme:"Traditional reflection"}));
const valid={zodiac:"aries",period:"yearly",locale:"en",title:"Aries 2027",subtitle:"Internal reference",overview:"Educational",notice:"No prediction",remedy:"Practical planning",luckyNumber:"—",luckyColor:"—",sections:rows.map(r=>({title:r.date,body:"Reflection"})),annualGuide:{year:2027,referenceSign:"Aries",rows,verification:"internal_educational_not_external_certified",personalPrediction:false}};
check(validateNativeHoroscope(valid,selection)!==null);
for(const v of [null,{},[],{...valid,zodiac:"taurus"},{...valid,period:"monthly"},{...valid,locale:"hi"},{...valid,luckyNumber:"7"},{...valid,annualGuide:undefined},{...valid,sections:valid.sections.slice(1)},{...valid,annualGuide:{...valid.annualGuide,year:2026}},{...valid,annualGuide:{...valid.annualGuide,personalPrediction:true}},{...valid,annualGuide:{...valid.annualGuide,rows:[{...rows[0],growthHouse:99},...rows.slice(1)]}},{...valid,annualGuide:{...valid.annualGuide,rows:[{...rows[0],date:"2026-01-01"},...rows.slice(1)]}}])check(validateNativeHoroscope(v,selection)===null);
check(validateNativeHoroscope(valid,{...selection,year:2026})===null);
const daily={...valid,period:"daily",luckyNumber:"1",luckyColor:"Gold",sections:[{title:"Work",body:"Reflection"}],annualGuide:undefined};
check(validateNativeHoroscope(daily,{...selection,period:"daily"})!==null);
const horoscopeScreen=fs.readFileSync("mobile-app/src/screens/HoroscopeScreen.tsx","utf8");
check(horoscopeScreen.includes("nativeAnnualYears()")&&horoscopeScreen.includes("validateNativeHoroscope(result,selection)")&&horoscopeScreen.includes("state.key!==requestKey")&&!horoscopeScreen.includes("2026 yearly themes"));
console.log("MOBILE_ANNUAL_SELECTION_CONTRACT_PASS "+JSON.stringify({checks:annualChecks,scope:"native client year selection, exact response validation, stale result rejection; no physical-device claim"}));

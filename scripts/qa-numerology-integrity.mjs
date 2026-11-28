import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, {createRequire} from "node:module";

const require = createRequire(import.meta.url), ts = require("typescript");
const resolve = Module._resolveFilename, load = Module._load;
Module._resolveFilename = function(name, ...args) {
  return resolve.call(this, name.startsWith("@/") ? path.resolve(name.slice(2)) : name, ...args);
};
Module._load = function(name, ...args) { return name === "server-only" ? {} : load.call(this, name, ...args); };
require.extensions[".ts"] = function(module, file) {
  module._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), {compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true
  }}).outputText, file);
};
process.env.ASTROLOGY_PROVIDER = "own_engine";
const {calculateNumerologyReport} = require("@/lib/numerology");
const {calculateNumerology} = require("@/lib/astrology/engine");
const {calculateRomanNameEvidence} = require("@/lib/numerology/name");
const {calculateNameNumberValue, calculatePersonalityNumberValue, dateDigitCounts, calculateFocusedNumerology} = require("@/lib/focused-calculators");
const {numerologySchema} = require("@/lib/validations/astrology");
const {assembleAutomaticPaidReport} = require("@/lib/reports/automatic-report-content");
const {assemblePremiumReportContent} = require("@/lib/reports/premium-report-content-engine");
const {calculateInternalChart} = require("@/lib/astrology/premium-engine/chart");
const asOf = new Date("2026-11-26T00:15:00Z"), dob = "1992-05-18";
const locales = ["en", "hi", "hinglish"];
const values = report => [report.nameNumber?.value ?? null, report.soulUrge?.value ?? null, report.personality?.value ?? null];
let nameCases = 0, unavailableCases = 0, dateCases = 0, numberCases = 0, assemblyCases = 0, legacyAssemblyCases = 0;

// Literal independent Pythagorean letter groups, distinct from production's
// character-code modulo arithmetic. These specify the accepted named method.
const groups = ["AJS", "BKT", "CLU", "DMV", "ENW", "FOX", "GPY", "HQZ", "IR"];
for (const [index, group] of groups.entries()) for (const letter of group) for (const locale of locales) {
  const result = calculateNumerologyReport({name:letter, dateOfBirth:dob, locale, asOf});
  const vowel = "AEIOU".includes(letter), expected = index + 1;
  assert.deepEqual(values(result), [expected, vowel ? expected : null, vowel ? null : expected]);
  nameCases++;
}
const named = [
  ["Asha Test", [3, 7, 5]], ["Rhythm", [11, null, 11]], ["AEIOU", [6, 6, null]],
  ["O'Neil", [1, 2, 8]], ["Anne-Marie", [8, 3, 5]], ["AA I", [11, 11, null]],
  ["BB BBB BBB BBB", [22, null, 22]], ["CC CCC CCC CCC", [33, null, 33]]
];
for (const [name, expected] of named) for (const locale of locales) {
  const result = calculateNumerologyReport({name, dateOfBirth:dob, locale, asOf});
  assert.deepEqual(values(result), expected, name);
  assert.equal(result.nameMethod, "pythagorean_a_z_aeiou_master_11_22_33");
  assert.equal(result.nameUnavailableReason, null);
  assert.equal(calculateNameNumberValue(name), expected[0]);
  assert.equal(calculatePersonalityNumberValue(name), expected[2]);
  const evidence = calculateRomanNameEvidence(name);
  assert.equal(evidence.all.number, expected[0]);
  assert.equal(evidence.vowels?.number ?? null, expected[1]);
  assert.equal(evidence.consonants?.number ?? null, expected[2]);
  const legacy = calculateNumerology(name, new Date(dob + "T00:00:00Z"));
  assert.deepEqual([legacy.destinyNumber, legacy.soulUrgeNumber, legacy.personalityNumber], expected);
  nameCases++;
}
for (const name of ["", " ", "आशा", "Asha शर्मा", "José", "Jose\u0301", "李明", "123", "-", "A1", "ß", "😀"]) for (const locale of locales) {
  const result = calculateNumerologyReport({name, dateOfBirth:dob, locale, asOf});
  assert.deepEqual(values(result), [null, null, null]);
  assert.equal(result.destiny, null);
  assert.equal(result.nameUnavailableReason, "complete_roman_spelling_required");
  assert.equal(result.moolank.value, 9);
  assert.equal(result.lifePath.value, 8);
  assert.deepEqual(result.loShuGrid.map(cell => [cell.number, cell.count]), [[4,0],[9,2],[2,1],[3,0],[5,1],[7,0],[8,1],[1,2],[6,0]]);
  assert.equal(calculateNameNumberValue(name), null);
  assert.equal(calculatePersonalityNumberValue(name), null);
  assert.equal(numerologySchema.safeParse({name, dateOfBirth:dob, locale}).success, false);
  unavailableCases++;
}
for (const dateOfBirth of ["1990-02-30", "1900-02-29", "2025-02-29", "2026-04-31", "2026-00-01", "2026-13-01", "2026-01-00", "2026-01-32", "2026-1-1", "2026-01-01suffix", "2026-01-01T23:00:00-08:00"]) {
  assert.equal(numerologySchema.safeParse({name:"Asha Test", dateOfBirth}).success, false, dateOfBirth);
  assert.throws(() => calculateNumerologyReport({name:"Asha Test", dateOfBirth, asOf}), /Invalid date/);
  assert.throws(() => dateDigitCounts(dateOfBirth), /Invalid date/);
  dateCases++;
}
for (const dateOfBirth of ["1992-05-18", "2000-02-29", "2024-02-29", "1900-02-28", "2026-04-30"]) {
  assert.equal(numerologySchema.safeParse({name:"Asha Test", dateOfBirth}).success, true);
  const result = calculateNumerologyReport({name:"Asha Test", dateOfBirth, asOf});
  assert.equal(result.dateOfBirth, dateOfBirth);
  assert.deepEqual(Object.fromEntries(result.loShuGrid.filter(cell=>cell.count).map(cell=>[cell.number,cell.count])), dateDigitCounts(dateOfBirth));
  dateCases++;
}
const savedZone = process.env.TZ;
try {
  for (const zone of ["UTC", "America/Los_Angeles", "Asia/Kolkata", "Pacific/Auckland"]) {
    process.env.TZ = zone;
    const result = calculateNumerologyReport({name:"Asha Test", dateOfBirth:new Date(dob + "T00:00:00Z"), asOf});
    assert.equal(result.dateOfBirth, dob);
    assert.equal(result.calendar.asOf, "2026-11-26");
    assert.deepEqual([result.calendar.personalYear, result.calendar.personalMonth, result.calendar.personalDay], [6, 8, 7]);
    assert.equal(result.dailyPrediction.personalDayNumber, 7);
    const legacy = calculateNumerology("Asha Test", new Date(dob + "T00:00:00Z"));
    assert.equal(legacy.lifePathNumber, 8);
    dateCases++;
  }
} finally { if (savedZone === undefined) delete process.env.TZ; else process.env.TZ = savedZone; }
for (const [field, invalid] of [["mobile","0000000"],["mobile","abcdefghi"],["mobile","+91/9876543210"],["vehicle","000000"],["vehicle","AB😀123"],["vehicle","车123"]]) {
  const input = {name:"Asha Test", dateOfBirth:dob, [field]:invalid};
  assert.equal(numerologySchema.safeParse(input).success, false);
  assert.throws(()=>calculateNumerologyReport(input), /Invalid (mobile|vehicle)/);
  numberCases++;
}
for (const [kind, targetNumber, expected] of [["mobile","+91 9876543210",1],["vehicle","MP09AB1234",33]]) {
  const result = calculateFocusedNumerology({name:"Asha Test",dateOfBirth:dob,kind,targetNumber});
  assert.equal(result.reducedNumber, expected);
  numberCases++;
}
// Actual paid assembler, not a mock: native display names remain valid for
// chart reports and retain date-derived numerology without inventing names.
const birth = {name:"आशा मेहरा",gender:"female",dateOfBirth:dob,timeOfBirth:"08:15",birthPlace:"Delhi, India",latitude:28.6139,longitude:77.209,timezone:5.5};
for (const name of ["आशा मेहरा", "José", "Asha शर्मा", "Rhythm", "AEIOU"]) for (const language of locales) {
  const result = await assembleAutomaticPaidReport({slug:"premium-kundli", birth:{...birth,name}, extra:{confirmed:true,birthZone:"Asia/Kolkata"}, question:"",language,now:asOf});
  const section = result.content.sections.find(section=>section.key==="numerology");
  assert.ok(section, "date/name numerology section retained");
  assert.equal(section.data.birthNumber.value, 9);
  assert.equal(section.data.lifePath.value, 8);
  assert.equal(section.data.nameNumber?.value ?? null, calculateNameNumberValue(name));
  assemblyCases++;
}
for (const name of ["Rhythm", "AEIOU", "Asha Test"]) for (const language of locales) {
  const result = await assembleAutomaticPaidReport({slug:"numerology-lo-shu-report", birth:{name,dateOfBirth:dob}, extra:{confirmed:true,romanName:name}, question:"family",language,now:asOf});
  const section = result.content.sections.find(section=>section.key==="numerology-profile");
  assert.deepEqual(values(section.data), values(calculateNumerologyReport({name,dateOfBirth:dob,locale:language,asOf})));
  assemblyCases++;
}
// The generic legacy assembler must not fabricate a person's name from
// a brand placeholder when the canonical chart has no display name.
const canonical = calculateInternalChart({...birth, name:"Asha Test", language:"en", ayanamsa:"lahiri"});
for (const name of [undefined, "आशा मेहरा", "Rhythm", "AEIOU", "Asha Test"]) {
  const chart = {...canonical, normalizedInput:{...canonical.normalizedInput, name}};
  const result = assemblePremiumReportContent({chart});
  const section = result.sections.find(section=>section.key==="numerology-section");
  const expected = calculateNumerologyReport({name:name ?? "", dateOfBirth:dob, asOf});
  assert.deepEqual(values(section.data), values(expected));
  assert.equal(section.data.moolank.value, 9);
  assert.equal(section.data.bhagyank.value, 8);
  if (!expected.nameNumber) {
    assert.equal(section.status, "partial_internal");
    assert.match(section.data.nameUnavailableReason, /complete name spelling/);
  }
  if (expected.nameNumber && (!expected.soulUrge || !expected.personality)) assert.ok(section.limitations.some(text=>/No (vowel|personality) number/.test(text)));
  legacyAssemblyCases++;
}
console.log("NUMEROLOGY_INTEGRITY_PASS", JSON.stringify({nameCases,unavailableCases,dateCases,numberCases,assemblyCases,legacyAssemblyCases,
  method:"Pythagorean continuous full-name sum, A/E/I/O/U vowels, Y consonant, preserve11/22/33; strict Gregorian civil dates",
  scope:"arithmetic and integration verification only; no predictive or expert certification"}));

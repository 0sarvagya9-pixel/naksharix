import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {execFileSync} from "node:child_process";
import Module, {createRequire} from "node:module";

const require = createRequire(import.meta.url), ts = require("typescript"), resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {return resolve.call(this, name.startsWith("@/") ? path.resolve(name.slice(2)) : name, ...args);};
require.extensions[".ts"] = function (module, file) {
  module._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}
  }).outputText, file);
};
const {qualifyStrengthReference, REFERENCE_GRAHAS: grahas, PLANET_COMPONENTS, HOUSE_COMPONENTS} = require("@/lib/astrology/strength/reference-qualification");
const {calculateBirthStrengthEvidence} = require("@/lib/astrology/strength/birth-context");
const {classicalRelationship} = require("@/lib/astrology/strength/classical-components");
const {calculateRamanPositionalCandidate} = require("@/lib/astrology/strength/shadbala");
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const original = read("fixtures/astrology/published-classical-comparison.json");
const holdout = read("fixtures/astrology/heldout-strength-2025.json");
const positional = read("fixtures/astrology/position-strength-crosschecks.json");
const integrity = read("fixtures/astrology/strength-reference-integrity.json");
const dhruv = positional.software.find(s => s.name === "Dhruv Astro Software 2025");
const lords = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const dms = ([sign, degree, minute, second]) => (sign - 1) * 30 + degree + minute / 60 + second / 3600;
const fixtures = [
  {...original, input: original.birth, positionsDms: original.positionsDms},
  {...holdout, positionsDms: dhruv.positionsDms}
];
let checks = 0;
const check = (value, message) => {assert.ok(value, message); checks++;};
function expectedSnapshot(ref) {
  const asc = ref.positionsDms[0][0] - 1;
  return {planets: Object.fromEntries(PLANET_COMPONENTS.map(k => [k, ref.strength[k]])),
    houses: Object.fromEntries(HOUSE_COMPONENTS.map(k => [k, ref.bhava[k]])),
    houseLords: Array.from({length: 12}, (_, i) => lords[(asc + i) % 12])};
}
function actualSnapshot(candidate) {
  const planets = Object.fromEntries(PLANET_COMPONENTS.map(k => [k, []]));
  for (const g of grahas) {
    const row = candidate.temporalVariantStrength.rows.find(r => r.planet === g), c = row.components;
    for (const k of PLANET_COMPONENTS) planets[k].push(k === "total" ? row.total : k === "kala" ?
      (typeof c.kalaBeforeWar === "number" && typeof row.warVirupas === "number" ? c.kalaBeforeWar + row.warVirupas : null) : c[k]);
  }
  const rows = candidate.temporalVariantBhava.houses;
  return {planets, houses: {lord: rows.map(r => r.lordStrengthVirupas), direction: rows.map(r => r.directionalVirupas),
    aspect: rows.map(r => r.aspect.virupas), total: rows.map(r => r.arithmeticTotalVirupas)}, houseLords: rows.map(r => r.lord)};
}
const comparisons = fixtures.map(ref => {
  const candidate = calculateBirthStrengthEvidence(ref.input, "raman_15_degree_table", "seasonal_day_night");
  const actual = actualSnapshot(candidate), expected = expectedSnapshot(ref);
  const result = qualifyStrengthReference(actual, expected);
  check(result.compared === 97, "all original reference cells retained");
  check(result.toleranceVirupas === 0.25, "original tolerance retained");
  check(!result.publicEnabled && !result.expertCertified && !candidate.fullShadbalaVerified, "qualification cannot activate public strength");
  // A new discrepancy is a regression. A source-backed fix may remove an old one.
  const known = ref === fixtures[0] ? ["Mars/cheshta", "Mercury/cheshta", "Jupiter/cheshta", "Saturn/cheshta", "Saturn/sthana"] :
    ["Mercury/sthana", "Mercury/cheshta", "Jupiter/sthana", "Venus/cheshta", "Saturn/sthana"];
  check(result.primary.every(r => known.includes(`${r.point}/${r.component}`)), "no new primary discrepancy");
  check(result.unattributedDiscrepancies === 0, "all failed totals have a supported dependency explanation");
  check(result.inconsistentSums === 0, "candidate sums, published sums and lord identities retain their independent invariants");
  check(result.failed === result.primaryDiscrepancies + result.inheritedDiscrepancies, "every original failed cell remains accounted for");
  return {date: ref.input.date, source: ref.source, input: ref.input, method: {
    ayana: "raman_15_degree_table", hora: "seasonal_day_night", luminary: "separate_kendra",
    positional: "Raman dignity weights; natal friendship; degree-qualified D1 moolatrikona", frame: "Lahiri"
  }, result, actual, expected};
});

// The 2025 table's printed friendship is a second independent source table;
// reproduce its Sapta arithmetic without importing the dignity implementation.
check(JSON.stringify(integrity.dhruv2025.planetOrder) === JSON.stringify(grahas), "friendship source order");
let friendshipChecks = 0;
for (const [i, from] of grahas.entries()) for (const [j, to] of grahas.entries()) {
  if (i === j) {check(integrity.dhruv2025.compoundFriendship[i][j] === null, "source diagonal has no invented grade"); continue;}
  check(classicalRelationship(from, to, dhruv.positionsDms[i + 1][0] - 1, dhruv.positionsDms[j + 1][0] - 1).relationship ===
    integrity.dhruv2025.compoundFriendship[i][j], `${from} toward ${to}: printed compound friendship`);
  friendshipChecks++;
}
const points = grahas.map((planet, i) => ({planet, absoluteLongitude: dms(dhruv.positionsDms[i + 1])}));
const weights = integrity.ramanDignity.weights;
const positionalProof = grahas.map((planet, i) => {
  const rows = positional.vargaOrder.map(varga => {
    const signNumber = dhruv.divisions[varga][i] || 12, lord = lords[signNumber - 1];
    const friendship = lord === planet ? null : integrity.dhruv2025.compoundFriendship[i][grahas.indexOf(lord)];
    // None of this dated chart's D1 placements is in the existing degree-qualified
    // moolatrikona interval. This statement is checked against the engine rows below.
    return {varga, sign: signs[signNumber - 1], lord, weight: lord === planet ? weights.own : weights[friendship]};
  });
  const independentlySummed = rows.reduce((n, r) => n + r.weight, 0);
  const engine = calculateRamanPositionalCandidate(points, planet, dms(dhruv.positionsDms[0]));
  check(engine.dignity.rows.every(r => r.dignity !== "moolatrikona"), "no omitted D1 moolatrikona exception");
  check(engine.dignity.rows.every((r, j) => r.virupas === rows[j].weight && r.sign === rows[j].sign), `${planet}: source-field recomputation agrees with engine`);
  const published = dhruv.saptavargaja[i];
  return {planet, rows, independentlySummed, published, delta: independentlySummed - published,
    sourceFieldsReproduceTotal: Math.abs(independentlySummed - published) <= 0.00501};
});
const geometryProof = ["Moon", "Saturn"].map(planet => {
  const i = grahas.indexOf(planet), [sign, degree, minute, second] = original.positionsDms[i + 1];
  // Exact integer arcseconds, followed by a rational seventh; no engine partition helper.
  const arcseconds = degree * 3600 + minute * 60 + second;
  const natal = sign - 1, start = natal + (sign % 2 === 0 ? 6 : 0);
  const seventhAt = value => (start + Math.floor(value * 7 / 108000)) % 12 + 1;
  const exact = seventhAt(arcseconds), below = seventhAt(arcseconds - 0.5), above = seventhAt(arcseconds + 0.5);
  const printed = original.divisions.D7[i + 1];
  check(exact === below && exact === above, "one-arcsecond printed precision cannot explain D7 disagreement");
  return {planet, publishedLongitudeDms: [sign, degree, minute, second], arcsecondsWithinSign: arcseconds,
    segmentIndex: Math.floor(arcseconds * 7 / 108000), expectedSign: signs[exact - 1], publishedSign: signs[printed - 1],
    stableAcrossPrintedRounding: true, same: exact === printed};
});
check(geometryProof.every(r => !r.same), "both previously recorded 1979 D7 inconsistencies independently reproduced");

// Real qualification failure modes: incomplete inputs, altered totals, a wrong
// house-lord binding and failed components that cancel in a combined total.
const pristine = structuredClone(comparisons[1].actual);
check(qualifyStrengthReference(pristine, pristine).numericalParity, "identical complete arithmetic has numerical parity only");
check(!qualifyStrengthReference(pristine, pristine).expertCertified, "parity does not invent professional approval");
for (const bad of [NaN, Infinity, null, "0"]) {
  const mutated = structuredClone(pristine); mutated.planets.cheshta[0] = bad;
  assert.throws(() => qualifyStrengthReference(mutated, pristine), /INCOMPLETE_STRENGTH_REFERENCE/); checks++;
}
for (const group of ["planets", "houses"]) {
  const mutated = structuredClone(pristine); mutated[group].total.pop();
  assert.throws(() => qualifyStrengthReference(mutated, pristine), /INCOMPLETE_STRENGTH_REFERENCE/); checks++;
}
const badTotal = structuredClone(pristine); badTotal.planets.total[0] += 1;
check(qualifyStrengthReference(badTotal, pristine).unattributedDiscrepancies === 1, "an unexplained total cannot be labeled inherited");
const wrongLord = structuredClone(pristine); wrongLord.houseLords[0] = "Sun";
const wrongLordAudit = qualifyStrengthReference(wrongLord, pristine);
check(!wrongLordAudit.numericalParity, "correct numbers with the wrong lord are not qualified");
check(wrongLordAudit.sourceConsistency.find(r => r.id === "house/1/lord").sourceSumMatches,
  "an incorrect candidate lord must not be labeled a source arithmetic error");
const cancel = structuredClone(pristine); cancel.planets.sthana[0] += 1; cancel.planets.cheshta[0] -= 1;
const cancellation = qualifyStrengthReference(cancel, pristine);
check(cancellation.failed === 2 && cancellation.primaryDiscrepancies === 2 && !cancellation.numericalParity, "cancellation cannot hide component failures");
const threshold = structuredClone(pristine); threshold.planets.sthana[0] += 0.25;
check(qualifyStrengthReference(threshold, pristine).rows.find(r => r.id === "planet/Sun/sthana").pass, "original inclusive tolerance");
threshold.planets.sthana[0] += 0.000001;
check(!qualifyStrengthReference(threshold, pristine).rows.find(r => r.id === "planet/Sun/sthana").pass, "original tolerance cannot drift");

const dependencyFiles = ["lib/astrology/strength/reference-qualification.ts", "fixtures/astrology/strength-reference-integrity.json",
  "fixtures/astrology/published-classical-comparison.json", "fixtures/astrology/heldout-strength-2025.json", "fixtures/astrology/position-strength-crosschecks.json",
  ...execFileSync("git", ["ls-files", "lib/astrology"], {encoding: "utf8"}).trim().split("\n")];
const sourceHashes = Object.fromEntries([...new Set(dependencyFiles)].map(file => [file, crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")]));
const result = {schemaVersion: 1, generatedAt: new Date().toISOString(), sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {encoding: "utf8"}).trim(), sourceHashes,
  originalToleranceVirupas: 0.25, qualification: comparisons.every(c => c.result.numericalParity) ? "NUMERICAL_PARITY_ONLY" : "BLOCKED",
  publicEnabled: false, expertCertified: false, comparisons, sourceIntegrity: {friendshipChecks, positionalProof, geometryProof,
    interpretation: integrity.admission}, diagnosticChecksPassed: checks};
if (process.env.STRENGTH_QUALIFICATION_OUTPUT) {
  fs.mkdirSync(path.dirname(process.env.STRENGTH_QUALIFICATION_OUTPUT), {recursive: true});
  fs.writeFileSync(process.env.STRENGTH_QUALIFICATION_OUTPUT, JSON.stringify(result, null, 2) + "\n");
}
console.log("STRENGTH_REFERENCE_QUALIFICATION " + JSON.stringify({qualification: result.qualification, originalToleranceVirupas: 0.25,
  comparisons: comparisons.map(({date, result: r}) => ({date, compared: r.compared, passed: r.passed, failed: r.failed,
    primary: r.primaryDiscrepancies, inherited: r.inheritedDiscrepancies, unattributed: r.unattributedDiscrepancies, inconsistentSums: r.inconsistentSums})),
  sourceFriendshipChecks: friendshipChecks, sourceD7Contradictions: geometryProof.filter(r => !r.same).length,
  sourceDignityDifferences: positionalProof.filter(r => !r.sourceFieldsReproduceTotal).map(r => ({planet: r.planet, sourceFieldsSum: r.independentlySummed, published: r.published, delta: r.delta})),
  diagnosticChecksPassed: checks, expertCertified: false, publicEnabled: false}));
if (process.argv.includes("--require-qualified") && result.qualification !== "NUMERICAL_PARITY_ONLY") {
  console.error("STRENGTH_ACCEPTANCE_BLOCKED: original reference discrepancies remain; no expected value or tolerance was changed.");
  process.exitCode = 2;
}

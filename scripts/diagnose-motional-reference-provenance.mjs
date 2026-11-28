#!/usr/bin/env node
/**
 * Independent, read-only reconciliation of five non-luminary Cheshta values.
 * No production imports, per-reference offsets, fitted constants, rewritten
 * expected values, or relaxed tolerances. All proposed substitutions are
 * diagnostic experiments and may not certify a calculation method.
 *
 * Usage: node scripts/diagnose-motional-reference-provenance.mjs [input.json] [output.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const ownDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(ownDirectory, '..');
const inputPath = process.argv[2] ?? path.join(repositoryDirectory, 'fixtures/astrology/motional-reference-diagnostic-inputs.json');
const outputPath = process.argv[3] ?? path.join(tmpdir(), 'naksharix-motion-reference-diagnostic.json');
const inputBytes = fs.readFileSync(inputPath);
const input = JSON.parse(inputBytes);
assert.equal(input.toleranceVirupas, 0.25, 'Original acceptance tolerance must remain fixed.');
const tolerance = input.toleranceVirupas;
const dayMilliseconds = 86_400_000;
const ujjainLongitude = 76;
const epochMilliseconds = Date.UTC(1900, 0, 1) - ujjainLongitude / 360 * dayMilliseconds;
const civilDaysPerMahayuga = 1_577_917_828;
const revolutions = { Sun: 4_320_000, Mars: 2_296_832, Mercury: 17_937_060, Jupiter: 364_220, Venus: 7_022_376, Saturn: 146_568 };
const exactRates = Object.fromEntries(Object.entries(revolutions).map(([p, n]) => [p, n * 360 / civilDaysPerMahayuga]));
// Published by PyJHora's authors; this is a named external approximation,
// not a proposed replacement for the higher precision table-derived rates.
const truncatedRates = { Sun: 0.9856, Mars: 0.524, Mercury: 4.0923, Jupiter: 0.0831, Venus: 1.60215, Saturn: 0.033439 };
const jplElements = {
  Mercury: [252.25032350, 149472.67411175],
  Venus: [181.97909950, 58517.81538729],
  Earth: [100.46457166, 35999.37244981],
  Mars: [-4.55343205, 19140.30268499],
  Jupiter: [34.39644051, 3034.74612775],
  Saturn: [49.95424423, 1222.49362201],
};
const sources = [
  { id: 'raman', url: 'https://astrojyotish.info/pdf/graha-bhava-balas.pdf', locator: 'Articles 87-105; Tables IV-IX', use: 'Definition of mean position, Gregorian civil interval, 76 E mean-midnight epoch, correction constants, and Cheshta formula.' },
  { id: 'pyjhora', url: 'https://github.com/naturalstupid/PyJHora/blob/be344af506590b6e4c79942d84b958495dee4766/src/jhora/horoscope/chart/strength.py', sourceSha256: 'f701c174b7c5ac4a32e271064419915940d8748d4e509d84ce223016c2f1e8b2', locator: 'planet_speed_at_epoch_ujjain_1900', use: 'Independent software author publishes the six truncated daily rates. Agreement is software comparison, not external expert approval.' },
  { id: 'jpl', url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html', locator: 'Table 1, 1800-2050', use: 'Rejected diagnostic orbital-element substitution. JPL explicitly says these best-fit elements are not intended to represent a mean; they must not silently replace classical mean positions.' },
];
const norm = angle => ((angle % 360) + 360) % 360;
const signedDifference = (a, b) => norm(a - b + 180) - 180;
const isInner = planet => planet === 'Mercury' || planet === 'Venus';
function cheshta(mean, trueLongitude, seeghrocha) {
  const d = signedDifference(trueLongitude, mean);
  if (Math.abs(Math.abs(d) - 180) < 1e-10) throw Error('Ambiguous antipodal midpoint.');
  const midpoint = norm(mean + d / 2);
  const signedKendra = signedDifference(seeghrocha, midpoint);
  return { mean, trueLongitude, seeghrocha, midpoint, signedKendra, virupas: Math.abs(signedKendra) / 3 };
}
function meansAt(utc, rates = exactRates, shiftDays = 0) {
  const time = new Date(utc).getTime();
  const days = (time - epochMilliseconds) / dayMilliseconds + shiftDays;
  const t = new Date(time + ujjainLongitude / 360 * dayMilliseconds).getUTCFullYear() - 1900;
  const values = {
    Sun: norm(257.4568 + rates.Sun * days),
    Mars: norm(270.22 + rates.Mars * days),
    Mercury: norm(164 + rates.Mercury * days + 6.67 - 0.00133 * t),
    Jupiter: norm(220.04 + rates.Jupiter * days - 3.33 - 0.0067 * t),
    Venus: norm(328.51 + rates.Venus * days - 5 - 0.0001 * t),
    Saturn: norm(236.74 + rates.Saturn * days + 5 + 0.001 * t),
  };
  return { days, correctionYear: t + 1900, values };
}
function fromMeanValues(values, row) {
  const { planet, trueLongitude } = row;
  return cheshta(isInner(planet) ? values.Sun : values[planet], trueLongitude,
    isInner(planet) ? values[planet] : values.Sun);
}
function jplDiagnostic(utc) {
  const jdUtc = new Date(utc).getTime() / dayMilliseconds + 2440587.5;
  const centuries = (jdUtc - 2451545) / 36525;
  // A fixed J2000 sidereal offset is deliberately declared as a diagnostic
  // approximation. TDB versus UTC and full ecliptic precession are not supplied;
  // consequently this experiment cannot qualify an astronomical pipeline.
  const j2000SiderealOffset = 23.856446;
  const values = Object.fromEntries(Object.entries(jplElements).map(([p, c]) => [p, norm(c[0] + c[1] * centuries - j2000SiderealOffset)]));
  values.Sun = norm(values.Earth + 180);
  return values;
}
function grade(actual, row) {
  const delta = actual.virupas - row.expected;
  return { ...actual, expected: row.expected, deltaVirupas: delta, passesOriginalTolerance: Math.abs(delta) <= tolerance };
}
function intersection(a, b) {
  const answer = [];
  for (const [a0, a1] of a) for (const [b0, b1] of b) {
    const lo = Math.max(a0, b0), hi = Math.min(a1, b1);
    if (lo <= hi) answer.push([lo, hi]);
  }
  return answer;
}
function allowedShiftIntervals(row, baseline) {
  // For |shift| <= 7 days the short-arc mean/true branch is checked directly.
  // Inverting the folded kendra here is used only to disprove the proposition
  // that one date error explains all observations. No inferred offset is used
  // as an input to the engine or promoted as a correction.
  const planet = row.planet;
  const meanRate = isInner(planet) ? exactRates.Sun : exactRates[planet];
  const seeghrochaRate = isInner(planet) ? exactRates[planet] : exactRates.Sun;
  const slope = seeghrochaRate - meanRate / 2;
  const low = 3 * Math.max(0, row.expected - tolerance), high = 3 * (row.expected + tolerance);
  let intervals = [];
  for (let turns = -1; turns <= 1; turns++) for (const sign of [-1, 1]) {
    const endpoints = [(sign * low + 360 * turns - baseline.signedKendra) / slope,
      (sign * high + 360 * turns - baseline.signedKendra) / slope].sort((a, b) => a - b);
    intervals.push(...intersection([endpoints], [[-7, 7]]));
  }
  // Verify every interval's midpoint by fresh arithmetic, not the inverse.
  for (const [lo, hi] of intervals) {
    const shift = (lo + hi) / 2;
    const check = cheshta(norm(baseline.mean + meanRate * shift), row.trueLongitude,
      norm(baseline.seeghrocha + seeghrochaRate * shift));
    assert.ok(Math.abs(check.virupas - row.expected) <= tolerance + 1e-8);
  }
  return intervals;
}
const candidateDefinitions = [
  { id: 'retained_exact_rates', reason: 'Reproduce the verified baseline without importing its implementation.', kind: 'retained' },
  { id: 'published_truncated_daily_rates', reason: 'Test an independently published complete approximation across all six charts.', kind: 'external_approximation' },
  { id: 'jpl_fitted_elements_diagnostic', reason: 'Reject an apparently modern alternative unless it explains the whole evidence set; not classical means.', kind: 'unqualified_diagnostic' },
  { id: 'omit_ujjain_epoch_conversion', shift: -76 / 360, reason: 'Incorrectly treat the local 1900 epoch as UTC midnight.', kind: 'calendar_fault_probe' },
  { id: 'local_civil_time_misread_as_utc', shift: 5.5 / 24, reason: 'Input timezone error; all supplied references use UTC+5:30.', kind: 'calendar_fault_probe' },
  { id: 'epoch_noon_instead_of_midnight', shift: -0.5, reason: 'Confuse the astronomical noon day boundary with civil midnight.', kind: 'calendar_fault_probe' },
  { id: 'count_1900_as_a_leap_year', shift: 1, reason: 'Add a false leap day. Raman article89 explicitly excludes1900.', kind: 'calendar_fault_probe' },
  { id: 'omit_one_intervening_leap_day', shift: -1, reason: 'Omit one intervening Gregorian leap day.', kind: 'calendar_fault_probe' },
  { id: 'julian_epoch_gregorian_birth_mixture', shift: -12, reason: 'Interpret Jan1 1900 as Julian but the birth date as Gregorian.', kind: 'calendar_fault_probe' },
];
const results = input.accounts.map(account => {
  const retained = meansAt(account.utc);
  const baselineRows = account.rows.map(row => {
    const actual = fromMeanValues(retained.values, row);
    assert.ok(Math.abs(actual.virupas - row.priorActual) < 1e-8, `Baseline changed for ${account.date} ${row.planet}`);
    assert.ok(Math.abs(signedDifference(actual.mean, row.baseline.mean)) < 1e-7);
    assert.ok(Math.abs(signedDifference(actual.seeghrocha, row.baseline.seeghrocha)) < 1e-7);
    return actual;
  });
  const candidates = candidateDefinitions.map(candidate => {
    const values = candidate.id === 'published_truncated_daily_rates' ? meansAt(account.utc, truncatedRates).values
      : candidate.id === 'jpl_fitted_elements_diagnostic' ? jplDiagnostic(account.utc)
      : meansAt(account.utc, exactRates, candidate.shift ?? 0).values;
    const rows = account.rows.map(row => ({ planet: row.planet, ...grade(fromMeanValues(values, row), row) }));
    return { id: candidate.id, passed: rows.filter(r => r.passesOriginalTolerance).length, tested: rows.length,
      meanAbsoluteError: rows.reduce((n, r) => n + Math.abs(r.deltaVirupas), 0) / rows.length,
      rows };
  });
  const shiftConstraints = account.rows.map((row, i) => ({ planet: row.planet, allowedDays: allowedShiftIntervals(row, baselineRows[i]) }));
  const commonShiftDays = shiftConstraints.reduce((common, row) => intersection(common, row.allowedDays), [[-7, 7]]);
  return { date: account.date, utc: account.utc, software: account.software, source: account.source,
    referenceFrame: account.referenceFrame, computedFrame: account.computedFrame,
    daysSinceEpoch: retained.days, correctionYear: retained.correctionYear,
    candidates, shiftConstraints, commonShiftDays };
});
const allChartCommonShiftDays = results.reduce((common, account) => intersection(common, account.commonShiftDays), [[-7, 7]]);
const aggregate = candidateDefinitions.map(candidate => {
  const rows = results.flatMap(account => account.candidates.find(c => c.id === candidate.id).rows);
  return { ...candidate, passed: rows.filter(r => r.passesOriginalTolerance).length, tested: rows.length,
    meanAbsoluteError: rows.reduce((n, r) => n + Math.abs(r.deltaVirupas), 0) / rows.length,
    allPassed: rows.every(r => r.passesOriginalTolerance) };
});
assert.equal(results.length, 6);
assert.equal(aggregate[0].tested, 30);
assert.equal(allChartCommonShiftDays.length, 0, 'Unexpected evidence: investigate whether a common epoch error could fit every chart.');
const output = {
  schemaVersion: 1, baselineCommit: input.baselineCommit,
  inputSha256: crypto.createHash('sha256').update(inputBytes).digest('hex'),
  toleranceVirupas: tolerance, baselineReproduced: true,
  sources, frozenRates: { exactRates, truncatedRates },
  aggregate, results, allChartCommonShiftDays,
  conclusions: {
    acceptedReplacement: null,
    singleCalendarShiftExplainsAllReferences: false,
    sourceOfRemainingDiscrepancies: 'Unresolved vendor method, epoch, or printed-reference provenance; none of the tested substitutions establishes a generally valid repair.',
    publicEnabled: false, fullParityAccepted: false,
    permittedUse: 'Residual attribution and source/provenance diagnostics only; no score-based selection of algorithms.',
  },
};
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ outputPath, baselineReproduced: output.baselineReproduced,
  aggregate: aggregate.map(({ id, passed, tested, meanAbsoluteError }) => ({ id, passed, tested, meanAbsoluteError })),
  commonEpochShift: allChartCommonShiftDays, acceptedReplacement: null }, null, 2));

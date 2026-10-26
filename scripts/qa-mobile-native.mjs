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

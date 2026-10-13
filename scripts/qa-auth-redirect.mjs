import assert from "node:assert/strict";
import { safeInternalAuthPath } from "../lib/auth/safe-redirect.ts";

const cases = [
  [null, null],
  ["", null],
  ["dashboard", null],
  ["https://evil.example/", null],
  ["//evil.example", null],
  ["/\\evil.example", null],
  ["/%5cevil.example", null],
  ["javascript:alert(1)", null],
  ["/", "/"],
  ["/dashboard", "/dashboard"],
  ["/reports?id=123", "/reports?id=123"],
  ["/bookings#upcoming", "/bookings#upcoming"]
];
for (const [input, expected] of cases) {
  assert.equal(safeInternalAuthPath(input), expected, `redirect case: ${JSON.stringify(input)}`);
}
console.log(`AUTH_SAFE_REDIRECT_REGRESSION=${cases.length}/${cases.length}_PASS`);

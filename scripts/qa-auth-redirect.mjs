import assert from "node:assert/strict";
import { authNavigationHref, safeInternalAuthPath } from "../lib/auth/safe-redirect.ts";

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
  ["/bookings#upcoming", "/bookings#upcoming"],
  ["/one/..//example.invalid", null],
  ["/%2e%2e//example.invalid", null],
  ["/one/../%2fexample.invalid", null],
  ["/%2Fexample.invalid", null],
  ["/%252fexample.invalid", null],
  ["/%00example.invalid", null],
  ["/%0d%0aexample.invalid", null],
  ["/%7fexample.invalid", null],
  ["/foo/../reports", "/reports"],
  ["/reports?next=%2Fdashboard%3Fa%3D1", "/reports?next=%2Fdashboard%3Fa%3D1"],
  ["/reports?query=100%25", "/reports?query=100%25"],
  ["/reports?return=https://example.invalid", "/reports?return=https://example.invalid"],
  ["/reports/%E0%A4%B0", "/reports/%E0%A4%B0"],
  [["/dashboard","/reports"],null],
  [123,null],
  [{path:"/dashboard"},null],
  [false,null],
  [undefined,null]
];
for (const [input, expected] of cases) {
  assert.equal(safeInternalAuthPath(input), expected, `redirect case: ${JSON.stringify(input)}`);
}
console.log(`AUTH_SAFE_REDIRECT_REGRESSION=${cases.length}/${cases.length}_PASS`);

const resume="/reports?checkout=career#details";
for(const path of ["/login","/signup","/auth/login","/auth/signup","/auth/astrologer-login"]){
  const u=new URL(authNavigationHref(path,resume),"https://naksharix.invalid");
  assert.equal(u.origin,"https://naksharix.invalid");
  assert.equal(u.pathname,path);
  assert.equal(u.searchParams.get("redirectTo"),resume);
  assert.equal(authNavigationHref(path,"/one/..//example.invalid"),path);
}
assert.equal(authNavigationHref("/auth/login",null,"user"),"/auth/login?role=user");
assert.equal(new URL(authNavigationHref("/signup",resume,"professional"),"https://naksharix.invalid").searchParams.get("role"),"professional");
console.log("AUTH_CROSS_PAGE_CONTINUATION_CONTRACT_PASS");

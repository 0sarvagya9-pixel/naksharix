import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const src=readFileSync("components/schema-markup.tsx","utf8");
for(const value of ["https://schema.org/InStock", 'operatingSystem: "Web, iOS, Android"',"/search?q={search_term_string}","/chatbot", "AggregateOffer"]) {
  assert.ok(!src.includes(value),"UNSUPPORTED_STRUCTURED_CLAIM="+value);
}
for(const url of ["/pujas", "/shop", "/consultation", "/reports", "/kundli"]) {
  assert.ok(src.includes(url), "MISSING_PUBLIC_ROUTE_IN_SCHEMA="+url);
}
assert.ok(src.includes('@type": "WebApplication"'),"WEB_ONLY_APP_DESCRIPTION_REQUIRED");
console.log("PUBLIC_STRUCTURED_DATA_TRUTH=PASS;FAKE_IN_STOCK=NO;NATIVE_APP_CLAIM=NO");

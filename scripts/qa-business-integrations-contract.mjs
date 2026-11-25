import assert from "node:assert/strict";
import {canonicalWidgetOrigin,WIDGET_GRANT_MAX_AGE_SECONDS} from "../lib/business-integrations/widget-origin.ts";
assert.equal(canonicalWidgetOrigin("https://publisher.example"),"https://publisher.example");
for(const value of ["http://publisher.example","https://publisher.example/","https://publisher.example/path","https://publisher.example?x=1","https://user@publisher.example","https://publisher.example#x","https://publisher.example.evil/","null","https://*.example"])assert.equal(canonicalWidgetOrigin(value),null,value);
assert.equal(WIDGET_GRANT_MAX_AGE_SECONDS,300);
import {readFileSync} from "node:fs";
import {scopeSubset,scopeUnits,parseBusinessAuthorization,usageFits,usagePeriod,renderPanchangWidget,qualifyBusinessMatchingFactors,validPdfBrand} from "../lib/business-integrations/contract.ts";
assert.equal(scopeUnits("matching"),2);assert.equal(scopeUnits("chart"),1);assert.equal(scopeUnits("chart-pdf"),2);
assert.equal(scopeSubset(["chart-pdf"],["chart","matching"]),false);
assert.equal(scopeSubset(["chart"],["chart","matching"]),true);assert.equal(scopeSubset(["chart","chart"],["chart"]),false);assert.equal(scopeSubset(["matching"],["chart"]),false);
assert.ok(validPdfBrand("Licensed Partner"));for(const v of ["","A"," x","x ","a".repeat(81),"Unlicensed\u0000","हिंदी"])assert.equal(validPdfBrand(v),false);
const raw="nxk_"+"a".repeat(32)+"_"+"b".repeat(43);
assert.equal(parseBusinessAuthorization("Bearer "+raw).id,"a".repeat(32));
assert.equal(parseBusinessAuthorization("Basic "+raw),null);assert.equal(parseBusinessAuthorization(raw),null);assert.equal(parseBusinessAuthorization("Bearer "+raw+"x"),null);
assert.equal(usageFits(9,10,1),true);assert.equal(usageFits(9,10,2),false);assert.equal(usageFits(-1,10,1),false);assert.equal(usagePeriod(new Date("2027-01-01T00:00:00Z")),"2027-01");
const html=renderPanchangWidget({brand:"<script>alert(1)</script>",date:"2027-01-15",tithi:"Example",nakshatra:"Example",sunrise:null,sunset:null});
assert.ok(!html.includes("<script>"));assert.ok(html.includes("&lt;script&gt;"));assert.ok(html.includes("Powered by Naksharix"));
const read=p=>readFileSync(p,"utf8"),ledger=read("lib/business-integrations/ledger.ts"),route=read("app/api/partner/v1/calculate/route.ts"),middleware=read("middleware.ts");
assert.ok(ledger.includes("pg_advisory_xact_lock")&&ledger.includes("timingSafeEqual")&&ledger.includes("tenantId_requestId"));
assert.ok(route.includes('request.headers.get("authorization")')&&!route.includes("getCurrentUser"));
assert.ok(middleware.includes('request.nextUrl.pathname==="/api/partner/v1/calculate"&&request.method==="POST"'));
assert.ok(!ledger.includes("birthDetails")&&!ledger.includes("dateOfBirth"));
console.log("B2B_CONTRACT_FIXTURES_PASS;REAL_CONTRACT_AND_RUNTIME_ACCEPTANCE_PENDING");

const factors=["varna","vashya","tara","yoni","grahaMaitri","gana","bhakoot","nadi"].map((kootKey,i)=>({kootKey,koot:kootKey,name:kootKey,available:true,score:i+1,maxScore:i+1}));
assert.equal(qualifyBusinessMatchingFactors(factors,36)?.length,8);
assert.equal(qualifyBusinessMatchingFactors(factors.slice(1),35),null);
for(const patch of [{koot:undefined},{available:false},{score:NaN},{score:2},{maxScore:2},{kootKey:"nadi"},{kootKey:"constructor"}]){
 assert.equal(qualifyBusinessMatchingFactors([{...factors[0],...patch},...factors.slice(1)],36),null);
}
assert.equal(qualifyBusinessMatchingFactors(factors,35),null);
console.log("MATCHING_PROVIDER_BOUNDARY_FIXTURES_PASS");

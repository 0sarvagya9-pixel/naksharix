import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkPublicEndpoints } from "./ops/check-public-endpoints.mjs";

const read = path => readFileSync(path, "utf8");
const healthy = body => new Response(body, {status:200});
const pausedPuja = '<html><head><meta name="robots" content="noindex, follow"></head><body><section aria-labelledby="puja-coming-soon-heading"><h1 id="puja-coming-soon-heading">पूजा सेवाएँ जल्द आ रही हैं</h1><p>Coming Soon</p><p>नई पूजा बुकिंग और ऑनलाइन भुगतान उपलब्ध नहीं हैं।</p></section></body></html>';
const activePuja = '<html><head><meta name="robots" content="index, follow"></head><body><p>No upfront payment</p><h2 id="puja-catalogue-heading">Puja Directory</h2><a href="/puja-booking?item=ganesh">Request preferred date</a></body></html>';
const requestOnlyPuja=activePuja.replace("index, follow","noindex, follow").replace("<body>",'<body><main data-puja-mode="request-only">').replace("</body>",'<p>platform fee · request date without paying</p></main></body>');
const sitemap = "<urlset><url><loc>https://www.naksharix.com/shop</loc></url><url><loc>https://www.naksharix.com/reports</loc></url></urlset>";
const activeSitemap = sitemap.replace("</urlset>", "<url><loc>https://www.naksharix.com/pujas</loc></url><url><loc>https://www.naksharix.com/pujas/ganesh</loc></url></urlset>");
const fakeFetch = async url => {
  const path = new URL(url).pathname;
  if (path === "/api/health") return healthy(JSON.stringify({data:{status:"ok",checks:{app:"ok",database:"ok"}}}));
  if (path === "/api/release") return healthy(JSON.stringify({data:{environment:"production",branch:"complete-production-polish",commitSha:"a".repeat(40)}}));
  if (path === "/api/ops/readiness") return healthy(JSON.stringify({data:{
    environment:"production",services:{databaseSchema:{ready:true},email:{enabled:true},reportStorage:{enabled:true}}
  }}));
  if (path === "/ads.txt") return healthy("google.com, pub-7848529669366564, DIRECT, f08c47fec0942fa0");
  if (path === "/robots.txt") return healthy("User-agent: *\\nDisallow: /admin\\nDisallow: /api\\nSitemap: https://www.naksharix.com/sitemap.xml");
  if (path === "/sitemap.xml") return healthy(sitemap);
  if (path === "/shop") return healthy("<html><body>Spiritual Catalogue Add to cart</body></html>");
  if (path === "/pujas") return healthy(pausedPuja);
  if (path === "/reports") return healthy("<html><body>Premium Astrology Reports 15 clearly priced personalized reports</body></html>");
  return healthy("<html><body>"+("Naksharix authentic educational content ".repeat(35))+"</body></html>");
};
const paused = await checkPublicEndpoints(fakeFetch);
assert.equal(paused.passed, true, "Healthy paused site rejected");
assert.equal(paused.pujaState, "paused");
assert.equal(paused.results.length, 14);
const withPuja = (html, xml=sitemap, status=200) => async url => {
  const path = new URL(url).pathname;
  if (path === "/pujas") return new Response(html,{status});
  if (path === "/sitemap.xml") return healthy(xml);
  return fakeFetch(url);
};
const active = await checkPublicEndpoints(withPuja(activePuja,activeSitemap));
assert.equal(active.passed,true,"Verified request-first directory rejected");
assert.equal(active.pujaState,"active");
const requestOnly=await checkPublicEndpoints(withPuja(requestOnlyPuja,sitemap));
assert.equal(requestOnly.passed,true,"Owner-enabled unpaid request-only directory must be healthy while noindexed");
assert.equal(requestOnly.pujaState,"request-only");
for (const [label,html,xml,status] of [
  ["legacy direct booking","<html><body>Puja Directory Book Now</body></html>",sitemap,200],
  ["script-only placeholder",'<script>'+pausedPuja+'</script>',sitemap,200],
  ["missing noindex",pausedPuja.replace("noindex, follow","index, follow"),sitemap,200],
  ["paused payment/request CTA",pausedPuja.replace("</section>",'<a href="/puja-booking?item=ganesh">Request preferred date</a></section>'),sitemap,200],
  ["paused root indexed",pausedPuja,activeSitemap,200],
  ["paused detail indexed",pausedPuja,sitemap.replace("</urlset>",'<url><loc>https://www.naksharix.com/pujas/ganesh</loc></url></urlset>'),200],
  ["active missing sitemap root",activePuja,sitemap,200],
  ["active with noindex",activePuja.replace("index, follow","noindex, follow"),activeSitemap,200],
  ["request-only indexed metadata",requestOnlyPuja.replace("noindex, follow","index, follow"),sitemap,200],
  ["request-only indexed sitemap",requestOnlyPuja,activeSitemap,200],
  ["request-only detail indexed",requestOnlyPuja,sitemap.replace("</urlset>",'<url><loc>https://www.naksharix.com/pujas/ganesh</loc></url></urlset>'),200],
  ["request-only missing mode",requestOnlyPuja.replace(' data-puja-mode="request-only"',''),sitemap,200],
  ["request-only missing no-payment disclosure",requestOnlyPuja.replace("request date without paying","request date"),sitemap,200],
  ["request-only legacy payment CTA",requestOnlyPuja.replace("</main>","<button>Pay Now</button></main>"),sitemap,200],
  ["unknown mode",requestOnlyPuja.replace('data-puja-mode="request-only"','data-puja-mode="unknown"'),sitemap,200],
  ["contradictory active mode",requestOnlyPuja.replace('data-puja-mode="request-only"','data-puja-mode="active"'),sitemap,200],
  ["active missing request-first copy",activePuja.replace("No upfront payment","Pay upfront"),activeSitemap,200],
  ["public HTTP outage",pausedPuja,sitemap,503]
]) {
  const result=await checkPublicEndpoints(withPuja(html,xml,status));
  assert.equal(result.passed,false,"Wrongly accepted "+label);
}
const wrongSeller = await checkPublicEndpoints(async url =>
  new URL(url).pathname === "/ads.txt" ? healthy("google.com, pub-INVALID, DIRECT, f08c47fec0942fa0") : fakeFetch(url));
assert.equal(wrongSeller.passed,false,"Wrong advertising seller wrongly accepted");
const failingDatabase = await checkPublicEndpoints(async url =>
  new URL(url).pathname === "/api/health" ? healthy(JSON.stringify({data:{status:"degraded",checks:{app:"ok",database:"error"}}})) : fakeFetch(url));
assert.equal(failingDatabase.passed,false,"Database outage wrongly accepted");
const failingEmail=await checkPublicEndpoints(async url =>
  new URL(url).pathname==="/api/ops/readiness" ? healthy(JSON.stringify({data:{
    environment:"production",services:{databaseSchema:{ready:true},email:{enabled:false},reportStorage:{enabled:true}}
  }})) : fakeFetch(url));
assert.equal(failingEmail.passed,false,"Email adapter outage wrongly accepted");
const missingReportPricing=await checkPublicEndpoints(async url =>
  new URL(url).pathname==="/reports" ? healthy("<html>Fee confirmation required</html>") : fakeFetch(url));
assert.equal(missingReportPricing.passed,false,"Report catalogue regression wrongly accepted");
assert.ok(read("app/pujas/page.tsx").includes('mode={release.requestOnly?"request-only":"active"}'),"Puja monitor marker must come from authoritative server state");
assert.ok(read("components/puja/puja-services-directory.tsx").includes("data-puja-mode={mode}"),"Puja monitor marker must be rendered on real page");
const workflow = read(".github/workflows/free-public-uptime.yml");
const backup = read(".github/workflows/free-encrypted-db-backup.yml");
for(const required of ["schedule:","workflow_dispatch:","issues: write","gh issue create","gh issue close","check-public-endpoints.mjs"])
  assert.ok(workflow.includes(required), "Monitor missing: "+required);
// The independent GitHub age export must fail closed without its protected
// inputs, and must not run on a schedule until those inputs exist.
for(const required of ["workflow_dispatch:","secrets.BACKUP_DATABASE_URL","vars.BACKUP_AGE_RECIPIENT","postgres:17-alpine","age -r","retention-days: 7","if-no-files-found: error","set -euo pipefail"])
  assert.ok(backup.includes(required),"Manual encrypted-backup guard missing: "+required);
assert.ok(!backup.includes("  schedule:"),"Unconfigured independent encrypted export must not run on a schedule");
// GitHub's default-branch job now checks an actual encrypted, private
// clean-room recovery receipt and reuses the existing backup incident.
const recoveryWatch=read(".github/workflows/encrypted-recovery-watch.yml");
for(const required of ["schedule:","cron: '17 6 * * *'","workflow_dispatch:","issues: write","check-encrypted-recovery.mjs","gh issue create","gh issue close"])
  assert.ok(recoveryWatch.includes(required),"Encrypted-recovery watcher missing: "+required);
assert.ok(backup.includes("encrypted-backup/*.dump.age") && !backup.includes("encrypted-backup/*.dump\n"),
  "Only ciphertext may be uploaded");
assert.ok(!backup.includes("actions/cache"),"No production database caching");
assert.ok(read("scripts/ops/check-public-endpoints.mjs").includes("AbortSignal.timeout"),"Network timeout missing");
console.log("FREE_OPS_SOURCE_QA=PASS;OUTAGE_DETECTION=PASS;ENCRYPTED_ONLY=PASS;NO_FAKE_CONFIG=PASS");

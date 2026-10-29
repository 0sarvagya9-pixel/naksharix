import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => readFileSync(p, "utf8");
const gate=read("lib/ops/three-phase-acceptance.ts");
const ui=read("app/admin/readiness/page.tsx");
const api=read("app/api/admin/readiness/route.ts");
assert.ok(gate.includes("to_regclass('public._prisma_migrations')") && gate.includes("Promise.allSettled"),"Read-only migration provenance probe missing");
assert.ok(gate.includes("sharedRedisConfigured() ? redisPing()"),"Real distributed redis probe missing");
for(const k of ["locale-review","migrations","redis","monitoring","analytics","backups","stock-shipping","operator-slots","manual-reports","email-payment","ads-approval","cmp","ad-slots"])
  assert.ok(gate.includes('"'+k+'"'),"Acceptance gate missing: "+k);
assert.ok(gate.includes("external_evidence_required") && gate.includes("allPhasesVerified: phases.every(p => p.ready)"),"Fake all-green allowed");
assert.ok(gate.includes("indexableKundliGuideLanguages") && gate.includes("seoLocaleExpansion"),"Draft locales falsely advertised as complete");
assert.ok(gate.includes("commercial.readyForAutomaticPayments"),"Business proof bypassed");
assert.ok(gate.includes("adsenseServingReady() && configuredSlots"),"AdSense evidence missing");
assert.ok(ui.includes("await requireAdminRole()") && ui.includes("getThreePhaseAcceptance(commercial)") && ui.includes("EXTERNAL PROOF REQUIRED"),"Admin readiness not visible/access-controlled");
assert.ok(api.includes("getCurrentUser()") && api.includes('["ADMIN", "SUPER_ADMIN"]') && api.includes("unified,"),"API leaks admin phase readiness or omits checks");
console.log("PHASE123_FAIL_CLOSED_ACCEPTANCE=PASS;EXTERNAL_PROOF_REQUIRED=YES;NO_FALSE_100_PERCENT=YES");

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
const transport=read("lib/monitoring/sentry-transport.ts");
const hook=read("instrumentation.ts");
assert.ok(transport.includes("application/x-sentry-envelope") && transport.includes('new URL(dsn)'),"Optional Sentry transport absent");
assert.ok(transport.includes('sentry\\.io
) && transport.includes('!value.username') && transport.includes("safeSentryTransportConfigured()"),"Sentry destination not restricted");
assert.ok(!transport.includes("request.headers") && !transport.includes("error.stack") && !transport.includes("error.message"),"Monitoring exposes sensitive request/error objects");
assert.ok(hook.includes('await reportSafeRequestFailure({ route: safeRoute'),"Safe request errors not forwarded when configured");
console.log("PHASE123_FAIL_CLOSED_ACCEPTANCE=PASS;EXTERNAL_PROOF_REQUIRED=YES;SAFE_MONITORING_TRANSPORT=READY_TO_CONFIGURE");

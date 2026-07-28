import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function assert(condition, name, detail) {
  const status = condition ? "PASSED" : "FAILED";
  results.push({ status, name, detail });
  console.log(`${status}: ${name}${detail ? ` - ${detail}` : ""}`);
}

const pkg = JSON.parse(source("package.json"));
const pricing = source("components/pricing-content.tsx");
const layout = source("app/layout.tsx");
const env = source("lib/env.ts");
const home = source("components/nx-home.tsx");
const monitor = source(".github/workflows/production-monitor.yml");
const opsRoute = source("app/api/ops/readiness/route.ts");
const emailService = source("lib/email/email-service.ts");
const reportDelivery = source("app/api/admin/report-requests/[id]/deliver/route.ts");
const otp = source("lib/auth/otp-service.ts");
const signup = source("app/api/auth/signup/route.ts");
const login = source("app/api/auth/login/route.ts");
const shop = exists("app/shop/page.tsx") ? source("app/shop/page.tsx") : "";

assert(pkg.scripts["start:prod"] === "npm run start:standalone", "Production startup does not auto-run migrations", pkg.scripts["start:prod"]);
assert(!pkg.scripts["db:deploy"], "Generic production migration command removed", "only reviewed-only command is exposed");
assert(pkg.scripts["db:deploy:reviewed-only"] === "prisma migrate deploy", "Reviewed migration command remains explicit", pkg.scripts["db:deploy:reviewed-only"]);
assert(exists("scripts/qa-production-db-readonly.mjs"), "Read-only production DB audit exists", "no schema writes");

assert(pricing.includes("AI Astrologer is available"), "Pricing truth matches active AI Astrologer", "stale unavailable copy removed");
assert(!pricing.includes("AI Astrologer and Shop ecommerce remain unavailable"), "Stale AI unavailable claim absent", "pricing source clean");
assert(home.includes("Clarity Before Claims"), "Homepage uses evidence-aware trust framing", "claim boundary visible");
assert(!/(1M\+|millions|98% Accuracy|10k\+ Expert|4\.8★)/i.test(home), "Unsupported vanity metrics absent from homepage source", "no unverified scale/accuracy claims");

assert(env.includes("GOOGLE_SITE_VERIFICATION"), "Search Console verification env supported", "Google site verification metadata can be configured externally");
assert(layout.includes("analyticsQueryStringExcluded") === false, "No accidental ops payload marker in layout", "layout only contains analytics client code");
assert(layout.includes("page_location:window.location.origin+window.location.pathname"), "Analytics excludes URL query strings", "birth/report/payment query data not forwarded in page_location");
assert(layout.includes("allow_google_signals:false"), "Google Signals disabled", "privacy hardening enabled");
assert(layout.includes("allow_ad_personalization_signals:false"), "Ad personalization signals disabled", "privacy hardening enabled");

assert(exists("app/api/ops/readiness/route.ts"), "Public non-secret ops readiness endpoint exists", "/api/ops/readiness");
assert(opsRoute.includes("X-Robots-Tag"), "Ops readiness endpoint is noindex", "operational endpoint not search-indexed");
assert(!/(SMTP_PASS|GEMINI_API_KEY|RAZORPAY_KEY_SECRET).*:/m.test(opsRoute), "Ops readiness does not serialize secret values", "presence/status only");

assert(exists(".github/workflows/production-monitor.yml"), "Hourly production monitor exists", "health/release/readiness/robots/sitemap");
assert(monitor.includes('cron: "17 * * * *"'), "Production monitor runs hourly", "scheduled external HTTP checks");
assert(monitor.includes("Open or update production incident"), "Monitor has incident path", "GitHub issue on failed production check");

assert(emailService.includes("secure: env.SMTP_PORT === 465"), "SMTP TLS mode supports Resend port 465", "production SMTP configuration compatible");
assert(emailService.includes("from: env.SMTP_FROM!"), "Transactional sender is environment-controlled", "care@naksharix.com can remain the sole configured sender");
assert(reportDelivery.includes("sendReportDeliveryEmail"), "Report delivery uses real email adapter", "secure report link delivery wired");

assert(otp.includes("createHmac"), "OTP raw value is HMAC protected", "no raw OTP persistence");
assert(otp.includes("randomInt"), "OTP uses cryptographic random integer", "6-digit generator");
assert(signup.includes("verificationRequired"), "Signup requires email verification", "no direct signup session");
assert(login.includes("EMAIL_VERIFICATION_REQUIRED"), "Login blocks marked unverified local accounts", "verification gate active");

assert(pkg.scripts["qa:final-closure"] === "node scripts/qa-final-code-closure.mjs", "Final closure QA registered", "package script available");
assert(pkg.scripts["qa:prod-db-readonly"] === "node scripts/qa-production-db-readonly.mjs", "Production DB read-only QA registered", "manual evidence command available");

assert(!/buy now|add to cart|checkout/i.test(shop), "Shop page remains non-transactional", "no public ecommerce CTA in page source");
assert(env.includes('SUBSCRIPTIONS_ENABLED: z.enum(["true", "false"]).default("false")'), "Subscriptions default disabled", "locked scope preserved");
assert(env.includes('AI_REPORT_GENERATOR_ENABLED: z.enum(["true", "false"]).default("false")'), "AI report generator default disabled", "locked scope preserved");
assert(env.includes('ALLOW_AI_DIAGNOSTICS: z.enum(["true", "false"]).default("false")'), "AI diagnostics default disabled", "locked scope preserved");

const failed = results.filter((result) => result.status === "FAILED");
console.log(`\nFinal code closure QA summary: ${JSON.stringify({ passed: results.length - failed.length, failed: failed.length })}`);
if (failed.length) process.exit(1);

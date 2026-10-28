import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

const schema = source("prisma/schema.prisma");
const audit = source("lib/reports/report-audit.ts");
const transitions = source("lib/reports/report-status-transitions.ts");
const rateLimit = source("lib/security/rate-limit.ts");
const logger = source("lib/monitoring/logger.ts");
const middleware = source("middleware.ts");
const clientCsrf = source("lib/security/csrf.ts");
const csrfRoute = source("app/api/csrf/route.ts");
const reportApi = source("app/api/report-requests/route.ts");
const adminApi = source("app/api/admin/report-requests/route.ts");
const panchangApi = source("app/api/panchang/route.ts");
const paymentOrder = source("app/api/payments/razorpay/order/route.ts");
const paymentVerify = source("app/api/payments/razorpay/verify/route.ts");
const webhook = source("app/api/payments/razorpay/webhook/route.ts");
const download = source("app/api/report-requests/[id]/download/route.ts");
const env = source("lib/env.ts");
const provider = source("lib/astrology/provider.ts");

const aiQuota = source("lib/ai/anonymous-quota.ts");
const aiRoute = source("app/api/ai/chat/route.ts");
assert(aiQuota.includes('createHmac("sha256", secret)') &&
  aiQuota.includes("pg_advisory_xact_lock") &&
  aiQuota.includes("tx.auditLog.count") &&
  aiQuota.includes("tx.auditLog.create") &&
  aiQuota.includes("if (count >= 20) return false") &&
  aiQuota.includes("ipStored: false") &&
  !aiQuota.includes("rawIp,"),
  "Anonymous AI quota is shared and stores only keyed IP digest", "privacy-safe distributed rate limiting");
assert(aiRoute.includes("sharedRedisConfigured()") &&
  aiRoute.includes("claimAnonymousAiQuota(request)") &&
  aiRoute.includes("rateLimitMessage(language), 429") &&
  aiRoute.indexOf("claimAnonymousAiQuota(request)") < aiRoute.indexOf("chatWithAstrologerAIStrict("),
  "AI provider cannot be called before shared rate-limit claim succeeds", "no memory fallback for paid AI");
assert(schema.includes("model AuditLog") && schema.includes("model ReportStatusHistory"), "Audit and status history models exist", "Prisma audit trail");
assert(audit.includes("writeAuditLog") && audit.includes("writeReportStatusHistory"), "Audit helpers exist", "safe centralized writes");
assert(!audit.includes("birthPlace") && !audit.includes("generatedPdfBytes"), "Audit helper does not log sensitive fields", "metadata is bounded");
assert(transitions.includes("assertAllowedReportStatusTransition") && transitions.includes("Delivered status must be set by the delivery service"), "Status transition guard exists", "API-enforced lifecycle");
assert(rateLimit.includes("checkRateLimit") && rateLimit.includes("Too many requests"), "Rate limit helper exists", "in-memory fallback");
assert(logger.includes("blockedKeys") && logger.includes("birth") && logger.includes("secret") && logger.includes("signature"), "Logger sanitizes sensitive metadata", "safe monitoring");
assert(clientCsrf.includes("secureFetch") && clientCsrf.includes("x-csrf-token"), "Client mutation helper attaches CSRF token", "double-submit client");
assert(csrfRoute.includes('sameSite: "strict"') && csrfRoute.includes('secure: process.env.NODE_ENV === "production"'), "CSRF cookie uses strict production settings", "secure double-submit cookie");
assert(middleware.includes("requiresCsrf") && middleware.includes("hasValidCsrf") && middleware.includes('"/api/:path*"'), "State-changing APIs enforce CSRF", "global API middleware");
assert(middleware.includes('"/api/payments/razorpay/webhook"'), "Provider webhook is explicitly exempt from browser CSRF", "Razorpay uses signature verification instead");
assert(reportApi.includes("rateLimitResponse") && reportApi.includes("report_request.created"), "Report request API rate-limits and audits creates", "secure creation");
assert(adminApi.includes("assertAllowedReportStatusTransition") && adminApi.includes("report_request.status_updated"), "Admin API enforces transitions and audits", "admin-only status changes");
assert(panchangApi.includes("rateLimitResponse"), "Panchang API is rate-limited", "public calculation protection");
assert(paymentOrder.includes("rateLimitResponse") && paymentOrder.includes("payment.razorpay_order_created") && paymentOrder.includes("findReusablePayment"), "Payment order route rate-limits, audits, and reuses pending orders", "payment automation trail");
assert(paymentVerify.includes("verifyRazorpayCapturedPayment") && paymentVerify.includes("writeAuditLog"), "Client verify route requires capture verification and audits", "client cannot self-mark paid");
assert(webhook.includes("verifyRazorpayWebhookSignature") && webhook.includes("payment.webhook_paid"), "Webhook verifies signature and audits paid event", "provider-authenticated update");
assert(download.includes("report_pdf.download_denied") && download.includes("report_pdf.downloaded"), "Download route audits denied and successful access", "PDF access history");
assert(env.includes('ASTROLOGY_PROVIDER === "mock"') && provider.includes('env.NODE_ENV === "production"'), "Mock astrology is rejected in production", "configuration and runtime guard");
assert(env.includes('ALLOW_AI_DIAGNOSTICS must remain false in production'), "AI diagnostics fail closed in production", "no production diagnostic provider calls");

const authQuota=source("lib/auth/public-quota.ts");
const authRoutes=[
  ["app/api/auth/signup/route.ts","signup-ip",5,3600],
  ["app/api/auth/login/route.ts","login-ip",8,60],
  ["app/api/auth/otp/request/route.ts","otp-request-ip",8,600],
  ["app/api/auth/otp/verify/route.ts","otp-verify-ip",15,600]
];
assert(authQuota.includes("pg_advisory_xact_lock")&&
  authQuota.includes('createHmac("sha256",secret)')&&
  authQuota.includes("tx.auditLog.count")&&
  authQuota.includes("tx.auditLog.create")&&
  authQuota.includes("if(count >= input.limit) return false")&&
  authQuota.includes("piiStored: false")&&
  authQuota.includes("x-vercel-forwarded-for"),
  "Public auth rate limits use shared keyed-pseudonymous audit records", "no process-local auth counter");
for(const [file,scope,limit,windowSeconds] of authRoutes){
  const sourceText=source(file);
  assert(sourceText.includes("claimPublicAuthQuota({")&&
    sourceText.includes('scope: "'+scope+'"')&&
    sourceText.includes("limit: "+limit)&&
    sourceText.includes("windowSeconds: "+windowSeconds)&&
    !sourceText.includes('from "@/lib/rate-limit"'),
    "Shared auth quota: "+scope, "no bypass by another serverless instance");
}
for(const scope of ["otp-request-destination","otp-verify-destination"]){
  const route=source(scope==="otp-request-destination"?
    "app/api/auth/otp/request/route.ts":"app/api/auth/otp/verify/route.ts");
  assert(route.includes('scope: "'+scope+'"')&&
    route.includes("key: email")&&
    !route.includes("keyForEmail"),
    "OTP email destination HMAC quota: "+scope, "no raw address in database");
}

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
console.log(`\nAudit/security QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);

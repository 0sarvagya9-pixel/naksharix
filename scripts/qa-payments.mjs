import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

const razorpayOrder = source("app/api/payments/razorpay/order/route.ts");
const razorpayReadiness = source("lib/payments/readiness.ts");
const paymentSuccess = source("app/payment/success/page.tsx");
const paymentVerify = source("app/api/payments/razorpay/verify/route.ts");
const paymentWebhook = source("app/api/payments/razorpay/webhook/route.ts");
const pricing = source("lib/reports/pricing.ts");
const stripeCheckout = source("app/api/payments/stripe/checkout/route.ts");
const paymentAudit = source("docs/payment-readiness-audit.md");
const reportsContent = source("components/reports-content.tsx");

assert(razorpayReadiness.includes("NEXT_PUBLIC_RAZORPAY_KEY_ID") && razorpayReadiness.includes("RAZORPAY_WEBHOOK_SECRET"), "Razorpay readiness validates required env", "checkout disabled until env is complete");
assert(razorpayOrder.includes("getRazorpayReadiness") && razorpayOrder.includes("return fail(readiness.reason, 503)"), "Razorpay route has disabled readiness fallback", "no provider/env means no checkout");
assert(razorpayOrder.includes("reportRequestId") && razorpayOrder.includes("getReportPricing"), "Razorpay order can link real report requests to server pricing", "client amount is not trusted");
assert(stripeCheckout.includes("if (!stripe) return fail(\"Payments coming soon\", 503)"), "Stripe route has disabled fallback", "no provider means no checkout");
assert(pricing.includes("reportPricing") && pricing.includes("paidReports.map"), "Server-owned report pricing source exists", "report prices central");
assert(paymentVerify.includes("verifyRazorpayCapturedPayment") && paymentVerify.includes("ReportPaymentStatus.PAID"), "Client verify requires captured payment before report paid status", "no client-only paid state");
assert(paymentWebhook.includes("verifyRazorpayWebhookSignature") && paymentWebhook.includes("ReportPaymentStatus.PAID"), "Webhook verifies signature before paid workflow update", "provider-authenticated paid state");
assert(paymentSuccess.includes("params.paymentId") && paymentSuccess.includes("providerPaymentId") && paymentSuccess.includes("status === \"PAID\""), "Payment success page requires verified paid DB state", "no query-only fake success");
assert(paymentSuccess.includes("redirect(\"/dashboard\")"), "Payment success redirects unverified users", "no fake success screen");
assert(paymentAudit.includes("Payment routes and dependencies exist"), "Payment readiness audit exists", "docs/payment-readiness-audit.md");
assert(!reportsContent.includes("Pay Now") && !reportsContent.includes("Buy Now"), "Reports catalogue has no pay/buy CTA", "no public payment activation");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nPayment QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

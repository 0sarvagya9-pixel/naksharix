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

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

const razorpayOrder = source("app/api/payments/razorpay/order/route.ts");
const razorpayReadiness = source("lib/payments/readiness.ts");
const paymentSuccess = source("app/payment/success/page.tsx");
const paymentVerify = source("app/api/payments/razorpay/verify/route.ts");
const paymentWebhook = source("app/api/payments/razorpay/webhook/route.ts");
const revenue = source("lib/revenue.ts");
const pricing = source("lib/reports/pricing.ts");
const checkoutButton = source("components/razorpay-checkout-button.tsx");

assert(razorpayReadiness.includes("NEXT_PUBLIC_RAZORPAY_KEY_ID") && razorpayReadiness.includes("RAZORPAY_WEBHOOK_SECRET"), "Razorpay readiness validates required env", "checkout disabled until env is complete");
assert(razorpayReadiness.includes('scope: "one_merchant_for_reports_consultations_confirmed_puja_and_shop"') && razorpayReadiness.includes("merchantKeyPairMatches"), "Razorpay readiness covers active services", "all categories use one matching Razorpay key pair");
assert(razorpayOrder.includes("getRazorpayReadiness") && razorpayOrder.includes("return fail(readiness.reason, 503)"), "Razorpay route has disabled readiness fallback", "no provider/env means no checkout");
assert(razorpayOrder.includes('purpose: z.literal("CONSULTATION")') && razorpayOrder.includes("booking.userId !== userId"), "Consultation checkout is server-owned", "booking ownership and price are resolved on the server");
assert(razorpayOrder.includes("reportRequestId") && razorpayOrder.includes("getReportPricing"), "Razorpay order links real report requests to server pricing", "client amount is not trusted");
assert(razorpayOrder.includes("rateLimitResponse") && razorpayOrder.includes("payment.razorpay_order_created"), "Razorpay order is rate-limited and audited", "payment creation trail");
assert(pricing.includes("reportPricing") && pricing.includes("paidReports.map"), "Server-owned report pricing source exists", "report prices are central");
assert(paymentVerify.includes("verifyRazorpayCapturedPayment") && paymentVerify.includes("ReportPaymentStatus.PAID"), "Client verify requires captured payment before report paid status", "no client-only paid state");
assert(paymentVerify.includes('data: { status: "CONFIRMED", paymentStatus: "PAID" }'), "Client verify confirms consultation only after captured payment", "booking payment state is linked");
assert(paymentWebhook.includes("verifyRazorpayWebhookSignature") && paymentWebhook.includes("ReportPaymentStatus.PAID"), "Webhook verifies signature before paid workflow update", "provider-authenticated paid state");
assert(revenue.includes("payment.providerPaymentId === providerPaymentId ? payment : null") && revenue.includes("prisma.$transaction") && revenue.includes("status: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] }"), "Paid finalization is idempotent, identity-bound and transactional", "duplicate and stale callbacks cannot replace paid/refunded entitlements");
assert(paymentSuccess.includes("params.paymentId") && paymentSuccess.includes("providerPaymentId") && paymentSuccess.includes('status === "PAID"'), "Payment success page requires verified paid DB state", "no query-only fake success");
assert(paymentSuccess.includes('redirect("/dashboard")'), "Payment success redirects unverified users", "no fake success screen");
assert(checkoutButton.includes("Razorpay") && checkoutButton.includes("/api/payments/razorpay/order") && checkoutButton.includes("/api/payments/razorpay/verify"), "Checkout UI uses Razorpay order and verification routes", "active provider flow");

for (const legacyStripeFile of [
  "app/api/payments/stripe/checkout/route.ts",
  "app/api/payments/stripe/webhook/route.ts",
  "app/api/reports/checkout/route.ts",
  "lib/payments/stripe.ts",
  "components/paid-report-checkout.tsx"
]) {
  assert(!exists(legacyStripeFile), `Legacy payment path removed: ${legacyStripeFile}`, "no stale Stripe or coming-soon checkout path");
}

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nPayment QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);

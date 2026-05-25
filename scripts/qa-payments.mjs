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
const stripeCheckout = source("app/api/payments/stripe/checkout/route.ts");
const paymentAudit = source("docs/payment-readiness-audit.md");
const reportsContent = source("components/reports-content.tsx");

assert(razorpayOrder.includes("if (!razorpay) return fail(\"Payments coming soon\", 503)"), "Razorpay route has disabled fallback", "no provider means no checkout");
assert(stripeCheckout.includes("if (!stripe) return fail(\"Payments coming soon\", 503)"), "Stripe route has disabled fallback", "no provider means no checkout");
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

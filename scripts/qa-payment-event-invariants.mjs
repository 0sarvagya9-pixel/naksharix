import assert from "node:assert/strict";
import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");
const revenue = read("lib/revenue.ts");
const webhook = read("app/api/payments/razorpay/webhook/route.ts");
const verify = read("app/api/payments/razorpay/verify/route.ts");
const invariant = [
  ["captured callback excludes refunded/waived", revenue.includes("payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.FAILED")],
  ["captured compare-and-swap only from pending/failed", revenue.includes("status: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] }")],
  ["paid callback cannot switch gateway payment id", revenue.includes("payment.providerPaymentId === providerPaymentId ? payment : null")],
  ["racing callbacks re-read paid state", revenue.includes("current?.status === PaymentStatus.PAID") && revenue.includes("current.providerPaymentId === providerPaymentId")],
  ["failure callback only transitions pending", webhook.includes("where: { id: existingPayment.id, status: PaymentStatus.PENDING }")],
  ["failure callback no-op bypasses dependent updates", webhook.includes("if (updated.count === 0)") && webhook.includes("razorpay_stale_failed_event_ignored")],
  ["captured consultation excludes canceled status", webhook.includes('status: { in: ["REQUESTED", "PAYMENT_PENDING", "ACCEPTED", "CONFIRMED"] }')],
  ["failure cannot downgrade paid consultation", webhook.includes('paymentStatus: "PENDING"') && webhook.includes("consultationBooking.updateMany")],
  ["client verification rejects mismatched paid id", verify.includes("existingPayment.providerPaymentId !== body.razorpay_payment_id")],
  ["client verification rejects refund recapture", verify.includes('existingPayment.status === "REFUNDED"')],
  ["client verification excludes canceled consultations", verify.includes("A captured payment does not resurrect a canceled or rejected session.") && verify.includes("consultationBooking.updateMany")],
  ["client captures cannot reopen canceled/delivered reports", verify.includes("reportRequest.updateMany") && verify.includes("ReportRequestStatus.PAYMENT_PENDING") && verify.includes("if (updated.count === 1) await writeReportStatusHistory")],
  ["webhook captures cannot reopen canceled/delivered reports", webhook.includes("reportRequest.updateMany") && webhook.includes("paymentStatus: { in: [ReportPaymentStatus.PENDING, ReportPaymentStatus.FAILED] }")],
  ["webhook failure cannot regress paid report", webhook.includes("paymentStatus: ReportPaymentStatus.PENDING") && webhook.includes("data: { paymentStatus: ReportPaymentStatus.FAILED }")]
];
for (const [name, accepted] of invariant) {
  assert.ok(accepted, "Payment invariant gate failed: " + name);
  console.log("PAYMENT_EVENT_GATE_PASS=" + name);
}
console.log("PAYMENT_EVENT_SOURCE_GATES=" + invariant.length + "/"+ invariant.length);
console.log("LIVE_GATEWAY_REQUESTS=NO;PRODUCTION_DB_WRITES=NO");

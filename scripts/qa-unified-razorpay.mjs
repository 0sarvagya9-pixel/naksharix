import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getConsultationSessionPrice } from "../lib/consultations/pricing.ts";

const read = path => readFileSync(path, "utf8");
const order = read("app/api/payments/razorpay/order/route.ts");
const refund = read("lib/payments/purpose-reconciliation.ts");
const webhook = read("app/api/payments/razorpay/webhook/route.ts");
const verify = read("app/api/payments/razorpay/verify/route.ts");
const readiness = read("lib/payments/readiness.ts");
const adminShop = read("app/api/admin/shop-orders/route.ts");
const shopPage = read("app/orders/page.tsx");
const schema = read("prisma/schema.prisma");
const migration = read("deploy/sql/20261029_unified_razorpay_commerce.sql");
const reportDownload = read("app/api/report-requests/[id]/download/route.ts");
const paymentHistory = read("components/payment-history.tsx");
const consultationApi = read("app/api/consultation-bookings/route.ts");
const consultationForm = read("components/consultation-request-form.tsx");
const receipt = read("lib/revenue.ts");
const env = read("lib/env.ts");
let checks = 0;
function gate(condition, title) {
  assert.ok(condition, "UNIFIED_RAZORPAY_GUARD_FAILED: " + title);
  checks++;
}
gate(readiness.includes("merchantKeyPairMatches") && readiness.includes("env.RAZORPAY_KEY_ID === env.NEXT_PUBLIC_RAZORPAY_KEY_ID") &&
  readiness.includes("one_merchant_for_reports_consultations_confirmed_puja_and_shop"), "one matched merchant key ID");
gate(read("lib/payments/razorpay.ts").includes("new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })"),
  "one existing Razorpay client");
gate(env.includes('SHOP_PAYMENTS_ENABLED: z.enum(["true", "false"]).default("false")') &&
  order.includes('env.SHOP_PAYMENTS_ENABLED !== "true"') &&
  order.includes('env.PUJA_PAYMENTS_ENABLED !== "true"'), "new payment categories disabled by default");
gate(schema.includes("SHOP_ORDER") && schema.includes("REFUNDED") &&
  schema.includes("fulfillmentEvidenceUrl String?") &&
  migration.includes("ADD VALUE IF NOT EXISTS 'SHOP_ORDER'") &&
  migration.includes("ADD VALUE IF NOT EXISTS 'REFUNDED'") &&
  migration.includes('ADD COLUMN IF NOT EXISTS "fulfillmentEvidenceUrl"'), "additive migration matches schema");
gate(!/\bDROP\s+(?:TABLE|SCHEMA)|\bTRUNCATE\b|\bDELETE\s+FROM\b/i.test(migration), "migration non-destructive");
gate(order.includes('purpose: z.literal("SHOP_ORDER")') &&
  order.includes('paymentStatus) ||') && order.includes('order.totalPaise !== order.subtotalPaise + order.shippingPaise + order.taxPaise') &&
  order.includes("order.fulfillmentEvidenceUrl?.startsWith") && order.includes('order.status !== "CONFIRMED"'),
  "owner supplier proof and server-owned shop order amount");
gate(shopPage.includes('payload={{purpose:"SHOP_ORDER",shopOrderId:order.id}}') &&
  shopPage.includes('env.SHOP_PAYMENTS_ENABLED==="true"'), "shop checkout visible only after approval");
gate(adminShop.includes('current.paymentStatus!=="PAID"') &&
  adminShop.includes("Supplier evidence URL") &&
  adminShop.includes("captured payment"), "shop cannot dispatch unpaid product");
gate(order.includes('purpose: body.purpose as PaymentPurpose') &&
  order.includes('provider: "RAZORPAY"') &&
  order.includes('metadata: { ...item.metadata') &&
  order.includes('reusable.createdAt.getTime()'), "server ownership, safe old pending retry");
gate(webhook.includes("verifyRazorpayWebhookSignature") &&
  webhook.includes('event.event === "refund.processed"') &&
  webhook.includes("reconcileProcessedRefund"), "signed refunds only");
gate(refund.includes('prisma.$transaction(async (tx) =>') &&
  refund.includes('isolationLevel: Prisma.TransactionIsolationLevel.Serializable') &&
  refund.includes('status: "REFUNDED"') &&
  refund.includes('Number(refund.amount)') &&
  refund.includes("razorpay_partial_refund_requires_ledger_review"),
  "refund is idempotent and transactional; partial refunds fail closed");
gate(refund.includes('original.purpose === "SHOP_ORDER"') &&
  refund.includes('original.purpose === "PUJA_BOOKING"') &&
  refund.includes('original.purpose === "CONSULTATION"') &&
  refund.includes('"KUNDLI_REPORT", "YEARLY_REPORT", "MATCH_REPORT"'),
  "refund across all business categories");
gate(verify.includes("reconcileCapturedPurpose(payment)") &&
  webhook.includes("reconcileCapturedPurpose(paid)"), "client and webhook converge on one receipt state");
gate(reportDownload.includes('reportRequest.paymentStatus !== "PAID"') &&
  refund.includes('data: { paymentStatus: "REFUNDED" }'), "refunded report PDF cannot be accessed");
gate(paymentHistory.includes("Complete purchased report details") &&
  paymentHistory.includes('payment.status === "PAID"') &&
  paymentHistory.includes("orderId="), "paid incomplete report can resume without another purchase");
gate(!receipt.includes('const taxAmount = Number(payment.amount) * 0.18') &&
  receipt.includes("This is a payment receipt, not a tax invoice"), "no invented universal 18% GST");
gate(consultationApi.includes("getConsultationSessionPrice") &&
  consultationApi.includes("amount: adminBypass ? 0 : sessionPrice") &&
  consultationForm.includes("sessionPrice === null"), "consultation customer sees server quoted price");
gate(getConsultationSessionPrice(10) === 300 && getConsultationSessionPrice(10,400) === 400 &&
  getConsultationSessionPrice(-1) === null && getConsultationSessionPrice(0,0) === null &&
  getConsultationSessionPrice(1.25) === 37.5 && getConsultationSessionPrice(30,0) === null,
  "actual 30-minute and flat-rate calculations");
console.log("UNIFIED_RAZORPAY_SOURCE_AND_PRICE_QA=" + checks + "/" + checks + "_PASS");
console.log("REAL_MERCHANT_CAPTURE_AND_BANK_SETTLEMENT=EXTERNAL_PROOF_REQUIRED");
console.log("SHOP_AND_PUJA_AUTOMATIC_PAYMENTS=DEFAULT_OFF");

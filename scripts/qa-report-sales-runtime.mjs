import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import Module, { createRequire } from "node:module";
import path from "node:path";

const db = new URL(process.env.DATABASE_URL || "postgresql://invalid/invalid");
assert.ok(process.env.CI === "true" && process.env.VERCEL_ENV !== "production" &&
  ["postgresql:", "postgres:"].includes(db.protocol) &&
  ["localhost", "127.0.0.1"].includes(db.hostname) && db.pathname === "/naksharix",
  "Only a disposable loopback naksharix database is permitted");

const require = createRequire(import.meta.url);
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.startsWith("@/") ? path.resolve(name.slice(2)) : name, ...args);
};
const ts = require("typescript");
require.extensions[".ts"] = function (module, file) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  module._compile(outputText, file);
};
const { PrismaClient } = require("@prisma/client");
const { countLiveReportOrders } = require("@/lib/analytics/report-sales");
const client = new PrismaClient();
const prefix = randomUUID();
const rollback = new Error("rollback synthetic fixtures");
try {
  await assert.rejects(client.$transaction(async tx => {
    const baseline = await countLiveReportOrders(tx);
    const user = await tx.user.create({ data: { email: prefix + "@example.invalid", name: "Fixture" } });
    const admin = await tx.user.create({ data: { email: prefix + "-ops@example.invalid", name: "Ops fixture", role: "ADMIN" } });
    const capture = { analyticsLiveOrder: true, gatewayStatus: "captured", reportId: "kundli-pro" };
    async function order(patch = {}, entitlement = true) {
      const id = randomUUID();
      const payment = await tx.payment.create({ data: {
        userId: user.id, provider: "RAZORPAY", purpose: "KUNDLI_REPORT", status: "PAID",
        amount: 799, currency: "INR", providerOrderId: "order_" + id, providerPaymentId: "pay_" + id,
        metadata: capture, ...patch
      } });
      if (entitlement) await tx.purchasedReport.create({ data: {
        userId: payment.userId, paymentId: payment.id, reportType: payment.purpose, title: "Fixture"
      } });
      return payment;
    }
    const retained = await order();
    const refunded = await order();
    await order({ userId: admin.id });
    await order({ status: "PENDING" });
    await order({ metadata: { ...capture, analyticsLiveOrder: false } });
    await order({ purpose: "PUJA_BOOKING" }, false);
    await order({ metadata: { ...capture, reportId: "health-report" } });
    await order({ metadata: { reportId: "kundli-pro", gatewayStatus: "captured" } });
    await order({}, false);
    const two = { captured: baseline.captured + 2, review: baseline.review + 3 };
    assert.deepEqual(await countLiveReportOrders(tx), two);
    assert.deepEqual(await countLiveReportOrders(tx), two);
    await tx.auditLog.create({ data: { action: "payment.razorpay_refund_processed_receipt",
      targetType: "RazorpayPayment", targetId: refunded.providerPaymentId, metadata: { amountPaise: 100 } } });
    assert.deepEqual(await countLiveReportOrders(tx), { ...two, captured: two.captured - 1 });
    await tx.payment.update({ where: { id: retained.id }, data: { status: "REFUNDED" } });
    assert.deepEqual(await countLiveReportOrders(tx), { ...two, captured: baseline.captured });
    throw rollback;
  }, { isolationLevel: "RepeatableRead" }), error => error === rollback);
  console.log("PASS: 9 isolated payment cases, repeat reads, partial signed refund, and full refund. Fixtures rolled back.");
} finally {
  await client.$disconnect();
}

import "server-only";
import { Prisma, type Payment } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";
import { writeAuditLog } from "@/lib/reports/report-audit";

/** One-gateway post-capture state reconciliation. Idempotent; never reopens canceled work. */
export async function reconcileCapturedPurpose(payment: Payment) {
  const meta = (payment.metadata as Record<string, unknown> | null) ?? {};
  if (payment.status !== "PAID") return;
  if (payment.purpose === "SHOP_ORDER" && typeof meta.shopOrderId === "string") {
    await prisma.shopOrder.updateMany({
      where: {
        id: meta.shopOrderId, userId: payment.userId,
        status: "CONFIRMED", paymentStatus: { in: ["UNPAID", "FAILED"] },
        totalPaise: Math.round(Number(payment.amount) * 100)
      },
      data: { paymentStatus: "PAID" }
    });
  }
  if (payment.purpose === "CONSULTATION" && typeof meta.bookingId === "string") {
    await prisma.consultationBooking.updateMany({
      where: {
        id: meta.bookingId, userId: payment.userId,
        status: { in: ["REQUESTED", "PAYMENT_PENDING", "ACCEPTED", "CONFIRMED"] },
        paymentStatus: { in: ["PENDING", "FAILED"] }
      },
      data: { status: "CONFIRMED", paymentStatus: "PAID" }
    });
  }
  // Puja has no separate payment-status field; the Payment ledger is authoritative.
  // Never mutate a Puja booking's appointment/partner details on a callback.
}

/** Only signed Razorpay refund.processed with the exact FULL original amount
 * may change entitlements. A partial refund requires separate accounting review.
 * No fake refund initiation or bank-settlement claim is made here.
 */
export async function reconcileProcessedRefund(refund: {
  id?: string; payment_id?: string; amount?: number; status?: string;
}) {
  if (refund.status !== "processed" || !refund.payment_id || !refund.id ||
      !Number.isSafeInteger(refund.amount) || Number(refund.amount) <= 0) return;
  const original = await prisma.payment.findUnique({ where: { providerPaymentId: refund.payment_id } });
  if (!original) return;
  const fullAmountPaise = Math.round(Number(original.amount) * 100);
  if (refund.amount !== fullAmountPaise) {
    logger.warn("razorpay_partial_refund_requires_ledger_review", { paymentId: original.id });
    return;
  }
  const meta = (original.metadata as Record<string, unknown> | null) ?? {};
  const transition = await prisma.payment.updateMany({
    where: { id: original.id, status: "PAID", providerPaymentId: refund.payment_id },
    data: {
      status: "REFUNDED",
      metadata: { ...meta, verifiedRefundId: refund.id, refundVerifiedBy: "signed_webhook" } as Prisma.InputJsonObject
    }
  });
  if (transition.count !== 1) return; // duplicate/refunded/waived must not change entitlements

  if (original.purpose === "SHOP_ORDER" && typeof meta.shopOrderId === "string") {
    await prisma.shopOrder.updateMany({
      where: { id: meta.shopOrderId, userId: original.userId, paymentStatus: "PAID" },
      data: { paymentStatus: "REFUNDED" }
    });
    await prisma.shopOrder.updateMany({
      where: { id: meta.shopOrderId, userId: original.userId,
        status: { in: ["REQUESTED", "CONFIRMED", "PACKING"] } },
      data: { status: "CANCELED" }
    });
  }
  if (original.purpose === "PUJA_BOOKING" && typeof meta.pujaBookingId === "string") {
    await prisma.pujaBookingRequest.updateMany({
      where: { id: meta.pujaBookingId, userId: original.userId,
        status: { notIn: ["COMPLETED", "CANCELED"] } },
      data: { status: "CANCELED" }
    });
  }
  if (original.purpose === "CONSULTATION" && typeof meta.bookingId === "string") {
    await prisma.consultationBooking.updateMany({
      where: { id: meta.bookingId, userId: original.userId, paymentStatus: "PAID" },
      data: { paymentStatus: "REFUNDED" }
    });
    await prisma.consultationBooking.updateMany({
      where: { id: meta.bookingId, userId: original.userId,
        status: { in: ["REQUESTED", "PAYMENT_PENDING", "ACCEPTED", "CONFIRMED"] } },
      data: { status: "CANCELED" }
    });
  }
  if (["KUNDLI_REPORT", "YEARLY_REPORT", "MATCH_REPORT"].includes(original.purpose)) {
    await prisma.purchasedReport.updateMany({
      where: { paymentId: original.id, userId: original.userId },
      data: { status: "REFUNDED" }
    });
    // Refund flags apply even if a PDF was already delivered. Keep completed
    // delivery history intact, but revoke subsequent paid download permission.
    await prisma.reportRequest.updateMany({
      where: { paymentId: original.id, userId: original.userId },
      data: { paymentStatus: "REFUNDED" }
    });
    await prisma.reportRequest.updateMany({
      where: { paymentId: original.id, userId: original.userId,
        status: { notIn: ["DELIVERED", "SENT", "CANCELLED"] } },
      data: { status: "CANCELLED" }
    });
  }
  await writeAuditLog({
    actor: { id: original.userId, role: "USER" },
    action: "payment.razorpay_full_refund_verified",
    targetType: "Payment",
    targetId: original.id,
    metadata: { refundId: refund.id, purpose: original.purpose, verifiedWebhook: true }
  });
}

import { NextRequest } from "next/server";
import { PaymentStatus, ReportPaymentStatus, ReportRequestStatus } from "@prisma/client";
import { fail, handleApiError, ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { finalizePaidPayment, verifyRazorpayWebhookSignature } from "@/lib/revenue";
import { reconcileCapturedPurpose, reconcileProcessedRefund } from "@/lib/payments/purpose-reconciliation";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    if (!verifyRazorpayWebhookSignature(payload, signature)) return fail("Invalid webhook signature", 400);
    const event = JSON.parse(payload) as { event?: string; payload?: {
      payment?: { entity?: { id?: string; order_id?: string; status?: string; amount?: number; currency?: string } };
      refund?: { entity?: { id?: string; payment_id?: string; amount?: number; status?: string } }
    } };
    const payment = event.payload?.payment?.entity;
    if (event.event === "payment.captured" && payment?.order_id && payment.id) {
      const existingPayment = await prisma.payment.findUnique({ where: { providerOrderId: payment.order_id } });
      if (existingPayment && payment.status === "captured" && Number(payment.amount) === Math.round(Number(existingPayment.amount) * 100) && (payment.currency ?? "").toUpperCase() === existingPayment.currency.toUpperCase()) {
        const paid = await finalizePaidPayment(payment.order_id, payment.id, { verifiedBy: "webhook", event: event.event, gatewayStatus: payment.status });
        if (paid) await reconcileCapturedPurpose(paid);
        const metadata = (paid?.metadata as Record<string, unknown> | null) ?? {};
        const reportRequestId = typeof metadata.reportRequestId === "string" ? metadata.reportRequestId : null;
        const bookingId = typeof metadata.bookingId === "string" ? metadata.bookingId : null;

        if (paid && reportRequestId) {
          const reportRequest = await prisma.reportRequest.findUnique({ where: { id: reportRequestId } });
          if (reportRequest && reportRequest.userId === paid.userId) {
            const updated = await prisma.reportRequest.updateMany({
              where: { id: reportRequestId, userId: paid.userId,
                status: { in: [ReportRequestStatus.RECEIVED, ReportRequestStatus.PENDING_REVIEW, ReportRequestStatus.PAYMENT_PENDING] },
                paymentStatus: { in: [ReportPaymentStatus.PENDING, ReportPaymentStatus.FAILED] } },
              data: { paymentStatus: ReportPaymentStatus.PAID, status: ReportRequestStatus.PAID }
            });
            if (updated.count === 1) await writeReportStatusHistory({
              reportRequestId,
              oldStatus: reportRequest.status,
              newStatus: ReportRequestStatus.PAID,
              actor: { id: paid.userId, role: "USER" },
              note: "Razorpay webhook verified paid status.",
              metadata: { paymentId: paid.id, provider: "razorpay" }
            });
          }
        }

        if (paid && bookingId) {
          await prisma.consultationBooking.updateMany({
            where: {
              id: bookingId,
              userId: paid.userId,
              status: { in: ["REQUESTED", "PAYMENT_PENDING", "ACCEPTED", "CONFIRMED"] },
              paymentStatus: { in: ["PENDING", "FAILED"] }
            },
            data: { status: "CONFIRMED", paymentStatus: "PAID" }
          });
        }

        await writeAuditLog({
          actor: paid ? { id: paid.userId, role: "USER" } : null,
          action: "payment.webhook_paid",
          targetType: "Payment",
          targetId: existingPayment.id,
          metadata: { provider: "razorpay", event: event.event }
        });
      }
    }
    if ((event.event === "payment.failed" || event.event === "payment.authorized") && payment?.order_id) {
      const existingPayment = await prisma.payment.findUnique({ where: { providerOrderId: payment.order_id } });
      if (existingPayment && event.event === "payment.failed") {
        // Failed callbacks can arrive after a captured/paid webhook. A stale
        // failure must NEVER downgrade PAID, REFUNDED or waived entitlements.
        const updated = await prisma.payment.updateMany({
          where: { id: existingPayment.id, status: PaymentStatus.PENDING },
          data: { status: PaymentStatus.FAILED }
        });
        if (updated.count === 0) {
          logger.info("razorpay_stale_failed_event_ignored", { paymentId: existingPayment.id });
          return ok({ received: true });
        }
        const metadata = (existingPayment.metadata as Record<string, unknown> | null) ?? {};
        const reportRequestId = typeof metadata.reportRequestId === "string" ? metadata.reportRequestId : null;
        const bookingId = typeof metadata.bookingId === "string" ? metadata.bookingId : null;

        if (reportRequestId) {
          await prisma.reportRequest.updateMany({
            where: { id: reportRequestId, userId: existingPayment.userId,
              status: { in: [ReportRequestStatus.RECEIVED, ReportRequestStatus.PENDING_REVIEW, ReportRequestStatus.PAYMENT_PENDING] },
              paymentStatus: ReportPaymentStatus.PENDING },
            data: { paymentStatus: ReportPaymentStatus.FAILED }
          });
        }

        if (bookingId) {
          await prisma.consultationBooking.updateMany({
            where: { id: bookingId, userId: existingPayment.userId,
              paymentStatus: "PENDING" },
            data: { paymentStatus: "FAILED" }
          });
        }

        await writeAuditLog({
          actor: { id: existingPayment.userId, role: "USER" },
          action: "payment.webhook_failed",
          targetType: "Payment",
          targetId: existingPayment.id,
          metadata: { provider: "razorpay", event: event.event }
        });
      }
    }
    // One signed full-refund path for EVERY purchase category, same merchant.
    if (event.event === "refund.processed" && event.payload?.refund?.entity) {
      await reconcileProcessedRefund(event.payload.refund.entity);
    }
    logger.info("razorpay_webhook_processed", { event: event.event ?? "unknown" });
    return ok({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}



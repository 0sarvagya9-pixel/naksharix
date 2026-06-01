import { NextRequest } from "next/server";
import { PaymentStatus, ReportPaymentStatus, ReportRequestStatus } from "@prisma/client";
import { fail, handleApiError, ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { finalizePaidPayment, verifyRazorpayWebhookSignature } from "@/lib/revenue";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    if (!verifyRazorpayWebhookSignature(payload, signature)) return fail("Invalid webhook signature", 400);
    const event = JSON.parse(payload) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string; amount?: number; currency?: string } } } };
    const payment = event.payload?.payment?.entity;
    if (event.event === "payment.captured" && payment?.order_id && payment.id) {
      const existingPayment = await prisma.payment.findUnique({ where: { providerOrderId: payment.order_id } });
      if (existingPayment && payment.status === "captured" && Number(payment.amount) === Math.round(Number(existingPayment.amount) * 100) && (payment.currency ?? "").toUpperCase() === existingPayment.currency.toUpperCase()) {
        const paid = await finalizePaidPayment(payment.order_id, payment.id, { verifiedBy: "webhook", event: event.event, gatewayStatus: payment.status });
        const metadata = (paid?.metadata as Record<string, unknown> | null) ?? {};
        const reportRequestId = typeof metadata.reportRequestId === "string" ? metadata.reportRequestId : null;
        if (paid && reportRequestId) {
          const reportRequest = await prisma.reportRequest.findUnique({ where: { id: reportRequestId } });
          if (reportRequest) {
            const updated = await prisma.reportRequest.update({
              where: { id: reportRequestId },
              data: { paymentStatus: ReportPaymentStatus.PAID, status: ReportRequestStatus.PAID }
            });
            await writeReportStatusHistory({
              reportRequestId,
              oldStatus: reportRequest.status,
              newStatus: updated.status,
              actor: { id: paid.userId, role: "USER" },
              note: "Razorpay webhook verified paid status.",
              metadata: { paymentId: paid.id, provider: "razorpay" }
            });
          }
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
        await prisma.payment.update({ where: { id: existingPayment.id }, data: { status: PaymentStatus.FAILED } });
        const metadata = (existingPayment.metadata as Record<string, unknown> | null) ?? {};
        const reportRequestId = typeof metadata.reportRequestId === "string" ? metadata.reportRequestId : null;
        if (reportRequestId) {
          await prisma.reportRequest.update({
            where: { id: reportRequestId },
            data: { paymentStatus: ReportPaymentStatus.FAILED }
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
    logger.info("razorpay_webhook_processed", { event: event.event ?? "unknown" });
    return ok({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}



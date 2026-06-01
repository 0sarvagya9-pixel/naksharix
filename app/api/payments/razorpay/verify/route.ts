import { NextRequest } from "next/server";
import { ReportPaymentStatus, ReportRequestStatus } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { finalizePaidPayment, verifyRazorpayCapturedPayment, verifyRazorpayPaymentSignature } from "@/lib/revenue";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const limited = rateLimitResponse("razorpay-verify", user.id || getRequestIp(request), 12, 60_000);
    if (limited) return limited;
    const body = await validateJson(request, schema);
    const valid = verifyRazorpayPaymentSignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);
    if (!valid) return fail("Invalid Razorpay signature", 400);

    const existingPayment = await prisma.payment.findUnique({
      where: { providerOrderId: body.razorpay_order_id },
      select: { id: true, userId: true, amount: true, currency: true, status: true, providerPaymentId: true, metadata: true }
    });
    if (!existingPayment || existingPayment.userId !== user.id) return fail("Payment not found", 404);
    if (existingPayment.status === "PAID") return ok({ payment: existingPayment });

    const captured = await verifyRazorpayCapturedPayment(body.razorpay_order_id, body.razorpay_payment_id, Number(existingPayment.amount), existingPayment.currency);
    if (!captured.ok) return fail("Payment could not be verified", 400);

    const payment = await finalizePaidPayment(body.razorpay_order_id, body.razorpay_payment_id, { verifiedBy: "client", gatewayStatus: "captured" });
    const metadata = (payment?.metadata as Record<string, unknown> | null) ?? {};
    const reportRequestId = typeof metadata.reportRequestId === "string" ? metadata.reportRequestId : null;
    if (payment && reportRequestId) {
      const reportRequest = await prisma.reportRequest.findUnique({ where: { id: reportRequestId } });
      if (reportRequest && reportRequest.userId === user.id) {
        const updated = await prisma.reportRequest.update({
          where: { id: reportRequestId },
          data: { paymentStatus: ReportPaymentStatus.PAID, status: ReportRequestStatus.PAID }
        });
        await writeReportStatusHistory({
          reportRequestId,
          oldStatus: reportRequest.status,
          newStatus: updated.status,
          actor: user,
          note: "Razorpay client verification confirmed captured payment.",
          metadata: { paymentId: payment.id, provider: "razorpay" }
        });
      }
    }
    if (payment) {
      await writeAuditLog({
        actor: user,
        action: "payment.razorpay_client_verified",
        targetType: "Payment",
        targetId: payment.id,
        metadata: { provider: "razorpay" }
      });
    }
    return ok({ payment });
  } catch (error) {
    return handleApiError(error);
  }
}


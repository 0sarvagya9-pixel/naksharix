import { NextRequest } from "next/server";
import { PaymentPurpose, ReportPaymentStatus, ReportRequestStatus } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getPaidReport } from "@/lib/paid-reports";
import { razorpay } from "@/lib/payments/razorpay";
import { getRazorpayReadiness } from "@/lib/payments/readiness";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { getReportPricing } from "@/lib/reports/pricing";
import { getSubscriptionPlan } from "@/lib/revenue";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";

const schema = z.discriminatedUnion("purpose", [
  z.object({ purpose: z.literal("SUBSCRIPTION"), plan: z.enum(["PREMIUM", "VIP"]) }),
  z.object({ purpose: z.literal("KUNDLI_REPORT"), reportId: z.string().min(1), savedReportId: z.string().min(1).optional(), reportRequestId: z.string().min(1).optional() }),
  z.object({ purpose: z.literal("YEARLY_REPORT"), reportId: z.string().min(1), savedReportId: z.string().min(1).optional(), reportRequestId: z.string().min(1).optional() }),
  z.object({ purpose: z.literal("MATCH_REPORT"), reportId: z.string().min(1), savedReportId: z.string().min(1).optional(), reportRequestId: z.string().min(1).optional() }),
  z.object({ purpose: z.literal("CONSULTATION"), bookingId: z.string().min(1) })
]);

type CheckoutBody = z.infer<typeof schema>;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const limited = rateLimitResponse("razorpay-order", user.id || getRequestIp(request), 10, 60_000);
    if (limited) return limited;
    const body = await validateJson(request, schema);
    if (body.purpose === "SUBSCRIPTION" && env.SUBSCRIPTIONS_ENABLED !== "true") return fail("Not found", 404);
    if (canBypassPayment(user)) return fail("Admin access does not require payment", 403);
    const readiness = getRazorpayReadiness();
    if (!readiness.enabled || !razorpay) return fail(readiness.reason, 503);

    const item = await resolveCheckoutItem(body, user.id);
    if (!item) return fail("Invalid or completed checkout item", 422);
    const reportRequestId = "reportRequestId" in body ? body.reportRequestId : undefined;
    const savedReportId = "savedReportId" in body ? body.savedReportId : undefined;

    if (savedReportId) {
      const alreadyPaid = await prisma.payment.findFirst({
        where: {
          userId: user.id,
          status: "PAID",
          metadata: { path: ["savedReportId"], equals: savedReportId }
        },
        select: { id: true }
      });
      if (alreadyPaid) return fail("This report is already unlocked.", 409);
    }

    let previousReportStatus: ReportRequestStatus | null = null;
    if (reportRequestId) {
      const reportRequest = await prisma.reportRequest.findUnique({ where: { id: reportRequestId } });
      if (!reportRequest || reportRequest.userId !== user.id) return fail("Report request not found", 404);
      if (reportRequest.paymentStatus === ReportPaymentStatus.PAID) return fail("This report request is already paid.", 409);
      previousReportStatus = reportRequest.status;
      const pricing = getReportPricing(reportRequest.reportSlug);
      if (!pricing || pricing.amount !== item.amount || pricing.reportType !== body.purpose) {
        return fail("Report pricing mismatch. Please restart checkout from the report page.", 422);
      }
    }

    const reusable = await findReusablePayment(body, user.id);
    if (reusable?.status === "PAID") return fail("This checkout item is already paid.", 409);
    if (reusable?.status === "PENDING" && reusable.providerOrderId) {
      return ok({
        keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order: {
          id: reusable.providerOrderId,
          amount: Math.round(Number(reusable.amount) * 100),
          currency: reusable.currency
        },
        paymentId: reusable.id,
        item: { name: item.name, amount: item.amount },
        reused: true
      });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        provider: "RAZORPAY",
        purpose: body.purpose as PaymentPurpose,
        status: "PENDING",
        amount: item.amount,
        currency: "INR",
        metadata: { ...item.metadata, reportRequestId, savedReportId }
      }
    });

    let order;
    try {
      order = await razorpay.orders.create({
        amount: Math.round(item.amount * 100),
        currency: "INR",
        receipt: payment.id,
        notes: { userId: user.id, paymentId: payment.id, purpose: body.purpose }
      });
    } catch (error) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } }).catch(() => null);
      await writeAuditLog({
        actor: user,
        action: "payment.razorpay_order_failed",
        targetType: "Payment",
        targetId: payment.id,
        metadata: { purpose: body.purpose, provider: "razorpay" }
      }).catch(() => null);
      throw error;
    }

    await prisma.payment.update({ where: { id: payment.id }, data: { providerOrderId: order.id } });
    if (reportRequestId) {
      const updated = await prisma.reportRequest.update({
        where: { id: reportRequestId },
        data: {
          paymentId: payment.id,
          paymentStatus: ReportPaymentStatus.PENDING,
          status: ReportRequestStatus.PAYMENT_PENDING
        }
      });
      await writeReportStatusHistory({
        reportRequestId,
        oldStatus: previousReportStatus,
        newStatus: updated.status,
        actor: user,
        note: "Razorpay order created for report request.",
        metadata: { paymentId: payment.id, amount: item.amount, currency: "INR" }
      });
    }
    await writeAuditLog({
      actor: user,
      action: "payment.razorpay_order_created",
      targetType: "Payment",
      targetId: payment.id,
      metadata: { purpose: body.purpose, amount: item.amount, reportRequestLinked: Boolean(reportRequestId) }
    });

    return ok({
      keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order,
      paymentId: payment.id,
      item: { name: item.name, amount: item.amount },
      reused: false
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function findReusablePayment(body: CheckoutBody, userId: string) {
  const identity = checkoutIdentity(body);
  if (!identity) return null;

  return prisma.payment.findFirst({
    where: {
      userId,
      status: { in: ["PENDING", "PAID"] },
      metadata: { path: [identity.key], equals: identity.value }
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, providerOrderId: true, amount: true, currency: true }
  });
}

function checkoutIdentity(body: CheckoutBody) {
  if (body.purpose === "CONSULTATION") return { key: "bookingId", value: body.bookingId };
  if (body.purpose === "SUBSCRIPTION") return null;
  if (body.reportRequestId) return { key: "reportRequestId", value: body.reportRequestId };
  if (body.savedReportId) return { key: "savedReportId", value: body.savedReportId };
  return null;
}

async function resolveCheckoutItem(body: CheckoutBody, userId: string) {
  if (body.purpose === "SUBSCRIPTION") {
    const plan = getSubscriptionPlan(body.plan);
    if (!plan) return null;
    return { name: `${plan.name} Plan`, amount: plan.amount, metadata: { plan: plan.id, interval: plan.interval } };
  }
  if (body.purpose === "CONSULTATION") {
    const booking = await prisma.consultationBooking.findUnique({ where: { id: body.bookingId } });
    if (!booking || booking.userId !== userId) return null;
    if (["PAID", "ADMIN_BYPASS", "REFUNDED"].includes(booking.paymentStatus)) return null;
    if (["CANCELED", "COMPLETED", "REJECTED"].includes(booking.status)) return null;
    return { name: "Astrology Consultation", amount: Number(booking.amount), metadata: { bookingId: booking.id } };
  }
  const report = getPaidReport(body.reportId);
  if (!report || report.purpose !== body.purpose) return null;
  return { name: report.name, amount: report.amount, metadata: { reportId: report.id, reportName: report.name } };
}

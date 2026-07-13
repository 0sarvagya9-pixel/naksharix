import { NextRequest } from "next/server";
import { PaymentStatus, ReportPaymentStatus, ReportPlanType, ReportRequestStatus } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { getManualReport } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
import { writeAuditLog, writeReportStatusHistory } from "@/lib/reports/report-audit";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";

const schema = z.object({
  orderId: z.string().optional(),
  planType: z.enum(["PREMIUM", "VIP"]),
  reportSlug: z.string().min(1).default("premium-kundli"),
  adminBypass: z.boolean().optional(),
  deliveryEmail: z.string().email(),
  fullName: z.string().min(1),
  gender: z.string().optional(),
  dateOfBirth: z.string().min(1),
  timeOfBirth: z.string().min(1),
  birthPlace: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.number().optional(),
  phone: z.string().optional(),
  concern: z.string().min(1),
  questionOrConcern: z.string().optional(),
  language: z.string().default("en")
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);

    const rateLimited = rateLimitResponse("report-request-create", user.id || getRequestIp(request), 5, 60_000);
    if (rateLimited) return rateLimited;

    const body = await validateJson(request, schema);
    const report = getManualReport(body.reportSlug);
    if (!report) return fail("Unknown report type", 422);

    const checkout = getManualReportCheckout(report.slug);
    const adminBypass = Boolean(body.adminBypass && canBypassPayment(user));

    if (body.deliveryEmail.toLowerCase() !== user.email.toLowerCase()) {
      return fail("Delivery email must match your login email", 403);
    }

    let paymentId: string | undefined;
    let paymentStatus: ReportPaymentStatus = adminBypass ? ReportPaymentStatus.ADMIN_BYPASS : ReportPaymentStatus.PENDING;
    const planType = body.planType as ReportPlanType;

    if (!adminBypass && checkout) {
      if (!body.orderId) return fail("Verified payment is required for this fixed-price report.", 402);

      const payment = await prisma.payment.findUnique({ where: { id: body.orderId } });
      if (!payment || payment.userId !== user.id) return fail("Payment not found", 404);

      const metadata = (payment.metadata as Record<string, unknown> | null) ?? {};
      const validPayment = payment.status === PaymentStatus.PAID
        && String(payment.purpose) === checkout.purpose
        && Number(payment.amount) === checkout.amount
        && metadata.reportId === checkout.reportId;

      if (!validPayment) {
        return fail("Payment does not match this report. Please restart checkout from the report page.", 422);
      }

      const existing = await prisma.reportRequest.findUnique({ where: { paymentId: payment.id } });
      if (existing) return ok({ reportRequest: existing });

      paymentId = payment.id;
      paymentStatus = ReportPaymentStatus.PAID;
    } else if (!adminBypass && body.orderId) {
      return fail("This manual-review report does not accept an upfront payment.", 422);
    }

    const reportRequest = await prisma.reportRequest.create({
      data: {
        userId: user.id,
        paymentId,
        planType,
        paymentStatus,
        status: paymentStatus === ReportPaymentStatus.PAID ? ReportRequestStatus.PAID : ReportRequestStatus.PENDING_REVIEW,
        reportSlug: report.slug,
        deliveryEmail: user.email,
        fullName: body.fullName,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth,
        timeOfBirth: body.timeOfBirth,
        birthPlace: body.birthPlace,
        latitude: body.latitude,
        longitude: body.longitude,
        timezone: body.timezone,
        phone: body.phone,
        concern: body.questionOrConcern ?? body.concern,
        language: body.language,
        adminBypass
      }
    });

    await writeReportStatusHistory({
      reportRequestId: reportRequest.id,
      oldStatus: null,
      newStatus: reportRequest.status,
      actor: user,
      note: paymentStatus === ReportPaymentStatus.PAID ? "Paid report request created after verified checkout." : "Manual-review report request created.",
      metadata: {
        paymentStatus: reportRequest.paymentStatus,
        reportSlug: reportRequest.reportSlug,
        paymentId: reportRequest.paymentId
      }
    });

    await writeAuditLog({
      actor: user,
      action: "report_request.created",
      targetType: "ReportRequest",
      targetId: reportRequest.id,
      metadata: {
        reportSlug: reportRequest.reportSlug,
        paymentStatus: reportRequest.paymentStatus,
        fixedPriceCheckout: Boolean(checkout)
      }
    });

    return ok({ reportRequest });
  } catch (error) {
    return handleApiError(error);
  }
}

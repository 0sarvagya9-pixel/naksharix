import { NextRequest } from "next/server";
import { PaymentPurpose, PaymentStatus, ReportPaymentStatus, ReportPlanType } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";

const schema = z.object({
  orderId: z.string().optional(),
  planType: z.enum(["PREMIUM", "VIP"]),
  adminBypass: z.boolean().optional(),
  deliveryEmail: z.string().email(),
  fullName: z.string().min(1),
  gender: z.string().optional(),
  dateOfBirth: z.string().min(1),
  timeOfBirth: z.string().optional(),
  birthPlace: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.number().optional(),
  phone: z.string().optional(),
  concern: z.string().optional(),
  language: z.string().default("en")
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const body = await validateJson(request, schema);
    const adminBypass = Boolean(body.adminBypass && canBypassPayment(user));

    if (body.deliveryEmail.toLowerCase() !== user.email.toLowerCase()) {
      return fail("Delivery email must match your login email", 403);
    }

    let paymentId: string | undefined;
    let paymentStatus: ReportPaymentStatus = ReportPaymentStatus.ADMIN_BYPASS;
    let planType = body.planType as ReportPlanType;

    if (!adminBypass) {
      if (!body.orderId) return fail("Payment required. Please complete checkout first.", 402);
      const payment = await prisma.payment.findUnique({ where: { id: body.orderId } });
      if (!payment || payment.userId !== user.id) return fail("Payment not found", 404);
      if (payment.status !== PaymentStatus.PAID) return fail("Payment required. Please complete checkout first.", 402);
      if (payment.purpose !== PaymentPurpose.SUBSCRIPTION) return fail("Invalid payment for report request", 422);
      const metadata = (payment.metadata as Record<string, unknown> | null) ?? {};
      const paidPlan = String(metadata.plan ?? body.planType).toUpperCase();
      planType = paidPlan === "VIP" ? ReportPlanType.VIP : ReportPlanType.PREMIUM;
      paymentId = payment.id;
      paymentStatus = ReportPaymentStatus.PAID;

      const existing = await prisma.reportRequest.findUnique({ where: { paymentId: payment.id } });
      if (existing) return ok({ reportRequest: existing });
    }

    const reportRequest = await prisma.reportRequest.create({
      data: {
        userId: user.id,
        paymentId,
        planType,
        paymentStatus,
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
        concern: body.concern,
        language: body.language,
        adminBypass
      }
    });

    return ok({ reportRequest });
  } catch (error) {
    return handleApiError(error);
  }
}

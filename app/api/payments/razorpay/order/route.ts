import { NextRequest } from "next/server";
import { PaymentPurpose } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getPaidReport } from "@/lib/paid-reports";
import { razorpay } from "@/lib/payments/razorpay";
import { getSubscriptionPlan } from "@/lib/revenue";

const schema = z.discriminatedUnion("purpose", [
  z.object({ purpose: z.literal("SUBSCRIPTION"), plan: z.enum(["PREMIUM", "VIP"]) }),
  z.object({ purpose: z.literal("KUNDLI_REPORT"), reportId: z.string().min(1) }),
  z.object({ purpose: z.literal("YEARLY_REPORT"), reportId: z.string().min(1) }),
  z.object({ purpose: z.literal("MATCH_REPORT"), reportId: z.string().min(1) })
]);

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    if (!razorpay) return fail("Payments coming soon", 503);
    const body = await validateJson(request, schema);

    const item = resolveCheckoutItem(body);
    if (!item) return fail("Invalid checkout item", 422);

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        provider: "RAZORPAY",
        purpose: body.purpose as PaymentPurpose,
        status: "PENDING",
        amount: item.amount,
        currency: "INR",
        metadata: item.metadata
      }
    });

    const order = await razorpay.orders.create({
      amount: Math.round(item.amount * 100),
      currency: "INR",
      receipt: payment.id,
      notes: { userId: user.id, paymentId: payment.id, purpose: body.purpose }
    });

    await prisma.payment.update({ where: { id: payment.id }, data: { providerOrderId: order.id } });

    return ok({
      keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order,
      paymentId: payment.id,
      item: { name: item.name, amount: item.amount }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function resolveCheckoutItem(body: z.infer<typeof schema>) {
  if (body.purpose === "SUBSCRIPTION") {
    const plan = getSubscriptionPlan(body.plan);
    if (!plan) return null;
    return { name: `${plan.name} Plan`, amount: plan.amount, metadata: { plan: plan.id, interval: plan.interval } };
  }
  const report = getPaidReport(body.reportId);
  if (!report || report.purpose !== body.purpose) return null;
  return { name: report.name, amount: report.amount, metadata: { reportId: report.id, reportName: report.name } };
}



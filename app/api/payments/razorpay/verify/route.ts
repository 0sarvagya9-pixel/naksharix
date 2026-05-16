import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { finalizePaidPayment, verifyRazorpayPaymentSignature } from "@/lib/revenue";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const body = await validateJson(request, schema);
    const valid = verifyRazorpayPaymentSignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);
    if (!valid) return fail("Invalid Razorpay signature", 400);

    const existingPayment = await prisma.payment.findUnique({ where: { providerOrderId: body.razorpay_order_id }, select: { userId: true } });
    if (!existingPayment || existingPayment.userId !== user.id) return fail("Payment not found", 404);

    const payment = await finalizePaidPayment(body.razorpay_order_id, body.razorpay_payment_id, { verifiedBy: "client" });
    return ok({ payment });
  } catch (error) {
    return handleApiError(error);
  }
}

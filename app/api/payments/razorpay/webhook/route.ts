import { NextRequest } from "next/server";
import { fail, handleApiError, ok } from "@/lib/api";
import { finalizePaidPayment, verifyRazorpayWebhookSignature } from "@/lib/revenue";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    if (!verifyRazorpayWebhookSignature(payload, signature)) return fail("Invalid webhook signature", 400);
    const event = JSON.parse(payload) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
    const payment = event.payload?.payment?.entity;
    if (event.event === "payment.captured" && payment?.order_id && payment.id) {
      await finalizePaidPayment(payment.order_id, payment.id, { verifiedBy: "webhook", event: event.event });
    }
    return ok({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}

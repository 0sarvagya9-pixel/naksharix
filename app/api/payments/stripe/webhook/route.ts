import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { env } from "@/lib/env";
import { stripe } from "@/lib/payments/stripe";

export async function POST(request: NextRequest) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return fail("Stripe webhook is not configured", 503);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return fail("Missing Stripe signature", 400);
  const body = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    // Persist subscription/payment state here. Kept idempotent by Stripe event id in production migrations.
    console.info("Stripe event received", event.type);
    return ok({ received: true });
  } catch (error) {
    console.error(error);
    return fail("Invalid Stripe webhook", 400);
  }
}

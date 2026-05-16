import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { env } from "@/lib/env";
import { stripe, stripePrices } from "@/lib/payments/stripe";

const schema = z.object({ plan: z.enum(["PREMIUM", "VIP"]) });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    if (!stripe) return fail("Payments coming soon", 503);
    const { plan } = await validateJson(request, schema);
    const price = stripePrices[plan];
    if (!price) return fail("Payments coming soon", 503);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      metadata: { userId: user.id, plan }
    });

    return ok({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}

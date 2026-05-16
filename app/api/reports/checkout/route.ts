import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { env } from "@/lib/env";
import { getPaidReport } from "@/lib/paid-reports";
import { stripe } from "@/lib/payments/stripe";

const schema = z.object({ reportId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    if (!stripe) return fail("Payments coming soon", 503);

    const { reportId } = await validateJson(request, schema);
    const report = getPaidReport(reportId);
    if (!report) return fail("Unknown report", 404);

    const price = process.env[report.priceEnv];
    if (!price) return fail("Payments coming soon", 503);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?report=${report.id}&checkout=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/reports?checkout=cancelled`,
      metadata: { userId: user.id, reportId: report.id, reportName: report.name }
    });

    return ok({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}

import "server-only";
import { env } from "@/lib/env";
import { razorpay } from "@/lib/payments/razorpay";

export function getRazorpayReadiness() {
  const missing = [
    env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? null : "NEXT_PUBLIC_RAZORPAY_KEY_ID",
    env.RAZORPAY_KEY_ID ? null : "RAZORPAY_KEY_ID",
    env.RAZORPAY_KEY_SECRET ? null : "RAZORPAY_KEY_SECRET",
    env.RAZORPAY_WEBHOOK_SECRET ? null : "RAZORPAY_WEBHOOK_SECRET"
  ].filter(Boolean) as string[];

  return {
    enabled: Boolean(razorpay && missing.length === 0),
    provider: "razorpay",
    scope: "reports_only",
    missing,
    required: ["NEXT_PUBLIC_RAZORPAY_KEY_ID", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"],
    publicCheckoutAllowed: Boolean(razorpay && missing.length === 0),
    reason: missing.length ? "Razorpay report checkout is disabled until all required environment variables are configured." : "Razorpay report checkout is configured."
  };
}

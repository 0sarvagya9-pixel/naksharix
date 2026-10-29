import "server-only";
import { env } from "@/lib/env";
import { razorpay } from "@/lib/payments/razorpay";

/**
 * ONE merchant: reports, consultations, approved Puja and confirmed shop
 * orders all call the same Razorpay client and the same four environment keys.
 * No gateway account is ever created dynamically per product category.
 */
export function getRazorpayReadiness() {
  const missing = [
    env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? null : "NEXT_PUBLIC_RAZORPAY_KEY_ID",
    env.RAZORPAY_KEY_ID ? null : "RAZORPAY_KEY_ID",
    env.RAZORPAY_KEY_SECRET ? null : "RAZORPAY_KEY_SECRET",
    env.RAZORPAY_WEBHOOK_SECRET ? null : "RAZORPAY_WEBHOOK_SECRET"
  ].filter(Boolean) as string[];
  const merchantKeyPairMatches = Boolean(env.RAZORPAY_KEY_ID &&
    env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
    env.RAZORPAY_KEY_ID === env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
  const enabled = Boolean(razorpay && missing.length === 0 && merchantKeyPairMatches);
  return {
    enabled,
    provider: "razorpay",
    scope: "one_merchant_for_reports_consultations_confirmed_puja_and_shop",
    missing,
    required: ["NEXT_PUBLIC_RAZORPAY_KEY_ID", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"],
    merchantKeyPairMatches,
    publicCheckoutAllowed: enabled,
    reason: missing.length
      ? "Razorpay checkout is disabled until all required environment variables are configured."
      : !merchantKeyPairMatches
        ? "Razorpay public and server key IDs differ; all checkout is blocked until the one merchant account is reconciled."
        : "Razorpay keys are configured for one merchant. Settlement and live-mode ownership still require a merchant-dashboard acceptance test."
  };
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { canBypassPayment } from "@/lib/auth/permissions";

type CheckoutPayload =
  | { purpose: "SUBSCRIPTION"; plan: "PREMIUM" | "VIP" }
  | { purpose: "KUNDLI_REPORT" | "YEARLY_REPORT" | "MATCH_REPORT"; reportId: string; savedReportId?: string };

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export function RazorpayCheckoutButton({ payload, label = "Pay with Razorpay", variant = "default" }: { payload: CheckoutPayload; label?: string; variant?: ButtonProps["variant"] }) {
  const { tr } = useLanguage();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    setStatus(tr("creatingSecureOrder"));
    const userResponse = await fetch("/api/auth/me", { cache: "no-store" }).catch(() => null);
    const userJson = userResponse?.ok ? await userResponse.json().catch(() => null) : null;
    if (canBypassPayment(userJson?.data?.user)) {
      setLoading(false);
      setStatus(tr("adminTestingModePaymentBypassed"));
      router.push(getAdminBypassTarget(payload));
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setLoading(false);
      setStatus(tr("paymentsComingSoon"));
      return;
    }

    const orderResponse = await secureFetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const orderJson = await orderResponse.json();
    if (!orderResponse.ok) {
      setLoading(false);
      setStatus(toPaymentMessage(orderJson.error, tr("paymentsComingSoon"), tr("signInToPay")));
      return;
    }

    const { keyId, order, item } = orderJson.data;
    const checkout = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Naksharix",
      description: item.name,
      order_id: order.id,
      theme: { color: "#A6772A" },
      handler: async (response: RazorpayResponse) => {
        setStatus(tr("verifyingPayment"));
        const verifyResponse = await secureFetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response)
        });
        setLoading(false);
        setStatus(verifyResponse.ok ? tr("paymentVerified") : tr("paymentsComingSoon"));
      },
      modal: { ondismiss: () => { setLoading(false); setStatus(tr("checkoutClosed")); } }
    });
    checkout.open();
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" variant={variant} onClick={startCheckout} disabled={loading}>
        <CreditCard className="h-4 w-4" />
        {loading ? tr("processing") : label}
      </Button>
      {status ? <p className="text-sm naksh-muted-text">{status}</p> : null}
    </div>
  );
}

function getAdminBypassTarget(payload: CheckoutPayload) {
  if (payload.purpose === "SUBSCRIPTION") return `/report-request/new?plan=${payload.plan.toLowerCase()}&mode=admin`;
  return "/report-request/new?plan=premium&mode=admin";
}

function toPaymentMessage(error: string | undefined, fallback: string, signIn: string) {
  if (!error || /razorpay|configured|key|server|unexpected/i.test(error)) return fallback;
  if (/unauthenticated/i.test(error)) return signIn;
  return error;
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}







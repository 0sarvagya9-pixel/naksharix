"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";

type CheckoutPayload =
  | { purpose: "SUBSCRIPTION"; plan: "PREMIUM" | "VIP" }
  | { purpose: "KUNDLI_REPORT" | "YEARLY_REPORT" | "MATCH_REPORT"; reportId: string };

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

const publicRazorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export function RazorpayCheckoutButton({ payload, label = "Pay with Razorpay" }: { payload: CheckoutPayload; label?: string }) {
  const { tr } = useLanguage();
  const [status, setStatus] = useState<string | null>(publicRazorpayKey ? null : tr("paymentsComingSoon"));
  const [loading, setLoading] = useState(false);
  const paymentsReady = Boolean(publicRazorpayKey);

  async function startCheckout() {
    if (!paymentsReady) {
      setStatus(tr("paymentsComingSoon"));
      return;
    }

    setLoading(true);
    setStatus(tr("creatingSecureOrder"));
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
      <Button className="w-full" onClick={startCheckout} disabled={loading || !paymentsReady}>
        <CreditCard className="h-4 w-4" />
        {loading ? tr("processing") : paymentsReady ? label : tr("paymentsComingSoon")}
      </Button>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </div>
  );
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

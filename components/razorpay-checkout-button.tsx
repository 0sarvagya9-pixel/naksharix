"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";
import {readCheckoutOrderAck,isVerifiedPaymentAck} from "@/lib/payments/client-checkout-contract";
import { googleAnalyticsSession } from "@/lib/analytics/google-client";
import { siteNotice } from "@/lib/ui/site-notification";
import { useLanguage } from "@/components/language-provider";
import { canBypassPayment } from "@/lib/auth/permissions";
import { PUJA_FEE_NOTICE_EN, PUJA_FEE_NOTICE_HI, PUJA_FEE_TERMS_VERSION } from "@/lib/puja/fee-terms";
import Link from "next/link";
import {getReportSlugForPaidId} from "@/lib/reports/checkout-catalogue";

import {AI_CREDIT_TERMS_VERSION} from "@/lib/ai/credit-contract";
import {PACKAGE_TERMS_VERSION} from "@/lib/digital-packages/catalogue";
import {EXPERT_TERMS_VERSION} from "@/lib/expert-services/contract";

type CheckoutPayload =
  | {purpose:"EXPERT_SERVICE";expertServiceId:string;quoteVersion:number;pricePaise:number;termsVersion:typeof EXPERT_TERMS_VERSION}
  | {purpose:"DIGITAL_PACKAGE";packageOrderId:string;version:"v1";pricePaise:number;termsVersion:typeof PACKAGE_TERMS_VERSION}
  | {purpose:"AI_CREDITS";intent:string;version:string;units:number;pricePaise:number;termsVersion:typeof AI_CREDIT_TERMS_VERSION}
  | { purpose: "SUBSCRIPTION"; plan: "PREMIUM" | "VIP" }
  | {
      purpose: "KUNDLI_REPORT" | "YEARLY_REPORT" | "MATCH_REPORT";
      reportId: string;
      savedReportId?: string;
      reportRequestId?: string;
      preflightToken?: string;
    }
  | { purpose: "PUJA_BOOKING"; bookingId: string }
  | { purpose: "SHOP_ORDER"; shopOrderId: string; expectedTotalPaise?: number; expectedOrderVersion?: number; shippingTermsVersion?: string };

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void; on: (event: "payment.failed", callback: () => void) => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type Props = {
  payload: CheckoutPayload;
  label?: string;
  variant?: ButtonProps["variant"];
  successHref?: string;
  adminBypassHref?: string;
  onVerified?: (paymentId:string)=>void|Promise<void>;
};

export function RazorpayCheckoutButton({
  payload,
  label = "Pay with Razorpay",
  variant = "default",
  successHref,
  adminBypassHref,
  onVerified
}: Props) {
  const { tr } = useLanguage();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const verifiedRef = useRef(false);
  const busyRef=useRef(false);
  const lockedRef=useRef(false);
  const [locked,setLocked]=useState(false);
  function setBusy(value:boolean){busyRef.current=value;setLoading(value);}
  function lockCheckout(){lockedRef.current=true;setLocked(true);}
  const pendingMessage="Payment status needs confirmation. Check Payment History before retrying; do not pay twice.";
  const feeDialog = useRef<HTMLDialogElement>(null);
  const [feeAccepted, setFeeAccepted] = useState(false);

  async function startCheckout(pujaConsent = false) {
    if (busyRef.current || lockedRef.current || (payload.purpose === "PUJA_BOOKING" && !pujaConsent)) return;
    verifiedRef.current = false;
    const slug="reportId" in payload&&!payload.reportRequestId&&!payload.savedReportId&&!payload.preflightToken?getReportSlugForPaidId(payload.reportId):undefined;
    const preflightHref=slug?`/report-request/new?reportSlug=${encodeURIComponent(slug)}&prepare=1`:null;
    setBusy(true);
    setStatus(tr("creatingSecureOrder"));

    const userResponse = await fetch("/api/auth/me", { cache: "no-store" }).catch(() => null);
    const userJson = userResponse?.ok ? await userResponse.json().catch(() => null) : null;
    if (userResponse?.status === 401) {
      setBusy(false);
      setStatus(tr("signInToPay"));
      siteNotice.warning("Sign in to your account before starting payment.", "Sign in required");
      // Resume the same public report or product after sign-in; never place a
      // charge before authentication, and never trust an external redirect.
      const resume = preflightHref??(window.location.pathname + window.location.search);
      if(preflightHref)window.location.assign(`/login?redirectTo=${encodeURIComponent(resume)}`);
      else router.push(`/login?redirectTo=${encodeURIComponent(resume)}`);
      return;
    }
    if (!userResponse?.ok || !userJson?.data?.user?.id) {
      setBusy(false);
      setStatus("Unable to verify your account. No payment checkout was started. Please sign in or try again.");
      return;
    }
    if (canBypassPayment(userJson?.data?.user)) {
      setBusy(false);
      if(payload.purpose==="EXPERT_SERVICE"){setStatus("Expert services require an eligible customer account and verified payment.");return;}
      if(payload.purpose==="DIGITAL_PACKAGE"){setStatus("Packages require an eligible customer account and captured payment.");return;}
      if(payload.purpose==="AI_CREDITS"){setStatus("Credit packs require an eligible customer account and captured payment; no admin credits granted.");return;}
      setStatus(tr("adminTestingModePaymentBypassed"));
      siteNotice.info("Admin mode skipped a charge. No payment has been collected.", "Admin testing mode");
      router.push(adminBypassHref ?? getAdminBypassTarget(payload));
      return;
    }

    if(preflightHref){setBusy(false);window.location.assign(preflightHref);return;}

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setBusy(false);
      setStatus(tr("paymentsComingSoon"));
      siteNotice.warning("Secure payment checkout is unavailable. Please try later.", "Payment unavailable");
      return;
    }

    let orderResponse: Response;
    try {
      orderResponse = await secureFetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.purpose === "PUJA_BOOKING" ? { ...payload, feeTermsVersion: PUJA_FEE_TERMS_VERSION } : "reportId" in payload ? {...payload,analyticsSession:googleAnalyticsSession()} : payload)
      });
    } catch {
      setBusy(false);
      lockCheckout();
      setStatus("Unable to reach the payment server. "+pendingMessage);
      return;
    }
    const orderJson = await orderResponse.json().catch(() => null);
    if (!orderResponse.ok) {
      setBusy(false);
      if(orderResponse.status>=500||orderResponse.status===409){lockCheckout();setStatus(pendingMessage);return;}
      setStatus(toPaymentMessage(orderJson?.error, tr("paymentsComingSoon"), tr("signInToPay")));
      return;
    }

    const expectedPaise="pricePaise" in payload?payload.pricePaise:payload.purpose==="SHOP_ORDER"?payload.expectedTotalPaise:payload.purpose==="PUJA_BOOKING"?110000:undefined;
    const data=readCheckoutOrderAck(orderJson,expectedPaise);
    if(!data){
      lockCheckout();
      setBusy(false);
      setStatus(pendingMessage);
      return;
    }
    const {keyId,order,item,paymentId}=data;
    let verificationStarted=false;

    try {
    const checkout = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Naksharix",
      description: item.name,
      order_id: order.id,
      theme: { color: "#A6772A" },
      handler: async (response: RazorpayResponse) => {
        if(verificationStarted)return;
        verificationStarted=true;
        lockCheckout();
        setBusy(true);
        setStatus(tr("verifyingPayment"));
        try {
          if(response?.razorpay_order_id!==order.id||typeof response.razorpay_payment_id!=="string"||!response.razorpay_payment_id.startsWith("pay_")||typeof response.razorpay_signature!=="string"||!response.razorpay_signature){setStatus(pendingMessage);return;}
          const verifyResponse = await secureFetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({...response,analyticsSession:"reportId" in payload ? googleAnalyticsSession() : undefined})
          });
          const verifyJson=await verifyResponse.json().catch(()=>null);
          if (!verifyResponse.ok||!isVerifiedPaymentAck(verifyJson,{id:paymentId,orderId:order.id,providerPaymentId:response.razorpay_payment_id,purpose:payload.purpose,amountPaise:order.amount})) {
            setStatus("Payment confirmation is pending. Check your payment history before trying again; do not pay twice.");
            // secureFetch already shows one centered payment error; preserve the detailed inline warning.
            return;
          }
          verifiedRef.current = true;
          setStatus(tr("paymentVerified"));
          siteNotice.success("Your payment has been verified. Check the booking/order history for fulfilment status.", "Payment verified");
          const target = successHref?.replace("{paymentId}", encodeURIComponent(paymentId));
          if(onVerified){
            try{await onVerified(paymentId);}catch{setStatus("Payment is verified. Review Payment History and the purchased service before retrying; do not pay again.");}
          }else if (target) router.push(target);
          else router.refresh();
        } catch {
          setStatus("Payment confirmation could not be checked. Check payment history before trying again; do not pay twice.");
          // secureFetch already provided one centered pending-payment notice.
        } finally {
          setBusy(false);
        }
      },
      modal: {
        ondismiss: () => {
          if (verifiedRef.current||verificationStarted) return;
          setBusy(false);
          if(lockedRef.current){setStatus(pendingMessage);return;}
          setStatus(tr("checkoutClosed"));
          siteNotice.info("Checkout closed. If money was deducted, verify payment history before retrying.", "Checkout closed");
        }
      }
    });
      checkout.on("payment.failed",()=>{
        if(verifiedRef.current||verificationStarted)return;
        // Keep the current gateway session active; do not start another order.
        // A later successful retry inside this same checkout can still verify.
        lockCheckout();
        setStatus("Payment was not confirmed. Check Payment History before retrying; do not pay twice.");
      });
      checkout.open();
    } catch {
      setBusy(false);
      lockCheckout();
      setStatus(pendingMessage);
      siteNotice.error("Could not open checkout. Review payment history before trying again.", "Checkout unavailable");
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" className="h-auto min-h-10 w-full min-w-0 whitespace-normal py-2 text-center" variant={variant} onClick={() => { if (payload.purpose === "PUJA_BOOKING") { setFeeAccepted(false); feeDialog.current?.showModal(); } else void startCheckout(); }} disabled={loading||locked}>
        <CreditCard className="h-4 w-4" />
        {loading ? tr("processing") : label}
      </Button>
      {payload.purpose === "PUJA_BOOKING" ? <dialog ref={feeDialog} onClose={() => setFeeAccepted(false)} aria-label="Important Puja payment information" className="m-auto max-h-[90dvh] w-[min(92vw,32rem)] overflow-y-auto rounded-2xl border border-[#d8b58c] bg-white p-6 text-[#3c2830] shadow-2xl backdrop:bg-black/60">
        <h2 className="text-xl font-bold">Important payment information</h2>
        <p className="mt-3 text-2xl font-bold text-[#7b293d]">₹1,100 platform coordination fee</p>
        <p className="mt-3 text-sm leading-6">{PUJA_FEE_NOTICE_EN}</p>
        <p lang="hi" className="mt-3 text-sm leading-6">{PUJA_FEE_NOTICE_HI}</p>
        <Link href="/refund-policy" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline">Read refund policy</Link>
        <label className="mt-4 flex items-start gap-3 text-sm font-semibold"><input type="checkbox" checked={feeAccepted} onChange={e=>setFeeAccepted(e.target.checked)} className="mt-1 h-4 w-4 shrink-0"/>I have read and accept the platform fee and availability terms.</label>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" onClick={()=>feeDialog.current?.close()}>Cancel</Button><Button type="button" disabled={!feeAccepted || loading || locked} onClick={()=>{ if (!feeAccepted) return; feeDialog.current?.close(); void startCheckout(true); }}>Agree &amp; proceed to pay ₹1,100</Button></div>
      </dialog> : null}
      {status ? <p className="text-sm naksh-muted-text" aria-live="polite">{status}</p> : null}
    </div>
  );
}

function getAdminBypassTarget(payload: CheckoutPayload) {
  if (payload.purpose === "PUJA_BOOKING") return "/puja-bookings";
  if (payload.purpose === "SHOP_ORDER") return "/orders";
  if (payload.purpose === "SUBSCRIPTION") return `/report-request/new?plan=${payload.plan.toLowerCase()}&mode=admin`;
  return "/report-request/new?plan=premium&mode=admin";
}

function toPaymentMessage(error: string | undefined, fallback: string, signIn: string) {
  if (!error || /razorpay|configured|key|server|unexpected/i.test(error)) return fallback;
  if (/unauthenticated/i.test(error)) return signIn;
  return error;
}

let razorpayScriptLoad:Promise<boolean>|null=null;
function loadRazorpayScript():Promise<boolean>{
 if(window.Razorpay)return Promise.resolve(true);
 if(razorpayScriptLoad)return razorpayScriptLoad;
 const pending=new Promise<boolean>(resolve=>{
  const existing=document.querySelector<HTMLScriptElement>('script[data-naksharix-razorpay="true"]');
  const script=existing??document.createElement("script");
  let done=false;
  const finish=(success:boolean)=>{
   if(done)return;done=true;window.clearTimeout(timer);
   script.removeEventListener("load",loaded);script.removeEventListener("error",failed);
   if(!success&&!window.Razorpay)script.remove();
   resolve(success&&Boolean(window.Razorpay));
  };
  const loaded=()=>finish(Boolean(window.Razorpay)),failed=()=>finish(false);
  const timer=window.setTimeout(()=>finish(Boolean(window.Razorpay)),12000);
  script.addEventListener("load",loaded,{once:true});script.addEventListener("error",failed,{once:true});
  if(!existing){script.src="https://checkout.razorpay.com/v1/checkout.js";script.dataset.naksharixRazorpay="true";document.body.appendChild(script);}
  if(window.Razorpay)finish(true);
 });
 razorpayScriptLoad=pending;
 void pending.finally(()=>{if(razorpayScriptLoad===pending)razorpayScriptLoad=null;});
 return pending;
}

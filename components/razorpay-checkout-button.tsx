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
import {paymentCopy, paymentOrderMessage, type PaymentMessage} from "@/lib/payments/customer-copy";
import {currentClientLocale} from "@/lib/i18n-copy";

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
      reviewedInput?: Record<string,unknown>;
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

function paymentNotice(kind:"success"|"warning"|"info"|"error",message:PaymentMessage,title:PaymentMessage){
  const copy=paymentCopy(currentClientLocale());
  siteNotice[kind](copy[message],copy[title]);
}

export function RazorpayCheckoutButton({
  payload,
  label,
  variant = "default",
  successHref,
  adminBypassHref,
  onVerified
}: Props) {
  const { locale } = useLanguage();
  const copy = paymentCopy(locale);
  const router = useRouter();
  const [status, setStatus] = useState<PaymentMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const verifiedRef = useRef(false);
  const busyRef=useRef(false);
  const lockedRef=useRef(false);
  const [locked,setLocked]=useState(false);
  function setBusy(value:boolean){busyRef.current=value;setLoading(value);}
  function lockCheckout(){lockedRef.current=true;setLocked(true);}
  const feeDialog = useRef<HTMLDialogElement>(null);
  const [feeAccepted, setFeeAccepted] = useState(false);

  async function startCheckout(pujaConsent = false) {
    if (busyRef.current || lockedRef.current || (payload.purpose === "PUJA_BOOKING" && !pujaConsent)) return;
    verifiedRef.current = false;
    const slug="reportId" in payload&&!payload.reportRequestId&&!payload.savedReportId&&!payload.preflightToken?getReportSlugForPaidId(payload.reportId):undefined;
    const preflightHref=slug?`/report-request/new?reportSlug=${encodeURIComponent(slug)}&prepare=1`:null;
    setBusy(true);
    setStatus("creating");

    const userResponse = await fetch("/api/auth/me", { cache: "no-store" }).catch(() => null);
    const userJson = userResponse?.ok ? await userResponse.json().catch(() => null) : null;
    if (userResponse?.status === 401) {
      setBusy(false);
      setStatus("signIn");
      paymentNotice("warning", "signIn", "signInTitle");
      // Resume the same public report or product after sign-in; never place a
      // charge before authentication, and never trust an external redirect.
      const resume = preflightHref??(window.location.pathname + window.location.search);
      if(preflightHref)window.location.assign(`/login?redirectTo=${encodeURIComponent(resume)}`);
      else router.push(`/login?redirectTo=${encodeURIComponent(resume)}`);
      return;
    }
    if (!userResponse?.ok || !userJson?.data?.user?.id) {
      setBusy(false);
      setStatus("accountUnverified");
      return;
    }
    if (canBypassPayment(userJson?.data?.user)) {
      setBusy(false);
      if(["EXPERT_SERVICE","DIGITAL_PACKAGE","AI_CREDITS"].includes(payload.purpose)){setStatus("eligibleAccount");return;}
      setStatus("admin");
      paymentNotice("info", "adminNotice", "adminTitle");
      router.push(adminBypassHref ?? getAdminBypassTarget(payload));
      return;
    }

    if(preflightHref){setBusy(false);window.location.assign(preflightHref);return;}

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setBusy(false);
      setStatus("unavailable");
      paymentNotice("warning", "unavailable", "unavailableTitle");
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
      setStatus("networkPending");
      return;
    }
    const orderJson = await orderResponse.json().catch(() => null);
    if (!orderResponse.ok) {
      setBusy(false);
      if(orderResponse.status>=500||orderResponse.status===409){lockCheckout();setStatus("pending");return;}
      setStatus(paymentOrderMessage(orderResponse.status));
      return;
    }

    const expectedPaise="pricePaise" in payload?payload.pricePaise:payload.purpose==="SHOP_ORDER"?payload.expectedTotalPaise:payload.purpose==="PUJA_BOOKING"?110000:undefined;
    const data=readCheckoutOrderAck(orderJson,expectedPaise);
    if(!data){
      lockCheckout();
      setBusy(false);
      setStatus("pending");
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
        setStatus("verifying");
        try {
          if(response?.razorpay_order_id!==order.id||typeof response.razorpay_payment_id!=="string"||!response.razorpay_payment_id.startsWith("pay_")||typeof response.razorpay_signature!=="string"||!response.razorpay_signature){setStatus("pending");return;}
          const verifyResponse = await secureFetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({...response,analyticsSession:"reportId" in payload ? googleAnalyticsSession() : undefined})
          });
          const verifyJson=await verifyResponse.json().catch(()=>null);
          if (!verifyResponse.ok||!isVerifiedPaymentAck(verifyJson,{id:paymentId,orderId:order.id,providerPaymentId:response.razorpay_payment_id,purpose:payload.purpose,amountPaise:order.amount})) {
            setStatus("confirmationPending");
            // secureFetch already shows one centered payment error; preserve the detailed inline warning.
            return;
          }
          verifiedRef.current = true;
          setStatus("verified");
          paymentNotice("success", "verifiedNotice", "verifiedTitle");
          const target = successHref?.replace("{paymentId}", encodeURIComponent(paymentId));
          if(onVerified){
            try{await onVerified(paymentId);}catch{setStatus("verifiedReview");}
          }else if (target) router.push(target);
          else router.refresh();
        } catch {
          setStatus("confirmationUnchecked");
          // secureFetch already provided one centered pending-payment notice.
        } finally {
          setBusy(false);
        }
      },
      modal: {
        ondismiss: () => {
          if (verifiedRef.current||verificationStarted) return;
          setBusy(false);
          if(lockedRef.current){setStatus("pending");return;}
          setStatus("closed");
          paymentNotice("info", "closed", "closedTitle");
        }
      }
    });
      checkout.on("payment.failed",()=>{
        if(verifiedRef.current||verificationStarted)return;
        // Keep the current gateway session active; do not start another order.
        // A later successful retry inside this same checkout can still verify.
        lockCheckout();
        setStatus("failed");
      });
      checkout.open();
    } catch {
      setBusy(false);
      lockCheckout();
      setStatus("pending");
      paymentNotice("error", "checkoutUnavailable", "checkoutUnavailableTitle");
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" className="h-auto min-h-10 w-full min-w-0 whitespace-normal py-2 text-center" variant={variant} onClick={() => { if (payload.purpose === "PUJA_BOOKING") { setFeeAccepted(false); feeDialog.current?.showModal(); } else void startCheckout(); }} disabled={loading||locked}>
        <CreditCard className="h-4 w-4" />
        {loading ? copy.processing : label ?? copy.pay}
      </Button>
      {payload.purpose === "PUJA_BOOKING" ? <dialog ref={feeDialog} onClose={() => setFeeAccepted(false)} aria-label={copy.feeDialog} className="m-auto max-h-[90dvh] w-[min(92vw,32rem)] overflow-y-auto rounded-2xl border border-[#d8b58c] bg-white p-6 text-[#3c2830] shadow-2xl backdrop:bg-black/60">
        <h2 className="text-xl font-bold">{copy.feeTitle}</h2>
        <p className="mt-3 text-2xl font-bold text-[#7b293d]">{copy.feeAmount}</p>
        <p className="mt-3 text-sm leading-6">{PUJA_FEE_NOTICE_EN}</p>
        <p lang="hi" className="mt-3 text-sm leading-6">{PUJA_FEE_NOTICE_HI}</p>
        <Link href="/refund-policy" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline">{copy.refundPolicy}</Link>
        <label className="mt-4 flex items-start gap-3 text-sm font-semibold"><input type="checkbox" checked={feeAccepted} onChange={e=>setFeeAccepted(e.target.checked)} className="mt-1 h-4 w-4 shrink-0"/>{copy.acceptFee}</label>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" onClick={()=>feeDialog.current?.close()}>{copy.cancel}</Button><Button type="button" disabled={!feeAccepted || loading || locked} onClick={()=>{ if (!feeAccepted) return; feeDialog.current?.close(); void startCheckout(true); }}>{copy.agreePay}</Button></div>
      </dialog> : null}
      {status ? <p className="text-sm naksh-muted-text" aria-live="polite">{copy[status]}</p> : null}
    </div>
  );
}

function getAdminBypassTarget(payload: CheckoutPayload) {
  if (payload.purpose === "PUJA_BOOKING") return "/puja-bookings";
  if (payload.purpose === "SHOP_ORDER") return "/orders";
  if (payload.purpose === "SUBSCRIPTION") return `/report-request/new?plan=${payload.plan.toLowerCase()}&mode=admin`;
  return "/report-request/new?plan=premium&mode=admin";
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

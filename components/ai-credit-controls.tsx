"use client";
import {useState,useEffect,useCallback,useRef} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {RazorpayCheckoutButton} from "@/components/razorpay-checkout-button";
import {useLanguage} from "@/components/language-provider";
import {AI_CREDIT_TERMS_VERSION,offerMatches} from "@/lib/ai/credit-contract";
import {readCreditSummary,type CreditSummary} from "@/lib/ai/customer-contract";
import {aiCustomerCopy} from "@/lib/ai/customer-copy";
export type {CreditSummary} from "@/lib/ai/customer-contract";
export function useCreditAccount(enabled:boolean){
 const [summary,setSummary]=useState<CreditSummary|null>(null);
 const [status,setStatus]=useState<"loading"|"signin"|"error"|"ready">("loading");
 const sequence=useRef(0);
 const refresh=useCallback(async()=>{
   const request=++sequence.current;
   if(!enabled){setSummary({enabled:false,offer:null});setStatus("ready");return;}
   setStatus("loading");
   try{
    const response=await fetch("/api/ai/credits",{cache:"no-store"});
    if(request!==sequence.current)return;
    if(response.status===401){setSummary(null);setStatus("signin");return;}
    const json=await response.json();if(request!==sequence.current)return;
    const next=readCreditSummary(json?.data);
    if(!response.ok||!next){setSummary(null);setStatus("error");return;}
    setSummary(next);setStatus("ready");return next;
   }catch{if(request===sequence.current){setSummary(null);setStatus("error");}}
 },[enabled]);
 useEffect(()=>{const requests=sequence;void refresh();return()=>{requests.current++;};},[refresh]);
 return {summary,status,refresh};
}
export function AiCreditControls({account,paid,onPaid,busy}:{account:ReturnType<typeof useCreditAccount>;paid:boolean;onPaid:(value:boolean)=>void;busy:boolean}){
 const {locale}=useLanguage(),copy=aiCustomerCopy(locale);
 const [accepted,setAccepted]=useState(false),[intent,setIntent]=useState<string|null>(null);
 const {summary,status,refresh}=account;
 const offer=summary?.offer,pendingIntent=summary?.enabled?summary.pendingIntent:null;
 useEffect(()=>{setIntent(pendingIntent??crypto.randomUUID());setAccepted(false);},[pendingIntent,offer?.version,offer?.pricePaise,offer?.units]);
 if(status==="signin")return <div className="mt-3 text-sm"><Link className="font-semibold underline" href="/login?redirectTo=%2Fai-astrologer">{copy.signIn}</Link></div>;
 if(status==="loading")return <p role="status" className="mt-3 text-sm">{copy.checkingCredits}</p>;
 if(status==="error")return <div className="mt-3 text-sm"><p role="alert">{copy.creditError}</p><Button type="button" variant="outline" disabled={busy} onClick={()=>void refresh()}>{copy.refreshCreditStatus}</Button></div>;
 if(!summary?.enabled)return null;
 const price=offer?new Intl.NumberFormat(locale==="hi"?"hi-IN":"en-IN",{style:"currency",currency:"INR"}).format(offer.pricePaise/100):"";
 const pendingMismatch=summary.unresolvedPurchase&&(!summary.pendingIntent||!summary.pendingOffer||!offer||!offerMatches(summary.pendingOffer,offer));
 return <section aria-label={copy.creditSection} className="mt-4 space-y-3 rounded-xl border border-[#dca956]/40 p-4 text-sm">
  <h3 className="font-semibold">{copy.paidCredits}</h3><p aria-live="polite">{copy.available} {summary.remaining}</p>
  <label className="flex items-start gap-2"><input type="checkbox" disabled={busy||(!paid&&summary.remaining<1)} checked={paid} onChange={event=>onPaid(event.target.checked)}/>{copy.usePaid}</label>
  <p className="text-xs">{copy.creditTerms}</p>
  {pendingMismatch?<p role="alert">{copy.pendingCredit}</p>:offer&&intent?<div className="space-y-2"><p className="font-semibold">{offer.units} {copy.responses} · {price} {copy.oneTime}</p><label className="flex items-start gap-2"><input type="checkbox" disabled={busy} checked={accepted} onChange={event=>setAccepted(event.target.checked)}/>{copy.acceptPack} <Link href="/refund-policy" className="underline" target="_blank">{copy.refundPolicy}</Link>{copy.acceptEnd}</label>{accepted&&!busy?<RazorpayCheckoutButton payload={{purpose:"AI_CREDITS",intent,version:offer.version,units:offer.units,pricePaise:offer.pricePaise,termsVersion:AI_CREDIT_TERMS_VERSION}} label={summary.unresolvedPurchase?copy.existingPayment:copy.buyCredits+" · "+price} onVerified={async()=>{setAccepted(false);const next=await refresh();if(next?.enabled&&!next.unresolvedPurchase)setIntent(crypto.randomUUID());}}/>:null}</div>:<p>{copy.packInactive}</p>}
  <div className="flex flex-wrap gap-3"><Button type="button" size="sm" variant="outline" disabled={busy} onClick={()=>void refresh()}>{copy.refreshBalance}</Button><Link className="underline" href="/dashboard">{copy.paymentHistory}</Link><Link className="underline" href="/ai-membership">{copy.membershipLink}</Link></div>
 </section>;
}

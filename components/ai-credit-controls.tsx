"use client";
import {useState,useEffect,useCallback} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {RazorpayCheckoutButton} from "@/components/razorpay-checkout-button";
import {AI_CREDIT_TERMS_VERSION,offerMatches,type CreditOffer} from "@/lib/ai/credit-contract";

export type CreditSummary={enabled:boolean;offer:CreditOffer|null;remaining:number;unresolvedPurchase:boolean;pendingIntent:string|null;pendingOffer:CreditOffer|null};
export function useCreditAccount(enabled:boolean){
 const [summary,setSummary]=useState<CreditSummary|null>(null);
 const [status,setStatus]=useState<"loading"|"signin"|"error"|"ready">("loading");
 const refresh=useCallback(async()=>{
   if(!enabled)return;
   try{const r=await fetch("/api/ai/credits",{cache:"no-store"});if(r.status===401){setSummary(null);setStatus("signin");return;}const j=await r.json();if(!r.ok||!j.data){setSummary(null);setStatus("error");return;}setSummary(j.data);setStatus("ready");}catch{setSummary(null);setStatus("error");}
 },[enabled]);
 useEffect(()=>{void refresh();},[refresh]);
 return {summary,status,refresh};
}
export function AiCreditControls({account,paid,onPaid,busy}:{account:ReturnType<typeof useCreditAccount>;paid:boolean;onPaid:(v:boolean)=>void;busy:boolean}){
 const [accepted,setAccepted]=useState(false);
 const [intent,setIntent]=useState<string|null>(null);
 const {summary,status,refresh}=account;
 const offer=summary?.offer;
 useEffect(()=>{setIntent(summary?.pendingIntent??crypto.randomUUID());setAccepted(false);},[summary?.pendingIntent,offer?.version,offer?.pricePaise,offer?.units]);
 if(status==="signin")return <div className="mt-3 text-sm"><Link className="font-semibold underline" href="/login?redirectTo=%2Fai-astrologer">Sign in to manage AI credits</Link></div>;
 if(status==="loading")return <p role="status" className="mt-3 text-sm">Checking paid credit availability…</p>;
 if(status==="error")return <div className="mt-3 text-sm"><p>Credit balance unavailable. Do not start another payment.</p><Button type="button" variant="outline" onClick={()=>void refresh()}>Refresh credit status</Button></div>;
 if(!summary?.enabled)return null;
 const price=offer?new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(offer.pricePaise/100):"";
 const pendingMismatch=summary.unresolvedPurchase&&(!summary.pendingIntent||!summary.pendingOffer||!offer||!offerMatches(summary.pendingOffer,offer));
 return <section aria-label="AI response credits" className="mt-4 space-y-3 rounded-xl border border-[#dca956]/40 p-4 text-sm">
 <h3 className="font-semibold">Paid AI credits</h3>
 <p aria-live="polite">Available responses: {summary.remaining}</p>
 <label className="flex items-start gap-2"><input type="checkbox" disabled={busy||(!paid&&summary.remaining<1)} checked={paid} onChange={e=>onPaid(e.target.checked)}/>Use one paid credit for the next completed answer instead of the free quota.</label>
 <p className="text-xs">No automatic switch from free to paid. Provider failures release the reservation; interrupted requests can be reviewed in your credit balance. Maximum 60 paid attempts per account per day. No promised prediction or recurring subscription.</p>
 {pendingMismatch?<p role="alert">An earlier credit purchase requires reconciliation. Review Payment History or contact support before another payment.</p>:offer&&intent?<div className="space-y-2"><p className="font-semibold">{offer.units} completed responses · {price} one-time payment</p><label className="flex items-start gap-2"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/>I accept the displayed credit quantity, one-time fee and <Link href="/refund-policy" className="underline" target="_blank">refund policy</Link>.</label>{accepted?<RazorpayCheckoutButton payload={{purpose:"AI_CREDITS",intent,version:offer.version,units:offer.units,pricePaise:offer.pricePaise,termsVersion:AI_CREDIT_TERMS_VERSION}} label={summary.unresolvedPurchase?"Review existing credit payment":"Buy credits · "+price} onVerified={async()=>{setAccepted(false);await refresh();setIntent(crypto.randomUUID());}}/>:null}</div>:<p>New credit-pack sales are not active.</p>}
 <div className="flex flex-wrap gap-3"><Button type="button" size="sm" variant="outline" onClick={()=>void refresh()}>Refresh balance</Button><Link className="underline" href="/dashboard">Payment history</Link></div></section>;
}

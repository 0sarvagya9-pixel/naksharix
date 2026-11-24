"use client";
import {useEffect,useState} from "react";
import {useLanguage} from "@/components/language-provider";
import {checkoutCopy,checkoutCountryLabel} from "@/lib/shop/checkout-copy";
import {RazorpayCheckoutButton} from "@/components/razorpay-checkout-button";
import {SHIPPING_TERMS_VERSION,countryName,type ShippingSnapshot} from "@/lib/shop/shipping-rules";
const money=(paise:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(paise/100);
export function ShopOrderPayButton({orderId,totalPaise,country,quote,orderVersion}:{orderId:string;totalPaise:number;country:string;quote:ShippingSnapshot|null;orderVersion:number}){
 const {apiLocale}=useLanguage(),copy=checkoutCopy[apiLocale];
 const key=JSON.stringify([orderId,orderVersion,country,totalPaise,quote]);
 const [consentKey,setConsentKey]=useState<string|null>(null);
 const [clock,setClock]=useState(()=>Date.now());
 useEffect(()=>{if(country==="IN"||!quote?.expiresAt)return;const t=window.setInterval(()=>setClock(Date.now()),1000);return()=>window.clearInterval(t)},[country,quote?.expiresAt]);
 const consent=consentKey===key;
 if(country==="IN")return <RazorpayCheckoutButton payload={{purpose:"SHOP_ORDER",shopOrderId:orderId,expectedTotalPaise:totalPaise}} label={copy.pay+" "+money(totalPaise)+" "+copy.withRazorpay} successHref="/orders"/>;
 if(!quote||!quote.expiresAt||!Number.isFinite(Date.parse(quote.expiresAt))||Date.parse(quote.expiresAt)<=Math.max(clock,Date.now()))return <p role="status" className="text-sm">{copy.renew}</p>;
 return <div className="space-y-3 rounded-lg border border-[#e5c7a9] bg-white p-3">
  <p className="text-sm font-semibold">{copy.confirmDelivery} {checkoutCountryLabel(country,countryName(country),apiLocale)} · {money(totalPaise)}</p>
  <p className="text-xs">{copy.courier}: {quote.carrier} · {copy.shipping} {money(quote.shippingPaise)} · {copy.tax} {money(quote.taxPaise)}</p>
  <p className="text-xs leading-5">{quote.dutiesMode==="INCLUDED"?copy.dutiesIncluded:copy.customs}</p>
  <label className="flex items-start gap-2 text-xs leading-5"><input type="checkbox" checked={consent} onChange={e=>setConsentKey(e.target.checked?key:null)} className="mt-1"/>{copy.acceptPay}</label>
  {consent?<RazorpayCheckoutButton payload={{purpose:"SHOP_ORDER",shopOrderId:orderId,expectedTotalPaise:totalPaise,expectedOrderVersion:orderVersion,shippingTermsVersion:SHIPPING_TERMS_VERSION}} label={copy.pay+" "+money(totalPaise)+" "+copy.withRazorpay} successHref="/orders"/>:<button type="button" disabled className="w-full rounded-xl bg-[#822c40] px-4 py-3 font-bold text-white opacity-50">{copy.acceptToPay}</button>}
 </div>;
}

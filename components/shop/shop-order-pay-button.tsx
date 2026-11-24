"use client";
import {useState} from "react";
import {RazorpayCheckoutButton} from "@/components/razorpay-checkout-button";
import {CUSTOMS_NOTICE,SHIPPING_TERMS_VERSION,countryName,type ShippingSnapshot} from "@/lib/shop/shipping-rules";
const money=(paise:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(paise/100);
export function ShopOrderPayButton({orderId,totalPaise,country,quote,orderVersion}:{orderId:string;totalPaise:number;country:string;quote:ShippingSnapshot|null;orderVersion:number}){
 const [consent,setConsent]=useState(false);
 if(country==="IN")return <RazorpayCheckoutButton payload={{purpose:"SHOP_ORDER",shopOrderId:orderId,expectedTotalPaise:totalPaise}} label={"Pay "+money(totalPaise)+" with Razorpay"} successHref="/orders"/>;
 if(!quote||!quote.expiresAt||Date.parse(quote.expiresAt)<=Date.now())return <p className="text-sm">The international quote needs renewal. Contact support before payment.</p>;
 return <div className="space-y-3 rounded-lg border border-[#e5c7a9] bg-white p-3">
  <p className="text-sm font-semibold">Confirm delivery to {countryName(country)} · {money(totalPaise)}</p>
  <p className="text-xs">Courier: {quote.carrier} · Shipping {money(quote.shippingPaise)} · Additional checkout tax {money(quote.taxPaise)}</p>
  <p className="text-xs leading-5">{quote.dutiesMode==="INCLUDED"?"The confirmed quote includes destination duties and import charges.":CUSTOMS_NOTICE}</p>
  <label className="flex items-start gap-2 text-xs leading-5"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/>I accept this exact quoted amount and the stated customs terms.</label>
  {consent?<RazorpayCheckoutButton payload={{purpose:"SHOP_ORDER",shopOrderId:orderId,expectedTotalPaise:totalPaise,expectedOrderVersion:orderVersion,shippingTermsVersion:SHIPPING_TERMS_VERSION}} label={"Pay "+money(totalPaise)+" with Razorpay"} successHref="/orders"/>:<button type="button" disabled className="w-full rounded-xl bg-[#822c40] px-4 py-3 font-bold text-white opacity-50">Accept terms to pay</button>}
 </div>;
}

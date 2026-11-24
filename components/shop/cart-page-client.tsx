"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResilientShopPhoto } from "@/components/shop/resilient-shop-photo";
import { ShopOrderPayButton } from "@/components/shop/shop-order-pay-button";
import {SHIPPING_COUNTRIES,SHIPPING_TERMS_VERSION,postalRequired,validPostal,normalizePostal,countryName,type ShippingSnapshot} from "@/lib/shop/shipping-rules";
import { secureFetch } from "@/lib/security/csrf";
import {categoryLabel,type ShopProduct} from "@/lib/manual-catalogue";
import {useLanguage} from "@/components/language-provider";
import {checkoutCopy,checkoutCountryLabel,checkoutPostalHint,type CheckoutCopyKey} from "@/lib/shop/checkout-copy";
import {cartFingerprint,readCheckoutQuote,readCheckoutOrder,quoteStillCurrent,checkoutErrorKey,checkoutIntentAlreadyUsed,type CheckoutQuote} from "@/lib/shop/checkout-contract";
import {siteNotice} from "@/lib/ui/site-notification";
import { readCart, writeCart, reserveCartCheckoutIntent, clearConfirmedCart, SHOP_CART_STORAGE_KEY, type CartLine } from "@/components/shop/quote-cart-controls";

type Props={ products:ShopProduct[]; signedIn:boolean; checkoutAvailable:boolean };

const money=(paise:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(paise/100);
const inputClass="mt-1 block w-full min-h-11 rounded-xl border border-[#ddc8b5] bg-white px-3 py-2 text-[#372630] focus:border-[#8a3046] focus:outline-none focus:ring-2 focus:ring-[#8a3046]/10";
export function CartPageClient({products,signedIn,checkoutAvailable}:Props){
 const router=useRouter();
 const {apiLocale}=useLanguage(),copy=checkoutCopy[apiLocale];
 const inFlight=useRef(false);
 const [uncertain,setUncertain]=useState(false);
 const [serverCheckout,setServerCheckout]=useState(false);
 const notice=(key:CheckoutCopyKey)=>siteNotice.error(copy[key],copy.review);
 const [lines,setLines]=useState<CartLine[]>([]);
 const [pending,setPending]=useState(false);
 const [issue,setIssue]=useState<CheckoutCopyKey|null>(null);
 const [orderId,setOrderId]=useState("");
 const [orderPayable,setOrderPayable]=useState<number|null>(null);
 const [orderShipping,setOrderShipping]=useState<number|null>(null);
 const [orderTax,setOrderTax]=useState<number|null>(null);
 const [orderCountry,setOrderCountry]=useState("IN");
 const [orderVersion,setOrderVersion]=useState(1);
 const [orderQuote,setOrderQuote]=useState<ShippingSnapshot|null>(null);
 const [orderStatus,setOrderStatus]=useState("");
 const [buyerName,setBuyerName]=useState("");
 const [buyerPhone,setBuyerPhone]=useState("");
 const [address,setAddress]=useState("");
 const [city,setCity]=useState("");
 const [stateName,setStateName]=useState("");
 const [postalCode,setPostalCode]=useState("");
 const [country,setCountry]=useState("IN");
 const [quoteResult,setQuoteResult]=useState<{key:string;quote:CheckoutQuote}|null>(null);
 const [quoteIssue,setQuoteIssue]=useState<CheckoutCopyKey|null>(null);
 const [quoteBusy,setQuoteBusy]=useState(false);
 const [quoteRevision,setQuoteRevision]=useState(0);
 const [acceptedKey,setAcceptedKey]=useState<string|null>(null);
 const [message,setMessage]=useState("");
 useEffect(()=>{
   const load=()=>setLines(readCart());load();
   const sync=(event:StorageEvent)=>{if(event.key===SHOP_CART_STORAGE_KEY||event.key===null)load()};
   window.addEventListener("naksharix-cart-changed",load);
   window.addEventListener("storage",sync);
   return()=>{window.removeEventListener("naksharix-cart-changed",load);window.removeEventListener("storage",sync)};
 },[]);
 const productMap=useMemo(()=>new Map(products.filter(p=>p.status==="active").map(p=>[p.id,p])),[products]);
 const valid=useMemo(()=>lines.filter(l=>productMap.has(l.productId)),[lines,productMap]);
 const total=valid.reduce((sum,line)=>sum+(productMap.get(line.productId)?.unitPricePaise||0)*line.quantity,0);
 const unpriced=valid.some(l=>!productMap.get(l.productId)?.unitPricePaise);
 const unavailable=lines.length!==valid.length;
 const locked=pending||uncertain||!!orderId;
 const international=country!=="IN",normalizedPostal=normalizePostal(country,postalCode),postalOK=validPostal(country,normalizedPostal);
 const itemsJSON=JSON.stringify(valid.map(l=>({productId:l.productId,quantity:l.quantity})));
 const selectionKey=country+"|"+normalizedPostal+"|"+itemsJSON+"|"+total+"|"+quoteRevision;
 const currentQuote=quoteResult?.key===selectionKey?quoteResult.quote:null;
 const quote=quoteStillCurrent(currentQuote)?currentQuote:null;
 const accepted=quote!==null&&acceptedKey===quote.quoteKey;
 const finalTotal=international?quote?.totalPaise??null:total;
 useEffect(()=>{
   if(!signedIn||!international||!postalOK||!valid.length||unpriced||unavailable||locked){setQuoteBusy(false);return;}
   setQuoteBusy(true);setQuoteIssue(null);
   let current=true;const controller=new AbortController();
   const timer=window.setTimeout(async()=>{
     setQuoteIssue(null);
     try{
       const response=await secureFetch("/api/commerce/shipping-quote",{method:"POST",headers:{"Content-Type":"application/json"},signal:controller.signal,silent:true,body:JSON.stringify({items:JSON.parse(itemsJSON),country,postalCode:normalizedPostal})});
       const result=await response.json().catch(()=>null);
       if(!response.ok){if(current)setQuoteIssue(response.status===409?"changed":"quoteError");return;}
       const checked=readCheckoutQuote(result?.data,total);
       if(!checked){if(current)setQuoteIssue("quoteError");return;}
       if(current)setQuoteResult({key:selectionKey,quote:checked});
     }catch{if(current)setQuoteIssue("quoteError");}
     finally{if(current)setQuoteBusy(false)}
   },450);
   return()=>{current=false;clearTimeout(timer);controller.abort()};
 },[signedIn,international,postalOK,valid.length,unpriced,unavailable,locked,itemsJSON,country,normalizedPostal,selectionKey,total]);
 useEffect(()=>{
   if(locked||currentQuote?.kind!=="PUBLISHED_RATE"||!currentQuote.expiresAt)return;
   const deadline=Date.parse(currentQuote.expiresAt);
   let timer:number|undefined;
   const check=()=>{const remaining=deadline-Date.now();if(remaining<=0){setAcceptedKey(null);setQuoteRevision(n=>n+1);setQuoteIssue("quoteExpired");return;}timer=window.setTimeout(check,Math.min(remaining+50,2147483647))};
   check();
   return()=>{if(timer!==undefined)clearTimeout(timer)};
 },[currentQuote,locked]);
 function changeCountry(next:string){if(locked)return;setCountry(next);setPostalCode("");setStateName("");setAcceptedKey(null);setQuoteBusy(false);setQuoteIssue(null);}
 function changePostal(next:string){if(locked)return;setPostalCode(next);setAcceptedKey(null);setQuoteIssue(null);setQuoteBusy(false);}

 function update(id:string,qty:number){
   if(locked)return;
   const next=lines.filter(l=>l.productId!==id);
   if(qty>0)next.push({productId:id,quantity:Math.min(10,qty)});
   try{writeCart(next);setLines(next);setIssue(null);setAcceptedKey(null);setQuoteIssue(null);setQuoteBusy(false);}
   catch{setIssue("cartStorage");notice("cartStorage");}
 }
 async function submitOrder(e:FormEvent<HTMLFormElement>){
   e.preventDefault();
   if(inFlight.current||locked||!signedIn||!valid.length||unpriced||unavailable||!postalOK)return;
   if(international&&(!quote||!accepted||!quoteStillCurrent(quote))){setIssue("reviewQuote");notice("reviewQuote");return;}
   const fingerprint=cartFingerprint(lines);
   inFlight.current=true;
   setPending(true);setIssue(null);
   try{
     let checkoutIntent:string;
     try{checkoutIntent=await reserveCartCheckoutIntent(lines);}catch{setIssue("cartStorage");notice("cartStorage");return;}
     const response=await secureFetch("/api/commerce/orders",{
       method:"POST",headers:{"Content-Type":"application/json"},silent:true,
       body:JSON.stringify({
         items:valid.map(l=>({productId:l.productId,quantity:l.quantity})),
         expectedSubtotalPaise:total,checkoutIntent,
         customerName:buyerName.trim(),customerPhone:buyerPhone.trim(),
         deliveryAddress:address.trim(),deliveryCity:city.trim(),
         deliveryState:stateName.trim(),deliveryCountry:country,postalCode:normalizedPostal,
         ...(international?{expectedShippingQuoteKey:quote?.quoteKey,shippingTermsVersion:SHIPPING_TERMS_VERSION}:{}),
         customerNote:message.trim()
       })
     });
     const payload=await response.json().catch(()=>null);
     if(!response.ok){
       if(checkoutIntentAlreadyUsed(response.status,payload)){setUncertain(true);setIssue("uncertain");notice("uncertain");return;}
       const key=checkoutErrorKey(response.status);
       if(key==="uncertain")setUncertain(true);
       if(response.status===409){setAcceptedKey(null);setQuoteRevision(n=>n+1);router.refresh();}
       setIssue(key);notice(key);return;
     }
     const confirmed=readCheckoutOrder(payload,{country,postalCode:normalizedPostal,subtotalPaise:total,quote:international?quote:null});
     if(!confirmed){setUncertain(true);setIssue("uncertain");notice("uncertain");return;}
     const order=confirmed.order;
     setServerCheckout(confirmed.onlineCheckoutAvailable);
     setOrderId(order.id);setOrderPayable(order.totalPaise);
     setOrderShipping(order.shippingPaise);setOrderTax(order.taxPaise);setOrderCountry(order.deliveryCountry);setOrderQuote(order.shippingQuote);setOrderVersion(order.version);
     setOrderStatus(order.status);
     siteNotice.success(copy[order.totalPaise===null?"quoteRequested":"orderSaved"],copy.orderUpdate);
     try{if(await clearConfirmedCart(fingerprint,checkoutIntent)){setLines([]);}else{setIssue("cartChanged");}}catch{setIssue("cartClear");}
     router.refresh();
   }catch{setUncertain(true);setIssue("uncertain");notice("uncertain");}
   finally{inFlight.current=false;setPending(false);}
 }
 return <main className="mx-auto max-w-6xl px-4 py-8 text-[#372630] md:px-6 md:py-12">
   <div className="flex flex-wrap items-end justify-between gap-3">
     <div>
       <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9b6e36]">{copy.shop}</p>
       <h1 className="mt-2 font-cinzel text-3xl font-bold md:text-4xl">{copy.title}</h1>
       <p className="mt-2 text-sm text-[#66515b]">{copy.intro}</p>
     </div>
     <Link href="/shop" className="rounded-xl border border-[#dabb9d] px-4 py-2 text-sm font-semibold hover:bg-white">{copy.continue}</Link>
   </div>
   {issue?<div role="alert" className="mt-5 rounded-xl border border-[#dba8af] bg-[#fff1f1] p-4 text-sm font-semibold text-[#922e40]">{copy[issue]}{uncertain?<p className="mt-2"><Link href="/orders" className="underline">{copy.orders}</Link></p>:null}</div>:null}
   {unavailable&&!orderId?<div role="alert" className="mt-5 rounded-xl border bg-white p-4 text-sm">{copy.unavailableItems} <button type="button" disabled={locked} onClick={()=>{try{writeCart(valid);setLines(valid);setAcceptedKey(null);}catch{setIssue("cartStorage")}}} className="font-semibold underline">{copy.removeUnavailable}</button></div>:null}
   {orderId?<section role="status" className="mt-7 max-w-2xl rounded-2xl border border-[#b6d5b8] bg-[#f5fff3] p-6">
      <h2 className="text-2xl font-bold">{orderPayable===null?copy.quoteRequested:copy.orderSaved}</h2>
      <p className="mt-2 text-sm">{copy.reference}: <strong className="break-all">{orderId}</strong></p>
      <p className="mt-2 text-sm">{copy.destination}: {checkoutCountryLabel(orderCountry,countryName(orderCountry),apiLocale)}</p>
      <p className="mt-2 text-sm">{copy.shipping}: {orderShipping===null?copy.quotePending:money(orderShipping)} · {copy.tax}: {orderTax===null?copy.pending:money(orderTax)}</p>
      <p className="mt-2 text-lg font-bold">{copy.total}: {orderPayable===null?copy.awaiting:money(orderPayable)}</p>
      {checkoutAvailable&&serverCheckout&&orderStatus==="CONFIRMED"&&orderPayable!==null?
        <div className="mt-5 max-w-sm"><ShopOrderPayButton orderId={orderId} totalPaise={orderPayable} country={orderCountry} quote={orderQuote} orderVersion={orderVersion}/></div>:
        <p className="mt-3 text-sm">{orderPayable===null?copy.noPayment:copy.saved}</p>}
      <Link href="/orders" className="mt-5 inline-block rounded-xl border border-[#b5cbb7] bg-white px-4 py-3 font-bold text-[#762e3d]">{copy.orders}</Link>
   </section>:!valid.length?<div className="mt-8 rounded-2xl border border-[#e6cbb0] bg-white p-8">
     <p>{copy.empty}</p><Link href="/shop" className="mt-4 inline-block font-bold text-[#842d40] underline">{copy.explore}</Link>
   </div>:<div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
     <section aria-label={copy.products} className="space-y-3">
       {valid.map(line=>{const p=productMap.get(line.productId)!;return <article key={p.id}
         className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e7d3c3] bg-white p-4 shadow-sm">
         <Link href={"/shop/"+encodeURIComponent(p.slug)} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#eddbcb] bg-[#fff8f0] p-1">
           <ResilientShopPhoto src={p.galleryImages?.[0]?.url||p.imageUrl||"/shop/combo-placeholder.svg"}
             alt={p.galleryImages?.[0]?.alt||p.imageAlt[apiLocale]||p.name[apiLocale]} width={120} height={120} className="h-full w-full rounded-lg object-contain"/>
         </Link>
         <div className="min-w-[130px] flex-1">
           <Link href={"/shop/"+encodeURIComponent(p.slug)} className="font-bold text-[#792c41] hover:underline">{p.name[apiLocale]}</Link>
           <p className="mt-1 text-xs text-[#725a61]">{categoryLabel(p.category,apiLocale)}</p>
           <p className="mt-2 font-bold">{p.unitPricePaise?money(p.unitPricePaise):copy.priceUnavailable}</p>
         </div>
         <div className="flex items-center gap-2">
           <button type="button" disabled={locked} aria-label={copy.decrease+": "+p.name[apiLocale]} onClick={()=>update(p.id,line.quantity-1)} className="h-9 w-9 rounded-lg border bg-white">−</button>
           <output aria-label={copy.quantity}>{line.quantity}</output>
           <button type="button" disabled={locked||line.quantity>=10} aria-label={copy.increase+": "+p.name[apiLocale]} onClick={()=>update(p.id,line.quantity+1)} className="h-9 w-9 rounded-lg border bg-white">+</button>
         </div>
         <button type="button" disabled={locked} onClick={()=>update(p.id,0)} className="text-sm font-semibold text-[#8b3043] underline">{copy.remove}</button>
       </article>})}
     </section>
     <aside className="rounded-2xl border border-[#e5c7a9] bg-[#fff5e9] p-5 shadow-sm">
       <h2 className="font-cinzel text-xl font-bold">{copy.summary}</h2>
       <div className="mt-4 flex justify-between text-sm"><span>{copy.items} ({valid.reduce((n,l)=>n+l.quantity,0)})</span><strong>{money(total)}</strong></div>
       <div className="mt-4 rounded-xl border border-[#e2c5a5] bg-white p-3">
         <label className="block text-sm font-semibold">{copy.country}<select disabled={locked} autoComplete="country" className={inputClass} value={country} onChange={e=>changeCountry(e.target.value)}>{SHIPPING_COUNTRIES.map(c=><option key={c.code} value={c.code}>{checkoutCountryLabel(c.code,c.name,apiLocale)}</option>)}</select></label>
         <p className="mt-2 text-xs text-[#745e65]">{international?copy.international:copy.domestic}</p>
       </div>
       <div className="mt-4 flex justify-between gap-3 text-sm"><span>{copy.shipping}</span><strong className="text-right">{international?quote?.shippingPaise!=null?money(quote.shippingPaise):quoteBusy?copy.calculating:copy.quoteRequired:copy.included}</strong></div>
       <div className="mt-2 flex justify-between gap-3 text-sm"><span>{copy.tax}</span><span>{international?quote?.taxPaise!=null?money(quote.taxPaise):copy.pending:"₹0"}</span></div>
       <div className="mt-4 flex justify-between gap-3 border-t border-[#e5c7a9] pt-4 text-lg font-bold"><span>{copy.totalINR}</span><span className="text-right">{finalTotal===null?copy.quotePending:money(finalTotal)}</span></div>
       {international&&quote?.carrier?<p className="mt-2 text-xs text-[#6f5b60]">{copy.courier}: {quote.carrier}{quote.expiresAt?" · "+copy.validUntil+" "+new Date(quote.expiresAt).toLocaleString(apiLocale==="hi"?"hi-IN":"en-IN"):""}</p>:null}
       {international?<p className="mt-3 text-xs leading-5 text-[#6f5b60]">{quote?.dutiesMode==="INCLUDED"?copy.dutiesIncluded:copy.customs} {quote?.kind==="QUOTE_REQUIRED"?copy.noObligation:""}</p>:<p className="mt-2 text-xs text-[#6f5b60]">{copy.history}</p>}
       {!signedIn?<div className="mt-6 rounded-xl border border-[#e2c5a5] bg-white p-4">
         <h3 className="font-bold">{copy.signInTitle}</h3>
         <p className="mt-2 text-sm">{copy.signInInfo}</p>
         <Link href="/login?redirectTo=%2Fcart" className="mt-4 block rounded-xl bg-[#822c40] px-4 py-3 text-center font-bold text-white">{copy.signIn}</Link>
         <Link href="/signup?redirectTo=%2Fcart" className="mt-3 block text-center text-sm font-semibold text-[#822c40] underline">{copy.create}</Link>
       </div>:<form className="mt-6 space-y-3" onSubmit={submitOrder} aria-label={copy.delivery}>
         <h3 className="font-cinzel text-lg font-bold">{copy.delivery}</h3>
         <label className="block text-sm font-semibold">{copy.fullName}<input disabled={locked} required autoComplete="name" minLength={2} maxLength={120} className={inputClass} value={buyerName} onChange={e=>setBuyerName(e.target.value)}/></label>
         <label className="block text-sm font-semibold">{copy.mobile}<input disabled={locked} required type="tel" autoComplete="tel" inputMode="tel" pattern="[+0-9() -]{8,20}" className={inputClass} value={buyerPhone} onChange={e=>setBuyerPhone(e.target.value)}/></label>
         <label className="block text-sm font-semibold">{copy.address}<textarea disabled={locked} required autoComplete="street-address" minLength={12} maxLength={350} rows={2} className={inputClass} value={address} onChange={e=>setAddress(e.target.value)}/></label>
         <div className="grid gap-3 sm:grid-cols-2">
           <label className="block text-sm font-semibold">{copy.city}<input disabled={locked} required autoComplete="address-level2" minLength={2} maxLength={90} className={inputClass} value={city} onChange={e=>setCity(e.target.value)}/></label>
           <label className="block text-sm font-semibold">{international?copy.region:copy.state}<input disabled={locked} required={!international} autoComplete="address-level1" minLength={international?0:2} maxLength={90} className={inputClass} value={stateName} onChange={e=>setStateName(e.target.value)}/></label>
         </div>
         <label className="block text-sm font-semibold">{international?copy.postal:copy.pin}<input disabled={locked} required={postalRequired(country)} autoComplete="postal-code" pattern={international?undefined:"[1-9][0-9]{5}"} maxLength={international?16:6} inputMode={international?"text":"numeric"} placeholder={checkoutPostalHint(country,postalRequired(country),apiLocale)} className={inputClass} value={postalCode} onChange={e=>changePostal(e.target.value)}/></label>
         {postalCode&&!postalOK?<p className="text-xs text-[#8b3043]" role="alert">{copy.validPostal}</p>:null}
         {international&&quoteIssue?<div role="alert" className="text-xs text-[#8b3043]">{copy[quoteIssue]} <button type="button" disabled={locked} className="underline" onClick={()=>{setQuoteIssue(null);setQuoteRevision(n=>n+1);setAcceptedKey(null)}}>{copy.retryQuote}</button></div>:null}
         {international&&quote?<label className="flex items-start gap-2 text-xs leading-5"><input type="checkbox" disabled={locked} required checked={accepted} onChange={e=>setAcceptedKey(e.target.checked?quote.quoteKey:null)} className="mt-1"/>{copy.acceptQuote}</label>:null}
         <label className="block text-sm font-semibold">{copy.note}<textarea disabled={locked} rows={2} maxLength={1000} className={inputClass} value={message} onChange={e=>setMessage(e.target.value)}/></label>
         <button type="submit" disabled={locked||unavailable||unpriced||!postalOK||(international&&(!quote||!accepted||quoteBusy))} className="mt-2 w-full rounded-xl bg-[#822c40] px-4 py-4 font-bold text-white disabled:opacity-50">
           {pending?copy.submitting:international&&quote?.kind==="QUOTE_REQUIRED"?copy.requestQuote:checkoutAvailable?copy.placeAndPay:copy.placeOrder}
         </button>
         <p className="text-xs text-[#745e65]">{international&&quote?.kind==="QUOTE_REQUIRED"?copy.noPaymentUntil:checkoutAvailable?copy.paymentInfo:copy.paymentLater}</p>
       </form>}
     </aside>
   </div>}
 </main>;
}

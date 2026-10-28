"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ResilientShopPhoto } from "@/components/shop/resilient-shop-photo";
import { secureFetch } from "@/lib/security/csrf";
import type { ShopProduct } from "@/lib/manual-catalogue";
import { readCart, writeCart, type CartLine } from "@/components/shop/quote-cart-controls";

export function CartPageClient({products}:{products:ShopProduct[]}){
 const [lines,setLines]=useState<CartLine[]>([]);
 const [city,setCity]=useState("");
 const [message,setMessage]=useState("");
 const [pending,setPending]=useState(false);
 const [ticket,setTicket]=useState("");
 const [orderId,setOrderId]=useState("");
 const [buyerName,setBuyerName]=useState("");
 const [buyerPhone,setBuyerPhone]=useState("");
 const [address,setAddress]=useState("");
 const [stateName,setStateName]=useState("");
 const [postalCode,setPostalCode]=useState("");
 const [issue,setIssue]=useState("");
 useEffect(()=>{const load=()=>setLines(readCart());load();window.addEventListener("naksharix-cart-changed",load);return()=>window.removeEventListener("naksharix-cart-changed",load)},[]);
 const productMap=useMemo(()=>new Map(products.filter(p=>p.status==="active").map(p=>[p.id,p])),[products]);
 const valid=lines.filter(l=>productMap.has(l.productId));
 const total=valid.reduce((sum,line)=>sum+(productMap.get(line.productId)?.unitPricePaise||0)*line.quantity,0);
 const unpriced=valid.some(l=>!productMap.get(l.productId)?.unitPricePaise);
 const formatter=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
 async function submitQuote(event:FormEvent<HTMLFormElement>){
   event.preventDefault();
   if(pending||!valid.length)return;
   setPending(true);setIssue("");
   try{
     const response=await secureFetch("/api/commerce/cart-quote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:valid.map(l=>({productId:l.productId,quantity:l.quantity})),city:city.trim(),message:message.trim()})});
     const payload=await response.json();
     if(!response.ok)throw new Error(payload.error||"Quote request failed.");
     const id=payload.data?.ticket?.id;
     if(typeof id!=="string")throw new Error("No tracked support ticket returned.");
     setTicket(id);
   }catch(e){setIssue(e instanceof Error?e.message:"Quote request failed.")}finally{setPending(false)}
 }
 async function submitOrder(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(pending||!valid.length||unpriced)return;
  setPending(true);setIssue("");
  try{
    const response=await secureFetch("/api/commerce/orders",{method:"POST",headers:{"Content-Type":"application/json"},
     body:JSON.stringify({items:valid.map(l=>({productId:l.productId,quantity:l.quantity})),
       customerName:buyerName.trim(),customerPhone:buyerPhone.trim(),deliveryAddress:address.trim(),
       deliveryCity:city.trim(),deliveryState:stateName.trim(),postalCode:postalCode.trim(),customerNote:message.trim()})});
    const body=await response.json();
    if(!response.ok)throw new Error(body.error||"Order request failed.");
    const id=body.data?.order?.id;
    if(typeof id!=="string")throw new Error("Order was not confirmed by the server.");
    setOrderId(id);
    try{writeCart([]);setLines([])}catch{setIssue("Order was saved, but this browser could not clear the local cart. Do not place the same order twice. Track it under My Orders.")}
  }catch(e){setIssue(e instanceof Error?e.message:"Order request failed.")}
  finally{setPending(false)}
 }
 function update(id:string,qty:number){const next=lines.filter(l=>l.productId!==id);if(qty>0)next.push({productId:id,quantity:Math.min(10,qty)});try{writeCart(next);setLines(next);setIssue("")}catch{setIssue("Cart changes could not be saved in this browser. Please enable storage and retry.")}}
 return <div className="mx-auto max-w-5xl px-5 py-12">
  <p className="text-xs font-extrabold uppercase tracking-[.21em] text-[#9d453c]">Spiritual catalogue</p>
  <h1 className="mt-3 font-cinzel text-4xl font-bold text-[#35232b]">Your cart</h1>
  <p className="mt-3 max-w-3xl leading-7 text-[#66515b]">Save items and quantities before requesting confirmed prices and fulfilment terms. No payment is charged from this cart.</p>
  {!valid.length?<div className="mt-8 rounded-2xl border border-[#ead3b5] bg-white p-8"><p>Your cart is empty.</p><Link href="/shop" className="mt-4 inline-block font-bold text-[#842d40] underline">Explore products</Link></div>:
  <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
   <section aria-label="Selected products" className="space-y-4">
   {valid.map(line=>{const p=productMap.get(line.productId)!;return <article key={p.id} className="flex flex-wrap items-center gap-5 rounded-2xl border border-[#e6cbb0] bg-white p-5 shadow-sm">
    <Link href={"/shop/"+encodeURIComponent(p.slug)} aria-label={"View "+p.name.en} className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#e6cbb0] bg-[#fff8ef] p-1">
      <ResilientShopPhoto src={p.galleryImages?.[0]?.url || p.imageUrl || "/shop/combo-placeholder.svg"} alt={p.galleryImages?.[0]?.alt || p.imageAlt.en || p.name.en} width={144} height={144} className="h-full w-full rounded-lg object-contain"/>
    </Link>
    <div className="min-w-0 flex-1"><Link href={"/shop/"+encodeURIComponent(p.slug)} className="text-lg font-bold text-[#70283b] hover:underline">{p.name.en}</Link>
    <p className="mt-1 text-sm text-[#635159]">{p.category}</p>
    <p className="mt-2 font-bold">{p.unitPricePaise?formatter.format(p.unitPricePaise/100):"Price awaiting verification"}</p></div>
    <div className="flex items-center gap-3"><button aria-label={"Decrease "+p.name.en+" quantity"} onClick={()=>update(p.id,line.quantity-1)} className="h-9 w-9 rounded-lg border">−</button>
    <output aria-label="Quantity">{line.quantity}</output><button aria-label={"Increase "+p.name.en+" quantity"} onClick={()=>update(p.id,line.quantity+1)} className="h-9 w-9 rounded-lg border">+</button></div>
    <button onClick={()=>update(p.id,0)} className="text-sm font-bold text-[#872d3e] underline">Remove</button>
    <Link href={"/commerce-enquiry?kind=SHOP&item="+encodeURIComponent(p.id)} className="text-sm font-bold text-[#7b3445] underline">Request confirmed terms</Link>
   </article>})}
   </section>
   <aside className="h-fit rounded-2xl border border-[#e4be87] bg-[#fff4e5] p-6">
     <h2 className="font-cinzel text-xl font-bold text-[#632638]">Cart summary</h2>
     <p className="mt-4 text-sm">{valid.reduce((sum,l)=>sum+l.quantity,0)} selected items</p>
     <p className="mt-3 text-xl font-bold">{unpriced?"Final price pending verification":formatter.format(total/100)}</p>
     {unpriced?<p className="mt-3 text-sm leading-6 text-[#674f56]">Some products do not yet have approved selling prices. No totals or charges are invented.</p>:<p className="mt-3 text-sm leading-6 text-[#674f56]">Market-compared product subtotal only; shipping, applicable tax, exact contents, and final availability must still be confirmed before any payment.</p>}
     <p className="mt-5 rounded-lg border border-[#ebcfad] bg-white p-3 text-sm">Secure checkout is not enabled until supplier fulfilment and refund operations are verified. Request a quote for each item above.</p>
     {ticket ? <div role="status" className="mt-5 rounded-xl border border-[#bfdeb9] bg-white p-4 text-sm">
       <p className="font-semibold">Request received. No payment was taken.</p>
       <p className="mt-2 break-all">Ticket: {ticket}</p>
       <Link className="mt-3 inline-block font-bold text-[#762c3c] underline" href="/support">Track your request</Link>
     </div> :
     <form className="mt-5 space-y-3" onSubmit={submitQuote}>
       <label className="block text-sm font-bold text-[#482b36]">Delivery city
         <input required minLength={2} maxLength={90} value={city} onChange={event=>setCity(event.target.value)}
           className="mt-2 block min-h-11 w-full rounded-lg border border-[#d9b78b] bg-white px-3 text-[#382430]" placeholder="Your city"/>
       </label>
       <label className="block text-sm font-bold text-[#482b36]">Request details
         <textarea required minLength={10} maxLength={1200} rows={3} value={message} onChange={event=>setMessage(event.target.value)}
           className="mt-2 block w-full rounded-lg border border-[#d9b78b] bg-white p-3 text-[#382430]" placeholder="Ask about size, authenticity and delivery terms."/>
       </label>
       {issue?<p role="alert" className="text-sm font-semibold text-[#9a2944]">{issue}</p>:null}
       <button type="submit" disabled={pending||!valid.length} className="w-full rounded-xl bg-[#7e2a3e] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
         {pending?"Sending request…":"Request quote for entire cart"}
       </button>
     </form>}
     {!unpriced && !orderId ? <form onSubmit={submitOrder} className="mt-6 space-y-3 border-t border-[#e0c29f] pt-5">
      <h3 className="font-cinzel text-lg font-bold text-[#632638]">Place order request</h3>
      <p className="text-xs leading-5 text-[#624b55]">Save a real order for owner confirmation. No money is charged online. Shipping, applicable taxes and fulfilment are confirmed before dispatch.</p>
      <label className="block text-sm font-bold">Full name<input required minLength={2} maxLength={120} value={buyerName} onChange={e=>setBuyerName(e.target.value)} className="mt-2 w-full rounded-lg border p-3"/></label>
      <label className="block text-sm font-bold">Phone number<input required minLength={8} maxLength={20} value={buyerPhone} onChange={e=>setBuyerPhone(e.target.value)} className="mt-2 w-full rounded-lg border p-3" placeholder="Mobile or contact number"/></label>
      <label className="block text-sm font-bold">Delivery address<textarea required minLength={12} maxLength={350} rows={3} value={address} onChange={e=>setAddress(e.target.value)} className="mt-2 w-full rounded-lg border p-3"/></label>
      <label className="block text-sm font-bold">City<input required minLength={2} maxLength={90} value={city} onChange={e=>setCity(e.target.value)} className="mt-2 w-full rounded-lg border p-3"/></label>
      <label className="block text-sm font-bold">State<input required minLength={2} maxLength={90} value={stateName} onChange={e=>setStateName(e.target.value)} className="mt-2 w-full rounded-lg border p-3"/></label>
      <label className="block text-sm font-bold">6-digit PIN<input required pattern="[0-9]{6}" maxLength={6} value={postalCode} onChange={e=>setPostalCode(e.target.value)} className="mt-2 w-full rounded-lg border p-3" inputMode="numeric"/></label>
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-[#7d2a3e] p-3 font-bold text-white disabled:opacity-50">{pending?"Saving order…":"Place order request — no online charge"}</button>
     </form> : null}
     {orderId ? <p role="status" className="mt-4 rounded-lg border border-[#b7dcae] bg-white p-3 text-sm">
       Order #{orderId} created. <Link href="/orders" className="font-bold text-[#7c2e3e] underline">Track My Orders</Link>.
     </p> : null}
     <Link href="/shop" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d2ae82] px-5 text-sm font-bold text-[#742d3e]">Continue shopping</Link>
   </aside>
  </div>}
 </div>;
}

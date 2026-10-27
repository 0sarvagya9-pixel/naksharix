"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ShopProduct } from "@/lib/manual-catalogue";
import { readCart, writeCart, type CartLine } from "@/components/shop/quote-cart-controls";

export function CartPageClient({products}:{products:ShopProduct[]}){
 const [lines,setLines]=useState<CartLine[]>([]);
 useEffect(()=>{const load=()=>setLines(readCart());load();window.addEventListener("naksharix-cart-changed",load);return()=>window.removeEventListener("naksharix-cart-changed",load)},[]);
 const productMap=useMemo(()=>new Map(products.filter(p=>p.status==="active").map(p=>[p.id,p])),[products]);
 const valid=lines.filter(l=>productMap.has(l.productId));
 const total=valid.reduce((sum,line)=>sum+(productMap.get(line.productId)?.unitPricePaise||0)*line.quantity,0);
 const unpriced=valid.some(l=>!productMap.get(l.productId)?.unitPricePaise);
 const formatter=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
 function update(id:string,qty:number){const next=lines.filter(l=>l.productId!==id);if(qty>0)next.push({productId:id,quantity:Math.min(99,qty)});writeCart(next);setLines(next)}
 return <div className="mx-auto max-w-5xl px-5 py-12">
  <p className="text-xs font-extrabold uppercase tracking-[.21em] text-[#9d453c]">Spiritual catalogue</p>
  <h1 className="mt-3 font-cinzel text-4xl font-bold text-[#35232b]">Your cart</h1>
  <p className="mt-3 max-w-3xl leading-7 text-[#66515b]">Save items and quantities before requesting confirmed prices and fulfilment terms. No payment is charged from this cart.</p>
  {!valid.length?<div className="mt-8 rounded-2xl border border-[#ead3b5] bg-white p-8"><p>Your cart is empty.</p><Link href="/shop" className="mt-4 inline-block font-bold text-[#842d40] underline">Explore products</Link></div>:
  <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
   <section aria-label="Selected products" className="space-y-4">
   {valid.map(line=>{const p=productMap.get(line.productId)!;return <article key={p.id} className="flex flex-wrap items-center gap-5 rounded-2xl border border-[#e6cbb0] bg-white p-5 shadow-sm">
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
     {unpriced?<p className="mt-3 text-sm leading-6 text-[#674f56]">Some products do not yet have approved selling prices. No totals or charges are invented.</p>:<p className="mt-3 text-sm leading-6 text-[#674f56]">Product subtotal only; shipping, applicable tax and final availability must still be confirmed.</p>}
     <p className="mt-5 rounded-lg border border-[#ebcfad] bg-white p-3 text-sm">Secure checkout is not enabled until supplier fulfilment and refund operations are verified. Request a quote for each item above.</p>
     <Link href="/shop" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#7e2a3e] px-5 text-sm font-bold text-white">Continue shopping</Link>
   </aside>
  </div>}
 </div>;
}

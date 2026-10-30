"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResilientShopPhoto } from "@/components/shop/resilient-shop-photo";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
import { secureFetch } from "@/lib/security/csrf";
import type { ShopProduct } from "@/lib/manual-catalogue";
import { readCart, writeCart, type CartLine } from "@/components/shop/quote-cart-controls";

type Props={ products:ShopProduct[]; signedIn:boolean; checkoutAvailable:boolean };
const money=(paise:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(paise/100);
const inputClass="mt-1 block w-full min-h-11 rounded-xl border border-[#ddc8b5] bg-white px-3 py-2 text-[#372630] focus:border-[#8a3046] focus:outline-none focus:ring-2 focus:ring-[#8a3046]/10";
export function CartPageClient({products,signedIn,checkoutAvailable}:Props){
 const router=useRouter();
 const [lines,setLines]=useState<CartLine[]>([]);
 const [pending,setPending]=useState(false);
 const [issue,setIssue]=useState("");
 const [orderId,setOrderId]=useState("");
 const [orderPayable,setOrderPayable]=useState(0);
 const [orderStatus,setOrderStatus]=useState("");
 const [buyerName,setBuyerName]=useState("");
 const [buyerPhone,setBuyerPhone]=useState("");
 const [address,setAddress]=useState("");
 const [city,setCity]=useState("");
 const [stateName,setStateName]=useState("");
 const [postalCode,setPostalCode]=useState("");
 const [message,setMessage]=useState("");
 useEffect(()=>{
   const load=()=>setLines(readCart());load();
   window.addEventListener("naksharix-cart-changed",load);
   return()=>window.removeEventListener("naksharix-cart-changed",load);
 },[]);
 const productMap=useMemo(()=>new Map(products.filter(p=>p.status==="active").map(p=>[p.id,p])),[products]);
 const valid=lines.filter(l=>productMap.has(l.productId));
 const total=valid.reduce((sum,line)=>sum+(productMap.get(line.productId)?.unitPricePaise||0)*line.quantity,0);
 const unpriced=valid.some(l=>!productMap.get(l.productId)?.unitPricePaise);
 function update(id:string,qty:number){
   const next=lines.filter(l=>l.productId!==id);
   if(qty>0)next.push({productId:id,quantity:Math.min(10,qty)});
   try{writeCart(next);setLines(next);setIssue("");}
   catch{setIssue("Cart could not be saved in this browser. Enable browser storage and retry.");}
 }
 async function submitOrder(e:FormEvent<HTMLFormElement>){
   e.preventDefault();
   if(pending||!signedIn||!valid.length||unpriced||orderId)return;
   setPending(true);setIssue("");
   try{
     const response=await secureFetch("/api/commerce/orders",{
       method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({
         items:valid.map(l=>({productId:l.productId,quantity:l.quantity})),
         expectedSubtotalPaise:total,
         customerName:buyerName.trim(),customerPhone:buyerPhone.trim(),
         deliveryAddress:address.trim(),deliveryCity:city.trim(),
         deliveryState:stateName.trim(),postalCode:postalCode.trim(),
         customerNote:message.trim()
       })
     });
     const payload=await response.json().catch(()=>null);
     if(!response.ok){
       if(response.status===401){setIssue("Your session expired. Sign in again; your cart remains saved.");return;}
       throw new Error(payload?.error||"Could not place order. Please retry.");
     }
     const order=payload?.data?.order;
     if(typeof order?.id!=="string")throw new Error("Order was not acknowledged by the server.");
     setOrderId(order.id);setOrderPayable(Number(order.totalPaise??total));
     setOrderStatus(order.status);
     try{writeCart([]);setLines([]);}catch{setIssue("Order placed. Cart could not be cleared; do not submit a duplicate order.");}
     router.refresh();
   }catch(error){setIssue(error instanceof Error?error.message:"Could not place order.");}
   finally{setPending(false);}
 }
 return <main className="mx-auto max-w-6xl px-4 py-8 text-[#372630] md:px-6 md:py-12">
   <div className="flex flex-wrap items-end justify-between gap-3">
     <div>
       <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9b6e36]">Naksharix Shop</p>
       <h1 className="mt-2 font-cinzel text-3xl font-bold md:text-4xl">Shopping cart</h1>
       <p className="mt-2 text-sm text-[#66515b]">Review products, enter your delivery address and place your order.</p>
     </div>
     <Link href="/shop" className="rounded-xl border border-[#dabb9d] px-4 py-2 text-sm font-semibold hover:bg-white">Continue shopping</Link>
   </div>
   {issue?<div role="alert" className="mt-5 rounded-xl border border-[#dba8af] bg-[#fff1f1] p-4 text-sm font-semibold text-[#922e40]">{issue}</div>:null}
   {orderId?<section role="status" className="mt-7 max-w-2xl rounded-2xl border border-[#b6d5b8] bg-[#f5fff3] p-6">
      <h2 className="text-2xl font-bold">Order placed successfully</h2>
      <p className="mt-2 text-sm">Order reference: <strong className="break-all">{orderId}</strong></p>
      <p className="mt-2 text-lg font-bold">Total: {money(orderPayable)}</p>
      {checkoutAvailable&&orderStatus==="CONFIRMED"?
        <div className="mt-5 max-w-sm"><RazorpayCheckoutButton payload={{purpose:"SHOP_ORDER",shopOrderId:orderId}}
          label={`Pay ${money(orderPayable)} with Razorpay`} successHref="/orders"/></div>:
        <p className="mt-3 text-sm">Your order has been saved. You can follow its status and payment instructions under My Orders.</p>}
      <Link href="/orders" className="mt-5 inline-block rounded-xl border border-[#b5cbb7] bg-white px-4 py-3 font-bold text-[#762e3d]">View My Orders</Link>
   </section>:!valid.length?<div className="mt-8 rounded-2xl border border-[#e6cbb0] bg-white p-8">
     <p>Your cart is empty.</p><Link href="/shop" className="mt-4 inline-block font-bold text-[#842d40] underline">Explore products</Link>
   </div>:<div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
     <section aria-label="Products in your cart" className="space-y-3">
       {valid.map(line=>{const p=productMap.get(line.productId)!;return <article key={p.id}
         className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e7d3c3] bg-white p-4 shadow-sm">
         <Link href={"/shop/"+encodeURIComponent(p.slug)} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#eddbcb] bg-[#fff8f0] p-1">
           <ResilientShopPhoto src={p.galleryImages?.[0]?.url||p.imageUrl||"/shop/combo-placeholder.svg"}
             alt={p.galleryImages?.[0]?.alt||p.imageAlt.en||p.name.en} width={120} height={120} className="h-full w-full rounded-lg object-contain"/>
         </Link>
         <div className="min-w-[130px] flex-1">
           <Link href={"/shop/"+encodeURIComponent(p.slug)} className="font-bold text-[#792c41] hover:underline">{p.name.en}</Link>
           <p className="mt-1 text-xs text-[#725a61]">{p.category}</p>
           <p className="mt-2 font-bold">{p.unitPricePaise?money(p.unitPricePaise):"Price unavailable"}</p>
         </div>
         <div className="flex items-center gap-2">
           <button type="button" aria-label={"Decrease "+p.name.en+" quantity"} onClick={()=>update(p.id,line.quantity-1)} className="h-9 w-9 rounded-lg border bg-white">−</button>
           <output aria-label="Quantity">{line.quantity}</output>
           <button type="button" aria-label={"Increase "+p.name.en+" quantity"} onClick={()=>update(p.id,line.quantity+1)} className="h-9 w-9 rounded-lg border bg-white">+</button>
         </div>
         <button type="button" onClick={()=>update(p.id,0)} className="text-sm font-semibold text-[#8b3043] underline">Remove</button>
       </article>})}
     </section>
     <aside className="rounded-2xl border border-[#e5c7a9] bg-[#fff5e9] p-5 shadow-sm">
       <h2 className="font-cinzel text-xl font-bold">Order summary</h2>
       <div className="mt-4 flex justify-between text-sm"><span>Items ({valid.reduce((n,l)=>n+l.quantity,0)})</span><strong>{money(total)}</strong></div>
       <div className="mt-2 flex justify-between text-sm"><span>Shipping</span><span>Included</span></div>
       <div className="mt-2 flex justify-between text-sm"><span>Additional tax at checkout</span><span>₹0</span></div>
       <div className="mt-4 flex justify-between border-t border-[#e5c7a9] pt-4 text-lg font-bold"><span>Total payable</span><span>{money(total)}</span></div>
       <p className="mt-2 text-xs text-[#6f5b60]">You will not be charged more than the displayed total. Your order and payment status will appear in My Orders.</p>
       {!signedIn?<div className="mt-6 rounded-xl border border-[#e2c5a5] bg-white p-4">
         <h3 className="font-bold">Sign in to checkout</h3>
         <p className="mt-2 text-sm">Secure sign-in links your delivery address, orders and receipts to your account. Your cart stays here.</p>
         <Link href="/login?redirectTo=%2Fcart" className="mt-4 block rounded-xl bg-[#822c40] px-4 py-3 text-center font-bold text-white">Sign in and continue</Link>
         <Link href="/signup?redirectTo=%2Fcart" className="mt-3 block text-center text-sm font-semibold text-[#822c40] underline">Create an account</Link>
       </div>:<form className="mt-6 space-y-3" onSubmit={submitOrder} aria-label="Delivery and checkout">
         <h3 className="font-cinzel text-lg font-bold">Delivery details</h3>
         <label className="block text-sm font-semibold">Full name<input required autoComplete="name" minLength={2} maxLength={120} className={inputClass} value={buyerName} onChange={e=>setBuyerName(e.target.value)}/></label>
         <label className="block text-sm font-semibold">Mobile number<input required type="tel" autoComplete="tel" inputMode="tel" pattern="[+0-9() -]{8,20}" className={inputClass} value={buyerPhone} onChange={e=>setBuyerPhone(e.target.value)}/></label>
         <label className="block text-sm font-semibold">Delivery address<textarea required autoComplete="street-address" minLength={12} maxLength={350} rows={2} className={inputClass} value={address} onChange={e=>setAddress(e.target.value)}/></label>
         <div className="grid gap-3 sm:grid-cols-2">
           <label className="block text-sm font-semibold">City<input required autoComplete="address-level2" minLength={2} maxLength={90} className={inputClass} value={city} onChange={e=>setCity(e.target.value)}/></label>
           <label className="block text-sm font-semibold">State<input required autoComplete="address-level1" minLength={2} maxLength={90} className={inputClass} value={stateName} onChange={e=>setStateName(e.target.value)}/></label>
         </div>
         <label className="block text-sm font-semibold">PIN code<input required autoComplete="postal-code" pattern="[0-9]{6}" maxLength={6} inputMode="numeric" className={inputClass} value={postalCode} onChange={e=>setPostalCode(e.target.value)}/></label>
         <label className="block text-sm font-semibold">Order note (optional)<textarea rows={2} maxLength={1000} className={inputClass} value={message} onChange={e=>setMessage(e.target.value)}/></label>
         <button type="submit" disabled={pending||unpriced} className="mt-2 w-full rounded-xl bg-[#822c40] px-4 py-4 font-bold text-white disabled:opacity-50">
           {pending?"Placing your order…":checkoutAvailable?"Place order & continue to payment":"Place order"}
         </button>
         <p className="text-xs text-[#745e65]">Your payment will be handled securely by Razorpay after your order is created.</p>
       </form>}
     </aside>
   </div>}
 </main>;
}

import type {Metadata} from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";
import { env } from "@/lib/env";
import { getRazorpayReadiness } from "@/lib/payments/readiness";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Track My Orders | Naksharix",robots:{index:false,follow:false}};
const money=(p:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(p/100);
export default async function MyOrdersPage(){
 const user=await getCurrentUser();
 if(!user)return <main className="mx-auto min-h-screen max-w-4xl px-5 py-16"><h1 className="font-cinzel text-3xl">My Orders</h1>
   <p className="mt-4">Sign in to securely view your private order history.</p>
   <Link className="mt-4 inline-block font-bold text-[#812e41] underline" href="/login">Sign in</Link></main>;
 let orders:Awaited<ReturnType<typeof prisma.shopOrder.findMany>>=[];
 let missing=false;
 try{orders=await prisma.shopOrder.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:50});}
 catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2021")missing=true;else throw e}
 return <main className="min-h-screen bg-[#fffbf5] px-5 py-12 text-[#3e2931]">
  <div className="mx-auto max-w-5xl"><h1 className="font-cinzel text-4xl font-bold">My Orders</h1>
   <p className="mt-4 text-sm text-[#655159]">Track your owner-confirmed product requests. A saved request does not mean online payment was charged.</p>
   {missing?<p className="mt-7 rounded-xl border p-5">Order service will be available after the reviewed database migration.</p>:null}
   {!missing&&!orders.length?<div className="mt-8 rounded-xl border bg-white p-8"><p>No orders yet.</p><Link href="/shop" className="mt-4 inline-block font-bold text-[#7d2c3b] underline">Browse Shop</Link></div>:null}
   <div className="mt-8 grid gap-5">
    {orders.map(order=><article key={order.id} className="rounded-2xl border border-[#e6cab0] bg-white p-6 shadow-sm">
     <div className="flex flex-wrap items-center justify-between gap-3">
      <strong className="text-[#7d293c]">Order #{order.id}</strong><span className="rounded-full bg-[#fff2e0] px-3 py-2 text-sm font-bold">{order.status}</span>
     </div>
     <p className="mt-3 text-sm text-[#6d5561]">Created {order.createdAt.toLocaleDateString("en-IN")} · Payment: {order.paymentStatus}</p>
     <p className="mt-3 text-lg font-bold">Product subtotal: {money(order.subtotalPaise)}</p>
     <p className="mt-2 text-sm">Confirmed total: {order.totalPaise!==null?money(order.totalPaise):"Awaiting shipping/tax confirmation"}</p>
     <p className="mt-2 text-sm">Tracking: {order.trackingReference||"Not dispatched"}</p>
     {order.status==="CONFIRMED" && ["UNPAID","FAILED"].includes(order.paymentStatus) &&
      order.fulfillmentMode==="MANUAL_CONFIRMATION" &&
      !!order.fulfillmentEvidenceUrl?.startsWith("https://") && order.adminNote.trim().length>=30 &&
      order.totalPaise!==null && order.totalPaise>0 &&
      order.shippingPaise!==null && order.taxPaise!==null &&
      order.totalPaise===order.subtotalPaise+order.shippingPaise+order.taxPaise ? (
       env.SHOP_PAYMENTS_ENABLED==="true" && getRazorpayReadiness().enabled ?
         <div className="mt-4 max-w-sm"><RazorpayCheckoutButton
           payload={{purpose:"SHOP_ORDER",shopOrderId:order.id}}
           label={`Pay confirmed total ${money(order.totalPaise)} with Razorpay`} successHref="/orders"/></div> :
         <p className="mt-3 text-sm">Final quote confirmed; secure Shop checkout is not activated. Contact support before sending money.</p>
     ) : null}
     {order.paymentStatus==="PAID"?<p className="mt-2 text-sm font-semibold">Payment captured and recorded. Track dispatch above.</p>:null}
     {order.paymentStatus==="REFUNDED"?<p className="mt-2 text-sm font-semibold">Full refund confirmed by signed Razorpay webhook.</p>:null}
     <details className="mt-4"><summary className="cursor-pointer font-semibold">Order items</summary>
       <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-[#fff8ee] p-4 text-xs">{JSON.stringify(order.items,null,2)}</pre>
     </details>
    </article>)}
   </div>
  </div>
 </main>;
}

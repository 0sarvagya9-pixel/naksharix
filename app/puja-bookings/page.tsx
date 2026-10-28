import type {Metadata} from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { env } from "@/lib/env";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";
import { findPujaTopic } from "@/lib/puja/service-catalogue";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"My Puja Requests | Naksharix",robots:{index:false,follow:false}};
export default async function MyPujas(){
 const user=await getCurrentUser();
 if(!user)return <main className="mx-auto max-w-3xl px-5 py-14"><h1 className="font-cinzel text-3xl">My Puja Requests</h1>
   <p className="mt-5">Please sign in to access your private Puja bookings.</p>
   <Link className="mt-3 inline-block text-[#8c3044] underline" href="/login">Sign in</Link></main>;
 let rows:Awaited<ReturnType<typeof prisma.pujaBookingRequest.findMany>>=[];
 let payments:Awaited<ReturnType<typeof prisma.payment.findMany>>=[];
 let missing=false;
 try{
   rows=await prisma.pujaBookingRequest.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:50});
   payments=await prisma.payment.findMany({where:{userId:user.id,purpose:"PUJA_BOOKING"},
     orderBy:{createdAt:"desc"},take:100});
 }
 catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2021")missing=true;else throw e}
 return <main className="min-h-screen bg-[#fffbf5] px-5 py-12 text-[#432b34]">
  <div className="mx-auto max-w-4xl"><h1 className="font-cinzel text-4xl font-bold">My Puja Requests</h1>
   <p className="mt-4 text-sm text-[#6b555c]">Requested dates are preferences, not guaranteed muhurat. Confirmation appears after the verified coordinator assigns a Pandit and time.</p>
   {missing?<p className="mt-7 rounded-xl border p-5">Puja booking service will become available after the reviewed database migration.</p>:null}
   {!missing&&!rows.length?<div className="mt-8 rounded-xl border bg-white p-7">No Puja requests yet. <Link href="/pujas" className="font-bold text-[#792a3c] underline">Browse Pujas</Link></div>:null}
   <div className="mt-8 grid gap-5">{rows.map(row=><article key={row.id} className="rounded-2xl border border-[#e8cbaa] bg-white p-6">
    <p className="text-xs font-bold tracking-wide text-[#8f3947]">#{row.id}</p>
    <h2 className="mt-2 font-cinzel text-xl font-bold">{findPujaTopic(row.topicId)?.name||row.topicId}</h2>
    <p className="mt-3 font-bold">Request status: {row.status}</p>
    <p className="mt-2 text-sm">Preferred date: {row.preferredDate.toLocaleDateString("en-IN")} · City: {row.city}</p>
    <p className="mt-2 text-sm">Published fee at request: ₹{(row.quotedPricePaise/100).toFixed(2)}</p>
    <p className="mt-2 text-sm">Confirmed ceremony: {row.scheduledAt?row.scheduledAt.toLocaleString("en-IN"):"Not yet scheduled"}</p>
    <p className="mt-2 text-sm">Pandit assignment: {row.partnerId?"Partner assigned":"Pending verification"}</p>
    {(()=>{
      const payment=payments.find(pay=>{
        const meta=pay.metadata;
        return !!meta&&typeof meta==="object"&&!Array.isArray(meta)&&meta.pujaBookingId===row.id;
      });
      const confirmed=["CONFIRMED","SCHEDULED"].includes(row.status)&&!!row.partnerId&&!!row.scheduledAt;
      return <div className="mt-4 rounded-xl border border-[#e8cbaa] bg-[#fff8ed] p-4">
        <p className="text-sm font-semibold">Razorpay payment: {payment?.status||"NOT CHARGED"}</p>
        {!payment&&confirmed&&env.PUJA_PAYMENTS_ENABLED==="true"?
          <div className="mt-3"><RazorpayCheckoutButton payload={{purpose:"PUJA_BOOKING",bookingId:row.id}} label="Pay ₹1,100 securely with Razorpay" successHref="/puja-bookings"/></div>:null}
        {!confirmed?<p className="mt-2 text-xs">Payment opens only after a verified Pandit and ceremony date/time are confirmed. No advance charge is taken.</p>:null}
        {confirmed&&env.PUJA_PAYMENTS_ENABLED!=="true"?<p className="mt-2 text-xs">Online Puja payment is currently unavailable. Contact support before paying.</p>:null}
      </div>;
    })()}
    {row.status==="COMPLETED"&&row.evidenceUrl?<a href={row.evidenceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold text-[#7c2a3d] underline">View completion evidence</a>:null}
   </article>)}</div>
  </div>
 </main>;
}

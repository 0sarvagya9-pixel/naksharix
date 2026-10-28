import type {Metadata} from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { env } from "@/lib/env";
import { getRazorpayReadiness } from "@/lib/payments/readiness";
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
 let verifiedPartnerIds=new Set<string>();
 let publishedOfferIds=new Set<string>();
 let missing=false;
 try{
   rows=await prisma.pujaBookingRequest.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:50});
   payments=await prisma.payment.findMany({where:{userId:user.id,purpose:"PUJA_BOOKING"},
     orderBy:{createdAt:"desc"},take:100});
   const [partners,offers]=await Promise.all([
     prisma.pujaPartner.findMany({where:{id:{in:rows.flatMap(row=>row.partnerId?[row.partnerId]:[])},reviewStatus:"VERIFIED",evidenceUrl:{not:null}},select:{id:true}}),
     prisma.pujaOffering.findMany({where:{topicId:{in:rows.map(row=>row.topicId)},available:true,pricePaise:110000},select:{topicId:true}})
   ]);
   verifiedPartnerIds=new Set(partners.map(partner=>partner.id));
   publishedOfferIds=new Set(offers.map(offer=>offer.topicId));
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
      const bookingPayments=payments.filter(pay=>{
        const meta=pay.metadata;
        return !!meta&&typeof meta==="object"&&!Array.isArray(meta)&&meta.pujaBookingId===row.id;
      });
      const payment=bookingPayments[0];
      const paymentSettled=bookingPayments.some(pay=>["PAID","REFUNDED","ADMIN_BYPASS","FREE"].includes(pay.status));
      const confirmed=["CONFIRMED","SCHEDULED"].includes(row.status)&&!!row.partnerId&&!!row.scheduledAt;
      const verified=confirmed&&verifiedPartnerIds.has(row.partnerId||"")&&publishedOfferIds.has(row.topicId)&&row.quotedPricePaise===110000;
      const retryable=!paymentSettled&&(!payment||["PENDING","FAILED"].includes(payment.status));
      const checkoutEnabled=env.PUJA_PAYMENTS_ENABLED==="true"&&getRazorpayReadiness().enabled;
      return <div className="mt-4 rounded-xl border border-[#e8cbaa] bg-[#fff8ed] p-4">
        <p className="text-sm font-semibold">Razorpay payment: {payment?.status||"NOT CHARGED"}</p>
        {verified&&retryable&&checkoutEnabled?
          <div className="mt-3"><RazorpayCheckoutButton payload={{purpose:"PUJA_BOOKING",bookingId:row.id}} label={payment?.status==="FAILED"?"Retry ₹1,100 Razorpay payment":payment?.status==="PENDING"?"Resume ₹1,100 Razorpay checkout":"Pay ₹1,100 securely with Razorpay"} successHref="/puja-bookings"/></div>:null}
        {!confirmed?<p className="mt-2 text-xs">Payment opens only after a verified Pandit and ceremony date/time are confirmed. No advance charge is taken.</p>:null}
        {confirmed&&!verified&&!paymentSettled?<p className="mt-2 text-xs">Payment is paused until the partner evidence and current ₹1,100 offering are verified. No charge is taken.</p>:null}
        {verified&&retryable&&!checkoutEnabled?<p className="mt-2 text-xs">Online Puja payment is currently unavailable. Contact support before paying.</p>:null}
        {paymentSettled?<p className="mt-2 text-xs">Payment history is recorded; another checkout will not be opened for this booking.</p>:null}
      </div>;
    })()}
    {row.status==="COMPLETED"&&row.evidenceUrl?<a href={row.evidenceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold text-[#7c2a3d] underline">View completion evidence</a>:null}
   </article>)}</div>
  </div>
 </main>;
}

import type {Metadata} from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";
import { findPujaTopic } from "@/lib/puja/service-catalogue";
import { getPujaLaunchState, partnerSupportsTopic } from "@/lib/puja/launch-readiness";
import { pujaStatusNotice } from "@/lib/puja/customer-notices";
import { getPujaRequestState } from "@/lib/puja/request-readiness";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
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
 const release=await getPujaLaunchState();
 const intake=await getPujaRequestState();
 try{
   rows=await prisma.pujaBookingRequest.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:50});
   payments=await prisma.payment.findMany({where:{userId:user.id,purpose:"PUJA_BOOKING"},
     orderBy:{createdAt:"desc"},take:100});
 }
 catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2021")missing=true;else throw e}
 const partnerIds = [...new Set(rows.map(row=>row.partnerId).filter((id):id is string=>Boolean(id)))];
 const partnerList = release.enabled && partnerIds.length ? await prisma.pujaPartner.findMany({
   where: {id:{in:partnerIds}},
   select: {id:true,reviewStatus:true,reviewedAt:true,evidenceUrl:true,traditions:true}
 }).catch(() => []) : [];
 const partnersById = new Map(partnerList.map(partner=>[partner.id,partner]));
 return <main className="min-h-screen bg-[#fffbf5] px-5 py-12 text-[#432b34]">
  <div className="mx-auto max-w-4xl"><h1 className="font-cinzel text-4xl font-bold">My Puja Requests</h1>
   <p className="mt-4 text-sm text-[#6b555c]">View your Puja requests, confirmed schedules and verified payments. {intake.enabled
    ? "A new request does not require payment; checkout opens only after your Pandit and ceremony time are confirmed."
    : "New Puja bookings and payments are currently paused."}</p>
   {missing?<p className="mt-7 rounded-xl border p-5">Puja booking service will become available after the reviewed database migration.</p>:null}
   {!missing&&!rows.length?<div className="mt-8 rounded-xl border bg-white p-7">No Puja requests yet. <Link href="/pujas" className="font-bold text-[#792a3c] underline">{intake.enabled?"Browse Puja date requests":"Puja services coming soon"}</Link></div>:null}
   <div className="mt-8 grid gap-5">{rows.map(row=><article key={row.id} className="rounded-2xl border border-[#e8cbaa] bg-white p-6">
    <p className="text-xs font-bold tracking-wide text-[#8f3947]">#{row.id}</p>
    <h2 className="mt-2 font-cinzel text-xl font-bold">{findPujaTopic(row.topicId)?.name||row.topicId}</h2>
    <p className="mt-3 font-bold">Request status: {row.status}</p>
    {pujaStatusNotice(row.status)?<div className="mt-3 rounded-xl border border-[#e8cbaa] bg-[#fff9ef] p-3 text-sm leading-7">
      <p>{pujaStatusNotice(row.status)?.hi}</p>
      <p className="mt-1 text-[#6c555f]">{pujaStatusNotice(row.status)?.en}</p>
    </div>:null}
    <p className="mt-2 text-sm">Preferred date: {row.preferredDate.toLocaleDateString("en-IN")} · City: {row.city}</p>
    <p className="mt-2 text-sm">Platform coordination fee at request: ₹{(row.quotedPricePaise/100).toFixed(2)}</p>
    <p className="mt-2 text-sm">Confirmed ceremony: {row.scheduledAt?row.scheduledAt.toLocaleString("en-IN",{timeZone:"Asia/Kolkata",timeZoneName:"short"}):"Not yet scheduled"}</p>
    <p className="mt-2 text-sm">Pandit assignment: {row.partnerId && row.status !== "REQUESTED"?"Assigned — check status for confirmation":"Pandit confirmation pending"}</p>
    {(()=>{
      const bookingPayments=payments.filter(pay=>{
        const meta=pay.metadata;
        return !!meta&&typeof meta==="object"&&!Array.isArray(meta)&&meta.pujaBookingId===row.id;
      });
      const payment=bookingPayments[0];
      const paymentSettled=bookingPayments.some(pay=>["PAID","REFUNDED","ADMIN_BYPASS","FREE"].includes(pay.status));
      const partner = row.partnerId ? partnersById.get(row.partnerId) : null;
      const validatedPartner = partner ? partnerSupportsTopic(partner,row.topicId) : false;
      const currentOffer = release.offers[row.topicId];
      const pendingOld = payment?.status==="PENDING" &&
        Date.now() - new Date(payment.createdAt).getTime() > 86400_000;
      const canCheckout = release.enabled && currentOffer?.pricePaise===row.quotedPricePaise &&
        row.quotedPricePaise === 110000 && row.status === "SCHEDULED" &&
        Boolean(row.scheduledAt && row.scheduledAt.getTime() > Date.now()) && validatedPartner &&
        !paymentSettled && !pendingOld;
      return <div className="mt-4 rounded-xl border border-[#e8cbaa] bg-[#fff8ed] p-4">
        <p className="text-sm font-semibold">Razorpay payment: {payment?.status||"NOT CHARGED"}</p>
        {!paymentSettled && !canCheckout?<p className="mt-2 text-xs">{pendingOld
          ? "A previous payment attempt needs reconciliation. Please check payment history or contact support; do not pay twice."
          : release.enabled
            ? "Payment unlocks only after a verified Pandit accepts and the future ceremony time is confirmed."
            : "Online Puja payment is not currently available for this request. Please await coordination or contact support."}</p>:null}
        {canCheckout?<div className="mt-4 max-w-sm">
          <RazorpayCheckoutButton payload={{purpose:"PUJA_BOOKING",bookingId:row.id}}
            label={`Pay ₹${(row.quotedPricePaise/100).toFixed(2)} securely`} successHref="/puja-bookings"/>
          <p className="mt-2 text-xs">Review the confirmed time, location/service mode, inclusion of materials and cancellation terms with the coordinator before paying.</p>
        </div>:null}
        <p className="mt-2 text-xs">The original preferred date is a request only. Only a displayed confirmed time is scheduled; contact support if your agreement differs.</p>
        {paymentSettled?<p className="mt-2 text-xs">Payment history is recorded; another checkout will not be opened for this booking.</p>:null}
      </div>;
    })()}
    {row.status==="COMPLETED"&&row.evidenceUrl?<a href={row.evidenceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold text-[#7c2a3d] underline">View completion evidence</a>:null}
   </article>)}</div>
  </div>
 </main>;
}

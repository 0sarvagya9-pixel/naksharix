import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { pujaTopics, findPujaTopic } from "@/lib/puja/service-catalogue";
import { getPujaRequestState as getPujaLaunchState } from "@/lib/puja/request-readiness";
import { displayPujaPrice } from "@/lib/puja/offerings";
import { PUJA_FEE_NOTICE_EN, PUJA_FEE_NOTICE_HI } from "@/lib/puja/fee-terms";

export const dynamic = "force-dynamic";
export const dynamicParams = false;
export function generateStaticParams() {
  return pujaTopics.map(p => ({ id: p.id }));
}
type Props = { params: Promise<{id: string}> };
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {id}=await params;
  const release=await getPujaLaunchState();
  const topic=findPujaTopic(id);
  if (!release.enabled || !topic || !release.offers[id])
    return {title:"Puja Services Coming Soon | Naksharix",robots:{index:false,follow:true}};
  return {
    title: topic.name+" — Puja Date Requests | Naksharix",
    description: topic.description+". Preferred-date requests only; payment after Pandit and schedule confirmation.",
    robots:{index:!release.requestOnly,follow:true}
  };
}
export default async function PujaTopicPage({params}:Props) {
  const {id}=await params;
  const release=await getPujaLaunchState();
  const topic=findPujaTopic(id);
  const offer=release.offers[id];
  // Previously indexed Puja details must never expose an old Book Now button
  // while paused or when a named service has no exact-topic Pandit coverage.
  if (!release.enabled || !topic || !offer) redirect("/pujas");
  return <main className="min-h-[75vh] bg-[#fffaf4] px-5 py-12 text-[#492d33]">
    <div className="mx-auto max-w-4xl rounded-3xl border border-[#e2c39f] bg-white p-7 md:p-12">
      <p className="text-xs font-bold uppercase tracking-widest text-[#8d5d3e]">NAKSHARIX · Puja coordination</p>
      <h1 className="mt-4 font-cinzel text-3xl font-bold md:text-5xl">{topic.name}</h1>
      <p className="mt-4 leading-8 text-[#6d565e]">{topic.description}</p>
      <p className="mt-5 text-2xl font-bold text-[#8f3448]">{displayPujaPrice(offer.pricePaise)} <span className="text-sm font-medium">platform coordination fee · no payment now</span></p>
      <p className="mt-3 text-sm leading-7 text-[#6d565e]">
        Puja is subject to actual Pandit availability. Your preferred date is only a request,
        not a reserved slot. The individual Pandit must accept your specific ceremony and the final schedule
        before online payment is offered. Confirm the service mode, samagri, location and cancellation terms with the coordinator.
      </p>
      <div className="mt-5 rounded-xl border border-[#e2c39f] bg-[#fff8ed] p-4 text-sm leading-7"><p>{PUJA_FEE_NOTICE_EN}</p><p lang="hi" className="mt-2">{PUJA_FEE_NOTICE_HI}</p><Link className="mt-2 inline-block underline" href="/refund-policy">Refund policy</Link></div>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link className="rounded-xl bg-[#7e3144] px-6 py-3 font-bold text-white" href={"/puja-booking?item="+encodeURIComponent(id)}>
          Request preferred date — no payment yet
        </Link>
        <Link className="rounded-xl border border-[#cda67c] px-6 py-3 font-semibold" href="/pujas">View other available Pujas</Link>
      </div>
      <p className="mt-6 text-xs leading-6 text-[#765e65]">Astrological or spiritual outcomes are not guaranteed. The Pandit and ceremony are not booked until explicitly confirmed.</p>
    </div>
  </main>;
}

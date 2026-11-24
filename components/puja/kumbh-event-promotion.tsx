"use client";

import { useEffect,useRef,useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays,MapPin,ArrowRight,X } from "lucide-react";
import { displayKumbhDate,kumbhEventRequestOpen,visibleKumbhEvents,KUMBH_2027_SOURCE } from "@/lib/puja/service-catalogue";
import type { PublicPujaOffer } from "@/lib/puja/offerings";

function useEventClock(initialNow:number){
  const [now,setNow]=useState(initialNow);
  useEffect(()=>{
    const update=()=>setNow(Date.now());
    update();
    const timer=window.setInterval(update,30_000);
    document.addEventListener("visibilitychange",update);
    return()=>{window.clearInterval(timer);document.removeEventListener("visibilitychange",update)};
  },[]);
  return now;
}

export function KumbhEventCards({offerings,initialNow}:{offerings:Record<string,PublicPujaOffer>;initialNow:number}){
  const now=useEventClock(initialNow);
  const events=visibleKumbhEvents(now);
  if(!events.length)return null;
  return <section id="kumbh-2027" aria-labelledby="kumbh-event-heading" className="mx-auto max-w-7xl scroll-mt-28 px-5 pt-12 lg:px-8">
    <div className="overflow-hidden rounded-[1.8rem] border border-[#d8ac70] bg-[#fff8ed] shadow-sm">
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#411c31] via-[#752f3d] to-[#b65a2a] p-6 text-white sm:p-9">
        <Image src="/pujas/festival-illustration.svg" alt="" width={320} height={240} className="pointer-events-none absolute -right-10 bottom-0 -z-10 w-56 opacity-20 sm:w-80"/>
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#ffdc9c]">Upcoming sacred event · 2027</p>
        <h2 id="kumbh-event-heading" className="mt-3 font-cinzel text-3xl font-bold sm:text-4xl">Nashik–Trimbakeshwar Simhastha Kumbh</h2>
        <p className="mt-3 text-sm leading-7 text-[#fff1dc]">Main Mela: 15 June – 30 September 2027 · Maharashtra, India</p>
        <Link href="/kumbh-mela-2027" className="mt-3 inline-block text-sm font-semibold text-[#fff1dc] underline">Kumbh Mela dates, Snan calendar and visitor guide</Link>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#fff1dc]">Date-specific Puja coordination requests. ₹1,100 platform fee, no advance payment. Actual Pandit, venue, ceremony time and any separate charges must be agreed first.</p>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {events.map(event=>{
          const canRequest=Boolean(offerings[event.id])&&kumbhEventRequestOpen(event,now);
          return <article key={event.id} className="flex min-w-0 flex-col rounded-2xl border border-[#e2c69b] bg-white p-5 text-[#482c34]">
            <p className="flex items-center gap-2 text-sm font-bold text-[#8d3b42]"><CalendarDays aria-hidden="true" size={17}/>{displayKumbhDate(event)}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#98643c]">{event.eventTitle}</p>
            <h3 className="mt-2 font-cinzel text-lg font-bold">{event.pujaName}</h3>
            <p className="mt-3 flex items-center gap-2 text-sm"><MapPin size={15} aria-hidden="true" className="shrink-0"/>{event.city}, Maharashtra</p>
            <p className="mt-2 text-xs text-[#68515a]">{event.timing} (IST)</p>
            <p className="mt-3 flex-1 text-sm leading-6 text-[#68515a]">{event.description}</p>
            <p className="mt-4 text-lg font-bold text-[#812b3d]">₹1,100 <span className="text-xs font-medium text-[#68515a]">platform fee</span></p>
            {canRequest?<Link href={"/puja-booking?item="+encodeURIComponent(event.id)} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#772e42] px-4 py-3 text-sm font-bold text-white">Request this date <ArrowRight size={16}/></Link>:<p className="mt-3 rounded-lg bg-[#fff3de] p-3 text-sm font-semibold">{kumbhEventRequestOpen(event,now)?"New requests currently unavailable":"New requests closed for this date"}</p>}
          </article>;
        })}
      </div>
      <p className="px-5 pb-6 text-xs leading-6 text-[#684f55] sm:px-6">All dates use Indian Standard Time. Exact muhurats may change and are not represented as reserved ceremony times. Each request closes at the start of its event date (midnight IST); the event card disappears after that date ends. Naksharix is not the official Mela authority and does not sell official Snan access. <a href={KUMBH_2027_SOURCE} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Official Maharashtra schedule</a>.</p>
    </div>
  </section>;
}

const PROMO_SESSION_KEY="naksharix:kumbh-2027:home-promo:v1";
export function KumbhHomePromotion({availableIds,initialNow}:{availableIds:string[];initialNow:number}){
  const now=useEventClock(initialNow);
  const next=visibleKumbhEvents(now).find(event=>availableIds.includes(event.id)&&kumbhEventRequestOpen(event,now));
  const nextId=next?.id;
  const dialog=useRef<HTMLDialogElement>(null);
  const shown=useRef(false);
  useEffect(()=>{
    const el=dialog.current;
    if(!nextId||!el){if(el?.open)el.close();return;}
    if(shown.current)return;
    try{if(sessionStorage.getItem(PROMO_SESSION_KEY))return;}catch{/* private browsing */}
    const timer=window.setTimeout(()=>{
      if(!el.isConnected||document.visibilityState!=="visible"||document.querySelector("dialog[open], [role=dialog][aria-modal=true]"))return;
      const active=visibleKumbhEvents().find(e=>e.id===nextId);
      if(!active||!kumbhEventRequestOpen(active))return;
      try{
        el.showModal();
        shown.current=true;
        try{sessionStorage.setItem(PROMO_SESSION_KEY,"shown");}catch{/* optional session memory */}
      }catch{/* Home remains usable even when modal display is unavailable. */}
    },5000);
    return()=>{window.clearTimeout(timer);if(el.open)el.close()};
  },[nextId]);
  if(!next)return null;
  return <dialog ref={dialog} aria-labelledby="kumbh-promo-title" className="m-auto max-h-[90dvh] w-[min(92vw,32rem)] overflow-y-auto rounded-[1.6rem] border border-[#e7c38c] bg-[#fffaf0] p-0 text-[#492b35] shadow-2xl backdrop:bg-black/55">
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#421b30] via-[#8d3f3c] to-[#b56b2a] px-6 pb-6 pt-8 text-white">
      <Image src="/pujas/festival-illustration.svg" alt="" width={220} height={180} className="pointer-events-none absolute -right-8 bottom-0 -z-10 opacity-25"/>
      <button type="button" aria-label="Close Kumbh promotion" autoFocus onClick={()=>dialog.current?.close()} className="absolute right-3 top-3 rounded-full border border-white/40 bg-[#3a1c28] p-2 text-white"><X size={19}/></button>
      <p className="text-xs font-bold uppercase tracking-[.22em] text-[#ffdd9e]">Upcoming event · Naksharix</p>
      <h2 id="kumbh-promo-title" className="mt-3 font-cinzel text-3xl font-bold leading-tight">Simhastha Kumbh 2027</h2>
      <p className="mt-2 text-sm text-[#fff1df]">Nashik &amp; Trimbakeshwar, Maharashtra</p>
      <p className="mt-3 inline-flex rounded-full border border-[#edc784]/70 bg-[#4b2430] px-3 py-1 text-xs font-bold text-[#ffdfa0]">15 Jun – 30 Sep 2027</p>
    </div>
    <div className="p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-[#8c4a42]">Next featured Puja date</p>
      <p className="mt-2 text-lg font-bold">{next.eventTitle}</p>
      <p className="mt-2 flex items-center gap-2 text-sm"><CalendarDays size={16} aria-hidden="true"/>{displayKumbhDate(next)} · {next.city}</p>
      <p className="mt-3 text-xl font-bold text-[#842f42]">₹1,100 <span className="text-sm font-medium">platform coordination fee</span></p>
      <p className="mt-2 text-sm leading-6 text-[#624c54]">Explore date-wise Kumbh Pujas. Send a request without paying now. Pandit availability and actual ceremony arrangements must be confirmed. Not an official Mela booking.</p>
      <Link href="/pujas#kumbh-2027" onClick={()=>dialog.current?.close()} className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#7d3044] px-5 py-3 font-bold text-white">Explore Kumbh Pujas <ArrowRight size={17}/></Link>
      <button type="button" onClick={()=>dialog.current?.close()} className="mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold underline">Not now</button>
    </div>
  </dialog>;
}

"use client";
import { useState,type FormEvent } from "react";
import Link from "next/link";
import { secureFetch } from "@/lib/security/csrf";
import { PUJA_STATUS_NOTICES } from "@/lib/puja/customer-notices";
import { PUJA_FEE_NOTICE_EN, PUJA_FEE_NOTICE_HI } from "@/lib/puja/fee-terms";
import { type KumbhEvent, displayKumbhDate, kumbhEventRequestOpen, KUMBH_2027_SOURCE } from "@/lib/puja/service-catalogue";
export function PujaRequestClient({topicId,name,pricePaise,signedIn,event}:{topicId:string;name:string;pricePaise:number;signedIn:boolean;event?:KumbhEvent}){
 const [city,setCity]=useState(event?.city??""),[preferredDate,setPreferredDate]=useState(event?.date??"");
 const [devoteeName,setDevoteeName]=useState(""),[gotra,setGotra]=useState("");
 const [customerPhone,setCustomerPhone]=useState(""),[sankalpNote,setSankalpNote]=useState("");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[bookingId,setBookingId]=useState("");
 const [confirmedQuotePaise,setConfirmedQuotePaise]=useState<number|null>(null);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;
  if(event&&!kumbhEventRequestOpen(event)){setError("This Kumbh date is closed. Select a future event.");return;}
  setBusy(true);setError("");
  try{
   const response=await secureFetch("/api/puja/bookings",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topicId,expectedPricePaise:pricePaise,city:city.trim(),preferredDate,devoteeName:devoteeName.trim(),
      gotra:gotra.trim()||null,sankalpNote:sankalpNote.trim(),customerPhone:customerPhone.trim()})});
   const body=await response.json();
   if(!response.ok)throw Error(body.error||"Booking request failed");
   const id=body.data?.booking?.id;
   if(typeof id!=="string")throw Error("Server did not confirm your request.");
   const quoted=body.data?.booking?.quotedPricePaise;
   if(typeof quoted==="number"&&Number.isSafeInteger(quoted)&&quoted>0)setConfirmedQuotePaise(quoted);
   setBookingId(id);
  }catch(e){setError(e instanceof Error?e.message:"Booking request failed.")}
  finally{setBusy(false)}
 }
 const labelClass="block text-sm font-bold text-[#4c303b]";
 const inputClass="mt-2 block min-h-11 w-full rounded-lg border border-[#d8b58c] bg-white px-3 text-[#392733] focus-visible:outline-[#a43c51]";
 return <div className="mx-auto max-w-3xl px-5 py-12 text-[#3c2830]">
  <p className="text-xs font-bold uppercase tracking-[.2em] text-[#913648]">Naksharix Puja date request</p>
  <h1 className="mt-3 font-cinzel text-3xl font-bold">{name}</h1>
  {event && <div className="mt-4 rounded-xl border border-[#e2c4a1] bg-[#fff8ed] p-4 text-sm leading-7"><p className="font-bold">{displayKumbhDate(event)} · {event.city}, Maharashtra</p><p>{event.timing} (IST). The ceremony time is not reserved. Requests close at midnight IST starting the event date.</p><p>Independent coordination only; no official Mela/temple booking or guaranteed Snan access. <a href={KUMBH_2027_SOURCE} target="_blank" rel="noopener noreferrer" className="underline">Official schedule</a></p></div>}
  <p className="mt-4 text-2xl font-bold text-[#7b293d]">{new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(pricePaise/100)}</p>
  <p className="mt-2 text-sm font-semibold">Platform coordination fee · no upfront payment</p>
  <div className="mt-4 rounded-xl border border-[#e2c4a1] bg-[#fff8ed] p-4 text-sm leading-7"><p>{PUJA_FEE_NOTICE_EN}</p><p lang="hi" className="mt-2">{PUJA_FEE_NOTICE_HI}</p><Link href="/refund-policy" className="underline">Refund policy</Link></div>
  <p className="mt-3 text-sm leading-7 text-[#655159]">Send your preferred date as a request. This is not a reserved Puja slot. A verified Pandit must accept and a final date/time must be coordinated before payment is offered.</p>
  {bookingId?<div role="status" className="mt-6 rounded-xl border border-[#b9d5a9] bg-[#f4fff0] p-5">
    <p className="font-bold">Puja request received: #{bookingId}</p>
    <p className="mt-2 text-sm">{confirmedQuotePaise!==null?"Server-recorded requested fee: "+new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(confirmedQuotePaise/100)+". ":""}Your preferred date was received, but your Pandit and ceremony time are not yet confirmed. </p>
    <p className="mt-3 text-sm font-semibold text-[#395a42]">{PUJA_STATUS_NOTICES.REQUESTED.hi}</p>
    <p className="mt-2 text-sm">{PUJA_STATUS_NOTICES.REQUESTED.en}</p>
    <p className="mt-3 text-sm">Payment will appear in My Puja Requests only AFTER the approved Pandit and exact ceremony schedule are confirmed.</p>
    <Link className="mt-4 inline-block font-bold text-[#762a3b] underline" href="/puja-bookings">View My Pujas</Link>
  </div>:!signedIn?<div className="mt-6 rounded-2xl border border-[#e2c4a1] bg-white p-6">
    <h2 className="text-lg font-bold">Sign in to request a Puja date</h2>
    <p className="mt-2 text-sm">Your request and any future verified payment will be shown in your account.</p>
    <Link href={"/login?redirectTo="+encodeURIComponent("/puja-booking?item="+topicId)} className="mt-4 inline-block rounded-xl bg-[#7e2940] px-5 py-3 font-semibold text-white">Sign in to continue</Link>
  </div>:<form onSubmit={submit} className="mt-7 space-y-5 rounded-2xl border border-[#e2c4a1] bg-white p-6 shadow-sm">
   <label className={labelClass}>Devotee&apos;s full name<input required minLength={2} maxLength={120} value={devoteeName} onChange={e=>setDevoteeName(e.target.value)} className={inputClass}/></label>
   <label className={labelClass}>Phone<input required minLength={8} maxLength={20} value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} className={inputClass}/></label>
   <label className={labelClass}>Preferred date (not a reserved time)<input required type="date" readOnly={!!event} min={event?.date??new Date(Date.now()+86400_000).toISOString().slice(0,10)} max={event?.date} value={preferredDate} onChange={e=>setPreferredDate(e.target.value)} className={inputClass}/></label>
   <label className={labelClass}>City / location<input required minLength={2} maxLength={100} readOnly={!!event} value={city} onChange={e=>setCity(e.target.value)} className={inputClass}/></label>
   <label className={labelClass}>Gotra (optional)<input maxLength={100} value={gotra} onChange={e=>setGotra(e.target.value)} className={inputClass}/></label>
   <label className={labelClass}>Private Sankalp requirements<textarea required minLength={10} maxLength={1500} rows={4} value={sankalpNote} onChange={e=>setSankalpNote(e.target.value)} className={inputClass} placeholder="Names, intention, preferred language, family details to share privately."/></label>
   {error?<p role="alert" className="text-sm font-bold text-[#97314b]">{error}</p>:null}
   <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#7e2940] px-5 py-3 font-bold text-white disabled:opacity-50">{busy?"Submitting…":"Submit Puja request — no payment now"}</button>
  </form>}
 </div>;
}

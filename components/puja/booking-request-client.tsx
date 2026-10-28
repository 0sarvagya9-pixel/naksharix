"use client";
import { useState,type FormEvent } from "react";
import Link from "next/link";
import { secureFetch } from "@/lib/security/csrf";
export function PujaRequestClient({topicId,name,pricePaise}:{topicId:string;name:string;pricePaise:number}){
 const [city,setCity]=useState(""),[preferredDate,setPreferredDate]=useState("");
 const [devoteeName,setDevoteeName]=useState(""),[gotra,setGotra]=useState("");
 const [customerPhone,setCustomerPhone]=useState(""),[sankalpNote,setSankalpNote]=useState("");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[bookingId,setBookingId]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;setBusy(true);setError("");
  try{
   const response=await secureFetch("/api/puja/bookings",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topicId,city:city.trim(),preferredDate,devoteeName:devoteeName.trim(),
      gotra:gotra.trim()||null,sankalpNote:sankalpNote.trim(),customerPhone:customerPhone.trim()})});
   const body=await response.json();
   if(!response.ok)throw Error(body.error||"Booking request failed");
   const id=body.data?.booking?.id;
   if(typeof id!=="string")throw Error("Server did not confirm your request.");
   setBookingId(id);
  }catch(e){setError(e instanceof Error?e.message:"Booking request failed.")}
  finally{setBusy(false)}
 }
 const labelClass="block text-sm font-bold text-[#4c303b]";
 const inputClass="mt-2 block min-h-11 w-full rounded-lg border border-[#d8b58c] bg-white px-3 text-[#392733] focus-visible:outline-[#a43c51]";
 return <div className="mx-auto max-w-3xl px-5 py-12 text-[#3c2830]">
  <p className="text-xs font-bold uppercase tracking-[.2em] text-[#913648]">Puja booking · Pending confirmation</p>
  <h1 className="mt-3 font-cinzel text-3xl font-bold">{name}</h1>
  <p className="mt-4 text-2xl font-bold text-[#7b293d]">{new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(pricePaise/100)}</p>
  <p className="mt-3 text-sm leading-7 text-[#655159]">Listed fee ₹1,100. Book Now requests your preferred date and securely saves Sankalp details. A verified Pandit and final muhurat must be assigned before Razorpay payment becomes available. You are not charged at this stage.</p>
  {bookingId?<div role="status" className="mt-6 rounded-xl border border-[#b9d5a9] bg-[#f4fff0] p-5">
    <p className="font-bold">Puja request received: #{bookingId}</p>
    <p className="mt-2 text-sm">Your date request is pending confirmation. Razorpay payment opens only after a verified Pandit and ceremony time are assigned. No charge was made.</p>
    <Link className="mt-4 inline-block font-bold text-[#762a3b] underline" href="/puja-bookings">Track My Puja Requests</Link>
  </div>:<form onSubmit={submit} className="mt-7 space-y-5 rounded-2xl border border-[#e2c4a1] bg-white p-6 shadow-sm">
   <label className={labelClass}>Devotee&apos;s full name<input required minLength={2} maxLength={120} value={devoteeName} onChange={e=>setDevoteeName(e.target.value)} className={inputClass}/></label>
   <label className={labelClass}>Phone<input required minLength={8} maxLength={20} value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} className={inputClass}/></label>
   <label className={labelClass}>Preferred date (not a reserved time)<input required type="date" value={preferredDate} onChange={e=>setPreferredDate(e.target.value)} className={inputClass}/></label>
   <label className={labelClass}>City / location<input required minLength={2} maxLength={100} value={city} onChange={e=>setCity(e.target.value)} className={inputClass}/></label>
   <label className={labelClass}>Gotra (optional)<input maxLength={100} value={gotra} onChange={e=>setGotra(e.target.value)} className={inputClass}/></label>
   <label className={labelClass}>Private Sankalp requirements<textarea required minLength={10} maxLength={1500} rows={4} value={sankalpNote} onChange={e=>setSankalpNote(e.target.value)} className={inputClass} placeholder="Names, intention, preferred language, family details to share privately."/></label>
   {error?<p role="alert" className="text-sm font-bold text-[#97314b]">{error}</p>:null}
   <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#7e2940] px-5 py-3 font-bold text-white disabled:opacity-50">{busy?"Submitting…":"Book Now — Request a Date"}</button>
  </form>}
 </div>;
}

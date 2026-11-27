"use client";
import { useCallback,useEffect,useRef,useState,type FormEvent } from "react";
import { secureFetch } from "@/lib/security/csrf";
import { shortlistPujaPartners, type ShortlistPartner as Partner } from "@/lib/puja/partner-shortlist";
import { useLanguage } from "@/components/language-provider";
import { fulfilmentCopy, fulfilmentDate, fulfilmentEmail, fulfilmentFailure, fulfilmentState, type FulfilmentCopyKey } from "@/lib/admin/fulfilment-copy";
import { fulfilmentObject, isPujaBooking, notificationRetryRecorded, savedPujaBooking, type PujaBooking as Booking } from "@/lib/admin/fulfilment-contract";
const nextStatuses:Record<string,string[]>={REQUESTED:["CONFIRMED","CANCELED","REJECTED"],
 CONFIRMED:["SCHEDULED","CANCELED"],SCHEDULED:["IN_PROGRESS","CANCELED"],
 IN_PROGRESS:["COMPLETED"],COMPLETED:[],CANCELED:[],REJECTED:[]};
export function AdminPujaBookings(){
 const {locale}=useLanguage(),copy=fulfilmentCopy(locale);
 const [bookings,setBookings]=useState<Booking[]>([]),[partners,setPartners]=useState<Partner[]>([]);
 const [editing,setEditing]=useState<Booking|null>(null),[partnerAccepted,setPartnerAccepted]=useState(false);
 const [error,setError]=useState<FulfilmentCopyKey|"">(""),[notice,setNotice]=useState<{message:FulfilmentCopyKey;email:FulfilmentCopyKey}|null>(null);
 const [busy,setBusy]=useState(false),[retrying,setRetrying]=useState<string|null>(null);
 const [loading,setLoading]=useState(true),[known,setKnown]=useState(false),[uncertain,setUncertain]=useState(false);
 const inFlight=useRef(false),active=useRef(true),loadSequence=useRef(0);
 const refresh=useCallback(async()=>{
  const sequence=++loadSequence.current;setLoading(true);
  try{
   const response=await fetch("/api/admin/puja-bookings",{cache:"no-store"}),result:unknown=await response.json();
   const data=fulfilmentObject(fulfilmentObject(result)?.data);
   if(!response.ok||!data||!Array.isArray(data.bookings)||!data.bookings.every(isPujaBooking)||!Array.isArray(data.partners)||!data.partners.every(value=>{const p=fulfilmentObject(value);return !!p&&typeof p.id==='string'&&!!p.id.trim()&&typeof p.name==='string'&&typeof p.region==='string'&&Array.isArray(p.traditions)&&p.traditions.every(x=>typeof x==='string');}))throw Error('Unverified Puja records');
   if(active.current&&sequence===loadSequence.current){setBookings(data.bookings);setPartners(data.partners as Partner[]);setKnown(true);setError("");setUncertain(false);setEditing(null);setPartnerAccepted(false);}
  }catch{if(active.current&&sequence===loadSequence.current){setKnown(false);setError("unavailable");}}
  finally{if(active.current&&sequence===loadSequence.current)setLoading(false);}
 },[]);
 useEffect(()=>{active.current=true;void refresh();return()=>{active.current=false;};},[refresh]);
 function edit(patch:Partial<Booking>){if(!editing)return;setEditing({...editing,...patch});if('partnerId' in patch||'scheduledAt' in patch||'status' in patch)setPartnerAccepted(false);}
 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!editing||inFlight.current||uncertain||!known)return;
  const draft={...editing},previous=bookings.find(row=>row.id===draft.id);if(!previous)return;
  inFlight.current=true;loadSequence.current++;setLoading(false);setError("");setNotice(null);setBusy(true);
  let failure:FulfilmentCopyKey="unconfirmed";
  try{
   const response=await secureFetch("/api/admin/puja-bookings",{method:"PATCH",silent:true,headers:{"Content-Type":"application/json"},body:JSON.stringify({id:draft.id,expectedVersion:draft.version,status:draft.status,partnerId:draft.partnerId,scheduledAt:draft.scheduledAt,adminNote:draft.adminNote,evidenceUrl:draft.evidenceUrl,partnerAcceptanceConfirmed:partnerAccepted})});
   const result=await response.json();if(!response.ok){failure=fulfilmentFailure(response.status);throw Error('Puja update not acknowledged');}
   const saved=savedPujaBooking(result,draft,previous);if(!saved)throw Error('Unmatched Puja acknowledgement');
   setBookings(rows=>rows.map(row=>row.id===saved.id?saved:row));setEditing(null);setPartnerAccepted(false);setNotice({message:"pujaSaved",email:fulfilmentEmail(result.data?.notification?.outcome)});
  }catch{setError(failure);setUncertain(true);}
  finally{inFlight.current=false;setBusy(false);}
 }
 async function retryEmail(booking:Booking){
  if(inFlight.current||uncertain||!known)return;
  inFlight.current=true;loadSequence.current++;setLoading(false);setRetrying(booking.id);setError("");setNotice(null);
  let failure:FulfilmentCopyKey="unconfirmed";
  try{
   const response=await secureFetch("/api/admin/fulfilment-notification",{method:"POST",silent:true,headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"puja",id:booking.id,expectedVersion:booking.version})});
   const result=await response.json();if(!response.ok){failure=fulfilmentFailure(response.status);throw Error('Retry not acknowledged');}
   if(!notificationRetryRecorded(result,{kind:'puja',id:booking.id,version:booking.version,status:booking.status}))throw Error('Unmatched notification acknowledgement');
   setNotice({message:"retryRecorded",email:fulfilmentEmail(result.data.notification.outcome)});
  }catch{setError(failure);setUncertain(true);}
  finally{inFlight.current=false;setRetrying(null);}
 }
 return <div className="mx-auto max-w-7xl space-y-5 px-5 py-12 text-[#3d2631]">
   <h1 className="font-cinzel text-3xl font-bold">{copy.pujaTitle}</h1>
   <p className="max-w-3xl text-sm leading-6">{copy.pujaIntro}</p>
   {error?<p role="alert" className="rounded-lg bg-[#fff0f0] p-4 text-[#9b3247]">{copy[error]}</p>:null}
   {notice?<p role="status" className="rounded-lg bg-[#eef9ec] p-4 text-[#345c34]">{copy[notice.message]} {copy[notice.email]}</p>:null}
   <button type="button" disabled={loading||busy||retrying!==null} onClick={()=>void refresh()} className="rounded-lg border px-4 py-2">{loading?copy.refreshing:copy.refresh}</button>
   {loading?<p role="status">{copy.loading}</p>:null}
   {editing?<form className="max-w-2xl space-y-4 rounded-2xl border border-[#d8b589] bg-white p-6" onSubmit={save}>
    <fieldset disabled={busy||retrying!==null||uncertain} className="space-y-4"><h2 className="text-xl font-bold">{editing.topicId} — #{editing.id.slice(0,12)}</h2>
    <label className="block text-sm font-bold">{copy.status}
      <select aria-label={copy.status} value={editing.status} onChange={e=>edit({status:e.target.value})} className="mt-2 block w-full rounded-lg border p-3">
       {(()=>{
         const current=bookings.find(row=>row.id===editing.id)?.status??editing.status;
         return [current,...(nextStatuses[current]??[])].map(x=><option key={x} value={x}>{fulfilmentState(x,locale)}</option>);
       })()}
      </select>
    </label>
    <label className="block text-sm font-bold">{copy.shortlist}
     <select aria-label={copy.shortlist} value={editing.partnerId??""} onChange={e=>edit({partnerId:e.target.value||null})} className="mt-2 block w-full rounded-lg border p-3">
      <option value="">{copy.choosePandit}</option>{shortlistPujaPartners(partners,editing.topicId,editing.city).map(p=><option key={p.id} value={p.id}>{p.name} — {p.region}</option>)}
     </select>
    </label>
    <p className="text-sm">{copy.shortlistHelp}</p>
    <div className="rounded-xl border border-[#e6cbaa] bg-[#fff8ee] p-4 text-sm leading-6">
      <p className="font-bold">{copy.consentTitle}</p>
      <p className="mt-1">{copy.consentHelp}</p>
      <label className="mt-3 flex items-center gap-3 font-semibold">
        <input type="checkbox" checked={partnerAccepted} onChange={e=>setPartnerAccepted(e.target.checked)} />
        {copy.panditConsent}
      </label>
    </div>
    <label className="block text-sm font-bold">{copy.ceremonyTime}
     <input aria-label={copy.ceremonyTime} value={editing.scheduledAt??""} onChange={e=>edit({scheduledAt:e.target.value||null})}
       placeholder="2026-11-01T10:30:00+05:30" className="mt-2 block w-full rounded-lg border p-3"/>
    </label>
    <label className="block text-sm font-bold">{copy.coordinatorNote}
     <textarea aria-label={copy.coordinatorNote} rows={4} maxLength={1500} value={editing.adminNote} onChange={e=>setEditing({...editing,adminNote:e.target.value})} className="mt-2 block w-full rounded-lg border p-3"/>
    </label>
    <label className="block text-sm font-bold">{copy.completionEvidence}
     <input maxLength={500} aria-label={copy.completionEvidence} value={editing.evidenceUrl??""} onChange={e=>setEditing({...editing,evidenceUrl:e.target.value||null})} className="mt-2 block w-full rounded-lg border p-3"/>
    </label>
    <div className="flex gap-3"><button disabled={busy} className="rounded-lg bg-[#822e40] px-5 py-3 font-bold text-white">{busy?copy.saving:copy.savePuja}</button>
     <button type="button" onClick={()=>setEditing(null)} className="rounded-lg border px-5 py-3 font-bold">{copy.cancel}</button>
    </div>
    </fieldset>
   </form>:null}
   {known&&!loading&&!bookings.length?<p className="rounded-xl border bg-white p-6">{copy.noPujas}</p>:null}
   <div className="grid gap-4 md:grid-cols-2">
    {bookings.map(b=><article key={b.id} className="rounded-2xl border border-[#e4cbaa] bg-white p-5">
     <p className="font-bold text-[#7e2b3c]">{b.topicId} · {fulfilmentState(b.status,locale)}</p>
     <p className="mt-2 text-sm">{copy.devotee}: {b.devoteeName} · {b.city} · {b.customerPhone}</p>
     <p className="mt-2 text-sm">{copy.requestedDate}: {fulfilmentDate(b.preferredDate,locale,true)} · {copy.fee}: ₹{(b.quotedPricePaise/100).toFixed(2)}</p>
     <p className="mt-2 text-sm">{copy.confirmedTime}: {b.scheduledAt?fulfilmentDate(b.scheduledAt,locale):copy.notScheduled} · {copy.coordinator}: {b.partnerId?copy.assigned:copy.unassigned}</p>
     <details className="mt-3 rounded-lg bg-[#fff7ed] p-3 text-xs"><summary className="cursor-pointer font-bold">{copy.sankalp}</summary>
      <p className="mt-3">{copy.gotra}: {b.gotra||copy.notSupplied}</p><p className="mt-2 whitespace-pre-wrap">{b.sankalpNote}</p>
     </details>
     <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" disabled={busy||retrying!==null||uncertain||!known} onClick={()=>{setEditing({...b});setPartnerAccepted(false)}} className="rounded-lg border border-[#bd8e83] px-4 py-2 text-sm font-bold text-[#762c3d]">{copy.managePuja}</button>
      {["CONFIRMED","SCHEDULED","IN_PROGRESS","COMPLETED","CANCELED","REJECTED"].includes(b.status)?
       <button type="button" disabled={busy||retrying!==null||uncertain||!known} onClick={()=>retryEmail(b)}
        className="rounded-lg border border-[#bd8e83] px-4 py-2 text-sm font-semibold text-[#762c3d] disabled:opacity-60">
        {retrying===b.id?copy.retrying:copy.retry}
       </button>:null}
     </div>
    </article>)}
   </div>
 </div>;
}

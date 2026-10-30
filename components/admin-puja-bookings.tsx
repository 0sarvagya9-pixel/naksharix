"use client";
import { useEffect,useState,type FormEvent } from "react";
import { secureFetch } from "@/lib/security/csrf";
type Partner={id:string;name:string;region:string};
type Booking={id:string;userId:string;topicId:string;quotedPricePaise:number;preferredDate:string;city:string;
 devoteeName:string;gotra:string|null;sankalpNote:string;customerPhone:string;status:string;
 partnerId:string|null;scheduledAt:string|null;adminNote:string;evidenceUrl:string|null;version:number;createdAt:string};
export function AdminPujaBookings(){
 const [bookings,setBookings]=useState<Booking[]>([]);
 const [partners,setPartners]=useState<Partner[]>([]);
 const [editing,setEditing]=useState<Booking|null>(null);
 const [error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;fetch("/api/admin/puja-bookings",{cache:"no-store"}).then(async r=>{
  const result=await r.json();if(!r.ok)throw Error(result.error||"Unable to load bookings");return result.data as {bookings:Booking[];partners:Partner[]};
 }).then(data=>{if(active){setBookings(data.bookings);setPartners(data.partners)}})
 .catch(e=>{if(active)setError(e instanceof Error?e.message:"Unable to load booking requests")});
 return()=>{active=false}},[]);
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!editing||busy)return;setError("");setNotice("");setBusy(true);
  try{
   const response=await secureFetch("/api/admin/puja-bookings",{method:"PATCH",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id:editing.id,expectedVersion:editing.version,status:editing.status,partnerId:editing.partnerId,
      scheduledAt:editing.scheduledAt,adminNote:editing.adminNote,evidenceUrl:editing.evidenceUrl})});
   const result=await response.json();if(!response.ok)throw Error(result.error||"Unable to save");
   setBookings(rows=>rows.map(row=>row.id===editing.id?result.data.booking:row));
   setEditing(null);setNotice("Booking updated. Payment status is managed separately by Razorpay.");
  }catch(e){setError(e instanceof Error?e.message:"Could not update booking")}
  finally{setBusy(false)}
 }
 return <div className="mx-auto max-w-7xl space-y-5 px-5 py-12 text-[#3d2631]">
   <h1 className="font-cinzel text-3xl font-bold">Puja requests & delivery</h1>
   <p className="max-w-3xl text-sm leading-6">Manage customer bookings and private Sankalp details. Naksharix may coordinate the ceremony directly or select an approved external partner.</p>
   {error?<p role="alert" className="rounded-lg bg-[#fff0f0] p-4 text-[#9b3247]">{error}</p>:null}
   {notice?<p role="status" className="rounded-lg bg-[#eef9ec] p-4 text-[#345c34]">{notice}</p>:null}
   {editing?<form className="max-w-2xl space-y-4 rounded-2xl border border-[#d8b589] bg-white p-6" onSubmit={save}>
    <h2 className="text-xl font-bold">{editing.topicId} — #{editing.id.slice(0,12)}</h2>
    <label className="block text-sm font-bold">Status
      <select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})} className="mt-2 block w-full rounded-lg border p-3">
       {["REQUESTED","CONFIRMED","SCHEDULED","IN_PROGRESS","COMPLETED","CANCELED","REJECTED"].map(x=><option key={x}>{x}</option>)}
      </select>
    </label>
    <label className="block text-sm font-bold">External Pandit/Puja partner (optional)
     <select value={editing.partnerId??""} onChange={e=>setEditing({...editing,partnerId:e.target.value||null})} className="mt-2 block w-full rounded-lg border p-3">
      <option value="">Handled by Naksharix / owner</option>{partners.map(p=><option key={p.id} value={p.id}>{p.name} — {p.region}</option>)}
     </select>
    </label>
    <label className="block text-sm font-bold">Confirmed ceremony date/time (ISO, with timezone)
     <input value={editing.scheduledAt??""} onChange={e=>setEditing({...editing,scheduledAt:e.target.value||null})}
       placeholder="2026-11-01T10:30:00+05:30" className="mt-2 block w-full rounded-lg border p-3"/>
    </label>
    <label className="block text-sm font-bold">Private completion / coordinator note
     <textarea rows={4} maxLength={1500} value={editing.adminNote} onChange={e=>setEditing({...editing,adminNote:e.target.value})} className="mt-2 block w-full rounded-lg border p-3"/>
    </label>
    <label className="block text-sm font-bold">Real completion evidence HTTPS URL, if applicable
     <input maxLength={500} value={editing.evidenceUrl??""} onChange={e=>setEditing({...editing,evidenceUrl:e.target.value||null})} className="mt-2 block w-full rounded-lg border p-3"/>
    </label>
    <div className="flex gap-3"><button disabled={busy} className="rounded-lg bg-[#822e40] px-5 py-3 font-bold text-white">{busy?"Saving...":"Update booking"}</button>
     <button type="button" onClick={()=>setEditing(null)} className="rounded-lg border px-5 py-3 font-bold">Cancel</button>
    </div>
   </form>:null}
   {!bookings.length?<p className="rounded-xl border bg-white p-6">No Puja requests yet.</p>:null}
   <div className="grid gap-4 md:grid-cols-2">
    {bookings.map(b=><article key={b.id} className="rounded-2xl border border-[#e4cbaa] bg-white p-5">
     <p className="font-bold text-[#7e2b3c]">{b.topicId} · {b.status}</p>
     <p className="mt-2 text-sm">Devotee: {b.devoteeName} · {b.city} · {b.customerPhone}</p>
     <p className="mt-2 text-sm">Requested date: {b.preferredDate.slice(0,10)} · Fee: ₹{(b.quotedPricePaise/100).toFixed(2)}</p>
     <p className="mt-2 text-sm">Confirmed: {b.scheduledAt||"Not scheduled"} · Partner {b.partnerId||"Not assigned"}</p>
     <details className="mt-3 rounded-lg bg-[#fff7ed] p-3 text-xs"><summary className="cursor-pointer font-bold">Private Sankalp details</summary>
      <p className="mt-3">Gotra: {b.gotra||"Not supplied"}</p><p className="mt-2 whitespace-pre-wrap">{b.sankalpNote}</p>
     </details>
     <button type="button" onClick={()=>setEditing({...b})} className="mt-4 rounded-lg border border-[#bd8e83] px-4 py-2 text-sm font-bold text-[#762c3d]">Manage Puja</button>
    </article>)}
   </div>
 </div>;
}

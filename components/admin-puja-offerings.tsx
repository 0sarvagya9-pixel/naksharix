"use client";
import { useEffect,useMemo,useState,type FormEvent } from "react";
import { pujaTopics } from "@/lib/puja/service-catalogue";
import { secureFetch } from "@/lib/security/csrf";
type Offer={topicId:string;pricePaise:number|null;durationMinutes:number|null;available:boolean;note:string};
function blank(topicId:string):Offer{return {topicId,pricePaise:null,durationMinutes:null,available:false,note:""}}
export function AdminPujaOfferEditor(){
 const [saved,setSaved]=useState<Record<string,Offer>>({});
 const [query,setQuery]=useState("");
 const [draft,setDraft]=useState<Offer|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 useEffect(()=>{let active=true;fetch("/api/admin/puja-offerings",{cache:"no-store"}).then(async r=>{
  const json=await r.json();if(!r.ok)throw Error(json.error||"Unable to load Puja offers.");return json.data.offerings as Offer[];
 }).then(rows=>{if(active)setSaved(Object.fromEntries(rows.map(o=>[o.topicId,o])))})
 .catch(e=>{if(active)setError(e instanceof Error?e.message:"Unable to load prices.")});
 return()=>{active=false}},[]);
 const results=useMemo(()=>pujaTopics.filter(p=>(p.name+" "+p.category+" "+p.deity).toLowerCase().includes(query.toLowerCase())),[query]);
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!draft||busy)return;
  if(draft.available&&draft.pricePaise===null){setError("Set an approved INR price before publishing.");return}
  setBusy(true);setError("");setNotice("");
  try{
   const r=await secureFetch("/api/admin/puja-offerings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(draft)});
   const body=await r.json();if(!r.ok)throw Error(body.error||"Could not save.");
   const row=body.data.offering as Offer;setSaved(prev=>({...prev,[row.topicId]:row}));setNotice("Saved "+row.topicId);setDraft(null);
  }catch(e){setError(e instanceof Error?e.message:"Unable to save offer.")}
  finally{setBusy(false)}
 }
 return <div className="mt-8">
  <label className="block max-w-lg text-sm font-semibold text-[#432b34]">Search Puja
    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Shiva, Lakshmi, Homa..." className="mt-2 block w-full rounded-xl border border-[#dcc3ab] bg-white px-4 py-3"/>
  </label>
  {error?<p role="alert" className="mt-4 rounded-xl bg-[#fff0f0] p-4 text-sm text-[#8e2342]">{error}</p>:null}
  {notice?<p role="status" className="mt-4 rounded-xl bg-[#eff9f0] p-4 text-sm text-[#31592d]">{notice}</p>:null}
  {draft?<form onSubmit={save} className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-[#d8b58d] bg-white p-6">
   <h2 className="font-cinzel text-xl font-bold text-[#402832]">{pujaTopics.find(p=>p.id===draft.topicId)?.name}</h2>
   <label className="block text-sm font-bold">Approved fee (INR)
     <input inputMode="decimal" type="number" step=".01" min="1" max="1000000" value={draft.pricePaise===null?"":(draft.pricePaise/100).toFixed(2)}
       onChange={e=>{const n=Math.round(Number(e.target.value)*100);setDraft({...draft,pricePaise:e.target.value.trim()&&Number.isSafeInteger(n)&&n>=100&&n<=100000000?n:null})}}
       className="mt-2 block w-full rounded-lg border border-[#d8b58d] p-3"/>
   </label>
   <label className="block text-sm font-bold">Estimated minutes (optional)
     <input type="number" min="15" max="2880" value={draft.durationMinutes??""} onChange={e=>setDraft({...draft,durationMinutes:e.target.value?Number(e.target.value):null})}
       className="mt-2 block w-full rounded-lg border border-[#d8b58d] p-3"/>
   </label>
   <label className="block text-sm font-bold">Public service note
     <textarea maxLength={500} rows={3} value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}
       className="mt-2 block w-full rounded-lg border border-[#d8b58d] p-3"/>
   </label>
   <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={draft.available} onChange={e=>setDraft({...draft,available:e.target.checked})}/>
     Publish price (only if you can actually offer this Puja)</label>
   <div className="flex flex-wrap gap-3"><button disabled={busy} className="rounded-xl bg-[#762a3c] px-6 py-3 font-bold text-white">{busy?"Saving...":"Save offer"}</button>
    <button type="button" onClick={()=>setDraft(null)} className="rounded-xl border border-[#c9ad93] px-6 py-3 font-bold">Cancel</button></div>
  </form>:null}
  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
   {results.map(topic=>{const offer=saved[topic.id];return <div key={topic.id} className="rounded-xl border border-[#ead4bb] bg-white p-4">
    <p className="font-semibold text-[#462832]">{topic.name}</p>
    <p className="mt-2 text-sm text-[#6b535e]">{offer?.available&&offer.pricePaise!==null?"₹"+(offer.pricePaise/100).toFixed(2)+" · Published":"Not published"}</p>
    <button type="button" className="mt-3 rounded-lg border border-[#a87a7f] px-4 py-2 text-sm font-bold text-[#762a3c]" onClick={()=>{setError("");setDraft({...blank(topic.id),...offer,topicId:topic.id})}}>Set rate</button>
   </div>})}
  </div>
 </div>
}

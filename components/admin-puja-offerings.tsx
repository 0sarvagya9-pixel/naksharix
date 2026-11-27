"use client";
import { useEffect,useMemo,useState,useCallback,useRef,type FormEvent } from "react";
import { ResilientEditorialImage } from "@/components/puja/resilient-editorial-image";
import { editorialPujaPhotos, pujaEditorialPhoto } from "@/lib/puja/editorial-photos";
import { pujaTopics, allPujaTopics, findKumbhEvent, kumbhEventVisible } from "@/lib/puja/service-catalogue";
import { secureFetch } from "@/lib/security/csrf";
import { siteNotice } from "@/lib/ui/site-notification";
import {useLanguage} from "@/components/language-provider";
import {adminCatalogueCopy,type CatalogueMessage} from "@/lib/admin/catalogue-copy";
import {isPujaOffer,matchingPujaOffer,type PujaOffer as Offer} from "@/lib/admin/catalogue-client-contract";

function blank(topicId:string):Offer{return {topicId,pricePaise:110000,durationMinutes:null,available:false,note:""}}
export function AdminPujaOfferEditor(){
 const {locale}=useLanguage(),copy=adminCatalogueCopy(locale);
 const lock=useRef(false),sequence=useRef(0);
 const [ready,setReady]=useState(false),[loading,setLoading]=useState(true);
 const [saved,setSaved]=useState<Record<string,Offer>>({});
 const [query,setQuery]=useState("");
 const [needsExactPhoto,setNeedsExactPhoto]=useState(false);
 const [draft,setDraft]=useState<Offer|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState<CatalogueMessage|null>(null),[notice,setNotice]=useState<CatalogueMessage|null>(null);
 const load=useCallback(async()=>{const n=++sequence.current;setLoading(true);try{const r=await fetch("/api/admin/puja-offerings",{cache:"no-store"});const j=await r.json().catch(()=>null);if(n!==sequence.current)return;const rows=j?.data?.offerings;if(!r.ok||!Array.isArray(rows)||!rows.every(isPujaOffer))throw Error("Unconfirmed offers");setSaved(Object.fromEntries(rows.map(x=>[x.topicId,x])));setReady(true);setError(null);}catch{if(n===sequence.current){setReady(false);setError("loadFailed");}}finally{if(n===sequence.current)setLoading(false);}},[]);
 useEffect(()=>{void load();return()=>{sequence.current++;};},[load]);
 const results=useMemo(()=>allPujaTopics.filter(topic=>
   (!findKumbhEvent(topic.id)||kumbhEventVisible(findKumbhEvent(topic.id)!)) &&
   (topic.name+" "+topic.category+" "+topic.deity).toLowerCase().includes(query.toLowerCase()) &&
   (!needsExactPhoto || !editorialPujaPhotos[topic.id])
 ),[query,needsExactPhoto]);
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!draft||lock.current||!ready)return;
  if(draft.available&&draft.pricePaise===null){setError("priceRequired");siteNotice.warning(copy.priceRequired);return}
  lock.current=true;sequence.current++;setLoading(false);const input={...draft,note:draft.note.trim()};setBusy(true);setError(null);setNotice(null);
  try{
   const r=await secureFetch("/api/admin/puja-offerings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(input),silent:true});
   const body=await r.json().catch(()=>null);if(!r.ok||!matchingPujaOffer(body?.data?.offering,input))throw Error("Unconfirmed offer");
   const row=body.data.offering as Offer;setSaved(prev=>({...prev,[row.topicId]:row}));setNotice("rateSaved");setDraft(null);
  }catch{setReady(false);setError("unknown");}
  finally{lock.current=false;setBusy(false)}
 }
 return <div className="mt-8">
  <label className="block max-w-lg text-sm font-semibold text-[#432b34]">{copy.search}
    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={copy.searchExample} className="mt-2 block w-full rounded-xl border border-[#dcc3ab] bg-white px-4 py-3"/>
  </label>
  <p className="mt-4 max-w-3xl text-sm leading-6 text-[#63454c]">
    {Object.keys(editorialPujaPhotos).length} / {pujaTopics.length} {copy.photoCoverage}
  </p>
  <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-[#582d3b]">
    <input type="checkbox" checked={needsExactPhoto} onChange={e=>setNeedsExactPhoto(e.target.checked)} />
    {copy.exactPhoto}
  </label>
  <button type="button" disabled={busy} onClick={()=>void load()} className="mt-4 rounded-lg border px-4 py-2">{copy.refresh}</button>
  {loading?<p role="status">{copy.loading}</p>:null}
  {error?<p role="alert" className="mt-4 rounded-xl bg-[#fff0f0] p-4 text-sm text-[#8e2342]">{copy[error]}</p>:null}
  {notice?<p role="status" className="mt-4 rounded-xl bg-[#eff9f0] p-4 text-sm text-[#31592d]">{copy[notice]}</p>:null}
  {draft?<form onSubmit={save} className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-[#d8b58d] bg-white p-6">
   <fieldset disabled={busy||!ready}><h2 className="font-cinzel text-xl font-bold text-[#402832]">{allPujaTopics.find(p=>p.id===draft.topicId)?.name}</h2>
   <p className="text-xs leading-6 text-[#6b535e]">{copy.feeTerms}</p>
   <label className="block text-sm font-bold">{copy.fee}
     <input inputMode="decimal" type="number" step=".01" min="1" max="1000000" value={draft.pricePaise===null?"":(draft.pricePaise/100).toFixed(2)}
       onChange={e=>{const n=Math.round(Number(e.target.value)*100);setDraft({...draft,pricePaise:e.target.value.trim()&&Number.isSafeInteger(n)&&n>=100&&n<=100000000?n:null})}}
       className="mt-2 block w-full rounded-lg border border-[#d8b58d] p-3"/>
   </label>
   <label className="block text-sm font-bold">{copy.minutes}
     <input type="number" min="15" max="2880" value={draft.durationMinutes??""} onChange={e=>setDraft({...draft,durationMinutes:e.target.value?Number(e.target.value):null})}
       className="mt-2 block w-full rounded-lg border border-[#d8b58d] p-3"/>
   </label>
   <label className="block text-sm font-bold">{copy.serviceNote}
     <textarea aria-label={copy.serviceNote} maxLength={500} rows={3} value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}
       className="mt-2 block w-full rounded-lg border border-[#d8b58d] p-3"/>
   </label>
   <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={draft.available} onChange={e=>setDraft({...draft,available:e.target.checked})}/>
     {copy.publishOffer}</label>
   <div className="flex flex-wrap gap-3"><button disabled={busy} className="rounded-xl bg-[#762a3c] px-6 py-3 font-bold text-white">{busy?copy.saving:copy.saveOffer}</button>
    <button type="button" onClick={()=>setDraft(null)} className="rounded-xl border border-[#c9ad93] px-6 py-3 font-bold">{copy.cancel}</button></div></fieldset>
  </form>:null}
  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
   {results.map(topic=>{const offer=saved[topic.id];const photo=pujaEditorialPhoto(topic.id,topic.category);
    const topicSpecific=Boolean(editorialPujaPhotos[topic.id]);
    return <div key={topic.id} className="rounded-xl border border-[#ead4bb] bg-white p-4">
    {photo?<div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-lg bg-[#f4e8d9]">
      <ResilientEditorialImage src={photo.src} fallbackSrc={topic.graphic} alt={copy.representative+" "+topic.name} width={480} height={300}
        className="h-full w-full object-cover" />
    </div>:null}
    <p className={"text-xs font-semibold "+(topicSpecific?"text-[#3d6b46]":"text-[#89452e]")}>
      {topicSpecific?copy.licensed:copy.categoryPhoto}
    </p>
    {photo?<a href={photo.source} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs underline text-[#664a52]">
      {photo.author} · {photo.license} · {copy.source}
    </a>:null}
    <p className="font-semibold text-[#462832]">{topic.name}</p>
    <p className="mt-2 text-sm text-[#6b535e]">{offer?.available&&offer.pricePaise!==null?"₹"+(offer.pricePaise/100).toFixed(2)+" · "+copy.published:copy.unpublished}</p>
    <button type="button" className="mt-3 rounded-lg border border-[#a87a7f] px-4 py-2 text-sm font-bold text-[#762a3c]" disabled={!ready||busy} onClick={()=>{setError(null);setDraft({...blank(topic.id),...offer,topicId:topic.id})}}>{copy.setRate}</button>
   </div>})}
  </div>
 </div>
}

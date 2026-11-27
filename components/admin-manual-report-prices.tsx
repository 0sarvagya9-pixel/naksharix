"use client";
import { useEffect,useState,useRef,useCallback,type FormEvent } from "react";
import { manualReports } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
import { secureFetch } from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {adminCatalogueCopy,type CatalogueMessage} from "@/lib/admin/catalogue-copy";
import {isManualRate,matchingManualRate,type ManualRate as Entry} from "@/lib/admin/catalogue-client-contract";
const manual=manualReports.filter(r=>!getManualReportCheckout(r.slug));
export function AdminManualReportPrices(){
 const {locale}=useLanguage(),copy=adminCatalogueCopy(locale);
 const lock=useRef(false),sequence=useRef(0);
 const [ready,setReady]=useState(false),[loading,setLoading]=useState(true);
 const [rates,setRates]=useState<Record<string,Entry>>({});
 const [edit,setEdit]=useState<Entry|null>(null),[error,setError]=useState<CatalogueMessage|null>(null),[notice,setNotice]=useState<CatalogueMessage|null>(null),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{const n=++sequence.current;setLoading(true);try{const r=await fetch("/api/admin/manual-report-offerings",{cache:"no-store"});const j=await r.json().catch(()=>null);if(n!==sequence.current)return;const rows=j?.data?.offerings;if(!r.ok||!Array.isArray(rows)||!rows.every(isManualRate))throw Error("Unconfirmed records");setRates(Object.fromEntries(rows.map(x=>[x.reportSlug,x])));setReady(true);setError(null);}catch{if(n===sequence.current){setReady(false);setError("loadFailed");}}finally{if(n===sequence.current)setLoading(false);}},[]);
 useEffect(()=>{void load();return()=>{sequence.current++;};},[load]);
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!edit||lock.current||!ready)return;lock.current=true;sequence.current++;setLoading(false);const input={...edit,note:edit.note.trim()};setBusy(true);setError(null);setNotice(null);
  try{
   const response=await secureFetch("/api/admin/manual-report-offerings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(input),silent:true});
   const body=await response.json().catch(()=>null);if(!response.ok||!matchingManualRate(body?.data?.offering,input))throw Error("Unconfirmed save");
   setRates(previous=>({...previous,[input.reportSlug]:body.data.offering}));
   setNotice("rateSaved");setEdit(null);
  }catch{setReady(false);setError("unknown");}finally{lock.current=false;setBusy(false)}
 }
 return <div className="mx-auto max-w-6xl px-5 py-12 text-[#3d2930]">
  <h1 className="font-cinzel text-3xl font-bold">{copy.manualTitle}</h1>
  <p className="mt-4 max-w-3xl text-sm leading-7">{copy.manualIntro}</p>
  <button type="button" disabled={busy} onClick={()=>void load()} className="mt-4 rounded-lg border px-4 py-2">{copy.refresh}</button>
  {loading?<p role="status">{copy.loading}</p>:null}
  {!manual.length?<p className="mt-4">{copy.noManual}</p>:null}
  {error?<p role="alert" className="mt-5 rounded-lg bg-[#fff0f0] p-4">{copy[error]}</p>:null}
  {notice?<p role="status" className="mt-5 rounded-lg bg-[#edfaed] p-4">{copy[notice]}</p>:null}
  {edit?<form onSubmit={save} className="mt-5 max-w-xl space-y-4 rounded-xl border border-[#debf9b] bg-white p-6">
   <fieldset disabled={busy||!ready}><h2 className="font-bold">{manual.find(r=>r.slug===edit.reportSlug)?.name[locale]}</h2>
   <label className="block text-sm font-bold">{copy.approvedPrice}
    <input type="number" min="1" max="1000000" step=".01" value={edit.pricePaise===null?"":(edit.pricePaise/100).toFixed(2)}
      onChange={e=>{const p=Math.round(Number(e.target.value)*100);setEdit({...edit,pricePaise:e.target.value&&Number.isSafeInteger(p)&&p>=100&&p<=100000000?p:null})}}
      className="mt-2 block w-full rounded-lg border p-3"/>
   </label>
   <label className="block text-sm font-bold">{copy.delivery}
    <input type="number" min="1" max="180" value={edit.deliveryDays??""} onChange={e=>setEdit({...edit,deliveryDays:e.target.value?Number(e.target.value):null})}
      className="mt-2 block w-full rounded-lg border p-3"/>
   </label>
   <label className="block text-sm font-bold">{copy.note}
    <textarea aria-label={copy.note} maxLength={500} value={edit.note} onChange={e=>setEdit({...edit,note:e.target.value})} className="mt-2 block w-full rounded-lg border p-3" rows={3}/>
   </label>
   <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={edit.available} onChange={e=>setEdit({...edit,available:e.target.checked})}/>{copy.publishRate}</label>
   <div className="flex gap-3"><button disabled={busy} className="rounded-lg bg-[#78283d] px-5 py-3 font-bold text-white">{busy?copy.saving:copy.saveRate}</button>
    <button type="button" onClick={()=>setEdit(null)} className="rounded-lg border px-5 py-3">{copy.cancel}</button></div></fieldset>
  </form>:null}
  <div className="mt-6 grid gap-4 md:grid-cols-3">
   {manual.map(report=>{const row=rates[report.slug];return <article key={report.slug} className="rounded-xl border border-[#e4cbb1] bg-white p-5">
    <p className="font-cinzel font-bold">{report.name[locale]}</p>
    <p className="mt-2 text-sm">{row?.available&&row.pricePaise!==null?"₹"+(row.pricePaise/100).toFixed(2):copy.unpriced}</p>
    <button disabled={!ready||busy} onClick={()=>setEdit({...{pricePaise:null,available:false,deliveryDays:null,note:""},...row,reportSlug:report.slug})} className="mt-3 rounded-lg border border-[#b57b81] px-4 py-2 text-sm font-bold">{copy.setRate}</button>
   </article>})}
  </div>
 </div>;
}

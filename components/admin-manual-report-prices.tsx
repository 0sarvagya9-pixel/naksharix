"use client";
import { useEffect,useState,type FormEvent } from "react";
import { manualReports } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
import { secureFetch } from "@/lib/security/csrf";
type Entry={reportSlug:string;pricePaise:number|null;available:boolean;deliveryDays:number|null;note:string};
const manual=manualReports.filter(r=>!getManualReportCheckout(r.slug));
export function AdminManualReportPrices(){
 const [rates,setRates]=useState<Record<string,Entry>>({});
 const [edit,setEdit]=useState<Entry|null>(null),[error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;fetch("/api/admin/manual-report-offerings",{cache:"no-store"}).then(async res=>{
  const data=await res.json();if(!res.ok)throw Error(data.error||"Unable to load rates");return data.data.offerings as Entry[];
 }).then(rows=>{if(active)setRates(Object.fromEntries(rows.map(x=>[x.reportSlug,x])))})
 .catch(e=>{if(active)setError(e instanceof Error?e.message:"Could not load report prices")});
 return()=>{active=false}},[]);
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!edit||busy)return;setBusy(true);setError("");setNotice("");
  try{
   const response=await secureFetch("/api/admin/manual-report-offerings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(edit)});
   const body=await response.json();if(!response.ok)throw Error(body.error||"Unable to save");
   setRates(previous=>({...previous,[edit.reportSlug]:body.data.offering}));
   setNotice("Published rate saved. No checkout or payment was changed.");setEdit(null);
  }catch(e){setError(e instanceof Error?e.message:"Unable to save")}finally{setBusy(false)}
 }
 return <div className="mx-auto max-w-6xl px-5 py-12 text-[#3d2930]">
  <h1 className="font-cinzel text-3xl font-bold">Manual Report Prices</h1>
  <p className="mt-4 max-w-3xl text-sm leading-7">Set the confirmed fee for specialist reports without an existing gateway-priced checkout. The six fixed-price Razorpay contracts are not changed here.</p>
  {error?<p role="alert" className="mt-5 rounded-lg bg-[#fff0f0] p-4">{error}</p>:null}
  {notice?<p role="status" className="mt-5 rounded-lg bg-[#edfaed] p-4">{notice}</p>:null}
  {edit?<form onSubmit={save} className="mt-5 max-w-xl space-y-4 rounded-xl border border-[#debf9b] bg-white p-6">
   <h2 className="font-bold">{manual.find(r=>r.slug===edit.reportSlug)?.name.en}</h2>
   <label className="block text-sm font-bold">Approved price INR
    <input type="number" min="1" max="1000000" step=".01" value={edit.pricePaise===null?"":(edit.pricePaise/100).toFixed(2)}
      onChange={e=>{const p=Math.round(Number(e.target.value)*100);setEdit({...edit,pricePaise:e.target.value&&Number.isSafeInteger(p)&&p>=100&&p<=100000000?p:null})}}
      className="mt-2 block w-full rounded-lg border p-3"/>
   </label>
   <label className="block text-sm font-bold">Estimated delivery days
    <input type="number" min="1" max="180" value={edit.deliveryDays??""} onChange={e=>setEdit({...edit,deliveryDays:e.target.value?Number(e.target.value):null})}
      className="mt-2 block w-full rounded-lg border p-3"/>
   </label>
   <label className="block text-sm font-bold">Public note
    <textarea maxLength={500} value={edit.note} onChange={e=>setEdit({...edit,note:e.target.value})} className="mt-2 block w-full rounded-lg border p-3" rows={3}/>
   </label>
   <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={edit.available} onChange={e=>setEdit({...edit,available:e.target.checked})}/>Publish rate</label>
   <div className="flex gap-3"><button disabled={busy} className="rounded-lg bg-[#78283d] px-5 py-3 font-bold text-white">{busy?"Saving…":"Save rate"}</button>
    <button type="button" onClick={()=>setEdit(null)} className="rounded-lg border px-5 py-3">Cancel</button></div>
  </form>:null}
  <div className="mt-6 grid gap-4 md:grid-cols-3">
   {manual.map(report=>{const row=rates[report.slug];return <article key={report.slug} className="rounded-xl border border-[#e4cbb1] bg-white p-5">
    <p className="font-cinzel font-bold">{report.name.en}</p>
    <p className="mt-2 text-sm">{row?.available&&row.pricePaise!==null?"₹"+(row.pricePaise/100).toFixed(2):"Unpriced / unpublished"}</p>
    <button onClick={()=>setEdit({...{pricePaise:null,available:false,deliveryDays:null,note:""},...row,reportSlug:report.slug})} className="mt-3 rounded-lg border border-[#b57b81] px-4 py-2 text-sm font-bold">Set rate</button>
   </article>})}
  </div>
 </div>;
}

"use client";
import { useCallback,useEffect,useRef,useState,type FormEvent } from "react";
import { secureFetch } from "@/lib/security/csrf";
import { countryName,readShippingSnapshot } from "@/lib/shop/shipping-rules";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { fulfilmentCopy, fulfilmentDate, fulfilmentEmail, fulfilmentFailure, fulfilmentState, type FulfilmentCopyKey } from "@/lib/admin/fulfilment-copy";
import { notificationRetryRecorded, readShopOrders, savedShopOrder, type ShopOrder as Order } from "@/lib/admin/fulfilment-contract";
const nextStatuses:Record<string,string[]>={REQUESTED:["CONFIRMED","CANCELED"],CONFIRMED:["PACKING","CANCELED"],
 PACKING:["DISPATCHED","CANCELED"],DISPATCHED:["DELIVERED"],DELIVERED:[],CANCELED:[]};
const blankQuote={carrier:"",evidenceReference:"",expiresAt:"",dutiesMode:"RECIPIENT_MAY_PAY",confirmed:false};
export function AdminShopOrders(){
 const {locale}=useLanguage(),copy=fulfilmentCopy(locale);
 const money=(value:number)=>new Intl.NumberFormat(locale==='hi'?'hi-IN':'en-IN',{style:'currency',currency:'INR'}).format(value/100);
 const [orders,setOrders]=useState<Order[]>([]),[error,setError]=useState<FulfilmentCopyKey|"">("");
 const [notice,setNotice]=useState<{message:FulfilmentCopyKey;email:FulfilmentCopyKey}|null>(null);
 const [manual,setManual]=useState(blankQuote);
 const [editing,setEditing]=useState<Order|null>(null),[saving,setSaving]=useState(false),[retrying,setRetrying]=useState<string|null>(null);
 const [loading,setLoading]=useState(true),[known,setKnown]=useState(false),[uncertain,setUncertain]=useState(false);
 const inFlight=useRef(false),active=useRef(true),loadSequence=useRef(0);
 const refresh=useCallback(async()=>{
  if(inFlight.current)return;
  const sequence=++loadSequence.current;setLoading(true);
  try{
   const response=await fetch("/api/admin/shop-orders",{cache:"no-store"}),body:unknown=await response.json();
   const rows=readShopOrders(body);if(!response.ok||!rows)throw Error('Unverified orders');
   if(active.current&&sequence===loadSequence.current){setOrders(rows);setKnown(true);setError("");setUncertain(false);setEditing(null);setManual({...blankQuote});}
  }catch{if(active.current&&sequence===loadSequence.current){setKnown(false);setError("unavailable");}}
  finally{if(active.current&&sequence===loadSequence.current)setLoading(false);}
 },[]);
 useEffect(()=>{active.current=true;void refresh();return()=>{active.current=false;};},[refresh]);
 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!editing||inFlight.current||uncertain||!known)return;
  const draft={...editing},previous=orders.find(row=>row.id===draft.id);if(!previous)return;
  inFlight.current=true;loadSequence.current++;setLoading(false);setSaving(true);setError("");setNotice(null);
  let failure:FulfilmentCopyKey="unconfirmed",sent=false;
  try{
   const manualQuote=manual.confirmed?{...manual,expiresAt:new Date(manual.expiresAt+"+05:30").toISOString()}:undefined;
   const payload={id:draft.id,expectedVersion:draft.version,status:draft.status,shippingPaise:draft.shippingPaise,taxPaise:draft.taxPaise,trackingReference:draft.trackingReference,fulfillmentEvidenceUrl:draft.fulfillmentEvidenceUrl,adminNote:draft.adminNote,...(manualQuote?{manualQuote}:{})};
   sent=true;
   const response=await secureFetch("/api/admin/shop-orders",{method:"PATCH",silent:true,headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const result=await response.json();if(!response.ok){failure=fulfilmentFailure(response.status);throw Error('Order not acknowledged');}
   const saved=savedShopOrder(result,draft,previous,manualQuote);if(!saved)throw Error('Unmatched order acknowledgement');
   setOrders(rows=>rows.map(row=>row.id===saved.id?saved:row));setEditing(null);setManual({...blankQuote});setNotice({message:"shopSaved",email:fulfilmentEmail(result.data?.notification?.outcome)});
  }catch{setError(sent?failure:"invalid");if(sent)setUncertain(true);}
  finally{inFlight.current=false;setSaving(false);}
 }
 async function retryEmail(order:Order){
  if(inFlight.current||uncertain||!known)return;
  inFlight.current=true;loadSequence.current++;setLoading(false);setRetrying(order.id);setError("");setNotice(null);
  let failure:FulfilmentCopyKey="unconfirmed";
  try{
   const response=await secureFetch("/api/admin/fulfilment-notification",{method:"POST",silent:true,headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"shop",id:order.id,expectedVersion:order.version})});
   const result=await response.json();if(!response.ok){failure=fulfilmentFailure(response.status);throw Error('Retry not acknowledged');}
   if(!notificationRetryRecorded(result,{kind:'shop',id:order.id,version:order.version,status:order.status}))throw Error('Unmatched notification acknowledgement');
   setNotice({message:"retryRecorded",email:fulfilmentEmail(result.data.notification.outcome)});
  }catch{setError(failure);setUncertain(true);}
  finally{inFlight.current=false;setRetrying(null);}
 }
 return <div className="mx-auto max-w-7xl space-y-5 py-12 text-[#3c2730] px-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-cinzel text-3xl font-bold">{copy.shopTitle}</h1><Link href="/admin/shop-shipping" className="rounded-xl bg-[#822c40] px-4 py-3 text-sm font-bold text-white">{copy.shippingRates}</Link></div>
  <p className="max-w-3xl text-sm leading-6">{copy.shopIntro}</p>
  {error?<p role="alert" className="rounded-lg bg-[#fff0f0] p-4 text-[#8d2d45]">{copy[error]}</p>:null}
  {notice?<p role="status" className="rounded-lg bg-[#edf9ed] p-4 text-[#365d36]">{copy[notice.message]} {copy[notice.email]}</p>:null}
  <button type="button" disabled={loading||saving||retrying!==null} onClick={()=>void refresh()} className="rounded-lg border px-4 py-2">{loading?copy.refreshing:copy.refresh}</button>
  {loading?<p role="status">{copy.loading}</p>:null}
  {editing?<form onSubmit={save} className="max-w-2xl space-y-3 rounded-2xl border border-[#d4b796] bg-white p-6">
    <fieldset disabled={saving||retrying!==null||uncertain} className="space-y-3"><h2 className="text-xl font-bold">{copy.manage} #{editing.id.slice(0,12)}</h2>
    <p className="text-sm">{copy.subtotal}: {money(editing.subtotalPaise)} · {copy.destination}: {new Intl.DisplayNames([locale==="hi"?"hi":"en"],{type:"region"}).of(editing.deliveryCountry)||countryName(editing.deliveryCountry)}, {editing.postalCode}</p>
    {readShippingSnapshot(editing.shippingQuote)?.carrier?<p className="text-sm">{copy.currentCarrier}: {readShippingSnapshot(editing.shippingQuote)?.carrier} · {copy.expires}: {readShippingSnapshot(editing.shippingQuote)?.expiresAt?fulfilmentDate(readShippingSnapshot(editing.shippingQuote)!.expiresAt!,locale):copy.na}</p>:null}
    <label className="block text-sm font-bold">{copy.status}
      <select className="mt-2 block w-full rounded-lg border p-3" aria-label={copy.status} value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>
        {(()=>{
          const current=orders.find(row=>row.id===editing.id)?.status??editing.status;
          return [current,...(nextStatuses[current]??[])].map(value=><option key={value} value={value}>{fulfilmentState(value,locale)}</option>);
        })()}
      </select>
    </label>
    {(["shippingPaise","taxPaise"] as const).map(field=><label key={field} className="block text-sm font-bold">{field==="shippingPaise"?copy.shipping:copy.tax}
      <input className="mt-2 block w-full rounded-lg border p-3" aria-label={field==="shippingPaise"?copy.shipping:copy.tax} type="number" min="0" max="100000" step="0.01"
        value={editing[field]===null?"":String(editing[field]!/100)}
        onChange={e=>{const n=Math.round(Number(e.target.value)*100);setEditing({...editing,[field]:e.target.value===""?null:Number.isSafeInteger(n)&&n>=0&&n<=10000000?n:null});setManual({...manual,confirmed:false})}}/>
    </label>)}
    {editing.deliveryCountry!=="IN"&&["UNPAID","FAILED"].includes(editing.paymentStatus)&&["REQUESTED","CONFIRMED"].includes(editing.status)?<fieldset className="space-y-3 rounded-xl border border-[#d4b796] p-4">
      <legend className="px-2 font-bold">{copy.quote}</legend>
      <p className="text-xs leading-5">{copy.quoteHelp}</p>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={manual.confirmed} onChange={e=>setManual({...manual,confirmed:e.target.checked})} className="mt-1"/>{copy.quoteConsent}</label>
      <div className="space-y-3">
        <label className="block text-sm">{copy.carrier}<input required={manual.confirmed} minLength={2} maxLength={120} className="mt-1 block w-full rounded-lg border p-3" aria-label={copy.carrier} value={manual.carrier} onChange={e=>setManual({...manual,carrier:e.target.value,confirmed:false})}/></label>
        <label className="block text-sm">{copy.quoteEvidence}<input required={manual.confirmed} minLength={8} maxLength={500} className="mt-1 block w-full rounded-lg border p-3" aria-label={copy.quoteEvidence} value={manual.evidenceReference} onChange={e=>setManual({...manual,evidenceReference:e.target.value,confirmed:false})}/></label>
        <label className="block text-sm">{copy.quoteExpiry}<input required={manual.confirmed} type="datetime-local" className="mt-1 block w-full rounded-lg border p-3" aria-label={copy.quoteExpiry} value={manual.expiresAt} onChange={e=>setManual({...manual,expiresAt:e.target.value,confirmed:false})}/></label>
        <label className="block text-sm">{copy.duties}<select className="mt-1 block w-full rounded-lg border p-3" aria-label={copy.duties} value={manual.dutiesMode} onChange={e=>setManual({...manual,dutiesMode:e.target.value,confirmed:false})}><option value="RECIPIENT_MAY_PAY">{copy.recipientDuties}</option><option value="INCLUDED">{copy.includedDuties}</option></select></label>
      </div>
    </fieldset>:null}
    <label className="block text-sm font-bold">{copy.tracking}
      <input maxLength={140} className="mt-2 block w-full rounded-lg border p-3" aria-label={copy.tracking} value={editing.trackingReference??""}
        onChange={e=>setEditing({...editing,trackingReference:e.target.value})}/>
    </label>
    <label className="block text-sm font-bold">{copy.supplierEvidence}
      <input type="url" maxLength={500} className="mt-2 block w-full rounded-lg border p-3" aria-label={copy.supplierEvidence} value={editing.fulfillmentEvidenceUrl??""}
        onChange={e=>setEditing({...editing,fulfillmentEvidenceUrl:e.target.value||null})}/>
    </label>
    <p className="text-xs">{copy.shopGuard}</p>
    <label className="block text-sm font-bold">{copy.ownerNotes}
      <textarea aria-label={copy.ownerNotes} maxLength={1500} rows={4} className="mt-2 block w-full rounded-lg border p-3" value={editing.adminNote}
        onChange={e=>setEditing({...editing,adminNote:e.target.value})}/>
    </label>
    <div className="flex gap-3"><button disabled={saving} className="rounded-lg bg-[#822c40] px-5 py-3 font-bold text-white">{saving?copy.saving:copy.saveOrder}</button>
      <button type="button" onClick={()=>setEditing(null)} className="rounded-lg border px-5 py-3">{copy.cancel}</button></div>
    </fieldset>
   </form>:null}
  <div className="grid gap-4 md:grid-cols-2">
    {orders.map(order=><article key={order.id} className="rounded-2xl border border-[#e5cfb3] bg-white p-5">
      <p className="text-sm font-bold text-[#7e2940]">#{order.id}</p>
      <p className="mt-2 font-bold">{order.customerName} · {order.deliveryCity}, {order.deliveryState}, {new Intl.DisplayNames([locale==="hi"?"hi":"en"],{type:"region"}).of(order.deliveryCountry)||countryName(order.deliveryCountry)}</p>
      <p className="mt-2 text-sm">{order.deliveryAddress}, {order.postalCode} · {order.customerPhone}</p>
      <p className="mt-2 text-sm">{copy.status}: <strong>{fulfilmentState(order.status,locale)}</strong> · {copy.payment}: <strong>{fulfilmentState(order.paymentStatus,locale)}</strong></p>
      <p className="mt-2 text-sm">{copy.subtotal} {money(order.subtotalPaise)} · {copy.total} {order.totalPaise!==null?money(order.totalPaise):copy.pendingCharges}</p>
      <details className="mt-3 text-sm"><summary className="cursor-pointer font-bold">{copy.items}</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{JSON.stringify(order.items,null,2)}</pre></details>
      <div className="mt-4 flex flex-wrap gap-2">
       <button type="button" disabled={saving||retrying!==null||uncertain||!known} onClick={()=>{setManual({...blankQuote});setEditing({...order})}} className="rounded-lg border border-[#c89c8a] px-5 py-2 text-sm font-bold text-[#742838]">{copy.manageOrder}</button>
       {["CONFIRMED","PACKING","DISPATCHED","DELIVERED","CANCELED"].includes(order.status)?
        <button type="button" disabled={saving||retrying!==null||uncertain||!known} onClick={()=>retryEmail(order)}
         className="rounded-lg border border-[#c89c8a] px-4 py-2 text-sm font-semibold text-[#742838] disabled:opacity-60">
          {retrying===order.id?copy.retrying:copy.retry}
        </button>:null}
      </div>
    </article>)}
  </div>
  {known&&!loading&&!orders.length?<p className="rounded-xl border p-6">{copy.noOrders}</p>:null}
 </div>;
}

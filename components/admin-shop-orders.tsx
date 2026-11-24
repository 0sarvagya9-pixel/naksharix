"use client";
import { useEffect,useState,type FormEvent } from "react";
import { secureFetch } from "@/lib/security/csrf";
import { countryName,readShippingSnapshot } from "@/lib/shop/shipping-rules";
import Link from "next/link";
type Order={id:string;userId:string;items:unknown;customerName:string;customerPhone:string;
 deliveryCity:string;deliveryState:string;deliveryAddress:string;deliveryCountry:string;postalCode:string;shippingQuote:unknown;
 subtotalPaise:number;shippingPaise:number|null;taxPaise:number|null;totalPaise:number|null;
 status:string;paymentStatus:string;trackingReference:string|null;fulfillmentEvidenceUrl:string|null;adminNote:string;version:number;createdAt:string};
const money=(p:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(p/100);
const nextStatuses:Record<string,string[]>={REQUESTED:["CONFIRMED","CANCELED"],CONFIRMED:["PACKING","CANCELED"],
 PACKING:["DISPATCHED","CANCELED"],DISPATCHED:["DELIVERED"],DELIVERED:[],CANCELED:[]};
const noticeForEmail=(outcome:string|undefined)=>outcome==="provider_accepted"
 ? " Email accepted by provider (inbox delivery not yet verified)."
 : outcome==="not_needed" ? " No status notification was needed."
 : " Customer email was not confirmed; status is saved and visible in their account.";
const blankQuote={carrier:"",evidenceReference:"",expiresAt:"",dutiesMode:"RECIPIENT_MAY_PAY",confirmed:false};
export function AdminShopOrders(){
 const [orders,setOrders]=useState<Order[]>([]),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [manual,setManual]=useState(blankQuote);
 const [editing,setEditing]=useState<Order|null>(null),[saving,setSaving]=useState(false),[retrying,setRetrying]=useState<string|null>(null);
 useEffect(()=>{let active=true;fetch("/api/admin/shop-orders",{cache:"no-store"}).then(async response=>{
  const body=await response.json();if(!response.ok)throw Error(body.error||"Unable to read orders");return body.data.orders as Order[];
 }).then(items=>{if(active)setOrders(items)}).catch(e=>{if(active)setError(e instanceof Error?e.message:"Order system not available.")});
 return()=>{active=false}},[]);
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!editing)return;setSaving(true);setError("");setNotice("");
  try{
   const response=await secureFetch("/api/admin/shop-orders",{method:"PATCH",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id:editing.id,expectedVersion:editing.version,status:editing.status,
      shippingPaise:editing.shippingPaise,taxPaise:editing.taxPaise,
      trackingReference:editing.trackingReference,fulfillmentEvidenceUrl:editing.fulfillmentEvidenceUrl,adminNote:editing.adminNote,
      ...(manual.confirmed?{manualQuote:{...manual,expiresAt:new Date(manual.expiresAt).toISOString()}}:{})})});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||"Could not update order.");
   setOrders(old=>old.map(row=>row.id===editing.id?result.data.order:row));
   setEditing(null);setNotice("Order status saved and available in My Orders."+noticeForEmail(result.data.notification?.outcome));
  }catch(e){setError(e instanceof Error?e.message:"Failed to update.")}finally{setSaving(false)}
 }
 async function retryEmail(order:Order){
  if(retrying)return;
  setRetrying(order.id);setError("");setNotice("");
  try{
   const response=await secureFetch("/api/admin/fulfilment-notification",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({kind:"shop",id:order.id,expectedVersion:order.version})
   });
   const data=await response.json();
   if(!response.ok)throw Error(data.error||"Could not retry notification.");
   setNotice("Order status notification retry recorded."+noticeForEmail(data.data?.notification?.outcome));
  }catch(e){setError(e instanceof Error?e.message:"Email retry failed.");}
  finally{setRetrying(null);}
 }
 return <div className="mx-auto max-w-7xl space-y-5 py-12 text-[#3c2730] px-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-cinzel text-3xl font-bold">Customer Shop Orders</h1><Link href="/admin/shop-shipping" className="rounded-xl bg-[#822c40] px-4 py-3 text-sm font-bold text-white">Manage international shipping rates</Link></div>
  <p className="max-w-3xl text-sm leading-6">Manage customer orders, exact SKU sourcing, packing, dispatch tracking and delivery. Only genuine fulfilment status changes are communicated to customers; recording a status is not independent evidence of delivery.</p>
  {error?<p role="alert" className="rounded-lg bg-[#fff0f0] p-4 text-[#8d2d45]">{error}</p>:null}
  {notice?<p role="status" className="rounded-lg bg-[#edf9ed] p-4 text-[#365d36]">{notice}</p>:null}
  {editing?<form onSubmit={save} className="max-w-2xl space-y-3 rounded-2xl border border-[#d4b796] bg-white p-6">
    <h2 className="text-xl font-bold">Manage #{editing.id.slice(0,12)}</h2>
    <p className="text-sm">Items subtotal: {money(editing.subtotalPaise)} · Destination: {countryName(editing.deliveryCountry)}, {editing.postalCode}</p>
    {readShippingSnapshot(editing.shippingQuote)?.carrier?<p className="text-sm">Current carrier: {readShippingSnapshot(editing.shippingQuote)?.carrier} · Expires: {readShippingSnapshot(editing.shippingQuote)?.expiresAt??"Not applicable"}</p>:null}
    <label className="block text-sm font-bold">Status
      <select className="mt-2 block w-full rounded-lg border p-3" value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>
        {(()=>{
          const current=orders.find(row=>row.id===editing.id)?.status??editing.status;
          return [current,...(nextStatuses[current]??[])].map(value=><option key={value} value={value}>{value}</option>);
        })()}
      </select>
    </label>
    {(["shippingPaise","taxPaise"] as const).map(field=><label key={field} className="block text-sm font-bold">{field==="shippingPaise"?"Shipping INR":"Tax INR"}
      <input className="mt-2 block w-full rounded-lg border p-3" type="number" min="0" max="100000" step="0.01"
        value={editing[field]===null?"":String(editing[field]!/100)}
        onChange={e=>{const n=Math.round(Number(e.target.value)*100);setEditing({...editing,[field]:e.target.value===""?null:Number.isSafeInteger(n)&&n>=0&&n<=10000000?n:null})}}/>
    </label>)}
    {editing.deliveryCountry!=="IN"&&["UNPAID","FAILED"].includes(editing.paymentStatus)&&["REQUESTED","CONFIRMED"].includes(editing.status)?<fieldset className="space-y-3 rounded-xl border border-[#d4b796] p-4">
      <legend className="px-2 font-bold">Verified international quote / renewal</legend>
      <p className="text-xs leading-5">Use this when no published rate exists, a rate expired, or charges changed. Verify the exact products, packaging, serviceability, carrier tariff, taxes and customs arrangements before confirmation.</p>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={manual.confirmed} onChange={e=>setManual({...manual,confirmed:e.target.checked})} className="mt-1"/>I verified the actual shipment and approve these shipping and tax amounts.</label>
      {manual.confirmed?<div className="space-y-3">
        <label className="block text-sm">Carrier / service<input required minLength={2} maxLength={120} className="mt-1 block w-full rounded-lg border p-3" value={manual.carrier} onChange={e=>setManual({...manual,carrier:e.target.value})}/></label>
        <label className="block text-sm">Carrier quote or evidence reference (private)<input required minLength={8} maxLength={500} className="mt-1 block w-full rounded-lg border p-3" value={manual.evidenceReference} onChange={e=>setManual({...manual,evidenceReference:e.target.value})}/></label>
        <label className="block text-sm">Quote valid until<input required type="datetime-local" className="mt-1 block w-full rounded-lg border p-3" value={manual.expiresAt} onChange={e=>setManual({...manual,expiresAt:e.target.value})}/></label>
        <label className="block text-sm">Destination import charges<select className="mt-1 block w-full rounded-lg border p-3" value={manual.dutiesMode} onChange={e=>setManual({...manual,dutiesMode:e.target.value})}><option value="RECIPIENT_MAY_PAY">Recipient may pay duties / import tax</option><option value="INCLUDED">Confirmed included in quote</option></select></label>
      </div>:null}
    </fieldset>:null}
    <label className="block text-sm font-bold">Tracking reference
      <input maxLength={140} className="mt-2 block w-full rounded-lg border p-3" value={editing.trackingReference??""}
        onChange={e=>setEditing({...editing,trackingReference:e.target.value})}/>
    </label>
    <label className="block text-sm font-bold">Supplier / dispatch evidence (optional HTTPS URL)
      <input type="url" maxLength={500} className="mt-2 block w-full rounded-lg border p-3" value={editing.fulfillmentEvidenceUrl??""}
        onChange={e=>setEditing({...editing,fulfillmentEvidenceUrl:e.target.value||null})}/>
    </label>
    <p className="text-xs">Confirm the actual SKU and dispatch capability. Add supporting evidence when available. Shipping and tax must be recorded before acceptance. Status changes are limited to valid next steps.</p>
    <label className="block text-sm font-bold">Owner fulfilment notes
      <textarea maxLength={1500} rows={4} className="mt-2 block w-full rounded-lg border p-3" value={editing.adminNote}
        onChange={e=>setEditing({...editing,adminNote:e.target.value})}/>
    </label>
    <div className="flex gap-3"><button disabled={saving} className="rounded-lg bg-[#822c40] px-5 py-3 font-bold text-white">{saving?"Saving…":"Update order"}</button>
      <button type="button" onClick={()=>setEditing(null)} className="rounded-lg border px-5 py-3">Cancel</button></div>
   </form>:null}
  <div className="grid gap-4 md:grid-cols-2">
    {orders.map(order=><article key={order.id} className="rounded-2xl border border-[#e5cfb3] bg-white p-5">
      <p className="text-sm font-bold text-[#7e2940]">#{order.id}</p>
      <p className="mt-2 font-bold">{order.customerName} · {order.deliveryCity}, {order.deliveryState}, {countryName(order.deliveryCountry)}</p>
      <p className="mt-2 text-sm">{order.deliveryAddress}, {order.postalCode} · {order.customerPhone}</p>
      <p className="mt-2 text-sm">Status: <strong>{order.status}</strong> · Payment: <strong>{order.paymentStatus}</strong></p>
      <p className="mt-2 text-sm">Subtotal {money(order.subtotalPaise)} · Total {order.totalPaise!==null?money(order.totalPaise):"Pending shipping and tax"}</p>
      <details className="mt-3 text-sm"><summary className="cursor-pointer font-bold">View line items</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{JSON.stringify(order.items,null,2)}</pre></details>
      <div className="mt-4 flex flex-wrap gap-2">
       <button type="button" onClick={()=>{setManual({...blankQuote});setEditing({...order})}} className="rounded-lg border border-[#c89c8a] px-5 py-2 text-sm font-bold text-[#742838]">Manage order</button>
       {["CONFIRMED","PACKING","DISPATCHED","DELIVERED","CANCELED"].includes(order.status)?
        <button type="button" disabled={retrying!==null} onClick={()=>retryEmail(order)}
         className="rounded-lg border border-[#c89c8a] px-4 py-2 text-sm font-semibold text-[#742838] disabled:opacity-60">
          {retrying===order.id?"Retrying email…":"Retry status email"}
        </button>:null}
      </div>
    </article>)}
  </div>
  {!orders.length?<p className="rounded-xl border p-6">No customer order requests yet.</p>:null}
 </div>;
}

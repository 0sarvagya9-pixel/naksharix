"use client";
import { useEffect,useState,type FormEvent } from "react";
import { secureFetch } from "@/lib/security/csrf";
type Order={id:string;userId:string;items:unknown;customerName:string;customerPhone:string;
 deliveryCity:string;deliveryState:string;deliveryAddress:string;postalCode:string;
 subtotalPaise:number;shippingPaise:number|null;taxPaise:number|null;totalPaise:number|null;
 status:string;paymentStatus:string;trackingReference:string|null;adminNote:string;version:number;createdAt:string};
const money=(p:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(p/100);
export function AdminShopOrders(){
 const [orders,setOrders]=useState<Order[]>([]),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [editing,setEditing]=useState<Order|null>(null),[saving,setSaving]=useState(false);
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
      trackingReference:editing.trackingReference,adminNote:editing.adminNote})});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||"Could not update order.");
   setOrders(old=>old.map(row=>row.id===editing.id?result.data.order:row));
   setEditing(null);setNotice("Order updated. Payment has not been automatically verified.");
  }catch(e){setError(e instanceof Error?e.message:"Failed to update.")}finally{setSaving(false)}
 }
 return <div className="mx-auto max-w-7xl space-y-5 px-5 py-12 text-[#3c2730]">
  <h1 className="font-cinzel text-3xl font-bold">Customer Shop Orders</h1>
  <p className="max-w-3xl text-sm leading-6">Owner dispatch workflow. Confirm delivery costs, applicable taxes, and payment method manually. Admin status changes never fabricate a Razorpay transaction.</p>
  {error?<p role="alert" className="rounded-lg bg-[#fff0f0] p-4 text-[#8d2d45]">{error}</p>:null}
  {notice?<p role="status" className="rounded-lg bg-[#edf9ed] p-4 text-[#365d36]">{notice}</p>:null}
  {editing?<form onSubmit={save} className="max-w-2xl space-y-3 rounded-2xl border border-[#d4b796] bg-white p-6">
    <h2 className="text-xl font-bold">Manage #{editing.id.slice(0,12)}</h2>
    <p className="text-sm">Items subtotal: {money(editing.subtotalPaise)}</p>
    <label className="block text-sm font-bold">Status
      <select className="mt-2 block w-full rounded-lg border p-3" value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>
        {["REQUESTED","CONFIRMED","PACKING","DISPATCHED","DELIVERED","CANCELED"].map(value=><option key={value} value={value}>{value}</option>)}
      </select>
    </label>
    {(["shippingPaise","taxPaise"] as const).map(field=><label key={field} className="block text-sm font-bold">{field==="shippingPaise"?"Shipping INR":"Tax INR"}
      <input className="mt-2 block w-full rounded-lg border p-3" type="number" min="0" max="100000" step="0.01"
        value={editing[field]===null?"":String(editing[field]!/100)}
        onChange={e=>{const n=Math.round(Number(e.target.value)*100);setEditing({...editing,[field]:e.target.value===""?null:Number.isSafeInteger(n)&&n>=0&&n<=10000000?n:null})}}/>
    </label>)}
    <label className="block text-sm font-bold">Tracking reference
      <input maxLength={140} className="mt-2 block w-full rounded-lg border p-3" value={editing.trackingReference??""}
        onChange={e=>setEditing({...editing,trackingReference:e.target.value})}/>
    </label>
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
      <p className="mt-2 font-bold">{order.customerName} · {order.deliveryCity}, {order.deliveryState}</p>
      <p className="mt-2 text-sm">{order.deliveryAddress}, {order.postalCode} · {order.customerPhone}</p>
      <p className="mt-2 text-sm">Status: <strong>{order.status}</strong> · Payment: <strong>{order.paymentStatus}</strong></p>
      <p className="mt-2 text-sm">Subtotal {money(order.subtotalPaise)} · Total {order.totalPaise!==null?money(order.totalPaise):"Pending shipping and tax"}</p>
      <details className="mt-3 text-sm"><summary className="cursor-pointer font-bold">View line items</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{JSON.stringify(order.items,null,2)}</pre></details>
      <button type="button" onClick={()=>setEditing({...order})} className="mt-4 rounded-lg border border-[#c89c8a] px-5 py-2 text-sm font-bold text-[#742838]">Manage order</button>
    </article>)}
  </div>
  {!orders.length?<p className="rounded-xl border p-6">No customer order requests yet.</p>:null}
 </div>;
}

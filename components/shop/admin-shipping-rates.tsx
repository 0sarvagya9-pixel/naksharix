"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {secureFetch} from "@/lib/security/csrf";
import {SHIPPING_COUNTRIES,countryName} from "@/lib/shop/shipping-rules";
type Product={id:string;name:string;status:string};
type Rate={id:string;country:string;productId:string;postalPrefix:string;shippingPaisePerUnit:number;taxPaisePerUnit:number;maxQuantity:number;carrier:string;evidenceReference:string;dutiesMode:"INCLUDED"|"RECIPIENT_MAY_PAY";expiresAt:string;active:boolean;version:number};
type Draft={id?:string;expectedVersion:number;country:string;productId:string;postalPrefix:string;shipping:string;tax:string;maxQuantity:string;carrier:string;evidenceReference:string;dutiesMode:"INCLUDED"|"RECIPIENT_MAY_PAY";expiresAt:string;active:boolean;confirmed:boolean};
const empty:Draft={expectedVersion:0,country:"US",productId:"",postalPrefix:"",shipping:"",tax:"",maxQuantity:"1",carrier:"",evidenceReference:"",dutiesMode:"RECIPIENT_MAY_PAY",expiresAt:"",active:false,confirmed:false};
const money=(p:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(p/100);
const field="mt-1 block w-full rounded-xl border border-[#d4b796] bg-white p-3 text-[#3c2730]";
function localDate(s:string){const d=new Date(s);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
export function AdminShippingRates(){
 const [rates,setRates]=useState<Rate[]>([]),[products,setProducts]=useState<Product[]>([]);
 const [draft,setDraft]=useState<Draft>({...empty}),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 useEffect(()=>{let active=true;fetch("/api/admin/shop-shipping",{cache:"no-store"}).then(async res=>{const j=await res.json();if(!res.ok)throw Error(j.error||"Unable to load rates.");return j.data}).then(d=>{if(active){setRates(d.rates);setProducts(d.products);setLoaded(true)}}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[]);
 function edit(r:Rate){setDraft({id:r.id,expectedVersion:r.version,country:r.country,productId:r.productId,postalPrefix:r.postalPrefix,shipping:String(r.shippingPaisePerUnit/100),tax:String(r.taxPaisePerUnit/100),maxQuantity:String(r.maxQuantity),carrier:r.carrier,evidenceReference:r.evidenceReference,dutiesMode:r.dutiesMode,expiresAt:localDate(r.expiresAt),active:r.active,confirmed:false});setNotice("");setError("")}
 function change<K extends keyof Draft>(key:K,value:Draft[K]){setDraft(d=>({...d,[key]:value,...(key!=="confirmed"?{confirmed:false}:{})}))}
 async function save(e:FormEvent){
  e.preventDefault();if(busy||!loaded)return;setBusy(true);setError("");setNotice("");
  try{
   const {shipping,tax,maxQuantity,expiresAt,...rest}=draft;
   const shippingPaisePerUnit=Math.round(Number(shipping)*100),taxPaisePerUnit=Math.round(Number(tax)*100);
   if(shipping.trim()===""||tax.trim()===""||!Number.isSafeInteger(shippingPaisePerUnit)||!Number.isSafeInteger(taxPaisePerUnit))throw Error("Enter actual verified charges. Do not leave them blank.");
   const response=await secureFetch("/api/admin/shop-shipping",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...rest,shippingPaisePerUnit,taxPaisePerUnit,maxQuantity:Number(maxQuantity),expiresAt:new Date(expiresAt).toISOString()})});
   const j=await response.json();if(!response.ok)throw Error(j.error||"Unable to save.");
   const saved=j.data.rate as Rate;setRates(rows=>[...rows.filter(r=>r.id!==saved.id),saved]);setDraft({...empty});setNotice("Rate saved. Automatic quotes use active, unexpired, verified entries only.");
  }catch(e){setError(e instanceof Error?e.message:"Unable to save rate.")}
  finally{setBusy(false)}
 }
 return <main className="mx-auto max-w-7xl space-y-6 px-5 py-10 text-[#3c2730]">
  <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-cinzel text-3xl font-bold">International shipping rates</h1><Link href="/admin/shop-orders" className="rounded-xl border px-4 py-3 text-sm font-bold">Back to Shop Orders</Link></div>
  <p className="max-w-4xl text-sm leading-6">India standard delivery remains included. Overseas rates are approved by country, exact product, and postal region. A missing, expired or ineligible rate creates a quote request with no payment. These are merchant-confirmed rates, not live courier API estimates.</p>
  {error?<p role="alert" className="rounded-xl bg-[#fff0f0] p-4 text-sm">{error}</p>:null}{notice?<p role="status" className="rounded-xl bg-[#edf9ed] p-4 text-sm">{notice}</p>:null}
  {loaded?<form onSubmit={save} className="space-y-4 rounded-2xl border border-[#d4b796] bg-white p-5 md:p-7">
   <h2 className="font-cinzel text-xl font-bold">{draft.id?"Edit verified rate":"Add verified carrier rate"}</h2>
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <label className="text-sm font-bold">Country<select required value={draft.country} onChange={e=>change("country",e.target.value)} className={field}>{SHIPPING_COUNTRIES.filter(c=>c.code!=="IN").map(c=><option value={c.code} key={c.code}>{c.name}</option>)}</select></label>
    <label className="text-sm font-bold">Exact product<select required value={draft.productId} onChange={e=>change("productId",e.target.value)} className={field}><option value="">Select product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}{p.status!=="active"?" (inactive)":""}</option>)}</select></label>
    <label className="text-sm font-bold">Postal prefix (optional)<input value={draft.postalPrefix} onChange={e=>change("postalPrefix",e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))} maxLength={12} className={field} placeholder="Blank only if entire country verified"/></label>
    <label className="text-sm font-bold">Shipping per separately packed unit (INR)<input required type="number" min="0" max="100000" step="0.01" value={draft.shipping} onChange={e=>change("shipping",e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">Additional tax per unit (INR)<input required type="number" min="0" max="100000" step="0.01" value={draft.tax} onChange={e=>change("tax",e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">Max quantity covered<input required type="number" min="1" max="10" value={draft.maxQuantity} onChange={e=>change("maxQuantity",e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">Carrier / service<input required minLength={2} maxLength={120} value={draft.carrier} onChange={e=>change("carrier",e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">Actual carrier quote reference (private)<input required minLength={8} maxLength={500} value={draft.evidenceReference} onChange={e=>change("evidenceReference",e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">Valid until<input required type="datetime-local" value={draft.expiresAt} onChange={e=>change("expiresAt",e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">Destination duties<select value={draft.dutiesMode} onChange={e=>change("dutiesMode",e.target.value as Draft["dutiesMode"])} className={field}><option value="RECIPIENT_MAY_PAY">Recipient may pay duties / import charges</option><option value="INCLUDED">Verified included in rate</option></select></label>
   </div>
   <p className="text-xs leading-5">Each unit is priced as a separately packed shipment. Verify the entire selected destination region, SKU packaging, maximum units, restricted-goods rules, carrier capability, currency and tax. Do not publish estimated or fabricated carrier rates. Previously accepted orders keep their quoted amount.</p>
   <label className="flex gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={e=>change("active",e.target.checked)}/>Publish for automatic checkout</label>
   {draft.active?<label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={draft.confirmed} required onChange={e=>change("confirmed",e.target.checked)} className="mt-1"/>I have verified the actual carrier quote, product eligibility, rates and customs terms and can fulfil orders on this basis.</label>:null}
   <div className="flex gap-3"><button type="submit" disabled={busy||draft.active&&!draft.confirmed} className="rounded-xl bg-[#822c40] px-5 py-3 font-bold text-white disabled:opacity-50">{busy?"Saving…":"Save shipping rate"}</button>{draft.id?<button type="button" onClick={()=>setDraft({...empty})} className="rounded-xl border px-5 py-3">Cancel edit</button>:null}</div>
  </form>:null}
  <h2 className="font-cinzel text-xl font-bold">Saved rates ({rates.length})</h2>
  {!rates.length?<p className="rounded-xl border bg-white p-5 text-sm">No verified overseas rates configured. International customers can request a shipping quote without paying.</p>:null}
  <div className="grid gap-4 md:grid-cols-2">{rates.map(r=><article key={r.id} className="rounded-xl border border-[#e5cfb3] bg-white p-5"><p className="font-bold">{countryName(r.country)} · {products.find(p=>p.id===r.productId)?.name??r.productId}</p><p className="mt-2 text-sm">Postal region: {r.postalPrefix||"Whole country"} · max {r.maxQuantity} units</p><p className="mt-2 text-sm">Shipping {money(r.shippingPaisePerUnit)} / unit · tax {money(r.taxPaisePerUnit)} / unit</p><p className="mt-2 text-sm">{r.carrier} · {r.active&&Date.parse(r.expiresAt)>Date.now()?"Published":"Inactive / expired"} · valid until {new Date(r.expiresAt).toLocaleString("en-IN")}</p><button type="button" onClick={()=>edit(r)} className="mt-3 rounded-lg border px-4 py-2 text-sm font-bold">Edit / deactivate</button></article>)}</div>
 </main>
}

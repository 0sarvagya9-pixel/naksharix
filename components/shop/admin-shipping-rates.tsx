"use client";
import {useCallback,useEffect,useRef,useState,type FormEvent} from "react";
import Link from "next/link";
import {secureFetch} from "@/lib/security/csrf";
import {SHIPPING_COUNTRIES} from "@/lib/shop/shipping-rules";
import {useLanguage} from "@/components/language-provider";
import {shopAdminCopy,shopAdminFailure,shippingDateInput,shippingExpiry,type ShopAdminCopyKey} from "@/lib/shop/admin-copy";
import {readShippingAdmin,savedShippingRate,shippingPaise,type ShippingAdminProduct as Product,type ShippingAdminRate as Rate,type ShippingRateInput} from "@/lib/shop/admin-contract";
import {fulfilmentDate} from "@/lib/admin/fulfilment-copy";
type Draft={id?:string;expectedVersion:number;country:string;productId:string;postalPrefix:string;shipping:string;tax:string;maxQuantity:string;carrier:string;evidenceReference:string;dutiesMode:"INCLUDED"|"RECIPIENT_MAY_PAY";expiresAt:string;active:boolean;confirmed:boolean};
const empty:Draft={expectedVersion:0,country:"US",productId:"",postalPrefix:"",shipping:"",tax:"",maxQuantity:"1",carrier:"",evidenceReference:"",dutiesMode:"RECIPIENT_MAY_PAY",expiresAt:"",active:false,confirmed:false};
const field="mt-1 block w-full rounded-xl border border-[#d4b796] bg-white p-3 text-[#3c2730]";
export function AdminShippingRates(){
 const {locale}=useLanguage(),copy=shopAdminCopy(locale);
 const money=(value:number)=>new Intl.NumberFormat(locale==='hi'?'hi-IN':'en-IN',{style:'currency',currency:'INR'}).format(value/100);
 const countryName=(value:string)=>new Intl.DisplayNames([locale==='hi'?'hi':'en'],{type:'region'}).of(value)||value;
 const [rates,setRates]=useState<Rate[]>([]),[products,setProducts]=useState<Product[]>([]);
 const [draft,setDraft]=useState<Draft>({...empty}),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false),[loading,setLoading]=useState(true),[uncertain,setUncertain]=useState(false);
 const [error,setError]=useState<ShopAdminCopyKey|"">(""),[notice,setNotice]=useState<ShopAdminCopyKey|"">("");
 const inFlight=useRef(false),active=useRef(true),loadSequence=useRef(0);
 const refresh=useCallback(async()=>{
  if(inFlight.current)return;
  const sequence=++loadSequence.current;setLoading(true);
  try{const response=await fetch('/api/admin/shop-shipping',{cache:'no-store'}),state=readShippingAdmin(await response.json());if(!response.ok||!state)throw Error('Unverified rates');
   if(active.current&&sequence===loadSequence.current){setRates(state.rates);setProducts(state.products);setLoaded(true);setUncertain(false);setDraft({...empty});setError('');setNotice('');}
  }catch{if(active.current&&sequence===loadSequence.current){setLoaded(false);setError('unavailable');}}
  finally{if(active.current&&sequence===loadSequence.current)setLoading(false);}
 },[]);
 useEffect(()=>{active.current=true;void refresh();return()=>{active.current=false;};},[refresh]);
 function edit(rate:Rate){if(inFlight.current||uncertain||!loaded)return;setDraft({id:rate.id,expectedVersion:rate.version,country:rate.country,productId:rate.productId,postalPrefix:rate.postalPrefix,shipping:String(rate.shippingPaisePerUnit/100),tax:String(rate.taxPaisePerUnit/100),maxQuantity:String(rate.maxQuantity),carrier:rate.carrier,evidenceReference:rate.evidenceReference,dutiesMode:rate.dutiesMode,expiresAt:shippingDateInput(rate.expiresAt),active:rate.active,confirmed:false});setNotice('');setError('');}
 function change<K extends keyof Draft>(key:K,value:Draft[K]){setDraft(valueBefore=>({...valueBefore,[key]:value,...(key!=='confirmed'?{confirmed:false}:{})}));}
 async function save(event:FormEvent){
  event.preventDefault();if(inFlight.current||uncertain||!loaded)return;
  inFlight.current=true;loadSequence.current++;setLoading(false);setBusy(true);setError('');setNotice('');
  let sent=false,refreshRequired=true,failure:ShopAdminCopyKey='unconfirmed';
  try{
   const {shipping,tax,maxQuantity,expiresAt,...rest}=draft;
   const shippingPaisePerUnit=shippingPaise(shipping),taxPaisePerUnit=shippingPaise(tax);
   if(shippingPaisePerUnit===null||taxPaisePerUnit===null||!rest.productId||!Number.isInteger(Number(maxQuantity))||Number(maxQuantity)<1||Number(maxQuantity)>10||rest.active&&!rest.confirmed)throw Error('Unverified rate input');
   const input:ShippingRateInput={...rest,shippingPaisePerUnit,taxPaisePerUnit,maxQuantity:Number(maxQuantity),expiresAt:shippingExpiry(expiresAt)};
   sent=true;const response=await secureFetch('/api/admin/shop-shipping',{method:'PUT',silent:true,headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}),result:unknown=await response.json();
   if(!response.ok){failure=shopAdminFailure(response.status);refreshRequired=![400,413,422].includes(response.status);throw Error('Rate rejected');}
   const saved=savedShippingRate(result,input,rates.map(rate=>rate.id));if(!saved)throw Error('Unmatched rate acknowledgement');
   setRates(rows=>[...rows.filter(rate=>rate.id!==saved.id),saved]);setDraft({...empty});setNotice('rateSaved');
  }catch{setError(sent?failure:'invalid');if(sent)setUncertain(refreshRequired);}
  finally{inFlight.current=false;setBusy(false);}
 }
 const disabled=busy||uncertain||!loaded;
 return <main className="mx-auto max-w-7xl space-y-6 px-5 py-10 text-[#3c2730]">
  <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-cinzel text-3xl font-bold">{copy.shippingTitle}</h1><Link href="/admin/shop-orders" className="rounded-xl border px-4 py-3 text-sm font-bold">{copy.backOrders}</Link></div>
  <p className="max-w-4xl text-sm leading-6">{copy.shippingIntro}</p>
  <button type="button" disabled={busy||loading} onClick={()=>void refresh()} className="rounded-xl border px-4 py-3 text-sm font-bold">{loading?copy.refreshing:copy.refresh}</button>
  {loading?<p>{copy.loading}</p>:null}{error?<p role="alert" className="rounded-xl bg-[#fff0f0] p-4 text-sm">{copy[error]}</p>:null}{notice?<p role="status" className="rounded-xl bg-[#edf9ed] p-4 text-sm">{copy[notice]}</p>:null}
  {loaded?<form onSubmit={save} className="space-y-4 rounded-2xl border border-[#d4b796] bg-white p-5 md:p-7"><fieldset disabled={disabled} className="space-y-4">
   <h2 className="font-cinzel text-xl font-bold">{draft.id?copy.editRate:copy.addRate}</h2>
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <label className="text-sm font-bold">{copy.country}<select aria-label={copy.country} required value={draft.country} onChange={e=>change('country',e.target.value)} className={field}>{SHIPPING_COUNTRIES.filter(country=>country.code!=='IN').map(country=><option value={country.code} key={country.code}>{countryName(country.code)}</option>)}</select></label>
    <label className="text-sm font-bold">{copy.exactProduct}<select aria-label={copy.exactProduct} required value={draft.productId} onChange={e=>change('productId',e.target.value)} className={field}><option value="">{copy.chooseProduct}</option>{products.map(product=><option key={product.id} value={product.id}>{product.names?.[locale]||product.name}{product.status!=='active'?' ('+copy.inactive+')':''}</option>)}</select></label>
    <label className="text-sm font-bold">{copy.postal}<input aria-label={copy.postal} value={draft.postalPrefix} onChange={e=>change('postalPrefix',e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''))} maxLength={12} className={field} placeholder={copy.postalHint}/></label>
    <label className="text-sm font-bold">{copy.shipping}<input aria-label={copy.shipping} required type="number" min="0" max="100000" step="0.01" value={draft.shipping} onChange={e=>change('shipping',e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">{copy.tax}<input aria-label={copy.tax} required type="number" min="0" max="100000" step="0.01" value={draft.tax} onChange={e=>change('tax',e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">{copy.quantity}<input aria-label={copy.quantity} required type="number" min="1" max="10" value={draft.maxQuantity} onChange={e=>change('maxQuantity',e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">{copy.carrier}<input aria-label={copy.carrier} required minLength={2} maxLength={120} value={draft.carrier} onChange={e=>change('carrier',e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">{copy.evidence}<input aria-label={copy.evidence} required minLength={8} maxLength={500} value={draft.evidenceReference} onChange={e=>change('evidenceReference',e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">{copy.expiry}<input aria-label={copy.expiry} required type="datetime-local" step="0.001" value={draft.expiresAt} onChange={e=>change('expiresAt',e.target.value)} className={field}/></label>
    <label className="text-sm font-bold">{copy.duties}<select aria-label={copy.duties} value={draft.dutiesMode} onChange={e=>change('dutiesMode',e.target.value as Draft['dutiesMode'])} className={field}><option value="RECIPIENT_MAY_PAY">{copy.recipientDuties}</option><option value="INCLUDED">{copy.includedDuties}</option></select></label>
   </div>
   <p className="text-xs leading-5">{copy.shippingGuard}</p>
   <label className="flex gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={e=>change('active',e.target.checked)}/>{copy.publishRate}</label>
   {draft.active?<label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={draft.confirmed} required onChange={e=>change('confirmed',e.target.checked)} className="mt-1"/>{copy.rateConsent}</label>:null}
   <div className="flex gap-3"><button type="submit" disabled={busy||draft.active&&!draft.confirmed} className="rounded-xl bg-[#822c40] px-5 py-3 font-bold text-white disabled:opacity-50">{busy?copy.saving:copy.saveRate}</button>{draft.id?<button type="button" onClick={()=>setDraft({...empty})} className="rounded-xl border px-5 py-3">{copy.cancel}</button>:null}</div>
  </fieldset></form>:null}
  {loaded?<><h2 className="font-cinzel text-xl font-bold">{copy.savedRates} ({rates.length})</h2>{!rates.length?<p className="rounded-xl border bg-white p-5 text-sm">{copy.noRates}</p>:null}
  <div className="grid gap-4 md:grid-cols-2">{rates.map(rate=><article key={rate.id} className="rounded-xl border border-[#e5cfb3] bg-white p-5"><p className="font-bold">{countryName(rate.country)} · {products.find(product=>product.id===rate.productId)?.names?.[locale]||products.find(product=>product.id===rate.productId)?.name||rate.productId}</p><p className="mt-2 text-sm">{copy.postalRegion}: {rate.postalPrefix||copy.wholeCountry} · {rate.maxQuantity} {copy.units}</p><p className="mt-2 text-sm">{money(rate.shippingPaisePerUnit)} {copy.perUnit} · {copy.tax}: {money(rate.taxPaisePerUnit)}</p><p className="mt-2 text-sm">{rate.carrier} · {rate.active&&Date.parse(rate.expiresAt)>Date.now()?copy.published:copy.inactiveExpired} · {copy.expiry}: {fulfilmentDate(rate.expiresAt,locale)}</p><button type="button" disabled={disabled} onClick={()=>edit(rate)} className="mt-3 rounded-lg border px-4 py-2 text-sm font-bold">{copy.editRateAction}</button></article>)}</div></>:null}
 </main>;
}

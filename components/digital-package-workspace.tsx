"use client";
import {useEffect,useState,useRef,useCallback} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {LocationAutocomplete,type ResolvedLocation} from "@/components/location-autocomplete";
import {secureFetch} from "@/lib/security/csrf";
import {RazorpayCheckoutButton} from "@/components/razorpay-checkout-button";
import {getPackageDefinition,PACKAGE_TERMS_VERSION,packageStatusLabels,type PackageOffer} from "@/lib/digital-packages/catalogue";
import {packageDraftSchema,preparePackageItems} from "@/lib/digital-packages/input";
type Subject={name:string;dateOfBirth:string;timeOfBirth:string;place:string;location:ResolvedLocation|null;offset:string;permission:boolean;romanName:string};
const blank=():Subject=>({name:"",dateOfBirth:"",timeOfBirth:"",place:"",location:null,offset:"",permission:false,romanName:""});
type PackageOrder={id:string;productKey:string;productVersion:"v1";pricePaise:number;status:string;expiresAt:string;createdAt:string;items:{id:string;kind:string;position:number;status:string;attempts:number;pdfSize:number|null}[]};
const price=(paise:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(paise/100);
const label=(kind:string)=>kind.split("-").map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(" ");
export function DigitalPackageWorkspace(){
 const [offers,setOffers]=useState<PackageOffer[]>([]),[orders,setOrders]=useState<PackageOrder[]>([]);
 const [chosen,setChosen]=useState(""),[subjects,setSubjects]=useState<Subject[]>([]),[names,setNames]=useState(""),[question,setQuestion]=useState(""),[language,setLanguage]=useState<"en"|"hi"|"hinglish">("en"),[accepted,setAccepted]=useState(false),[status,setStatus]=useState(""),[ready,setReady]=useState(false),[busy,setBusy]=useState(""),[signedOut,setSignedOut]=useState(false);
 const intent=useRef<string|null>(null),submitted=useRef<unknown>(null),inflight=useRef(false);
 const offer=offers.find(o=>o.key===chosen);
 const refresh=useCallback(async()=>{
  try{const r=await fetch("/api/digital-packages",{cache:"no-store"});if(r.status===401){setSignedOut(true);return;}const j=await r.json();if(!r.ok||!j.data)throw Error("Package status unavailable");setOffers(j.data.offers);setOrders(j.data.orders);setReady(true);}catch{setReady(false);setOffers([]);setStatus("Package account could not be checked. Do not start another payment.");}
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 function choose(key:string){if(submitted.current)return;const o=offers.find(x=>x.key===key);setChosen(key);setSubjects(Array.from({length:o?.subjects??0},blank));setNames("");setQuestion("");setLanguage("en");setAccepted(false);intent.current=null;setStatus("");}
 function changeSubject(i:number,patch:Partial<Subject>){setSubjects(rows=>rows.map((s,j)=>j===i?{...s,...patch}:s));}
 async function prepare(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(!offer||inflight.current)return;
  setStatus("");inflight.current=true;setBusy("prepare");
  try{
   if(!submitted.current){
    intent.current??=crypto.randomUUID();
    const input=packageDraftSchema.parse({clientIntent:intent.current,productKey:offer.key,version:offer.version,pricePaise:offer.pricePaise,termsVersion:PACKAGE_TERMS_VERSION,accepted,language,
      subjects:subjects.map(s=>({permission:s.permission,birth:{name:s.name,dateOfBirth:s.dateOfBirth,timeOfBirth:s.timeOfBirth,birthPlace:s.location?.displayName??"",latitude:s.location?.latitude,longitude:s.location?.longitude,timezone:s.offset.trim()===""?undefined:Number(s.offset)},...(offer.key==="complete-life"?{romanName:s.romanName}:{})})),
      names:offer.key==="business-name-numerology"?names.split(/\n/).map(s=>s.trim()).filter(Boolean):[],question});
    preparePackageItems(input);submitted.current=input;
   }
   const r=await secureFetch("/api/digital-packages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(submitted.current),silent:true});const j=await r.json().catch(()=>null);
   if(!r.ok||!j?.data?.order){setStatus(j?.error??"Save was not confirmed. Review existing orders or retry the identical draft.");if(r.status===422||r.status===403||r.status===409){submitted.current=null;intent.current=null;}return;}
   submitted.current=null;intent.current=null;setChosen("");setSubjects([]);setNames("");setQuestion("");setAccepted(false);setStatus("Details saved. Review the package order below. No payment was collected.");await refresh();
  }catch(e){setStatus(submitted.current?"Save result is unknown. Retry the same draft or refresh existing orders.":e instanceof Error?e.message.slice(0,350):"Review the required fields.");}
  finally{inflight.current=false;setBusy("");}
 }
 async function mutate(order:PackageOrder,itemId?:string){
  if(inflight.current)return;inflight.current=true;setBusy(itemId??order.id);setStatus("");
  try{const response=await secureFetch(itemId?"/api/digital-packages/"+encodeURIComponent(order.id)+"/items/"+encodeURIComponent(itemId)+"/generate":"/api/digital-packages",{method:itemId?"POST":"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify(itemId?{}:{orderId:order.id}),silent:true});const j=await response.json().catch(()=>null);setStatus(response.ok&&j?.data?(itemId?"Document is ready for secure download.":"Unpaid draft canceled."):j?.error??"Action not confirmed. Review existing orders.");}
  catch{setStatus("Connection interrupted. Refresh existing orders; do not pay again.");}
  finally{await refresh();inflight.current=false;setBusy("");}
 }
 if(signedOut)return <p>Sign in to manage package orders. <Link href="/login?redirectTo=%2Fdigital-packages" className="underline font-semibold">Sign in</Link></p>;
 return <div className="space-y-8">
 <section className="rounded-2xl border border-[#dfc5ac] bg-white p-5"><h2 className="text-xl font-bold text-[#70283d]">Available packages</h2>
 {!ready?<p role="status" className="mt-4">Checking availability…</p>:!offers.length?<p className="mt-3">New package sales are not active. Existing purchases remain in your account.</p>:<div className="mt-4 grid gap-4 sm:grid-cols-2">{offers.map(o=><article key={o.key} className="rounded-xl border border-[#ead8c7] p-4"><h3 className="font-semibold text-[#70283d]">{o.title}</h3><p className="mt-2 text-sm leading-6">{o.description}</p><p className="mt-3 text-lg font-bold">{price(o.pricePaise)}</p><Button type="button" disabled={Boolean(busy)||Boolean(submitted.current)} variant={chosen===o.key?"default":"outline"} className="mt-3" onClick={()=>choose(o.key)}>Prepare package</Button></article>)}</div>}
 {offer?<form className="mt-6 space-y-5" onSubmit={prepare}><h3 className="text-xl font-bold">{offer.title} · {price(offer.pricePaise)}</h3><p className="text-sm">Required details are stored privately before checkout. Each document will be generated separately after verified payment. Birth details and candidate names stay in your private package records; the payment gateway receives the required account/order references, not your report input.</p>
 <fieldset className="space-y-4" disabled={Boolean(busy)||Boolean(submitted.current)}>
 {offer.key==="business-name-numerology"?<label className="block text-sm font-medium">2–10 candidate business names, one per line<textarea required maxLength={710} rows={6} value={names} onChange={e=>setNames(e.target.value)} className="mt-1 block w-full rounded-lg border border-[#bba392] p-3"/></label>:null}
 {subjects.map((s,i)=><fieldset key={i} className="grid gap-4 rounded-xl border border-[#ead8c7] p-4 sm:grid-cols-2"><legend className="px-2 font-semibold">Person {i+1}</legend><label className="block text-sm">Name<Input required maxLength={100} value={s.name} onChange={e=>changeSubject(i,{name:e.target.value})}/></label><label className="block text-sm">Birth date<Input required type="date" value={s.dateOfBirth} onChange={e=>changeSubject(i,{dateOfBirth:e.target.value})}/></label><label className="block text-sm">Birth time<Input required type="time" value={s.timeOfBirth} onChange={e=>changeSubject(i,{timeOfBirth:e.target.value})}/></label><label className="block text-sm">Actual UTC offset at birth (hours)<Input required type="number" min={-12} max={14} step="any" value={s.offset} onChange={e=>changeSubject(i,{offset:e.target.value})}/></label><div className="sm:col-span-2"><LocationAutocomplete label="Birth place" required value={s.place} onChange={value=>changeSubject(i,{place:value,...(value!==s.location?.displayName?{location:null,offset:""}:{})})} onResolvedLocation={next=>changeSubject(i,{location:next,offset:next?.timezoneOffset===undefined?"":String(next.timezoneOffset)})}/><p className="mt-1 text-xs">Confirm the actual offset, including daylight saving where applicable.</p></div>{offer.key==="complete-life"?<label className="block text-sm sm:col-span-2">Full Roman-letter name for numerology<Input required maxLength={100} value={s.romanName} onChange={e=>changeSubject(i,{romanName:e.target.value})}/></label>:null}<label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" required checked={s.permission} onChange={e=>changeSubject(i,{permission:e.target.checked})}/>I am this person or have their informed permission to submit these birth details and receive their private report.</label></fieldset>)}
 {offer.subjects?<><label className="block text-sm">Optional reflection question<textarea maxLength={1000} rows={3} value={question} onChange={e=>setQuestion(e.target.value)} className="mt-1 block w-full rounded-lg border border-[#bba392] p-3"/></label><label className="block text-sm">Report language<select value={language} onChange={e=>setLanguage(e.target.value as typeof language)} className="mt-1 block min-h-11 rounded-lg border border-[#bba392] px-3"><option value="en">English</option><option value="hi">Hindi</option><option value="hinglish">Hinglish</option></select></label>{offer.key==="marriage-planning"?<p className="text-xs">The planning workbook is in English; the personalized report uses the selected language.</p>:null}</>:null}
 <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={accepted} onChange={e=>setAccepted(e.target.checked)}/>I accept the displayed product contents, one-time fee, <Link href="/refund-policy" target="_blank" rel="noopener noreferrer" className="underline">refund policy</Link>, private storage and educational limitations. No guaranteed result, consultation or ceremony is included.</label></fieldset>
 <Button type="submit" disabled={Boolean(busy)||!accepted}>{busy==="prepare"?"Saving…":submitted.current?"Retry identical draft":"Validate and save details — no charge"}</Button>
 {submitted.current&&!busy?<Button type="button" variant="outline" onClick={()=>{submitted.current=null;intent.current=null;setChosen("");setSubjects([]);setNames("");setQuestion("");setAccepted(false);void refresh();}}>Discard local draft and review existing orders</Button>:null}
 </form>:null}</section>
 <section className="rounded-2xl border border-[#dfc5ac] bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-[#70283d]">Your package orders</h2><Button variant="outline" type="button" disabled={Boolean(busy)} onClick={()=>void refresh()}>Refresh status</Button></div>
 {ready&&!orders.length?<p className="mt-4 text-sm">No package orders yet.</p>:null}
 <div className="mt-4 space-y-4">{orders.map(o=>{const def=getPackageDefinition(o.productKey),current=offers.find(x=>x.key===o.productKey&&x.version===o.productVersion&&x.pricePaise===o.pricePaise),canPay=Boolean(current&&(o.status==="PAYMENT_PENDING"||o.status==="DRAFT"&&Date.parse(o.expiresAt)>Date.now()));return <article key={o.id} className="rounded-xl border border-[#ead8c7] p-4"><h3 className="font-semibold text-[#70283d]">{def?.title??label(o.productKey)}</h3><p className="mt-1 text-sm">{price(o.pricePaise)} · {packageStatusLabels[o.status]??"Review required"}</p><p className="text-xs">Reference: {o.id}</p>
 {canPay?<div className="mt-3"><RazorpayCheckoutButton payload={{purpose:"DIGITAL_PACKAGE",packageOrderId:o.id,version:o.productVersion,pricePaise:o.pricePaise,termsVersion:PACKAGE_TERMS_VERSION}} label={o.status==="PAYMENT_PENDING"?"Review / resume existing payment":"Review and pay "+price(o.pricePaise)} onVerified={async()=>{await refresh();}}/></div>:null}
 {o.status==="DRAFT"?<Button className="mt-3" type="button" variant="outline" disabled={Boolean(busy)} onClick={()=>void mutate(o)}>Cancel unpaid draft</Button>:null}
 {o.status==="PAYMENT_PENDING"&&!canPay?<p className="mt-3 text-sm">Earlier payment requires reconciliation. Do not start another payment; check Payment History or support.</p>:null}
 {o.status==="PAID"&&o.productKey==="astrology-course"?<Button asChild className="mt-3"><Link href={"/learn/paid-course?orderId="+encodeURIComponent(o.id)}>Open self-study course</Link></Button>:null}
 {o.status==="PAID"?<ul className="mt-4 space-y-3">{o.items.map(item=><li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#ead8c7] p-3"><div><p className="font-medium">{label(item.kind)}{o.productKey==="family-three"?" · Person "+(item.position+1):""}</p><p className="text-xs">{item.status==="READY"?"Document ready":item.status==="GENERATING"?"Generation recorded; refresh or retry after lease":item.attempts>=5?"Support review needed":"Not yet generated"}</p></div>{item.status==="READY"?<Button asChild variant="outline"><a href={"/api/digital-packages/"+encodeURIComponent(o.id)+"/items/"+encodeURIComponent(item.id)+"/download"}>Download PDF</a></Button>:<Button disabled={Boolean(busy)||item.attempts>=5} onClick={()=>void mutate(o,item.id)}>{busy===item.id?"Generating…":"Generate PDF"}</Button>}</li>)}</ul>:null}</article>;})}</div>
 </section>
 {status?<p role="status" className="rounded-lg border border-[#dfc5ac] bg-white p-4 text-sm">{status}</p>:null}
 <div className="flex flex-wrap gap-4 text-sm font-semibold"><Link href="/dashboard" className="underline">Payment History</Link><Link href="/support" className="underline">Support</Link><Link href="/reports" className="underline">All individual reports</Link></div></div>;
}

"use client";
import {useEffect,useState,useRef,useCallback} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {LocationAutocomplete,type ResolvedLocation} from "@/components/location-autocomplete";
import {secureFetch} from "@/lib/security/csrf";
import {RazorpayCheckoutButton} from "@/components/razorpay-checkout-button";
import {PACKAGE_TERMS_VERSION,type PackageOffer} from "@/lib/digital-packages/catalogue";
import {packageDraftSchema,preparePackageItems,type PackageDraft} from "@/lib/digital-packages/input";
type Subject={name:string;dateOfBirth:string;timeOfBirth:string;place:string;location:ResolvedLocation|null;offset:string;permission:boolean;romanName:string};
const blank=():Subject=>({name:"",dateOfBirth:"",timeOfBirth:"",place:"",location:null,offset:"",permission:false,romanName:""});
import {useLanguage} from "@/components/language-provider";
import {packageCustomerCopy,packageTitle,packageDescription,packageStatus,packageItemTitle,type PackageNotice} from "@/lib/digital-packages/customer-copy";
import {readPackageAccount,readPackageDraftAck,type PackageOrder} from "@/lib/digital-packages/customer-contract";
const price=(paise:number,locale:string)=>new Intl.NumberFormat(locale==="hi"?"hi-IN":"en-IN",{style:"currency",currency:"INR"}).format(paise/100);
export function DigitalPackageWorkspace(){
 const {locale}=useLanguage(),copy=packageCustomerCopy(locale);
 const [offers,setOffers]=useState<PackageOffer[]>([]),[orders,setOrders]=useState<PackageOrder[]>([]);
 const [chosen,setChosen]=useState(""),[subjects,setSubjects]=useState<Subject[]>([]),[names,setNames]=useState(""),[question,setQuestion]=useState(""),[language,setLanguage]=useState<"en"|"hi"|"hinglish">("en"),[accepted,setAccepted]=useState(false),[status,setStatus]=useState<PackageNotice|null>(null),[ready,setReady]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(""),[signedOut,setSignedOut]=useState(false);
 const intent=useRef<string|null>(null),submitted=useRef<PackageDraft|null>(null),inflight=useRef(false),readSequence=useRef(0),uncertainAction=useRef(false);
 const offer=offers.find(o=>o.key===chosen);
 const refresh=useCallback(async()=>{
  const sequence=++readSequence.current;setLoading(true);
  try{
   const r=await fetch("/api/digital-packages",{cache:"no-store"});const j=await r.json().catch(()=>null);
   if(sequence!==readSequence.current)return;
   if(r.status===401){setSignedOut(true);setReady(false);return;}
   const account=readPackageAccount(j?.data);if(!r.ok||!account)throw Error("Unconfirmed account");
   setSignedOut(false);setOffers(account.offers);setOrders(account.orders);setReady(true);uncertainAction.current=false;
  }catch{if(sequence===readSequence.current){setReady(false);setStatus("unavailable");}}
  finally{if(sequence===readSequence.current)setLoading(false);}
 },[]);
 useEffect(()=>{void refresh();return()=>{readSequence.current++;};},[refresh]);
 function choose(key:string){if(submitted.current)return;const o=offers.find(x=>x.key===key);setChosen(key);setSubjects(Array.from({length:o?.subjects??0},blank));setNames("");setQuestion("");setLanguage(o?.language==="multilingual"?locale:"en");setAccepted(false);intent.current=null;setStatus(null);}
 function changeSubject(i:number,patch:Partial<Subject>){setSubjects(rows=>rows.map((s,j)=>j===i?{...s,...patch}:s));}
 async function prepare(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if((!offer&&!submitted.current)||inflight.current||uncertainAction.current)return;
  setStatus(null);inflight.current=true;setBusy("prepare");
  try{
   if(!submitted.current){
    if(!offer||!ready)return;
    intent.current??=crypto.randomUUID();
    const input=packageDraftSchema.parse({clientIntent:intent.current,productKey:offer.key,version:offer.version,pricePaise:offer.pricePaise,termsVersion:PACKAGE_TERMS_VERSION,accepted,language,
      subjects:subjects.map(s=>({permission:s.permission,birth:{name:s.name,dateOfBirth:s.dateOfBirth,timeOfBirth:s.timeOfBirth,birthPlace:s.location?.displayName??"",latitude:s.location?.latitude,longitude:s.location?.longitude,timezone:s.offset.trim()===""?undefined:Number(s.offset)},...(offer.key==="complete-life"?{romanName:s.romanName}:{})})),
      names:offer.key==="business-name-numerology"?names.split(/\n/).map(s=>s.trim()).filter(Boolean):[],question});
    preparePackageItems(input);submitted.current=input;
   }
   const r=await secureFetch("/api/digital-packages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(submitted.current),silent:true});const j=await r.json().catch(()=>null);
   if(!r.ok||!readPackageDraftAck(j?.data,submitted.current)){setStatus(r.ok||r.status>=500?"unknown":"rejected");if(r.status===422||r.status===403||r.status===409){submitted.current=null;intent.current=null;}return;}
   submitted.current=null;intent.current=null;setChosen("");setSubjects([]);setNames("");setQuestion("");setAccepted(false);setStatus("saved");await refresh();
  }catch{setStatus(submitted.current?"unknown":"invalid");}
  finally{inflight.current=false;setBusy("");}
 }
 async function mutate(order:PackageOrder,itemId?:string){
  if(inflight.current||!ready||uncertainAction.current)return;inflight.current=true;setBusy(itemId??order.id);setStatus(null);
  try{const response=await secureFetch(itemId?"/api/digital-packages/"+encodeURIComponent(order.id)+"/items/"+encodeURIComponent(itemId)+"/generate":"/api/digital-packages",{method:itemId?"POST":"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify(itemId?{}:{orderId:order.id}),silent:true});const j=await response.json().catch(()=>null);const confirmed=response.ok&&(itemId?j?.data?.ready===true:j?.data?.canceled===true);uncertainAction.current=!confirmed;setStatus(confirmed?(itemId?"generated":"canceled"):"actionUnknown");}
  catch{uncertainAction.current=true;setStatus("actionUnknown");}
  finally{await refresh();inflight.current=false;setBusy("");}
 }
 if(signedOut)return <p>{copy.signedOut} <Link href="/login?redirectTo=%2Fdigital-packages" className="underline font-semibold">{copy.signIn}</Link></p>;
 return <div className="space-y-8">
 <section className="rounded-2xl border border-[#dfc5ac] bg-white p-5"><h2 className="text-xl font-bold text-[#70283d]">{copy.available}</h2>
 {!ready?<p role="status" className="mt-4">{loading?copy.checking:copy.unavailable}</p>:!offers.length?<p className="mt-3">{copy.noOffers}</p>:<div className="mt-4 grid gap-4 sm:grid-cols-2">{offers.map(o=><article key={o.key} className="rounded-xl border border-[#ead8c7] p-4"><h3 className="font-semibold text-[#70283d]">{packageTitle(o.key,locale)}</h3><p className="mt-2 text-sm leading-6">{packageDescription(o.key,locale)}</p><p className="mt-3 text-lg font-bold">{price(o.pricePaise,locale)}</p><Button type="button" disabled={Boolean(busy)||Boolean(submitted.current)} variant={chosen===o.key?"default":"outline"} className="mt-3" onClick={()=>choose(o.key)}>{copy.prepare}</Button></article>)}</div>}
 {offer?<form className="mt-6 space-y-5" onSubmit={prepare}><h3 className="text-xl font-bold">{packageTitle(offer.key,locale)} · {price(offer.pricePaise,locale)}</h3><p className="text-sm">{copy.privacy}</p>
 <fieldset className="space-y-4" disabled={Boolean(busy)||Boolean(submitted.current)}>
 {offer.key==="business-name-numerology"?<label className="block text-sm font-medium">{copy.names}<textarea required maxLength={710} rows={6} value={names} onChange={e=>setNames(e.target.value)} className="mt-1 block w-full rounded-lg border border-[#bba392] p-3"/></label>:null}
 {subjects.map((s,i)=><fieldset key={i} className="grid gap-4 rounded-xl border border-[#ead8c7] p-4 sm:grid-cols-2"><legend className="px-2 font-semibold">{copy.person} {i+1}</legend><label className="block text-sm">{copy.name}<Input required maxLength={100} value={s.name} onChange={e=>changeSubject(i,{name:e.target.value})}/></label><label className="block text-sm">{copy.birthDate}<Input required type="date" value={s.dateOfBirth} onChange={e=>changeSubject(i,{dateOfBirth:e.target.value})}/></label><label className="block text-sm">{copy.birthTime}<Input required type="time" value={s.timeOfBirth} onChange={e=>changeSubject(i,{timeOfBirth:e.target.value})}/></label><label className="block text-sm">{copy.offset}<Input required type="number" min={-12} max={14} step="any" value={s.offset} onChange={e=>changeSubject(i,{offset:e.target.value})}/></label><div className="sm:col-span-2"><LocationAutocomplete label={copy.place} required value={s.place} onChange={value=>changeSubject(i,{place:value,...(value!==s.location?.displayName?{location:null,offset:""}:{})})} onResolvedLocation={next=>changeSubject(i,{location:next,offset:next?.timezoneOffset===undefined?"":String(next.timezoneOffset)})}/><p className="mt-1 text-xs">{copy.offsetHelp}</p></div>{offer.key==="complete-life"?<label className="block text-sm sm:col-span-2">{copy.romanName}<Input required maxLength={100} value={s.romanName} onChange={e=>changeSubject(i,{romanName:e.target.value})}/></label>:null}<label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" required checked={s.permission} onChange={e=>changeSubject(i,{permission:e.target.checked})}/>{copy.permission}</label></fieldset>)}
 {offer.subjects?<><label className="block text-sm">{copy.question}<textarea maxLength={1000} rows={3} value={question} onChange={e=>setQuestion(e.target.value)} className="mt-1 block w-full rounded-lg border border-[#bba392] p-3"/></label><label className="block text-sm">{copy.language}<select aria-label={copy.language} value={language} onChange={e=>setLanguage(e.target.value as typeof language)} className="mt-1 block min-h-11 rounded-lg border border-[#bba392] px-3"><option value="en">{copy.english}</option><option value="hi">{copy.hindi}</option><option value="hinglish">{copy.hinglish}</option></select></label>{offer.key==="marriage-planning"?<p className="text-xs">{copy.workbookEnglish}</p>:null}</>:null}
 <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={accepted} onChange={e=>setAccepted(e.target.checked)}/>{copy.accept} <Link href="/refund-policy" target="_blank" rel="noopener noreferrer" className="underline">{copy.refund}</Link></label></fieldset>
 <Button type="submit" disabled={Boolean(busy)||!accepted}>{busy==="prepare"?copy.saving:submitted.current?copy.retry:copy.save}</Button>

 </form>:null}
 {offer?.language==="en"?<p className="mt-3 text-sm">{copy.englishOnly}</p>:null}
 {submitted.current&&!busy?<Button type="button" variant="outline" onClick={()=>{submitted.current=null;intent.current=null;setChosen("");setSubjects([]);setNames("");setQuestion("");setAccepted(false);void refresh();}}>{copy.discard}</Button>:null}
 </section>
 <section className="rounded-2xl border border-[#dfc5ac] bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-[#70283d]">{copy.orders}</h2><Button variant="outline" type="button" disabled={Boolean(busy)} onClick={()=>{if(!inflight.current)void refresh();}}>{copy.refresh}</Button></div>
 {ready&&!orders.length?<p className="mt-4 text-sm">{copy.empty}</p>:null}
 <div className="mt-4 space-y-4">{orders.map(o=>{const current=offers.find(x=>x.key===o.productKey&&x.version===o.productVersion&&x.pricePaise===o.pricePaise),canPay=Boolean(ready&&!busy&&!submitted.current&&!uncertainAction.current&&current&&(o.status==="PAYMENT_PENDING"||o.status==="DRAFT"&&Date.parse(o.expiresAt)>Date.now()));return <article key={o.id} className="rounded-xl border border-[#ead8c7] p-4"><h3 className="font-semibold text-[#70283d]">{packageTitle(o.productKey,locale)}</h3><p className="mt-1 text-sm">{price(o.pricePaise,locale)} · {packageStatus(o.status,locale)}</p><p className="text-xs">{copy.reference}: {o.id}</p>
 {canPay?<div className="mt-3"><RazorpayCheckoutButton payload={{purpose:"DIGITAL_PACKAGE",packageOrderId:o.id,version:o.productVersion,pricePaise:o.pricePaise,termsVersion:PACKAGE_TERMS_VERSION}} label={o.status==="PAYMENT_PENDING"?copy.reviewPay:copy.pay+" "+price(o.pricePaise,locale)} onVerified={async()=>{await refresh();}}/></div>:null}
 {o.status==="DRAFT"?<Button className="mt-3" type="button" variant="outline" disabled={Boolean(busy)||!ready} onClick={()=>void mutate(o)}>{copy.cancel}</Button>:null}
 {o.status==="PAYMENT_PENDING"&&!canPay?<p className="mt-3 text-sm">{copy.reconcile}</p>:null}
 {o.status==="PAID"&&o.productKey==="reference-reminders-2027"?<Button asChild className="mt-3"><Link href="/reference-reminders">{copy.reminders}</Link></Button>:null}
 {o.status==="PAID"&&o.productKey==="astrology-course"?<Button asChild className="mt-3"><Link href={"/learn/paid-course?orderId="+encodeURIComponent(o.id)}>{copy.course}</Link></Button>:null}
 {o.status==="PAID"?<ul className="mt-4 space-y-3">{o.items.map(item=><li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#ead8c7] p-3"><div><p className="font-medium">{packageItemTitle(item.kind,locale)}{o.productKey==="family-three"?" · "+copy.person+" "+(item.position+1):""}</p><p className="text-xs">{item.status==="READY"?copy.documentReady:item.status==="GENERATING"?copy.generatingRecorded:item.attempts>=5?copy.needsSupport:copy.notGenerated}</p></div>{item.status==="READY"?<Button asChild variant="outline"><a href={"/api/digital-packages/"+encodeURIComponent(o.id)+"/items/"+encodeURIComponent(item.id)+"/download"}>{copy.download}</a></Button>:<Button disabled={Boolean(busy)||!ready||item.attempts>=5} onClick={()=>void mutate(o,item.id)}>{busy===item.id?copy.generating:copy.generate}</Button>}</li>)}</ul>:null}</article>;})}</div>
 </section>
 {status?<p role="status" className="rounded-lg border border-[#dfc5ac] bg-white p-4 text-sm">{copy[status]}</p>:null}
 <div className="flex flex-wrap gap-4 text-sm font-semibold"><Link href="/dashboard" className="underline">{copy.history}</Link><Link href="/support" className="underline">{copy.support}</Link><Link href="/reports" className="underline">{copy.allReports}</Link></div></div>;
}

"use client";
import {useRef,useState,type FormEvent} from "react";
import Link from "next/link";
import {SERVICES,REQUEST_TERMS} from "@/lib/deferred-services/contract";
import {SHIPPING_COUNTRIES} from "@/lib/shop/shipping-rules";
import {secureFetch} from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {deferredCopy,serviceCopy} from "@/lib/deferred-services/copy";
import {requestRecorded} from "@/lib/deferred-services/client";
export function DeferredServiceRequestForm(){
 const {apiLocale}=useLanguage(),c=deferredCopy(apiLocale);
 const [kind,setKind]=useState<string>(SERVICES[0].kind),[units,setUnits]=useState<number>(SERVICES[0].min),[target,setTarget]=useState(""),[preferredDate,setDate]=useState(""),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState<"requestSaved"|"requestUnknown"|"rejected"|null>(null),[saved,setSaved]=useState(false);
 const pending=useRef<Record<string,unknown>|null>(null),locked=useRef(false),item=SERVICES.find(s=>s.kind===kind)!,labels=serviceCopy(kind,apiLocale);
 function edit(change:()=>void){change();setConsent(false);setNotice(null);}
 async function submit(event:FormEvent){event.preventDefault();if(locked.current||!consent||saved)return;locked.current=true;setBusy(true);setNotice(null);
  try{pending.current??={kind,units,target:target.trim(),preferredDate,consent:REQUEST_TERMS,requestId:crypto.randomUUID()};const input=pending.current;
   const r=await secureFetch("/api/deferred-services/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input),silent:true}),j=await r.json().catch(()=>null);
   if(!r.ok||!requestRecorded(j?.data,input)){if([400,401,403,404,422,429].includes(r.status)){pending.current=null;setConsent(false);setNotice("rejected");}else setNotice("requestUnknown");return;}
   setNotice("requestSaved");setSaved(true);
  }catch{setNotice("requestUnknown");}finally{setBusy(false);locked.current=false;}
 }
 const countryNames=new Intl.DisplayNames([apiLocale==="hi"?"hi-IN":"en-IN"],{type:"region"});
 return <form onSubmit={submit} className="space-y-4"><fieldset disabled={busy||saved||Boolean(pending.current)} className="space-y-4">
  <label className="block">{c.service}<select aria-label={c.service} className="block w-full rounded border bg-transparent p-3" value={kind} onChange={e=>edit(()=>{const s=SERVICES.find(s=>s.kind===e.target.value)!;setKind(s.kind);setUnits(s.min);setTarget("");})}>{SERVICES.map(s=><option key={s.id} value={s.kind}>{serviceCopy(s.kind,apiLocale).title}</option>)}</select></label>
  <label className="block">{labels.unit}<input aria-label={labels.unit} className="block w-full rounded border bg-transparent p-3" type="number" min={item.min} max={item.max} value={units} required onChange={e=>edit(()=>setUnits(Number(e.target.value)))}/></label>
  {item.target==="country"?<label className="block">{c.country}<select aria-label={c.country} required className="block w-full rounded border bg-transparent p-3" value={target} onChange={e=>edit(()=>setTarget(e.target.value))}><option value="">{c.chooseCountry}</option>{SHIPPING_COUNTRIES.map(country=><option key={country.code} value={country.code}>{countryNames.of(country.code)??country.name}</option>)}</select></label>:item.target!=="none"?<label className="block">{item.target==="temple"?c.temple:c.city}<input aria-label={item.target==="temple"?c.temple:c.city} className="block w-full rounded border bg-transparent p-3" value={target} maxLength={100} required onChange={e=>edit(()=>setTarget(e.target.value))}/></label>:null}
  <label className="block">{c.date}<input aria-label={c.date} className="block w-full rounded border bg-transparent p-3" type="date" value={preferredDate} onChange={e=>edit(()=>setDate(e.target.value))}/></label><p>{c.before}: {labels.review}.</p>
  <label className="flex gap-2"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/>{c.consent}</label>
 </fieldset><button type="submit" disabled={busy||!consent||saved} className="rounded border px-5 py-3 font-semibold disabled:opacity-50">{busy?c.sending:pending.current?c.retry:c.send}</button><p role="status" aria-live="polite">{notice?c[notice]:""}</p>{saved||notice==="requestUnknown"?<Link href="/support" className="underline">{c.track}</Link>:null}</form>;
}

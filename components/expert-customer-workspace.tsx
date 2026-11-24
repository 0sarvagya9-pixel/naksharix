"use client";
import {useState,useEffect,useCallback,useRef} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {secureFetch} from "@/lib/security/csrf";
import {RazorpayCheckoutButton} from "@/components/razorpay-checkout-button";
import {useLanguage} from "@/components/language-provider";
import {expertCustomerCopy} from "@/lib/expert-services/customer-copy";
import {EXPERT_TERMS_VERSION,type ExpertKind} from "@/lib/expert-services/contract";
type Row={id:string;kind:ExpertKind;question:string;language:string;status:string;quoteVersion:number;pricePaise:number|null;dueAt:string|null;astrologerProfile:{id:string;displayName:string}|null;response:string|null};
type Report={id:string;reportSlug:string;createdAt:string};
type Data={intake:boolean;sales:boolean;requests:Row[];reports:Report[]};
export function ExpertCustomerWorkspace(){
 const {apiLocale}=useLanguage(),c=expertCustomerCopy[apiLocale];
 const [data,setData]=useState<Data|null>(null),[kind,setKind]=useState<ExpertKind>("WRITTEN"),[question,setQuestion]=useState(""),[source,setSource]=useState(""),[language,setLanguage]=useState<"en"|"hi"|"hinglish">(apiLocale),[consent,setConsent]=useState(false),[quote,setQuote]=useState(""),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[loaded,setLoaded]=useState(false);
 const pending=useRef<Record<string,unknown>|null>(null),lock=useRef(false);
 const refresh=useCallback(async()=>{try{const r=await fetch("/api/expert-services",{cache:"no-store"}),j=await r.json();if(!r.ok||!j.data)throw Error("unavailable");setData(j.data);setLoaded(true);}catch{setData(null);setLoaded(true);}},[]);
 useEffect(()=>{void refresh();},[refresh]);
 async function send(e:React.FormEvent<HTMLFormElement>){
 e.preventDefault();if(lock.current||!consent||!data?.intake)return;lock.current=true;setBusy(true);setNotice("");
 try{
  pending.current??={clientIntent:crypto.randomUUID(),kind,question,language,...(kind==="REPORT_REVIEW"?{sourceReportId:source}:{}),consent:true,consentVersion:EXPERT_TERMS_VERSION};
  const r=await secureFetch("/api/expert-services",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pending.current),silent:true}),j=await r.json().catch(()=>null);
  if(!r.ok||!j?.data?.request?.id){setNotice(c.failed);if([403,409,422].includes(r.status))pending.current=null;return;}
  pending.current=null;setQuestion("");setSource("");setConsent(false);setNotice(c.saved);await refresh();
 }catch{setNotice(c.failed);}finally{lock.current=false;setBusy(false);}
 }
 async function cancel(id:string){if(lock.current||!window.confirm(c.cancelConfirm))return;lock.current=true;setBusy(true);try{const r=await secureFetch("/api/expert-services",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id}),silent:true}),j=await r.json().catch(()=>null);setNotice(r.ok&&j?.data?.canceled===true?c.canceled:c.failed);await refresh();}catch{setNotice(c.failed);}finally{lock.current=false;setBusy(false);}}
 const label=(k:ExpertKind)=>k==="WRITTEN"?c.written:c.review;
 const money=(n:number)=>new Intl.NumberFormat(apiLocale==="hi"?"hi-IN":"en-IN",{style:"currency",currency:"INR"}).format(n/100);
 return <div lang={apiLocale==="hi"?"hi":apiLocale==="hinglish"?"hi-Latn":"en"} className="space-y-6"><h1 className="font-cinzel text-3xl font-black text-[#70283d]">{c.title}</h1><p className="leading-7">{c.intro}</p>
 <section className="rounded-2xl bg-white border border-[#e4cbaa] p-5"><h2 className="text-xl font-bold">{c.request}</h2>{!loaded?<p role="status" className="mt-3">{c.loading}</p>:!data?.intake?<p className="mt-3">{c.unavailable}</p>:<form onSubmit={send} className="mt-4 space-y-4"><fieldset disabled={busy||Boolean(pending.current)} className="space-y-4"><label className="block font-medium">{c.kind}<select className="mt-1 block min-h-11 w-full rounded-lg border px-3" value={kind} onChange={e=>{setKind(e.target.value as ExpertKind);setSource("");}}><option value="WRITTEN">{c.written}</option><option value="REPORT_REVIEW">{c.review}</option></select></label>
 {kind==="REPORT_REVIEW"?<label className="block font-medium">{c.report}<select required className="mt-1 block min-h-11 w-full rounded-lg border px-3" value={source} onChange={e=>setSource(e.target.value)}><option value="">{c.select}</option>{data.reports.map(r=><option key={r.id} value={r.id}>{r.reportSlug} · {new Date(r.createdAt).toLocaleDateString("en-IN")}</option>)}</select></label>:null}
 <label className="block font-medium">{c.question}<textarea required minLength={20} maxLength={1600} rows={5} className="mt-1 block w-full rounded-lg border p-3" value={question} onChange={e=>setQuestion(e.target.value)}/></label><label className="block font-medium">{c.language}<select className="mt-1 block min-h-11 rounded-lg border px-3" value={language} onChange={e=>setLanguage(e.target.value as typeof language)}><option value="en">English</option><option value="hi">हिंदी</option><option value="hinglish">Hinglish</option></select></label><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={consent} required onChange={e=>setConsent(e.target.checked)}/>{c.consent}</label></fieldset><Button disabled={busy||!consent}>{pending.current?c.retry:c.send}</Button>{pending.current&&!busy?<Button type="button" variant="outline" className="ml-2" onClick={()=>{pending.current=null;setConsent(false);void refresh();}}>{c.refresh}</Button>:null}</form>}</section>
 <section className="rounded-2xl bg-white border border-[#e4cbaa] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{c.orders}</h2><Button variant="outline" disabled={busy} onClick={()=>void refresh()}>{c.refresh}</Button></div>{data&&!data.requests.length?<p className="mt-4">{c.none}</p>:null}<div className="mt-4 space-y-4">{data?.requests.map(r=>{
 const key=r.id+":"+r.quoteVersion+":"+r.pricePaise;
 const canPay=data.sales&&r.pricePaise!==null&&r.astrologerProfile&&r.dueAt&&Date.parse(r.dueAt)>Date.now()+15*60000&&["QUOTED","PAYMENT_PENDING"].includes(r.status);
 return <article key={r.id} className="rounded-xl border border-[#ead8c7] p-4"><h3 className="font-bold">{label(r.kind)}</h3><p className="text-sm mt-2">{c.status[r.status as keyof typeof c.status]??r.status} · {r.id}</p><p className="mt-3 whitespace-pre-wrap break-words text-sm">{r.question}</p>{r.astrologerProfile?<p className="text-sm mt-2">{c.provider}: {r.astrologerProfile.displayName}</p>:null}{r.dueAt?<p className="text-sm">{c.due}: {new Date(r.dueAt).toLocaleString(apiLocale==="hi"?"hi-IN":"en-IN",{timeZoneName:"short"})}</p>:null}
 {canPay&&r.pricePaise!==null?<div className="mt-4 border-t pt-4 space-y-3"><h4 className="font-semibold">{c.reviewQuote} — {money(r.pricePaise)}</h4><label className="flex gap-2 items-start text-sm"><input type="checkbox" checked={quote===key} onChange={e=>setQuote(e.target.checked?key:"")}/>{c.terms}</label><Link href="/refund-policy" className="underline text-sm">Refund policy / धनवापसी नीति</Link>{quote===key?<RazorpayCheckoutButton payload={{purpose:"EXPERT_SERVICE",expertServiceId:r.id,quoteVersion:r.quoteVersion,pricePaise:r.pricePaise,termsVersion:EXPERT_TERMS_VERSION}} label={r.status==="PAYMENT_PENDING"?c.resume:c.pay+" "+money(r.pricePaise)} onVerified={async()=>{setQuote("");await refresh();}}/>:null}</div>:r.status==="PAYMENT_PENDING"||r.status==="REVIEW"||r.status==="QUOTED"?<p className="mt-3 text-sm">{c.reviewNeeded}</p>:null}
 {["REQUESTED","ASSIGNED","QUOTED"].includes(r.status)?<Button variant="outline" className="mt-3" disabled={busy} onClick={()=>void cancel(r.id)}>{c.cancel}</Button>:null}
 {r.status==="PAID"?<p className="mt-3">{c.paid}</p>:null}
 {r.status==="DELIVERED"?r.response?<section className="mt-4 rounded-xl bg-[#fff8ee] p-4"><h4 className="font-bold">{c.delivered}</h4><p className="whitespace-pre-wrap break-words leading-7 mt-3">{r.response}</p></section>:<p className="mt-3">{c.reviewNeeded}</p>:null}</article>;
 })}</div></section>{notice?<p role="status" className="rounded-lg border bg-white p-4">{notice}</p>:null}<div className="flex flex-wrap gap-4 text-sm"><Link href="/support" className="underline">{c.support}</Link><Link href="/dashboard" className="underline">{c.history}</Link></div></div>;
}

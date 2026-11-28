"use client";
import {useState,useEffect,useCallback,useRef} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useLanguage} from "@/components/language-provider";
import {secureFetch} from "@/lib/security/csrf";
import {readReminderAccount,scheduledReminderMatches,type ReminderAccount} from "@/lib/calendar/reminder-client-contract";
import {reminderCopy,reminderEventName} from "@/lib/calendar/reminder-copy";
type Notice="scheduled"|"canceled"|"uncertain"|"signedOut"|"declined"|"limited"|null;
export function ReferenceReminderWorkspace(){
 const {locale}=useLanguage(),copy=reminderCopy(locale);
 const [account,setAccount]=useState<ReminderAccount|null>(null),[order,setOrder]=useState(""),[eventId,setEvent]=useState(""),[lead,setLead]=useState<1|7>(1),[consent,setConsent]=useState(false),[notice,setNotice]=useState<Notice>(null),[busy,setBusy]=useState(false),[status,setStatus]=useState<"loading"|"ready"|"unknown">("loading");const inflight=useRef(false),sequence=useRef(0);
 const refresh=useCallback(async()=>{const request=++sequence.current;setStatus("loading");setConsent(false);try{const response=await fetch("/api/reference-reminders",{cache:"no-store"}),json=await response.json();if(request!==sequence.current)return;const next=readReminderAccount(json?.data);if(!response.ok||!next)throw Error("Unconfirmed");setAccount(next);setOrder(value=>next.orders.some(row=>row.id===value)?value:next.orders[0]?.id??"");setEvent(value=>next.events.some(row=>row.id===value)?value:"");setStatus("ready");}catch{if(request===sequence.current)setStatus("unknown");}},[]);
 useEffect(()=>{const requests=sequence;void refresh();return()=>{requests.current++;};},[refresh]);
 async function mutate(id?:string){
  if(inflight.current||status!=="ready"||!account)return;
  const selected=account.events.find(event=>event.id===eventId);
  if(id?!account.reminders.some(row=>row.id===id&&row.status==="SCHEDULED"):!account.available||!selected||!consent||!account.orders.some(row=>row.id===order)||Date.parse(selected.date+"T02:00:00Z")-lead*86400000<=Date.now())return;
  inflight.current=true;setBusy(true);setNotice(null);sequence.current++;
  try{const response=await secureFetch("/api/reference-reminders",{method:id?"DELETE":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(id?{id}:{orderId:order,eventId,leadDays:lead,consent:true,consentVersion:account.consentVersion}),silent:true}),json=await response.json();
   if(!response.ok){setNotice(response.status===401?"signedOut":response.status===429?"limited":response.status===409||response.status===422?"declined":"uncertain");setStatus("unknown");return;}
   if(id?json?.data?.canceled!==true:!selected||!scheduledReminderMatches(json?.data?.reminder,order,selected,lead))throw Error("Unconfirmed");
   setNotice(id?"canceled":"scheduled");await refresh();
  }catch{setNotice("uncertain");setStatus("unknown");}finally{setConsent(false);inflight.current=false;setBusy(false);}
 }
 const events=account?.events??[],future=events.filter(event=>Date.parse(event.date+"T02:00:00Z")-lead*86400000>Date.now());
 return <div className="mt-6 space-y-6"><div className="flex flex-wrap items-center gap-4 text-sm"><Link href="/digital-packages" className="font-semibold underline">{copy.packages}</Link><Link href="/festival-calendar" className="font-semibold underline">{copy.calendar}</Link><Button type="button" variant="outline" disabled={busy} onClick={()=>void refresh()}>{copy.refresh}</Button></div>
  {status==="loading"?<p role="status">{copy.checking}</p>:status==="unknown"?<p role="alert">{copy.unavailable}</p>:null}
  {status==="ready"&&account&&!account.available?<p role="status">{copy.inactive}</p>:null}
  {status==="ready"&&account?.available&&!account.orders.length?<p>{copy.purchase}</p>:null}
  {account?.available&&account.orders.length>0?<form onSubmit={event=>{event.preventDefault();void mutate();}} className="space-y-4 rounded-2xl border border-[#e7cda3] bg-white p-5"><fieldset disabled={busy||status!=="ready"} className="space-y-4"><label className="block text-sm font-semibold">{copy.order}<select aria-label={copy.order} value={order} onChange={event=>{setOrder(event.target.value);setConsent(false);}} required className="mt-1 block w-full rounded border p-3">{account.orders.map(row=><option key={row.id} value={row.id}>{row.id}</option>)}</select></label><label className="block text-sm font-semibold">{copy.lead}<select aria-label={copy.lead} value={lead} onChange={event=>{setLead(event.target.value==="7"?7:1);setEvent("");setConsent(false);}} className="mt-1 block w-full rounded border p-3"><option value="1">{copy.one}</option><option value="7">{copy.seven}</option></select></label><label className="block text-sm font-semibold">{copy.event}<select aria-label={copy.event} required value={eventId} onChange={event=>{setEvent(event.target.value);setConsent(false);}} className="mt-1 block w-full rounded border p-3"><option value="">{copy.select}</option>{future.map(event=><option key={event.id} value={event.id}>{event.date} · {reminderEventName(event,locale)}</option>)}</select></label><label className="flex gap-3 text-sm"><input type="checkbox" required checked={consent} onChange={event=>setConsent(event.target.checked)}/>{copy.consent}</label></fieldset><Button type="submit" disabled={busy||status!=="ready"||!consent||!eventId||!order}>{copy.schedule}</Button></form>:null}
  {account?<section><h2 className="text-xl font-bold">{copy.your}</h2>{status==="ready"&&!account.reminders.length?<p className="mt-3">{copy.empty}</p>:<div className="mt-3 space-y-3">{account.reminders.map(row=><article key={row.id} className="flex flex-wrap justify-between items-center gap-3 rounded-xl border border-[#e7cda3] bg-white p-4"><div><p className="font-semibold break-words">{events.find(event=>event.id===row.eventId)?reminderEventName(events.find(event=>event.id===row.eventId)!,locale):row.eventId}</p><p className="text-sm">{row.eventDate} · {row.leadDays===1?copy.one:copy.seven}</p><p className="text-sm">{copy[row.status]}</p></div>{row.status==="SCHEDULED"?<Button variant="outline" type="button" disabled={busy||status!=="ready"} onClick={()=>void mutate(row.id)}>{copy.cancel}</Button>:null}</article>)}</div>}</section>:null}
  {notice?<p role="status" data-reminder-notice className="text-sm font-semibold">{copy[notice]}</p>:null}
 </div>;
}

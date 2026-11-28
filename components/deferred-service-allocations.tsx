"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {secureFetch} from "@/lib/security/csrf";
import {PLAN_TERMS} from "@/lib/deferred-services/planning-contract";
import {useLanguage} from "@/components/language-provider";
import {deferredCopy,deferredDate,deferredState} from "@/lib/deferred-services/copy";
import {readCustomerAllocations,planningRecorded,type CustomerAllocation} from "@/lib/deferred-services/client";
export function DeferredServiceAllocations(){
 const {apiLocale}=useLanguage(),c=deferredCopy(apiLocale);
 const [rows,setRows]=useState<CustomerAllocation[]|null>(null),[notice,setNotice]=useState<"recorded"|"unknown"|"unavailable"|null>(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[uncertain,setUncertain]=useState(false);
 const locked=useRef(false),sequence=useRef(0);
 const refresh=useCallback(async(clearNotice=false)=>{if(clearNotice&&locked.current)return;const n=++sequence.current;setLoading(true);try{const r=await secureFetch("/api/deferred-services/allocations",{silent:true,cache:"no-store"}),j=await r.json().catch(()=>null);if(n!==sequence.current)return;const next=r.ok?readCustomerAllocations(j?.data):null;if(!next)throw Error("unavailable");setRows(next);setUncertain(false);if(clearNotice)setNotice(null);}catch{if(n===sequence.current){setRows(null);setNotice("unavailable");}}finally{if(n===sequence.current)setLoading(false);}},[]);
 useEffect(()=>{const currentSequence=sequence;void refresh();return()=>{currentSequence.current++;};},[refresh]);
 async function change(a:CustomerAllocation,action:"ACCEPT"|"CANCEL"){
  if(locked.current||loading||uncertain)return;if(action==="ACCEPT"&&!window.confirm(c.acceptConfirm))return;locked.current=true;setBusy(true);setNotice(null);sequence.current++;
  const input={action,allocationId:a.id,version:a.version,...(action==="ACCEPT"?{consent:PLAN_TERMS}:{})};
  try{const r=await secureFetch("/api/deferred-services/allocations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input),silent:true}),j=await r.json().catch(()=>null);if(!r.ok||!planningRecorded(j?.data,input)){setUncertain(true);setNotice("unknown");return;}setNotice("recorded");await refresh();}
  catch{setUncertain(true);setNotice("unknown");}finally{setBusy(false);locked.current=false;}
 }
 return <section className="mt-8 space-y-4"><h2 className="text-xl font-semibold">{c.proposals}</h2><p className="text-sm">{c.proposalIntro}</p><button type="button" disabled={busy} onClick={()=>void refresh(true)} className="rounded border px-3 py-2">{c.refresh}</button><p aria-live="polite" role="status">{notice?c[notice]:""}</p>{loading?<p>{c.loading}</p>:rows===null?null:rows.length===0?<p>{c.none}</p>:rows.map(a=><article key={a.id} className="rounded-lg border p-4"><h3 className="font-semibold">{a.plan.label}</h3><p>{deferredState(a.state,apiLocale)} · {a.completedUnits}/{a.units} {c.unitsRecorded}</p><p className="text-sm">{a.plan.target||c.emptyTarget} · {deferredDate(a.plan.startsAt,apiLocale)} – {deferredDate(a.plan.endsAt,apiLocale)}</p>{a.state==="EXPIRED"?<p className="mt-2 text-sm">{c.expired}</p>:null}{a.state==="HELD"?<div><p className="text-sm">{c.hold} {deferredDate(a.holdUntil,apiLocale)}</p><button type="button" disabled={busy||uncertain||loading} className="rounded border px-3 py-2" onClick={()=>void change(a,"ACCEPT")}>{c.accept}</button></div>:null}{!["COMPLETED","CANCELED","EXPIRED"].includes(a.state)?<button type="button" disabled={busy||uncertain||loading} className="ml-2 rounded border px-3 py-2" onClick={()=>void change(a,"CANCEL")}>{c.cancel}</button>:null}{a.progress.length>0?<ul className="mt-3 space-y-1 text-sm">{a.progress.map((p,i)=><li key={i}>{p.units} {c.unitsRecorded} — {deferredDate(p.occurredAt,apiLocale)}</li>)}</ul>:null}</article>)}</section>;
}

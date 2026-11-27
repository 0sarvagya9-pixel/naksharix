"use client";
import {useEffect,useRef,useState} from "react";
import {secureFetch} from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {operationsControlCopy} from "@/lib/admin/operations-control-copy";
import {freshRestoreTimestamp,recoveryReceipt,explicitlyUnverified} from "@/lib/admin/operations-control-client";
type Props={configured:boolean;verified:boolean;lastSuccessfulAt?:string};
export function ManualEncryptedRecoveryControl({configured,verified,lastSuccessfulAt}:Props){
 const {apiLocale}=useLanguage(),c=operationsControlCopy(apiLocale),initial=verified&&freshRestoreTimestamp(lastSuccessfulAt);
 const [confirmed,setConfirmed]=useState(false),[pending,setPending]=useState(false),[uncertain,setUncertain]=useState(false),[passed,setPassed]=useState(initial),[lastSuccess,setLastSuccess]=useState(initial?lastSuccessfulAt!:""),[notice,setNotice]=useState<"verified"|"unverified"|"runningDetail"|"unknown"|"unavailable">(initial?"verified":"unverified");
 const lock=useRef(false),sequence=useRef(0);
 useEffect(()=>()=>{sequence.current++;},[]);
 async function checkReceipt(){
  if(lock.current)return;lock.current=true;const n=++sequence.current;setPending(true);setConfirmed(false);
  try{const response=await fetch("/api/ops/backup-status",{cache:"no-store"}),json=await response.json().catch(()=>null);if(n!==sequence.current)return;const receipt=response.ok?recoveryReceipt(json?.data,"status"):null;
   if(receipt){setPassed(true);setLastSuccess(receipt);setUncertain(false);setNotice("verified");}else{setPassed(false);setNotice(explicitlyUnverified(json?.data)?"unverified":"unavailable");}
  }catch{if(n===sequence.current){setPassed(false);setNotice("unavailable");}}finally{lock.current=false;if(n===sequence.current)setPending(false);}
 }
 async function run(){
  if(!configured||lock.current||!confirmed||passed||uncertain)return;lock.current=true;const n=++sequence.current;setPending(true);setConfirmed(false);setNotice("runningDetail");
  try{const response=await secureFetch("/api/admin/ops/run-recovery",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({confirmation:"RUN_VERIFIED_RECOVERY"}),silent:true}),json=await response.json().catch(()=>null);if(n!==sequence.current)return;const receipt=response.ok?recoveryReceipt(json?.data,"run"):null;
   if(receipt){setPassed(true);setLastSuccess(receipt);setNotice("verified");}else{setPassed(false);setUncertain(true);setNotice("unknown");}
  }catch{if(n===sequence.current){setPassed(false);setUncertain(true);setNotice("unknown");}}finally{lock.current=false;if(n===sequence.current)setPending(false);}
 }
 return <section className="mt-6 rounded-2xl border border-[#dec6a4] bg-white p-6 text-[#402a2d]" aria-labelledby="encrypted-recovery-owner-action" aria-busy={pending}><h2 id="encrypted-recovery-owner-action" className="text-xl font-bold">{c.recoveryTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-7">{c.recoveryIntro}</p><p className="mt-3 text-sm font-semibold">{passed?c.current:c.required}</p>{lastSuccess?<p className="text-sm">{c.last}: {new Date(lastSuccess).toLocaleString(apiLocale==="hi"?"hi-IN":"en-IN",{timeZone:"UTC",timeZoneName:"short"})}</p>:null}
 <label className="mt-4 flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1 h-4 w-4" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} disabled={pending||passed||!configured||uncertain}/>{c.consent}</label><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={()=>void run()} disabled={!configured||!confirmed||pending||passed||uncertain} className="min-h-11 rounded-lg bg-[#76263b] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{pending?c.running:passed?c.already:c.run}</button><button type="button" onClick={()=>void checkReceipt()} disabled={pending} className="min-h-11 rounded-lg border border-[#87525c] px-5 py-3 font-semibold disabled:opacity-50">{c.recheck}</button></div>{!configured&&!passed?<p className="mt-3 text-sm text-[#932c40]">{c.disabled}</p>:null}<p role="status" aria-live="polite" className="mt-4 text-sm leading-7">{c[notice]}</p>{uncertain?<a href="/admin/operations" className="text-sm underline">{c.reloadRecovery}</a>:null}<p className="mt-3 text-xs leading-6">{c.boundary}</p></section>;
}

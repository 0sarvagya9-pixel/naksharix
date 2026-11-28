"use client";
import {useEffect,useRef,useState} from "react";
import {secureFetch} from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {operationsControlCopy,emailCategory} from "@/lib/admin/operations-control-copy";
import {emailTestResult,type EmailTestResult} from "@/lib/admin/operations-control-client";
/** Only explicitly invoked by an authenticated administrator. */
export function AdminEmailAcceptanceTest({enabled}:{enabled:boolean}){
 const {apiLocale}=useLanguage(),c=operationsControlCopy(apiLocale);
 const [pending,setPending]=useState(false),[uncertain,setUncertain]=useState(false),[result,setResult]=useState<EmailTestResult|null>(null);
 const lock=useRef(false),sequence=useRef(0);
 useEffect(()=>()=>{sequence.current++;},[]);
 async function submit(mode:"single"|"suite"){
  if(lock.current||!enabled||uncertain)return;lock.current=true;const n=++sequence.current;setPending(true);setResult(null);
  try{const response=await secureFetch("/api/admin/email-test", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode}),silent:true}),payload=await response.json().catch(()=>null);if(n!==sequence.current)return;const receipt=response.ok?emailTestResult(payload?.data,mode):null;if(!receipt){setUncertain(true);return;}setResult(receipt);if(receipt.outcomes.some(item=>item.acceptanceUncertain===true))setUncertain(true);}
  catch{if(n===sequence.current)setUncertain(true);}finally{lock.current=false;if(n===sequence.current)setPending(false);}
 }
 const disabled=!enabled||pending||uncertain;
 return <section className="mt-6 rounded-2xl border border-[#d5bb92] bg-[#231b27] p-5" aria-labelledby="admin-email-test-heading" aria-busy={pending}><h2 id="admin-email-test-heading" className="font-cinzel text-lg font-bold text-white">{c.emailTitle}</h2><p className="mt-2 text-sm leading-6 text-[#e3d5da]">{c.emailIntro}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={disabled} onClick={()=>void submit("single")} className="min-h-11 rounded-lg border border-[#d4ac67] bg-[#6c2f46] px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{pending?c.checking:c.single}</button><button type="button" disabled={disabled} onClick={()=>void submit("suite")} className="min-h-11 rounded-lg border border-[#d4ac67] bg-[#75452b] px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{c.suite}</button></div>{!enabled?<p className="mt-2 text-sm text-[#f4d89d]">{c.emailDisabled}</p>:null}
 {uncertain?<div className="mt-3 text-sm leading-6 text-[#f4d89d]"><p role="status" aria-live="polite">{c.emailUnknown}</p><a href="/admin/readiness" className="underline">{c.reloadEmail}</a></div>:null}
 {result?<div role="status" aria-live="polite" className="mt-3 text-sm leading-6 text-[#f4d89d]">{result.mode==="single"?<p>{result.recipientSource==="EMAIL_QA_RECIPIENT"?c.singleAcceptanceAccepted:c.singleAccepted}</p>:<><p>{c.suiteResult}: {result.acceptedCount}/{result.requestedCount}</p><ul>{result.outcomes.map(item=><li key={item.index}>#{String(item.index).padStart(2,"0")} {emailCategory(item.index,apiLocale)}: {item.providerAccepted?c.accepted:item.acceptanceUncertain?c.acceptanceUnknown:c.notAccepted}</li>)}</ul><p>{c.inbox}</p></>}</div>:null}</section>;
}

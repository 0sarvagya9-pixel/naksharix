"use client";
import {useRef,useState} from "react";
import Link from "next/link";
import {secureFetch} from "@/lib/security/csrf";
import {Button} from "@/components/ui/button";
import {useLanguage} from "@/components/language-provider";
import {professionalApplicationCopy,professionalApplicationAcknowledged} from "@/lib/auth/professional-application-copy";
export function ProfessionalApplicationConfirmation({role,resume}:{role:"ASTROLOGER"|"CONSULTANT";resume:string|null}){
 const {apiLocale}=useLanguage(),copy=professionalApplicationCopy[apiLocale];
 const lock=useRef(false),[busy,setBusy]=useState(false),[error,setError]=useState<"failed"|"verification"|"rate"|null>(null);
 async function confirm(){
  if(lock.current)return;lock.current=true;setBusy(true);setError(null);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  let committed=false;
  try{
   const response=await secureFetch("/api/astrologer/become",{method:"POST",silent:true,headers:{"Content-Type":"application/json"},signal:controller.signal,body:JSON.stringify({role})});
   const body=await response.json().catch(()=>null);
   if(!response.ok||!professionalApplicationAcknowledged(body,role)){setError(response.status===429?"rate":[401,403,409].includes(response.status)?"verification":"failed");return;}
   committed=true;window.location.assign("/astrologer/profile");
  }catch{setError("failed");}
  finally{clearTimeout(timer);if(!committed){lock.current=false;setBusy(false);}}
 }
 return <div className="space-y-4 rounded-2xl border p-5 sm:p-6" aria-busy={busy}><h1 className="font-cinzel text-2xl font-bold">{copy.title}</h1><p>{copy.description}</p><Button type="button" disabled={busy} onClick={confirm}>{busy?copy.busy:copy.confirm}</Button><Link className="block underline" href={resume??"/dashboard"}>{copy.keep}</Link>{error&&<p role="alert">{copy[error]}</p>}</div>;
}

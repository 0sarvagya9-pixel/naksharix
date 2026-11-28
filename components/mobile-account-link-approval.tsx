"use client";
import {useRef,useState} from "react";
import {secureFetch} from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {deviceCopy,type DeviceMessage} from "@/lib/account/device-copy";
export function MobileAccountLinkApproval({ticket,accountName}:{ticket:string;accountName:string}){
  const {locale}=useLanguage(),copy=deviceCopy(locale),lock=useRef(false);
  const [pending,setPending]=useState(false),[approved,setApproved]=useState(false),[error,setError]=useState<DeviceMessage|null>(null),[uncertain,setUncertain]=useState(false);
  async function approve(){
    if(lock.current||approved||uncertain)return;
    lock.current=true;setPending(true);setError(null);
    try{
      const response=await secureFetch("/api/mobile/auth/approve",{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ticket}),silent:true
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok){const kind=response.status===410?"mobileExpired":response.status===401?"signedOut":response.status===403?"mobileForbidden":"mobileUncertain";setError(kind);setUncertain(kind==="mobileUncertain"||kind==="mobileExpired");return;}
      if(data.data?.approved!==true)throw Error("Unconfirmed approval");
      setApproved(true);
    }catch{setError("mobileUncertain");setUncertain(true);}
    finally{lock.current=false;setPending(false);}
  }
  return <section className="rounded-2xl border border-[#dac6ad] bg-white p-7 text-[#34232e]">
    <p className="text-xs font-bold uppercase tracking-widest text-[#71344b]">{copy.mobileEyebrow}</p>
    <h1 className="mt-4 text-2xl font-black">{copy.mobileTitle}</h1>
    <p className="mt-3 text-sm leading-7">{copy.mobileAccount} <strong>{accountName}</strong>. {copy.mobileWarning}</p>
    <p className="mt-3 text-sm leading-7">{copy.mobileScope}</p>
    {approved?<div role="status" className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-5">
      {copy.mobileApproved}
    </div>:<>
      <button type="button" disabled={pending||uncertain} onClick={approve}
        className="mt-6 min-h-12 w-full rounded-xl bg-[#71344b] px-5 py-3 font-semibold text-white disabled:opacity-50">
        {pending?copy.mobileBusy:copy.mobileApprove}
      </button>
      {error?<p role="alert" className="mt-3 text-sm text-red-700">{copy[error]}</p>:null}
      <p className="mt-4 text-xs leading-6">{copy.mobileExpiry}</p>
    </>}
  </section>;
}

"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {Button} from "@/components/ui/button";
import {useLanguage} from "@/components/language-provider";
import {secureFetch} from "@/lib/security/csrf";
import {browserPushSupported,decodePublicPushKey,disableCurrentPushDevice} from "@/lib/notifications/push-client";
import {readPushReadiness,revokedPushReceipt,type PushReadiness} from "@/lib/notifications/push-client-contract";
import {deviceCopy,deviceFailure,type DeviceMessage} from "@/lib/account/device-copy";
export function PushPreferences(){
 const {locale}=useLanguage(),copy=deviceCopy(locale),lock=useRef(false),sequence=useRef(0);
 const [state,setState]=useState<PushReadiness|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState<DeviceMessage|null>(null),[consent,setConsent]=useState(false),[supported,setSupported]=useState(false),[local,setLocal]=useState<boolean|null>(null),[phase,setPhase]=useState<"loading"|"ready"|"unknown">("loading"),[uncertain,setUncertain]=useState(false);
 const refresh=useCallback(async(clearUncertainty=false)=>{
  const current=++sequence.current;setPhase("loading");setConsent(false);
  let account:PushReadiness|null=null,localState:boolean|null=null;
  const support=browserPushSupported();
  try{const r=await fetch("/api/notifications/subscribe",{cache:"no-store"}),j=await r.json();account=r.ok?readPushReadiness(j?.data):null;}catch{}
  if(support){try{const registration=await navigator.serviceWorker.getRegistration();localState=Boolean(await registration?.pushManager.getSubscription());}catch{}}
  else localState=false;
  if(current!==sequence.current)return false;
  setState(account);setSupported(support);setLocal(localState);setPhase(account?"ready":"unknown");
  if(clearUncertainty&&account&&localState!==null){setUncertain(false);setNotice(null);}
  return !!account&&localState!==null;
 },[]);
 const invalidate=useCallback(()=>{sequence.current++;},[]);
 useEffect(()=>{void refresh();return invalidate;},[refresh,invalidate]);
 async function enable(){
  if(lock.current||uncertain||phase!=="ready"||!state?.ready||!state.publicKey||!consent||local===null||!browserPushSupported())return;
  lock.current=true;setBusy(true);setNotice(null);let created:PushSubscription|null=null;
  try{
   if(await Notification.requestPermission()!=="granted"){setNotice("permission");return;}
   const registration=await navigator.serviceWorker.register("/sw.js");
   const active=await Promise.race([navigator.serviceWorker.ready,new Promise<never>((_,reject)=>setTimeout(()=>reject(Error("Worker not ready")),8000))]);
   if(active.scope!==registration.scope)throw Error("Unexpected worker scope");
   const key=decodePublicPushKey(state.publicKey);let sub=await active.pushManager.getSubscription();
   if(sub){const existing=sub.options.applicationServerKey;if(!existing||new Uint8Array(existing).length!==key.length||!new Uint8Array(existing).every((byte,i)=>byte===key[i])){if(!await sub.unsubscribe())throw Error("Previous device not revoked");sub=null;}}
   if(!sub){sub=await active.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});created=sub;}
   const response=await secureFetch("/api/notifications/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({endpoint:sub.endpoint,consent:true,consentVersion:state.consentVersion,publicKey:state.publicKey}),silent:true});
   const body=await response.json().catch(()=>null);
   if(!response.ok){const kind=deviceFailure(response.status);setNotice(kind);setUncertain(true);if(created)await created.unsubscribe().catch(()=>false);return;}
   if(body?.data?.registered!==true||body.data.deliveryVerified!==false)throw Error("Unconfirmed registration");
   setConsent(false);setNotice("registered");
  }catch{if(created)await created.unsubscribe().catch(()=>false);setNotice("uncertain");setUncertain(true);}
  finally{await refresh();lock.current=false;setBusy(false);}
 }
 async function revoke(all:boolean){
  if(lock.current||uncertain||phase!=="ready"||!state||all&&(!state.schemaReady||!state.registeredDevices)||!all&&local!==true)return;
  lock.current=true;setBusy(true);setNotice(null);
  try{
   if(all){const r=await secureFetch("/api/notifications/subscribe",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({all:true}),silent:true});const j=await r.json().catch(()=>null);if(!r.ok){setNotice(deviceFailure(r.status));setUncertain(true);return;}if(!revokedPushReceipt(j?.data,true))throw Error("Unconfirmed revocation");}
   const result=await disableCurrentPushDevice();
   if(result.local==="unknown"){setNotice(all?"serverRevokedLocalUnknown":"uncertain");setUncertain(true);}
   else setNotice(all?"revoked":"localRevoked");
  }catch{setNotice("uncertain");setUncertain(true);}
  finally{await refresh();lock.current=false;setBusy(false);}
 }
 return <section className="mt-6 rounded-2xl border border-[#e4cbaa] bg-[#fffdf8] p-5 text-[#35242b]" aria-labelledby="push-settings-title">
  <h2 id="push-settings-title" className="font-cinzel text-xl font-bold text-[#70283d]">{copy.title}</h2>
  <p className="mt-2 text-sm leading-6">{copy.intro}</p>
  {phase==="ready"&&state?<p className="mt-3 text-sm">{copy.count}: {state.registeredDevices}/5 · {local===true?copy.localExists:local===false?copy.localAbsent:copy.localUnknown}</p>:<p className="mt-3 text-sm" role={phase==="unknown"?"alert":"status"}>{phase==="loading"?copy.checking:copy.unknown}</p>}
  {phase==="ready"?(!state?.ready?<p className="mt-3 text-sm">{copy.inactive}</p>:!supported?<p className="mt-3 text-sm">{copy.unsupported}</p>:<div className="mt-4 space-y-3"><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} disabled={busy||uncertain||local===null}/>{copy.consent}</label><Button disabled={!consent||busy||uncertain||local===null} onClick={()=>void enable()}>{copy.enable}</Button></div>):null}
  <div className="mt-4 flex flex-wrap gap-3"><Button variant="outline" disabled={busy||uncertain||phase!=="ready"||local!==true} onClick={()=>void revoke(false)}>{copy.disable}</Button><Button variant="outline" disabled={busy||uncertain||phase!=="ready"||!state?.schemaReady||!state.registeredDevices} onClick={()=>void revoke(true)}>{copy.revoke}</Button><Button variant="ghost" disabled={busy} onClick={()=>void refresh(true)}>{copy.refresh}</Button></div>
  {notice?<p role={["registered","revoked","localRevoked","permission"].includes(notice)?"status":"alert"} className="mt-4 text-sm" data-device-notice>{copy[notice]}</p>:null}
 </section>;
}

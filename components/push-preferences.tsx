"use client";
import {useCallback,useEffect,useState} from "react";
import {Button} from "@/components/ui/button";
import {secureFetch} from "@/lib/security/csrf";
import {browserPushSupported,decodePublicPushKey,disableCurrentPushDevice} from "@/lib/notifications/push-client";
type Readiness={ready:boolean;publicKey:string|null;registeredDevices:number;schemaReady:boolean;consentVersion:string};
export function PushPreferences(){
 const [state,setState]=useState<Readiness|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[consent,setConsent]=useState(false),[supported,setSupported]=useState(false),[local,setLocal]=useState(false);
 const refresh=useCallback(async()=>{
  try{const r=await fetch("/api/notifications/subscribe",{cache:"no-store"}),j=await r.json();setState(r.ok?j.data:null);}catch{setState(null);}
  setSupported(browserPushSupported());
  if(browserPushSupported()){const registration=await navigator.serviceWorker.getRegistration().catch(()=>undefined);setLocal(Boolean(await registration?.pushManager.getSubscription().catch(()=>null)));}
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 async function enable(){
  if(!state?.ready||!state.publicKey||!consent||busy||!browserPushSupported())return;
  setBusy(true);setNotice("");
  let created:PushSubscription|null=null;
  try{
   // Permission prompt follows an explicit user gesture; never request it on load.
   if(await Notification.requestPermission()!=="granted"){setNotice("Browser permission was not granted. No server subscription saved.");return;}
   const registration=await navigator.serviceWorker.register("/sw.js");
   const active=await Promise.race([navigator.serviceWorker.ready,new Promise<never>((_,reject)=>setTimeout(()=>reject(Error("Worker not ready")),8000))]);
   if(active.scope!==registration.scope)throw Error("Unexpected worker scope");
   const key=decodePublicPushKey(state.publicKey);
   let sub=await active.pushManager.getSubscription();
   if(sub){
    const existing=sub.options.applicationServerKey;
    if(!existing||new Uint8Array(existing).length!==key.length||!new Uint8Array(existing).every((byte,i)=>byte===key[i])){await sub.unsubscribe();sub=null;}
   }
   if(!sub){sub=await active.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});created=sub;}
   const response=await secureFetch("/api/notifications/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({endpoint:sub.endpoint,consent:true,consentVersion:state.consentVersion,publicKey:state.publicKey}),silent:true});
   const body=await response.json().catch(()=>null);
   if(!response.ok||body?.data?.registered!==true){setNotice(body?.error??"Subscription was not confirmed. Try again or revoke old devices.");if(created)await created.unsubscribe().catch(()=>false);return;}
   setConsent(false);setNotice("Device registered. Actual notification delivery has not yet been verified.");
  }catch{if(created)await created.unsubscribe().catch(()=>false);setNotice("This browser could not register a notification device.");}
  finally{await refresh();setBusy(false);}
 }
 async function revoke(all:boolean){
  setBusy(true);setNotice("");
  try{
   if(all){const r=await secureFetch("/api/notifications/subscribe",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({all:true}),silent:true});if(!r.ok)throw Error("Revocation not confirmed");}
   await disableCurrentPushDevice();
   setNotice(all?"Account device registrations removed. Already queued browser notices may still arrive.":"Local device unsubscribed. Use revoke all if server registration remains.");
  }catch{setNotice("Revocation could not be confirmed. Use the account controls again.");}
  finally{await refresh();setBusy(false);}
 }
 return <section className="mt-6 rounded-2xl border border-[#e4cbaa] bg-[#fffdf8] p-5 text-[#35242b]" aria-labelledby="push-settings-title">
 <h2 id="push-settings-title" className="font-cinzel text-xl font-bold text-[#70283d]">Account notification preferences</h2>
 <p className="mt-2 text-sm leading-6">Optional generic browser notices for actual report, order and Puja account updates. No personal details appear in push messages; marketing permission is separate. Sign in to read your account. Do not enable on a shared device.</p>
 {state?<p className="mt-3 text-sm">Registered devices: {state.registeredDevices}/5 · {local?"Browser subscription exists":"No local browser subscription"}</p>:<p className="mt-3 text-sm">Notification status is unavailable or loading.</p>}
 {!state?.ready?<p className="mt-3 text-sm">New registrations are not available.</p>:!supported?<p className="mt-3 text-sm">This browser does not currently support secure push notifications.</p>:<div className="mt-4 space-y-3"><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} disabled={busy}/>Enable account updates on this device. I can revoke them at any time.</label><Button disabled={!consent||busy} onClick={()=>void enable()}>Enable this device</Button></div>}
 <div className="mt-4 flex flex-wrap gap-3"><Button variant="outline" disabled={busy||!local} onClick={()=>void revoke(false)}>Disable this browser</Button><Button variant="outline" disabled={busy||!state?.schemaReady||!state.registeredDevices} onClick={()=>void revoke(true)}>Revoke all registered devices</Button><Button variant="ghost" disabled={busy} onClick={()=>void refresh()}>Refresh status</Button></div>
 {notice?<p role="status" className="mt-4 text-sm">{notice}</p>:null}
 </section>;
}

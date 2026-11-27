"use client";
import {secureFetch} from "@/lib/security/csrf";
import {revokedPushReceipt} from "@/lib/notifications/push-client-contract";
export function browserPushSupported(){return typeof window!=="undefined"&&window.isSecureContext&&"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;}
export function decodePublicPushKey(value:string){
 const base64=value.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(value.length/4)*4,"=");
 return Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
}
export async function disableCurrentPushDevice(){
 if(!browserPushSupported())return {local:"absent" as const,serverRevoked:false};
 const registration=await navigator.serviceWorker.getRegistration();
 const sub=await registration?.pushManager.getSubscription();
 if(!sub)return {local:"absent" as const,serverRevoked:false};
 // Local unsubscribe happens even when the server request is unavailable.
 // No private notification content can be sent after account sign-out.
 let serverRevoked=false;
 try{const response=await secureFetch("/api/notifications/subscribe",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({endpoint:sub.endpoint}),silent:true,signal:AbortSignal.timeout(3500)});const json=await response.json().catch(()=>null);serverRevoked=response.ok&&revokedPushReceipt(json?.data);}catch{}
 const local=await sub.unsubscribe().catch(()=>false)?"revoked" as const:"unknown" as const;
 return {local,serverRevoked};
}

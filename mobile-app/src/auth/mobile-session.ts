import * as SecureStore from "expo-secure-store";
import {webUrl} from "../config/env";
const KEY="naksharix_mobile_access_v1";
export class MobileAuthError extends Error {
  constructor(message:string,readonly status:number){super(message);this.name="MobileAuthError";}
}
export const savedAccessToken=()=>SecureStore.getItemAsync(KEY);
export async function saveAccessToken(token:string){
  if(!/^[A-Za-z0-9_.-]{90,1500}$/.test(token))throw new MobileAuthError("Invalid mobile session.",0);
  await SecureStore.setItemAsync(KEY,token);
}
export const deleteAccessToken=()=>SecureStore.deleteItemAsync(KEY);
export async function mobileRequest<T>(path:string,opts:{
  method?:"GET"|"POST"|"PATCH";body?:unknown;token?:string;signal?:AbortSignal
}={}):Promise<T>{
  if(!path.startsWith("/api/mobile/")||path.startsWith("//"))
    throw new MobileAuthError("Invalid account destination.",0);
  const controller=new AbortController(),onAbort=()=>controller.abort();
  opts.signal?.addEventListener("abort",onAbort,{once:true});
  const timeout=setTimeout(()=>controller.abort(),18000);
  try{
    const response=await fetch(webUrl(path),{
      method:opts.method||"GET",cache:"no-store",credentials:"omit",
      headers:{Accept:"application/json",
        ...(opts.body!==undefined?{"Content-Type":"application/json"}:{}),
        ...(opts.token?{Authorization:"Bearer "+opts.token}:{})},
      body:opts.body!==undefined?JSON.stringify(opts.body):undefined,
      signal:controller.signal
    });
    const json=await response.json().catch(()=>null) as {data?:T;error?:string}|null;
    if(!response.ok)throw new MobileAuthError(response.status===401?
      "Your session expired. Connect your account again.":response.status===429?
      "Too many requests. Please try shortly.":json?.error||"Account service unavailable.",response.status);
    if(!json||json.data===undefined)throw new MobileAuthError("Invalid account response.",502);
    return json.data;
  }catch(e){
    if(e instanceof MobileAuthError)throw e;
    throw new MobileAuthError(controller.signal.aborted?"Connection timed out.":"Check your network and retry.",0);
  }finally{clearTimeout(timeout);opts.signal?.removeEventListener("abort",onAbort);}
}

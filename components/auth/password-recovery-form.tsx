"use client";
import {useEffect,useLayoutEffect,useRef,useState,type FormEvent} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {secureFetch} from "@/lib/security/csrf";
import {isUnchangedCredential} from "@/lib/security/sanitize";
import {useLanguage} from "@/components/language-provider";
import {passwordRecoveryCopy,recoveryErrorKey,recoveryPasswordLengthValid,type RecoveryKey} from "@/lib/auth/password-recovery-copy";
export function PasswordRecoveryForm({mode}:{mode:"request"|"confirm"}){
 const {apiLocale}=useLanguage(),copy=passwordRecoveryCopy[apiLocale];
 const [email,setEmail]=useState(""),[token,setToken]=useState(""),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState<RecoveryKey|null>(null),[error,setError]=useState<RecoveryKey|null>(null),[done,setDone]=useState(false);
 const [ready,setReady]=useState(false);
 const passwordInput=useRef<HTMLInputElement>(null),confirmInput=useRef<HTMLInputElement>(null);
 const visibilitySnapshot=useRef<{password:string;confirm:string}|null>(null);
 const lock=useRef(false);
 useEffect(()=>{
  if(mode==="request"){setReady(true);return;}
  const raw=new URLSearchParams(window.location.hash.slice(1)).get("token");
  if(raw&&/^[A-Za-z0-9_-]{43}$/.test(raw))setToken(raw);
  window.history.replaceState(null,"",window.location.pathname);
  setReady(true);
 },[mode]);
 // Native password controls can change their value when WebKit switches the
 // input type. Capture the actual DOM values, not possibly delayed React
 // change events; restore them before the browser paints the new type.
 function togglePasswords(){
  if(!ready||busy||!passwordInput.current||!confirmInput.current)return;
  visibilitySnapshot.current={password:passwordInput.current.value,confirm:confirmInput.current.value};
  setShow(v=>!v);
 }
 useLayoutEffect(()=>{
  const snapshot=visibilitySnapshot.current;
  if(!snapshot)return;
  visibilitySnapshot.current=null;
  if(passwordInput.current)passwordInput.current.value=snapshot.password;
  if(confirmInput.current)confirmInput.current.value=snapshot.confirm;
 },[show]);
 async function submit(e:FormEvent){
  e.preventDefault();if(lock.current||busy||done||!ready)return;setMessage(null);setError(null);
  const password=passwordInput.current?.value??"",confirm=confirmInput.current?.value??"";
  if(mode==="confirm"){
   if(!token){setError("missingToken");return;}
   if(!recoveryPasswordLengthValid(password)||!isUnchangedCredential(password)){setError("length");return;}
   if(password!==confirm){setError("mismatch");return;}
  }
  lock.current=true;setBusy(true);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
   const r=await secureFetch("/api/auth/password-reset/"+mode,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mode==="request"?{email}:{token,password}),signal:controller.signal,silent:true});
   if(!r.ok){setError(recoveryErrorKey(r.status,mode));return;}
   const body=await r.json();
   if((mode==="request"?body?.data?.accepted:body?.data?.reset)!==true){setError("failed");return;}
   if(passwordInput.current)passwordInput.current.value="";
   if(confirmInput.current)confirmInput.current.value="";
   visibilitySnapshot.current=null;setDone(true);setToken("");setShow(false);
   setMessage(mode==="request"?"accepted":"changed");
  }catch{setError("failed");}finally{clearTimeout(timer);lock.current=false;setBusy(false);}
 }
 return <div className="space-y-5"><h1 className="font-cinzel text-2xl font-bold">{copy[mode==="request"?"requestTitle":"confirmTitle"]}</h1>
 {!done&&<form className="space-y-4" onSubmit={submit} aria-busy={busy||!ready}>
 {mode==="request"?<div><Label htmlFor="reset-email">{copy.email}</Label><Input id="reset-email" type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy||!ready} aria-describedby={error?"recovery-error":undefined} onChange={e=>setEmail(e.target.value)}/></div>:<>
 {ready&&!token&&<p role="alert">{copy.missingToken}</p>}
 <div><Label htmlFor="new-password">{copy.password}</Label><Input id="new-password" type={show?"text":"password"} autoComplete="new-password" minLength={8} maxLength={72} required name="newPassword" ref={passwordInput} disabled={busy||!ready||!token} aria-describedby={error?"recovery-length recovery-error":"recovery-length"}/><p id="recovery-length" className="text-xs text-muted-foreground">{copy.length}</p></div>
 <div><Label htmlFor="confirm-password">{copy.confirm}</Label><Input id="confirm-password" type={show?"text":"password"} autoComplete="new-password" minLength={8} maxLength={72} required name="confirmPassword" ref={confirmInput} disabled={busy||!ready||!token} aria-invalid={error==="mismatch"||undefined} aria-describedby={error?"recovery-error":undefined}/></div>
 <button type="button" aria-pressed={show} aria-controls="new-password confirm-password" className="min-h-10 text-sm underline" disabled={busy||!ready||!token} onClick={togglePasswords}>{copy[show?"hide":"show"]}</button></>}
 <Button className="w-full" disabled={busy||!ready||(mode==="confirm"&&!token)}>{copy[busy?"waiting":mode==="request"?"request":"change"]}</Button>
 </form>}
 {message&&<p role="status" className="rounded-xl border p-4 text-sm">{copy[message]}</p>}{error&&<p id="recovery-error" role="alert" className="text-sm text-destructive">{copy[error]}</p>}
 <Link href="/login" className="block underline">{copy.login}</Link>{mode==="confirm"&&!done&&<Link href="/forgot-password" className="block underline">{copy.again}</Link>}</div>
}

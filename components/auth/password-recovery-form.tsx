"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {secureFetch} from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {passwordRecoveryCopy,recoveryErrorKey,recoveryPasswordLengthValid,type RecoveryKey} from "@/lib/auth/password-recovery-copy";
export function PasswordRecoveryForm({mode}:{mode:"request"|"confirm"}){
 const {apiLocale}=useLanguage(),copy=passwordRecoveryCopy[apiLocale];
 const [email,setEmail]=useState(""),[token,setToken]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState<RecoveryKey|null>(null),[error,setError]=useState<RecoveryKey|null>(null),[done,setDone]=useState(false);
 useEffect(()=>{if(mode!=="confirm")return;const raw=new URLSearchParams(window.location.hash.slice(1)).get("token");if(raw&&/^[A-Za-z0-9_-]{43}$/.test(raw))setToken(raw);window.history.replaceState(null,"",window.location.pathname);},[mode]);
 async function submit(e:FormEvent){
  e.preventDefault();if(busy||done)return;setMessage(null);setError(null);
  if(mode==="confirm"){
   if(!token){setError("missingToken");return;}
   if(!recoveryPasswordLengthValid(password)){setError("length");return;}
   if(password!==confirm){setError("mismatch");return;}
  }
  setBusy(true);
  try{
   const r=await secureFetch("/api/auth/password-reset/"+mode,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mode==="request"?{email}:{token,password}),silent:true});
   if(!r.ok){setError(recoveryErrorKey(r.status,mode));return;}
   const body=await r.json();
   if((mode==="request"?body?.data?.accepted:body?.data?.reset)!==true){setError("failed");return;}
   setDone(true);setPassword("");setConfirm("");setToken("");setShow(false);
   setMessage(mode==="request"?"accepted":"changed");
  }catch{setError("failed");}finally{setBusy(false);}
 }
 return <div className="space-y-5"><h1 className="font-cinzel text-2xl font-bold">{copy[mode==="request"?"requestTitle":"confirmTitle"]}</h1>
 {!done&&<form className="space-y-4" onSubmit={submit} aria-busy={busy}>
 {mode==="request"?<div><Label htmlFor="reset-email">{copy.email}</Label><Input id="reset-email" type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy} aria-describedby={error?"recovery-error":undefined} onChange={e=>setEmail(e.target.value)}/></div>:<>
 {!token&&<p role="alert">{copy.missingToken}</p>}
 <div><Label htmlFor="new-password">{copy.password}</Label><Input id="new-password" type={show?"text":"password"} autoComplete="new-password" minLength={8} maxLength={72} required value={password} disabled={busy} aria-describedby={error?"recovery-length recovery-error":"recovery-length"} onChange={e=>setPassword(e.target.value)}/><p id="recovery-length" className="text-xs text-muted-foreground">{copy.length}</p></div>
 <div><Label htmlFor="confirm-password">{copy.confirm}</Label><Input id="confirm-password" type={show?"text":"password"} autoComplete="new-password" minLength={8} maxLength={72} required value={confirm} disabled={busy} aria-invalid={error==="mismatch"||undefined} aria-describedby={error?"recovery-error":undefined} onChange={e=>setConfirm(e.target.value)}/></div>
 <button type="button" aria-pressed={show} aria-controls="new-password confirm-password" className="text-sm underline" onClick={()=>setShow(v=>!v)}>{copy[show?"hide":"show"]}</button></>}
 <Button className="w-full" disabled={busy||(mode==="confirm"&&!token)}>{copy[busy?"waiting":mode==="request"?"request":"change"]}</Button>
 </form>}
 {message&&<p role="status" className="rounded-xl border p-4 text-sm">{copy[message]}</p>}{error&&<p id="recovery-error" role="alert" className="text-sm text-destructive">{copy[error]}</p>}
 <Link href="/login" className="block underline">{copy.login}</Link>{mode==="confirm"&&!done&&<Link href="/forgot-password" className="block underline">{copy.again}</Link>}</div>
}

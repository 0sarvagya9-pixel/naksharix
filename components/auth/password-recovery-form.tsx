"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {secureFetch} from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
export function PasswordRecoveryForm({mode}:{mode:"request"|"confirm"}){
 const {apiLocale}=useLanguage(),hi=apiLocale==="hi";
 const [email,setEmail]=useState(""),[token,setToken]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState(""),[done,setDone]=useState(false);
 useEffect(()=>{if(mode!=="confirm")return;const raw=new URLSearchParams(window.location.hash.slice(1)).get("token");if(raw&&/^[A-Za-z0-9_-]{43}$/.test(raw))setToken(raw);window.history.replaceState(null,"",window.location.pathname);},[mode]);
 async function submit(e:FormEvent){
  e.preventDefault();setMessage("");setError("");
  if(mode==="confirm"&&(!token||password!==confirm)){setError(hi?"सही रीसेट लिंक और समान पासवर्ड दर्ज करें।":"Open a valid reset link and enter matching passwords.");return;}
  setBusy(true);
  try{
   const r=await secureFetch("/api/auth/password-reset/"+mode,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mode==="request"?{email}:{token,password}),silent:true});
   const body=await r.json();if(!r.ok){setError(body.error??"Request failed.");return;}
   setDone(true);setPassword("");setConfirm("");setToken("");
   setMessage(mode==="request"?(hi?"यदि पात्र खाता मौजूद है तो रीसेट ईमेल भेजने का अनुरोध स्वीकार किया गया है। अपना इनबॉक्स और स्पैम फ़ोल्डर जाँचें।":"If an eligible account exists, the reset email has been requested. Check your inbox and spam folder."):(hi?"पासवर्ड बदल गया है। नए पासवर्ड से साइन इन करें।":"Your password has changed. Sign in using the new password."));
  }catch{setError(hi?"अनुरोध पूरा नहीं हुआ। फिर प्रयास करें।":"The request could not be completed. Try again.");}finally{setBusy(false);}
 }
 return <div className="space-y-5"><h1 className="font-cinzel text-2xl font-bold">{mode==="request"?(hi?"पासवर्ड भूल गए?":"Forgot your password?"):(hi?"नया पासवर्ड बनाएँ":"Choose a new password")}</h1>
 {!done&&<form className="space-y-4" onSubmit={submit}>
 {mode==="request"?<div><Label htmlFor="reset-email">{hi?"ईमेल":"Email"}</Label><Input id="reset-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></div>:<>
 {!token&&<p role="alert">{hi?"ईमेल में प्राप्त पूरा रीसेट लिंक खोलें।":"Open the complete one-time link from your reset email."}</p>}
 <div><Label htmlFor="new-password">{hi?"नया पासवर्ड":"New password"}</Label><Input id="new-password" type={show?"text":"password"} autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={e=>setPassword(e.target.value)}/></div>
 <div><Label htmlFor="confirm-password">{hi?"पासवर्ड की पुष्टि":"Confirm password"}</Label><Input id="confirm-password" type={show?"text":"password"} autoComplete="new-password" minLength={8} maxLength={72} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></div>
 <button type="button" aria-pressed={show} className="text-sm underline" onClick={()=>setShow(v=>!v)}>{show?(hi?"छिपाएँ":"Hide passwords"):(hi?"दिखाएँ":"Show passwords")}</button></>}
 <Button className="w-full" disabled={busy||(mode==="confirm"&&!token)}>{busy?(hi?"प्रतीक्षा करें":"Please wait"):mode==="request"?(hi?"रीसेट लिंक भेजें":"Request reset link"):(hi?"पासवर्ड बदलें":"Change password")}</Button>
 </form>}
 {message&&<p role="status" className="rounded-xl border p-4 text-sm">{message}</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 <Link href="/login" className="block underline">{hi?"लॉगिन पर लौटें":"Return to login"}</Link>{mode==="confirm"&&!done&&<Link href="/forgot-password" className="block underline">{hi?"नया रीसेट लिंक माँगें":"Request a new reset link"}</Link>}</div>
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { secureFetch } from "@/lib/security/csrf";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
export function ProfessionalApplicationConfirmation({role,resume}:{role:"ASTROLOGER"|"CONSULTANT";resume:string|null}){
 const router=useRouter(),{apiLocale}=useLanguage();
 const [busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
 const hi=apiLocale==="hi";
 async function confirm(){
  setBusy(true);setError(null);
  try{
   const r=await secureFetch("/api/astrologer/become",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({role})});
   const data=await r.json();
   if(!r.ok){setError(data.error??"Application could not be completed.");return;}
   router.push("/astrologer/profile");router.refresh();
  }catch{setError("Application could not be completed. Please try again.");}finally{setBusy(false);}
 }
 return <div className="rounded-2xl border p-6 space-y-4"><h1 className="font-cinzel text-2xl font-bold">{hi?"पेशेवर खाते का आवेदन":"Confirm professional application"}</h1><p>{hi?"आपका व्यक्तिगत खाता पेशेवर आवेदन में बदलेगा। प्रोफ़ाइल की समीक्षा से पहले सार्वजनिक बुकिंग उपलब्ध नहीं होगी।":"This changes your account to a professional applicant. Public bookings remain disabled until your profile and credentials are reviewed."}</p><Button disabled={busy} onClick={confirm}>{hi?"आवेदन की पुष्टि करें":"Confirm application"}</Button><Link className="block underline" href={resume??"/dashboard"}>{hi?"व्यक्तिगत खाते में रहें":"Keep my personal account"}</Link>{error&&<p role="alert">{error}</p>}</div>;
}

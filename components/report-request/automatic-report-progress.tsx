"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";
export function AutomaticReportProgress({id,canRetry,pending}:{id:string;canRetry:boolean;pending:boolean}){
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  useEffect(()=>{
    if(!pending)return;
    const timer=window.setInterval(()=>router.refresh(),15000);
    const stop=window.setTimeout(()=>window.clearInterval(timer),180000);
    return()=>{window.clearInterval(timer);window.clearTimeout(stop)};
  },[pending,router]);
  async function retry(){
    if(busy)return;
    setBusy(true);setMessage("");
    try{
      const result=await secureFetch("/api/report-requests/"+encodeURIComponent(id)+"/retry",{method:"POST"});
      const json=await result.json().catch(()=>null);
      setMessage(result.ok?"Processing request recorded. Check the report status below.":json?.error??"Retry unavailable; contact care@naksharix.com.");
      if(result.ok)router.refresh();
    }catch{setMessage("Unable to request retry. Your purchase remains saved.")}
    finally{setBusy(false)}
  }
  return <div className="space-y-2">{pending&&<p className="text-xs naksh-muted-text">This page refreshes the report status while you are here. You may safely close it.</p>}{canRetry&&<Button type="button" variant="outline" disabled={busy} onClick={()=>void retry()}>{busy?"Processing…":"Retry automatic delivery"}</Button>}{message&&<p role="status" className="text-sm">{message}</p>}</div>
}

"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {reportDeliveryCopy, reportRetryMessage, type ReportDeliveryMessage} from "@/lib/reports/delivery-copy";
export function AutomaticReportProgress({id,canRetry,pending}:{id:string;canRetry:boolean;pending:boolean}){
  const {locale}=useLanguage(),copy=reportDeliveryCopy(locale);
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState<ReportDeliveryMessage|null>(null);
  useEffect(()=>{
    if(!pending)return;
    const timer=window.setInterval(()=>router.refresh(),15000);
    const stop=window.setTimeout(()=>window.clearInterval(timer),180000);
    return()=>{window.clearInterval(timer);window.clearTimeout(stop)};
  },[pending,router]);
  async function retry(){
    if(busy)return;
    setBusy(true);setMessage(null);
    try{
      const result=await secureFetch("/api/report-requests/"+encodeURIComponent(id)+"/retry",{method:"POST"});
      const json=await result.json().catch(()=>null);
      const recorded=result.ok&&json?.data?.queued===true;
      setMessage(recorded?"queued":reportRetryMessage(result.status));
      if(recorded)router.refresh();
    }catch{setMessage("retryConnection")}
    finally{setBusy(false)}
  }
  return <div className="space-y-2">{pending&&<p className="text-xs naksh-muted-text">{copy.refreshing}</p>}{canRetry&&<Button type="button" variant="outline" disabled={busy} onClick={()=>void retry()}>{busy?copy.processing:copy.retry}</Button>}{message&&<p role="status" className="text-sm">{copy[message]}</p>}</div>
}

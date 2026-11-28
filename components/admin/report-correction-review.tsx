"use client";
import {useRef,useState} from "react";
import {Button} from "@/components/ui/button";
import {secureFetch} from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {reportOperationsCopy,type ReportOperationNotice} from "@/lib/admin/report-operations-copy";
export function ReportCorrectionReview({id,version,sendOnly=false}:{id:string;version:number;sendOnly?:boolean}){
 const {locale}=useLanguage(),copy=reportOperationsCopy(locale),lock=useRef(false);
 const [note,setNote]=useState(""),[busy,setBusy]=useState(false),[held,setHeld]=useState(false),[message,setMessage]=useState<ReportOperationNotice|null>(null);
 async function submit(action:"approve"|"decline"|"notify"){
  if(lock.current||held)return;if(action!=="notify"&&note.trim().length<30){setMessage("reviewRequired");return;}
  lock.current=true;setBusy(true);setMessage(null);
  try{const response=await secureFetch(`/api/admin/report-requests/${id}/revisions/${version}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,note:note.trim()}),silent:true});const result=await response.json().catch(()=>null),data=result?.data;
   if(!response.ok||data?.reportRequestId!==id||data.version!==version||data.action!==action||(action==="notify"?data.accepted!==true:data.status!==(action==="approve"?"READY":"DECLINED")))throw Error("Unconfirmed correction");
   setMessage(action==="notify"?"sent":action==="approve"?"approved":"declined");setHeld(true);
  }catch{setMessage("unknown");setHeld(true);}finally{lock.current=false;setBusy(false);}
 }
 return <div className="my-3 space-y-2">{sendOnly?<Button disabled={busy||held} onClick={()=>void submit("notify")}>{busy?copy.working:copy.retryEmail}</Button>:<>
  <label className="block">{copy.correctionNotes}<textarea aria-label={copy.correctionNotes} disabled={busy||held} className="cosmic-textarea block w-full" rows={3} maxLength={2000} value={note} onChange={e=>setNote(e.target.value)}/></label>
  <div className="flex flex-wrap gap-2"><Button disabled={busy||held||note.trim().length<30} onClick={()=>void submit("approve")}>{copy.approve} {version}</Button><Button variant="outline" disabled={busy||held||note.trim().length<30} onClick={()=>void submit("decline")}>{copy.decline}</Button></div>
 </>}{message?<p role="status">{copy[message]}</p>:null}{held?<a className="block underline" href={`/admin/report-requests/${encodeURIComponent(id)}`}>{copy.refresh}</a>:null}</div>;
}

"use client";
import {useRef,useState} from "react";
import {Download,FileText,Save} from "lucide-react";
import {Button} from "@/components/ui/button";
import {secureFetch} from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {reportOperationsCopy,reportOperationState,type ReportOperationNotice} from "@/lib/admin/report-operations-copy";
const statuses=["PENDING_REVIEW","PAYMENT_PENDING","PAID","IN_PROGRESS","NEEDS_INFO","READY_FOR_GENERATION","GENERATED","READY_FOR_DELIVERY","DELIVERED","CANCELLED"] as const;
export function ReportRequestActions({requestId,initialStatus,initialNotes,hasPdf}:{requestId:string;initialStatus:string;initialNotes?:string|null;hasPdf:boolean}){
 const {locale}=useLanguage(),copy=reportOperationsCopy(locale),lock=useRef(false);
 const [status,setStatus]=useState(initialStatus),[recordedStatus,setRecordedStatus]=useState(initialStatus),[recordedNotes,setRecordedNotes]=useState(initialNotes??""),[adminNotes,setAdminNotes]=useState(initialNotes??""),[reviewConfirmed,setReviewConfirmed]=useState(false);
 const [message,setMessage]=useState<ReportOperationNotice|null>(null),[loading,setLoading]=useState<"save"|"pdf"|"deliver"|null>(null),[held,setHeld]=useState(false);
 async function perform(action:"save"|"pdf"|"deliver"){
  if(lock.current||held)return;
  if(action==="save"&&status==="READY_FOR_GENERATION"&&recordedStatus!==status&&(!reviewConfirmed||adminNotes.trim().length<30)){setMessage("reviewRequired");return;}
  if(action==="pdf"&&(recordedStatus!=="READY_FOR_GENERATION"||status!==recordedStatus||adminNotes!==recordedNotes))return;
  if(action==="deliver"&&(status!==recordedStatus||adminNotes!==recordedNotes))return;
  lock.current=true;setLoading(action);setMessage(null);
  const input={id:requestId,status,adminNotes,reviewConfirmed};
  try{
   const response=await secureFetch(action==="save"?"/api/admin/report-requests":`/api/admin/report-requests/${requestId}/${action==="pdf"?"generate-pdf":"deliver"}`,action==="save"?{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(input),silent:true}:{method:"POST",silent:true});
   const body=await response.json().catch(()=>null),data=body?.data;if(!response.ok||!data)throw Error("Unconfirmed operation");
   if(action==="save"){
    if(data.reportRequest?.id!==requestId||data.reportRequest.status!==input.status||data.reportRequest.adminNotes!==input.adminNotes)throw Error("Unconfirmed workflow");
    setRecordedStatus(data.reportRequest.status);setRecordedNotes(data.reportRequest.adminNotes);setReviewConfirmed(false);setMessage("saved");
   }else if(action==="pdf"){
    if(data.reportRequestId!==requestId||data.status!=="GENERATED"||typeof data.fileName!=="string"||!data.fileName.endsWith(".pdf")||!Number.isSafeInteger(data.byteLength)||data.byteLength<=0||typeof data.storageProvider!=="string"||!data.storageProvider)throw Error("Unconfirmed file");
    setMessage("generated");setHeld(true);
   }else{
    if(data.reportRequest?.id!==requestId||data.reportRequest.status!=="DELIVERED"||data.reportRequest.deliveryStatus!=="email_sent"||(data.delivery?.skipped===true?data.delivery.sent!==false:data.delivery?.sent!==true))throw Error("Unconfirmed delivery");
    setMessage(data.delivery.skipped===true?"skipped":"sent");setHeld(true);
   }
  }catch{setMessage("unknown");setHeld(true);}finally{lock.current=false;setLoading(null);}
 }
 return <div className="space-y-4 rounded-2xl border border-[#D4AF37]/20 bg-[#0f1c3a]/70 p-5">
  <fieldset disabled={loading!==null||held} className="space-y-4"><div className="grid gap-4 md:grid-cols-2">
   <label className="space-y-2 text-sm text-slate-200"><span>{copy.workflow}</span><select aria-label={copy.workflow} value={status} onChange={e=>{setStatus(e.target.value);setReviewConfirmed(false);}} className="cosmic-select">{statuses.map(item=><option key={item} value={item}>{reportOperationState(item,locale)}</option>)}</select></label>
   <div className="space-y-2 text-sm text-slate-200"><span>{copy.pdfActions}</span><div className="flex flex-wrap gap-2">
    <Button type="button" onClick={()=>void perform("pdf")} disabled={loading!==null||held||recordedStatus!=="READY_FOR_GENERATION"||status!==recordedStatus||adminNotes!==recordedNotes} variant="secondary"><FileText className="mr-2 h-4 w-4"/>{loading==="pdf"?copy.working:copy.generate}</Button>
    {hasPdf?<><Button type="button" asChild variant="outline"><a href={`/api/report-requests/${requestId}/download`}><Download className="mr-2 h-4 w-4"/>{copy.download}</a></Button><Button type="button" onClick={()=>void perform("deliver")} disabled={loading!==null||held||status!==recordedStatus||adminNotes!==recordedNotes} variant="outline">{loading==="deliver"?copy.working:copy.send}</Button></>:null}
   </div></div></div>
   {status==="READY_FOR_GENERATION"&&recordedStatus!==status?<label className="flex items-start gap-2 rounded-lg border border-[#D4AF37]/30 p-3 text-sm"><input type="checkbox" checked={reviewConfirmed} onChange={e=>setReviewConfirmed(e.target.checked)} className="mt-1"/><span>{copy.review}</span></label>:null}
   <label className="block space-y-2 text-sm text-slate-200"><span>{copy.notes}</span><textarea aria-label={copy.notes} value={adminNotes} onChange={e=>{setAdminNotes(e.target.value);setReviewConfirmed(false);}} rows={4} maxLength={5000} className="cosmic-textarea"/></label>
   <Button type="button" onClick={()=>void perform("save")} disabled={loading!==null||held}><Save className="mr-2 h-4 w-4"/>{loading==="save"?copy.saving:copy.save}</Button>
  </fieldset>{message?<p role="status" className="rounded-md border border-[#D4AF37]/20 bg-[#020612]/70 p-3 text-sm text-slate-200">{copy[message]}</p>:null}{held?<a className="block underline" href={`/admin/report-requests/${encodeURIComponent(requestId)}`}>{copy.refresh}</a>:null}
 </div>;
}

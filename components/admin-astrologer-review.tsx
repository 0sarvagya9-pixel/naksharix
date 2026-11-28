"use client";
import {useEffect,useRef,useState} from "react";
import {CheckCircle2,RotateCcw,XCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useLanguage} from "@/components/language-provider";
import {secureFetch} from "@/lib/security/csrf";
import {editorialAdminCopy,editorialStatus} from "@/lib/admin/editorial-copy";
import {profileRecorded} from "@/lib/admin/editorial-client";
export function AdminAstrologerReview({profileId,status}:{profileId:string;status:string}){
 const {locale}=useLanguage(),c=editorialAdminCopy(locale);
 const [notice,setNotice]=useState<"recorded"|"unknown"|null>(null),[busy,setBusy]=useState(false),[uncertain,setUncertain]=useState(false),[recordedStatus,setRecordedStatus]=useState(status);
 const lock=useRef(false),identity=useRef(profileId);identity.current=profileId;
 useEffect(()=>{setRecordedStatus(status);},[profileId,status]);
 async function review(action:"APPROVE"|"REJECT"|"PENDING"){
  if(lock.current||uncertain)return;lock.current=true;setBusy(true);setNotice(null);const submittedId=profileId;
  try{const r=await secureFetch("/api/admin/astrologers/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profileId:submittedId,action,reason:action==="REJECT"?"Profile needs more verification details.":undefined}),silent:true}),j=await r.json().catch(()=>null);if(identity.current!==submittedId)return;if(!r.ok||!profileRecorded(j?.data,submittedId,action)){setNotice("unknown");setUncertain(true);return;}setRecordedStatus(j.data.profile.status);setNotice("recorded");}
  catch{if(identity.current===submittedId){setNotice("unknown");setUncertain(true);}}finally{lock.current=false;setBusy(false);}
 }
 return <div className="space-y-2"><p className="text-xs">{c.status}: {editorialStatus(recordedStatus,locale)}</p><div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy||uncertain||recordedStatus==="APPROVED"} onClick={()=>void review("APPROVE")}><CheckCircle2 className="h-4 w-4"/>{c.approve}</Button><Button size="sm" variant="outline" disabled={busy||uncertain||recordedStatus==="REJECTED"} onClick={()=>void review("REJECT")}><XCircle className="h-4 w-4"/>{c.reject}</Button><Button size="sm" variant="outline" disabled={busy||uncertain||recordedStatus==="PENDING_REVIEW"} onClick={()=>void review("PENDING")}><RotateCcw className="h-4 w-4"/>{c.pending}</Button></div>{notice?<p role="status" aria-live="polite" className="text-xs naksh-muted-text">{c[notice]}</p>:null}{uncertain?<a href="/admin/astrologers" className="text-xs underline">{c.reload}</a>:null}</div>;
}

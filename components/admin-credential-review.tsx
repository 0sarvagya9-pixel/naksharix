"use client";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useLanguage} from "@/components/language-provider";
import {secureFetch} from "@/lib/security/csrf";
import {editorialAdminCopy,editorialStatus} from "@/lib/admin/editorial-copy";
import {credentialRecorded} from "@/lib/admin/editorial-client";
export function AdminCredentialReview({profileId,status}:{profileId:string;status:string}){
 const {locale}=useLanguage(),c=editorialAdminCopy(locale);
 const [decision,setDecision]=useState<"DOCUMENTS_REVIEWED"|"REJECTED">("DOCUMENTS_REVIEWED"),[note,setNote]=useState(""),[notice,setNotice]=useState<"recorded"|"unknown"|null>(null),[busy,setBusy]=useState(false),[recordedStatus,setRecordedStatus]=useState(status),[uncertain,setUncertain]=useState(false);
 const lock=useRef(false),identity=useRef(profileId);identity.current=profileId;
 useEffect(()=>{setRecordedStatus(status);},[profileId,status]);
 async function save(event:FormEvent<HTMLFormElement>){event.preventDefault();if(lock.current||uncertain||note.trim().length<5)return;lock.current=true;setBusy(true);setNotice(null);const submitted={profileId,decision,note:note.trim()};
  try{const r=await secureFetch("/api/admin/astrologers/credentials",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(submitted),silent:true}),j=await r.json().catch(()=>null);if(identity.current!==submitted.profileId)return;if(!r.ok||!credentialRecorded(j?.data,submitted.profileId,submitted.decision)){setNotice("unknown");setUncertain(true);return;}setRecordedStatus(submitted.decision);setNotice("recorded");}
  catch{if(identity.current===submitted.profileId){setNotice("unknown");setUncertain(true);}}finally{lock.current=false;setBusy(false);}
 }
 return <form onSubmit={save} className="space-y-2 rounded-lg border border-[#D4AF37]/20 p-3"><p className="text-xs naksh-muted-text">{c.credentials}: {editorialStatus(recordedStatus,locale)}</p><fieldset className="space-y-2" disabled={busy||uncertain}><label className="block text-xs">{c.decision}<select aria-label={c.decision} value={decision} onChange={e=>setDecision(e.target.value as typeof decision)} className="mt-1 block h-9 rounded-md border border-[#263957] bg-[#02112C] p-2 text-xs"><option value="DOCUMENTS_REVIEWED">{c.reviewed}</option><option value="REJECTED">{c.rejectDocuments}</option></select></label><label className="block text-xs">{c.note}<Input required value={note} minLength={5} maxLength={300} onChange={e=>setNote(e.target.value)}/></label><Button type="submit" size="sm" disabled={busy||uncertain||note.trim().length<5}>{busy?c.recording:c.record}</Button></fieldset>{notice?<p role="status" aria-live="polite" className="text-xs naksh-muted-text">{c[notice]}</p>:null}{uncertain?<a className="text-xs underline" href="/admin/astrologers">{c.reload}</a>:null}</form>;
}

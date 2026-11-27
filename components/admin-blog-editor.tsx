"use client";
import {useRef,useState,type FormEvent} from "react";
import {Send} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardHeader,CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {useLanguage} from "@/components/language-provider";
import {secureFetch} from "@/lib/security/csrf";
import {editorialAdminCopy,editorialStatus} from "@/lib/admin/editorial-copy";
import {articleRecorded,type ArticleDraft,type ArticleReceipt} from "@/lib/admin/editorial-client";
const initial={title:"",category:"Astrology",excerpt:"",content:"",tags:"",status:"DRAFT" as "DRAFT"|"PUBLISHED"};
export function AdminBlogEditor(){
 const {locale}=useLanguage(),c=editorialAdminCopy(locale);
 const [draft,setDraft]=useState(initial),[busy,setBusy]=useState(false),[uncertain,setUncertain]=useState(false),[saved,setSaved]=useState<ArticleReceipt|null>(null);
 const lock=useRef(false);
 async function save(event:FormEvent<HTMLFormElement>){event.preventDefault();if(lock.current||uncertain)return;lock.current=true;setBusy(true);setSaved(null);
  const body:ArticleDraft={...draft,tags:draft.tags.split(",").map(tag=>tag.trim()).filter(Boolean)};
  try{const r=await secureFetch("/api/blog",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),silent:true}),j=await r.json().catch(()=>null);const receipt=r.ok?articleRecorded(j?.data,body):null;if(!receipt){setUncertain(true);return;}setSaved(receipt);setDraft(initial);}
  catch{setUncertain(true);}finally{lock.current=false;setBusy(false);}
 }
 return <Card className="glass"><CardHeader><CardTitle className="font-cinzel">{c.create}</CardTitle></CardHeader><CardContent><form onSubmit={save} className="grid gap-4"><fieldset className="grid gap-4" disabled={busy||uncertain}><div className="grid gap-4 md:grid-cols-2"><label className="space-y-2">{c.title}<Input name="title" minLength={4} required value={draft.title} onChange={e=>setDraft(v=>({...v,title:e.target.value}))}/></label><label className="space-y-2">{c.category}<Input name="category" minLength={2} required value={draft.category} onChange={e=>setDraft(v=>({...v,category:e.target.value}))}/></label></div><label className="space-y-2">{c.excerpt}<Textarea aria-label={c.excerpt} name="excerpt" minLength={20} required value={draft.excerpt} onChange={e=>setDraft(v=>({...v,excerpt:e.target.value}))}/></label><label className="space-y-2">{c.content}<Textarea aria-label={c.content} name="content" minLength={80} rows={10} required value={draft.content} onChange={e=>setDraft(v=>({...v,content:e.target.value}))}/></label><div className="grid gap-4 md:grid-cols-2"><label className="space-y-2">{c.tags}<Input name="tags" value={draft.tags} onChange={e=>setDraft(v=>({...v,tags:e.target.value}))}/></label><label className="space-y-2">{c.status}<select aria-label={c.status} name="status" value={draft.status} onChange={e=>setDraft(v=>({...v,status:e.target.value as typeof v.status}))} className="h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm"><option value="DRAFT">{c.draft}</option><option value="PUBLISHED">{c.published}</option></select></label></div><Button disabled={busy||uncertain}><Send className="h-4 w-4"/>{busy?c.saving:c.save}</Button></fieldset></form>{uncertain?<div className="mt-4 space-y-2"><p role="alert">{c.unknown}</p><a className="underline" href="/admin/blog">{c.reload}</a></div>:null}{saved?<section aria-live="polite" className="mt-4 space-y-2"><p className="font-semibold">{c.saved}: {saved.title}</p><p>{c.status}: {editorialStatus(saved.status,locale)} · {c.recordId}: {saved.id} · {c.slug}: {saved.slug}</p><p className="text-sm">{c.blogIntro}</p></section>:null}</CardContent></Card>;
}

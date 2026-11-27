"use client";

import {useId,useRef,useState,type FormEvent} from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {workspaceCopy,workspaceFailure,type WorkspaceMessage} from "@/lib/astrologers/workspace-copy";
import {noteMatches} from "@/lib/astrologers/client-contract";
import {sanitizeInput} from "@/lib/security/sanitize";

export function AstrologerNoteForm({ userId }: { userId: string }) {
  const {locale}=useLanguage(),copy=workspaceCopy(locale),lock=useRef(false),instanceId=useId();
  const [message,setMessage]=useState<WorkspaceMessage|null>(null),[busy,setBusy]=useState(false),[uncertain,setUncertain]=useState(false);

  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(lock.current||uncertain)return;lock.current=true;setBusy(true);setMessage(null);
    const form=event.currentTarget,formData=new FormData(form),payload=sanitizeInput({userId,title:String(formData.get("title")??""),body:String(formData.get("body")??""),private:true});
    try{const response = await secureFetch("/api/astrologer/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),silent:true
    });
    const json = await response.json();
    if(!response.ok){const kind=workspaceFailure(response.status);setMessage(kind);setUncertain(kind==="uncertain"||kind==="conflict");return;}
    if(!noteMatches(json?.data?.note,payload))throw Error("Unconfirmed note");
    setMessage("noteSaved");form.reset();
    }catch{setMessage("uncertain");setUncertain(true);}finally{lock.current=false;setBusy(false);}
  }

  return (
    <form onSubmit={save} className="space-y-3 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/60 p-4">
      <fieldset disabled={busy||uncertain} className="space-y-3"><Label htmlFor={`note-title-${instanceId}`}>{copy.noteTitle}</Label>
      <Input id={`note-title-${instanceId}`} name="title" required minLength={2} maxLength={120} placeholder={copy.noteTitleHint} />
      <Label htmlFor={`note-body-${instanceId}`}>{copy.noteBody}</Label>
      <Textarea id={`note-body-${instanceId}`} name="body" required minLength={5} maxLength={2000} placeholder={copy.noteBodyHint} />
      <Button type="submit" size="sm"><StickyNote className="h-4 w-4" />{busy?copy.saving:copy.noteSave}</Button></fieldset>
      {uncertain?<Button type="button" variant="outline" onClick={()=>window.location.reload()}>{copy.refresh}</Button>:null}
      {message ? <p role={message==="noteSaved"?"status":"alert"} className="text-xs naksh-muted-text">{copy[message]}</p> : null}
    </form>
  );
}

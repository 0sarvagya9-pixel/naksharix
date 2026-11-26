"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";

export function ReportCorrectionReview({id,version,sendOnly=false}:{id:string;version:number;sendOnly?:boolean}) {
  const [note,setNote] = useState(""), [busy,setBusy] = useState(false), [message,setMessage] = useState("");
  const router = useRouter();
  async function submit(action:"approve"|"decline"|"notify") {
    setBusy(true);
    try {
      const response=await secureFetch(`/api/admin/report-requests/${id}/revisions/${version}`,{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,note})
      });
      const result=await response.json();
      setMessage(response.ok ? "Review saved." : result.error ?? "Review unavailable.");
      if (response.ok) router.refresh();
    } catch { setMessage("Review could not be confirmed. Reload this request."); }
    finally { setBusy(false); }
  }
  if (sendOnly) return <div><Button disabled={busy} onClick={()=>submit("notify")}>Retry registered email</Button>{message&&<p role="status">{message}</p>}</div>;
  return <div className="my-3 space-y-2"><label className="block">Review notes (30 characters minimum)
    <textarea className="cosmic-textarea block w-full" rows={3} maxLength={2000} value={note} onChange={e=>setNote(e.target.value)}/></label>
    <div className="flex flex-wrap gap-2"><Button disabled={busy||note.trim().length<30} onClick={()=>submit("approve")}>Approve and generate version {version}</Button>
      <Button variant="outline" disabled={busy||note.trim().length<30} onClick={()=>submit("decline")}>Decline</Button></div>
    {message&&<p role="status">{message}</p>}</div>;
}

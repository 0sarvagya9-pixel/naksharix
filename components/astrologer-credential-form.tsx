"use client";

import { useRef,useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";
import {useLanguage} from "@/components/language-provider";
import {workspaceCopy,workspaceFailure,type WorkspaceMessage} from "@/lib/astrologers/workspace-copy";

export function AstrologerCredentialForm({ initialStatus }: { initialStatus: string }) {
  const {locale}=useLanguage(),copy=workspaceCopy(locale),lock=useRef(false);
  const [credentialName, setCredentialName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuedYear, setIssuedYear] = useState(new Date().getFullYear());
  const [referenceUrl, setReferenceUrl] = useState("");
  const [message, setMessage] = useState<WorkspaceMessage|null>(null),[review,setReview]=useState(initialStatus),[uncertain,setUncertain]=useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current||uncertain) return;
    lock.current=true;setBusy(true);
    setMessage(null);
    try {
      const r = await secureFetch("/api/astrologer/credentials", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialName, issuer, issuedYear, referenceUrl }),silent:true
      });
      const j = await r.json();
      if(!r.ok){const kind=workspaceFailure(r.status);setMessage(kind);setUncertain(kind==="uncertain"||kind==="conflict");if(kind==="uncertain"||kind==="conflict")setReview("UNKNOWN");return;}
      if(j?.data?.submitted!==true||j.data.reviewStatus!=="PENDING")throw Error("Unconfirmed evidence");
      setReview("PENDING");setMessage("credentialSaved");setCredentialName("");setIssuer("");setReferenceUrl("");
    } catch {setMessage("uncertain");setUncertain(true);setReview("UNKNOWN");}
    finally {lock.current=false;setBusy(false);}
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3 rounded-xl border border-[#D4AF37]/20 p-5">
      <h2 className="font-cinzel text-lg font-bold">{copy.credentialTitle}</h2>
      <p className="text-sm naksh-muted-text">
        {copy.currentReview}: {["PENDING","DOCUMENTS_REVIEWED","REJECTED"].includes(review)?copy[review as WorkspaceMessage]:copy.unknown}. {copy.credentialHelp}
      </p>
      <fieldset disabled={busy||uncertain} className="space-y-3"><label className="grid gap-1 text-sm">{copy.credentialName}
        <Input required minLength={4} maxLength={120} value={credentialName} onChange={(e) => setCredentialName(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">{copy.issuer}
        <Input required minLength={3} maxLength={120} value={issuer} onChange={(e) => setIssuer(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">{copy.issuedYear}
        <Input type="number" required min={1950} max={2026} value={issuedYear} onChange={(e) => setIssuedYear(Number(e.target.value))} />
      </label>
      <label className="grid gap-1 text-sm">{copy.referenceUrl}
        <Input type="url" required maxLength={500} value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} placeholder="https://issuer.example/credential/reference" />
      </label>
      <Button type="submit">{busy ? copy.saving : copy.credentialSave}</Button></fieldset>
      {uncertain?<Button type="button" variant="outline" onClick={()=>window.location.reload()}>{copy.refresh}</Button>:null}
      {message ? <p role={message==="credentialSaved"?"status":"alert"} className="text-sm naksh-muted-text">{copy[message]}</p> : null}
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";

export function AstrologerCredentialForm({ initialStatus }: { initialStatus: string }) {
  const [credentialName, setCredentialName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuedYear, setIssuedYear] = useState(new Date().getFullYear());
  const [referenceUrl, setReferenceUrl] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const r = await secureFetch("/api/astrologer/credentials", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialName, issuer, issuedYear, referenceUrl })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Could not submit evidence");
      setMessage("Reference saved for independent administrator review. No verification badge is issued yet.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Submission failed");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3 rounded-xl border border-[#D4AF37]/20 p-5">
      <h2 className="font-cinzel text-lg font-bold">Professional document review</h2>
      <p className="text-sm naksh-muted-text">
        Current review: {initialStatus}. Submit a publicly accessible professional certificate
        reference. Do not upload Aadhaar, PAN, addresses or private identity documents.
        A staff review is distinct from third-party accreditation.
      </p>
      <label className="grid gap-1 text-sm">Certificate or qualification
        <Input required minLength={4} maxLength={120} value={credentialName} onChange={(e) => setCredentialName(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">Issuing organization
        <Input required minLength={3} maxLength={120} value={issuer} onChange={(e) => setIssuer(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">Year issued
        <Input type="number" required min={1950} max={2026} value={issuedYear} onChange={(e) => setIssuedYear(Number(e.target.value))} />
      </label>
      <label className="grid gap-1 text-sm">Public HTTPS reference
        <Input type="url" required maxLength={500} value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} placeholder="https://issuer.example/credential/reference" />
      </label>
      <Button type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit for review"}</Button>
      {message ? <p role="status" className="text-sm naksh-muted-text">{message}</p> : null}
    </form>
  );
}

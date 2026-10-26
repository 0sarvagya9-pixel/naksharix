"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";

export function AdminCredentialReview({ profileId, status }: { profileId: string; status: string }) {
  const [decision, setDecision] = useState<"DOCUMENTS_REVIEWED" | "REJECTED">("DOCUMENTS_REVIEWED");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const r = await secureFetch("/api/admin/astrologers/credentials", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, decision, note: note.trim() })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Review failed");
      setMessage("Document review decision recorded. Refresh to see updated status.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review failed");
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} className="space-y-2 rounded-lg border border-[#D4AF37]/20 p-3">
      <p className="text-xs naksh-muted-text">Document review: {status}</p>
      <select value={decision} onChange={(e) => setDecision(e.target.value as typeof decision)}
        className="h-9 rounded-md border border-[#263957] bg-[#02112C] p-2 text-xs">
        <option value="DOCUMENTS_REVIEWED">Documents reviewed</option>
        <option value="REJECTED">Reject documentation</option>
      </select>
      <Input required value={note} minLength={5} maxLength={300}
        onChange={(e) => setNote(e.target.value)} placeholder="Private evidence review note" />
      <Button type="submit" size="sm" disabled={busy || note.trim().length < 5}>
        {busy ? "Recording..." : "Record decision"}
      </Button>
      {message ? <p role="status" className="text-xs naksh-muted-text">{message}</p> : null}
    </form>
  );
}

"use client";

import { useRef,useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";

type Message = { author: string; text: string; at: string };
type Props = { ticketId: string; messages: unknown; status: string; admin?: boolean; onSent: () => Promise<void> };

function normalizeMessages(value: unknown): Message[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Message =>
    Boolean(item) && typeof item === "object" &&
    typeof item.author === "string" && typeof item.text === "string" &&
    typeof item.at === "string"
  );
}

export function SupportConversation({ ticketId, messages, status, admin = false, onSent }: Props) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const inFlight=useRef(false);
  const pending=useRef<{id:string;ticketId:string;message:string}|null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const thread = normalizeMessages(messages);
  const closed = status === "CLOSED" || status === "RESOLVED";

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || closed) return;
    inFlight.current=true;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const message=draft.trim();
      if(pending.current&&(pending.current.ticketId!==ticketId||pending.current.message!==message)){
        setError("A previous reply is not confirmed. Restore its original text and retry before sending a different reply.");
        return;
      }
      const intent=pending.current??{id:crypto.randomUUID(),ticketId,message};
      pending.current=intent;
      const response = await secureFetch(admin ? "/api/admin/support/reply" : "/api/support/tickets/reply", {
        method: "POST",silent:true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ticketId,message,clientMutationId:intent.id})
      });
      const result = await response.json();
      if (!response.ok){
        if(response.status===422||response.status===401||response.status===403||response.status===404)pending.current=null;
        throw new Error(result.error||"Reply could not be sent.");
      }
      if(result.data?.recorded!==true||result.data?.clientMutationId!==intent.id||typeof result.data?.duplicate!=="boolean")throw Error("Reply confirmation is incomplete. Retry the unchanged text.");
      pending.current=null;
      setDraft("");
      // We report only provider acceptance, never claim recipient inbox delivery.
      if (admin) setNotice(result.data?.notification === "provider_accepted"
        ? "Reply saved. Email provider accepted a customer notification; inbox delivery is not confirmed."
        : "Reply saved in the private customer support desk. Email notification was not confirmed.");
      if(!admin)setNotice("Reply recorded.");
      try{await onSent();}catch{setError("Reply recorded, but the conversation could not refresh. Refresh this page.");}
    } catch (cause) {
      setError((cause instanceof Error ? cause.message : "Reply could not be sent.")+(pending.current?" Check the conversation before retrying unchanged text.":""));
    } finally {
      inFlight.current=false;
      setSending(false);
    }
  }

  return (
    <div className="mt-4 space-y-3" aria-label="Support conversation">
      <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-[#263957] p-3">
        {thread.map((entry, index) => (
          <div key={index} className="rounded-lg bg-[#02112C]/80 p-3 text-sm">
            <p className="mb-1 text-xs font-semibold text-[#FFD700]">{entry.author === "ADMIN" ? "Naksharix Support" : "Customer"}</p>
            <p className="whitespace-pre-wrap break-words">{entry.text}</p>
            <p className="mt-1 text-xs naksh-muted-text">{new Date(entry.at).toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>
      {closed ? <p className="text-sm naksh-muted-text">Ticket resolved or closed; reopen before replying.</p> : (
        <form onSubmit={send} className="space-y-2">
          <label className="block text-sm">
            <span>Reply to this ticket</span>
            <textarea aria-label="Support reply" required minLength={2} maxLength={1200} rows={3}
              value={draft} disabled={sending} onChange={(event) => setDraft(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#263957] bg-[#02112C] p-3 text-white"
              placeholder="Reply without passwords, OTPs or card details." />
          </label>
          <Button type="submit" disabled={sending || draft.trim().length < 2}>
            {sending ? "Sending..." : "Send reply"}
          </Button>
          {error&&pending.current?<Button type="button" variant="outline" disabled={sending} onClick={()=>setDraft(pending.current?.message??draft)}>Restore unconfirmed reply</Button>:null}
          {notice ? <p role="status" className="text-sm text-[#b8f1d2]">{notice}</p> : null}
          {error ? <p role="alert" className="text-sm text-[#fda4af]">{error}</p> : null}
        </form>
      )}
    </div>
  );
}

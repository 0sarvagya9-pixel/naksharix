"use client";

import { useState, type FormEvent } from "react";
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
  const [error, setError] = useState("");
  const thread = normalizeMessages(messages);
  const closed = status === "CLOSED" || status === "RESOLVED";

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || closed) return;
    setSending(true);
    setError("");
    try {
      const response = await secureFetch(admin ? "/api/admin/support/reply" : "/api/support/tickets/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId, message: draft.trim(), clientMutationId: crypto.randomUUID()
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Reply could not be sent.");
      setDraft("");
      await onSent();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Reply could not be sent.");
    } finally {
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
              value={draft} onChange={(event) => setDraft(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#263957] bg-[#02112C] p-3 text-white"
              placeholder="Reply without passwords, OTPs or card details." />
          </label>
          <Button type="submit" disabled={sending || draft.trim().length < 2}>
            {sending ? "Sending..." : "Send reply"}
          </Button>
          {error ? <p role="alert" className="text-sm text-[#fda4af]">{error}</p> : null}
        </form>
      )}
    </div>
  );
}

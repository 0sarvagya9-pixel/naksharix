"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { secureFetch } from "@/lib/security/csrf";
import { SupportConversation } from "@/components/support-conversation";
import { useLanguage } from "@/components/language-provider";
import { supportCopy, supportDate, supportFailure, supportState, type SupportCopyKey } from "@/lib/support/ui-copy";
import { readSupportTickets, supportPriorities, supportReviewRecorded, supportStatuses, type SupportTicket } from "@/lib/support/client-response";

type Draft = { status: string; priority: string };
export function AdminSupportContent() {
  const { locale } = useLanguage(), copy = supportCopy(locale);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true), [known, setKnown] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const inFlight = useRef(false), active = useRef(true), loadSequence = useRef(0);
  const [error, setError] = useState<SupportCopyKey | "">("");
  const [notice, setNotice] = useState<SupportCopyKey | "">("");

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    const sequence = ++loadSequence.current;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/support", { cache: "no-store" });
      const result: unknown = await response.json();
      const items = readSupportTickets(result, true);
      if (!response.ok || !items) throw Error("Unverified support list");
      if (active.current && sequence === loadSequence.current) {
        setTickets(items); setDrafts({}); setKnown(true); setUncertain(false); setError("");
      }
    } catch (cause) {
      if (active.current && sequence === loadSequence.current) { setKnown(false); setError("unavailable"); }
      throw cause;
    } finally { if (active.current && sequence === loadSequence.current) setLoading(false); }
  }, []);
  useEffect(() => {
    active.current = true; void refresh().catch(() => undefined);
    return () => { active.current = false; };
  }, [refresh]);

  function edit(ticket: SupportTicket, patch: Partial<Draft>) {
    setDrafts(existing => ({ ...existing, [ticket.id]: { ...(existing[ticket.id] ?? { status: ticket.status, priority: ticket.priority }), ...patch } }));
  }
  async function save(ticket: SupportTicket) {
    if (inFlight.current || uncertain || !known) return;
    inFlight.current = true;
    loadSequence.current++; setLoading(false);
    const draft = drafts[ticket.id] ?? ticket;
    const expected = { id: ticket.id, status: draft.status, priority: draft.priority };
    setSavingId(ticket.id); setError(""); setNotice("");
    let failure: SupportCopyKey = "unconfirmed";
    try {
      const response = await secureFetch("/api/admin/support", {
        method: "PATCH", silent: true, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: expected.id, status: expected.status, priority: expected.priority })
      });
      const result: unknown = await response.json();
      if (!response.ok) { failure = supportFailure(response.status); throw Error("Review not acknowledged"); }
      if (!supportReviewRecorded(result, expected)) throw Error("Unmatched support review");
      setTickets(previous => previous.map(row => row.id === expected.id ? { ...row, status: expected.status, priority: expected.priority } : row));
      setDrafts(previous => { const next = { ...previous }; delete next[expected.id]; return next; });
      setNotice("reviewSaved");
    } catch { setError(failure); setUncertain(true); }
    finally { inFlight.current = false; setSavingId(""); }
  }

  return <main className="star-field"><Section>
    <div className="flex flex-wrap items-start justify-between gap-4"><div>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{copy.adminEyebrow}</p>
      <h1 className="mt-3 font-cinzel text-4xl font-black">{copy.adminTitle}</h1>
      <p className="mt-3 naksh-muted-text">{copy.adminIntro}</p>
    </div><Button variant="outline" asChild><Link href="/admin">{copy.backAdmin}</Link></Button></div>
    <Button className="mt-5" type="button" variant="outline" disabled={loading || !!savingId} onClick={() => void refresh().catch(() => undefined)}>{loading ? copy.refreshing : copy.refresh}</Button>
    {loading ? <p role="status" className="mt-8 naksh-muted-text">{copy.loading}</p> : null}
    {error ? <p role="alert" className="mt-6 text-sm text-[#fda4af]">{copy[error]}</p> : null}
    {notice ? <p role="status" className="mt-6 text-sm text-[#00f5a0]">{copy[notice]}</p> : null}
    <div className="mt-8 space-y-4">{tickets.map(ticket => {
      const draft = drafts[ticket.id] ?? ticket;
      return <Card key={ticket.id} className="glass"><CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-3">
        <span>{ticket.subject}</span><span className="text-sm text-[#FFD700]">{ticket.user?.name || ticket.user?.email}</span>
      </CardTitle></CardHeader><CardContent>
        <p className="text-sm" data-saved-support-status>{copy.status}: {supportState(ticket.status, locale)} · {copy.priority}: {supportState(ticket.priority, locale)}</p>
        <SupportConversation ticketId={ticket.id} messages={ticket.messages} status={ticket.status} admin onSent={refresh} />
        <fieldset disabled={!!savingId || uncertain || !known} className="mt-4 flex flex-wrap items-end gap-4">
          <label className="grid gap-2 text-sm"><span>{copy.status}</span><select aria-label={copy.status + " — " + ticket.subject} value={draft.status} onChange={event => edit(ticket, { status: event.target.value })} className="h-10 rounded-md border border-[#263957] bg-[#02112C] px-3 text-white">
            {supportStatuses.map(value => <option key={value} value={value}>{supportState(value, locale)}</option>)}
          </select></label>
          <label className="grid gap-2 text-sm"><span>{copy.priority}</span><select aria-label={copy.priority + " — " + ticket.subject} value={draft.priority} onChange={event => edit(ticket, { priority: event.target.value })} className="h-10 rounded-md border border-[#263957] bg-[#02112C] px-3 text-white">
            {supportPriorities.map(value => <option key={value} value={value}>{supportState(value, locale)}</option>)}
          </select></label>
          <Button type="button" onClick={() => void save(ticket)}>{savingId === ticket.id ? copy.saving : copy.save}</Button>
        </fieldset>
        <p className="mt-3 text-xs naksh-muted-text">{copy.created} {supportDate(ticket.createdAt, locale)}</p>
      </CardContent></Card>;
    })}{known && !loading && tickets.length === 0 ? <p className="rounded-xl border border-[#263957] p-6 naksh-muted-text">{copy.emptyAdmin}</p> : null}</div>
  </Section></main>;
}

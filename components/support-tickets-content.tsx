"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";
import { SupportConversation } from "@/components/support-conversation";
import { useLanguage } from "@/components/language-provider";
import { supportCopy, supportDate, supportFailure, supportState, type SupportCopyKey } from "@/lib/support/ui-copy";
import { createdSupportTicket, readSupportTickets, type SupportTicket } from "@/lib/support/client-response";

type Ticket = SupportTicket;

export function SupportTicketsContent({ initialSubject = "" }: { initialSubject?: string }) {
  const { locale } = useLanguage();
  const copy = supportCopy(locale);
  const [known, setKnown] = useState(false);
  const active = useRef(true), loadSequence = useRef(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight=useRef(false);
  const pending=useRef<{id:string;subject:string;message:string}|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<SupportCopyKey | "">("");
  const [notice, setNotice] = useState<SupportCopyKey | "">("");

  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);
    try {
      const response = await fetch("/api/support/tickets", { cache: "no-store" });
      const result: unknown = await response.json();
      const items = readSupportTickets(result);
      if (!response.ok || !items) throw Error("Unverified support list");
      if (active.current && sequence === loadSequence.current) { setTickets(items); setKnown(true); setError(pending.current ? "originalRequest" : ""); }
    } catch (error) {
      if (active.current && sequence === loadSequence.current) { setKnown(false); setError("unavailable"); }
      throw error;
    } finally { if (active.current && sequence === loadSequence.current) setLoading(false); }
  }, []);

  useEffect(() => {
    active.current = true;
    void load().catch(() => undefined);
    return () => { active.current = false; };
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current=true;
    loadSequence.current++; setLoading(false);
    setBusy(true);
    setError("");
    setNotice("");
    let failure: SupportCopyKey = "unconfirmed";
    try {
      const details={subject:subject.trim(),message:message.trim()};
      // Keep the same intent if a response is lost. Never automatically resend.
      if(pending.current&&(pending.current.subject!==details.subject||pending.current.message!==details.message)){
        setError("originalRequest");
        return;
      }
      const intent=pending.current??{id:crypto.randomUUID(),...details};
      pending.current=intent;
      const response = await secureFetch("/api/support/tickets", {
        method: "POST", headers: { "Content-Type": "application/json" },silent:true,
        body: JSON.stringify({...details,clientMutationId:intent.id})
      });
      const result = await response.json();
      if(!response.ok){
        if(response.status===422||response.status===401||response.status===403)pending.current=null;
        failure = supportFailure(response.status);
        throw new Error("Request not acknowledged");
      }
      if (!createdSupportTicket(result, intent)) throw Error("Unmatched support acknowledgement");
      pending.current=null;
      setSubject("");
      setMessage("");
      setNotice("recorded");
      try{await load();}catch{setError("savedRefreshFailed");}
    } catch {
      setError(failure);
    } finally {
      inFlight.current=false;
      setBusy(false);
    }
  }

  return (
    <main className="star-field">
      <Section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{copy.customerEyebrow}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">{copy.customerTitle}</h1>
            <p className="mt-3 max-w-3xl naksh-muted-text">{copy.customerIntro}</p>
          </div>
          <Button variant="outline" asChild><Link href="/dashboard">{copy.backDashboard}</Link></Button>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <Card className="glass">
            <CardHeader><CardTitle>{copy.newRequest}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <label className="block space-y-2 text-sm">
                  <span>{copy.subject}</span>
                  <Input aria-label={copy.subject} required minLength={5} maxLength={140} value={subject} disabled={busy} onChange={(event) => setSubject(event.target.value)} placeholder={copy.subjectHint} />
                </label>
                <label className="block space-y-2 text-sm">
                  <span>{copy.details}</span>
                  <textarea aria-label={copy.details} required minLength={10} maxLength={2000} rows={6} value={message} disabled={busy} onChange={(event) => setMessage(event.target.value)} className="w-full rounded-lg border border-[#263957] bg-[#02112C] p-3 text-white" placeholder={copy.detailsHint}/>
                </label>
                <Button type="submit" disabled={busy}>{busy ? copy.submitting : copy.submit}</Button>
                {error&&pending.current?<Button type="button" variant="outline" disabled={busy} onClick={()=>{setSubject(pending.current?.subject??subject);setMessage(pending.current?.message??message);}}>{copy.restoreDetails}</Button>:null}
                {notice ? <p role="status" className="text-sm text-[#00f5a0]">{copy[notice]}</p> : null}
                {error ? <p role="alert" className="text-sm text-[#fda4af]">{copy[error]}</p> : null}
              </form>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader><CardTitle>{copy.requests}</CardTitle><Button type="button" variant="outline" disabled={busy || loading} onClick={() => void load().catch(() => undefined)}>{loading ? copy.refreshing : copy.refresh}</Button></CardHeader>
            <CardContent className="space-y-4">
              {loading ? <p role="status" className="text-sm naksh-muted-text">{copy.loading}</p> : null}
              {known && !loading && tickets.length === 0 ? <p className="text-sm naksh-muted-text">{copy.emptyCustomer}</p> : null}
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border border-[#263957] bg-[#061D3C]/75 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold">{ticket.subject}</h2>
                    <span className="text-xs font-semibold text-[#FFD700]">{supportState(ticket.status, locale)}</span>
                  </div>
                  <SupportConversation ticketId={ticket.id} messages={ticket.messages} status={ticket.status} onSent={load} />
                  <p className="mt-3 text-xs naksh-muted-text">{copy.created} {supportDate(ticket.createdAt, locale, false)} · {copy.priority}: {supportState(ticket.priority, locale)}</p>
                </div>
              ))}
              <p className="text-xs naksh-muted-text">{copy.privacy}</p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </main>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  messages: unknown;
};

function firstMessage(messages: unknown) {
  if (!Array.isArray(messages)) return "";
  const first = messages[0] as { text?: unknown } | undefined;
  return typeof first?.text === "string" ? first.text : "";
}

export function SupportTicketsContent() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/support/tickets", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Support requests could not be loaded.");
    setTickets(result.data?.tickets ?? []);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/support/tickets", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to fetch tickets.");
        return result.data?.tickets ?? [];
      })
      .then((items: Ticket[]) => { if (active) setTickets(items); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Loading failed."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await secureFetch("/api/support/tickets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request could not be submitted.");
      setSubject("");
      setMessage("");
      setNotice("Your support request has been recorded.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Support request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="star-field">
      <Section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Customer Support</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">Support Centre</h1>
            <p className="mt-3 max-w-3xl naksh-muted-text">Submit a private support request and track its current status.</p>
          </div>
          <Button variant="outline" asChild><Link href="/dashboard">Back to dashboard</Link></Button>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <Card className="glass">
            <CardHeader><CardTitle>New support request</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <label className="block space-y-2 text-sm">
                  <span>Subject</span>
                  <Input required minLength={5} maxLength={140} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What do you need help with?" />
                </label>
                <label className="block space-y-2 text-sm">
                  <span>Details</span>
                  <textarea required minLength={10} maxLength={2000} rows={6} value={message} onChange={(event) => setMessage(event.target.value)} className="w-full rounded-lg border border-[#263957] bg-[#02112C] p-3 text-white" placeholder="Describe the issue without sharing passwords or payment credentials."/>
                </label>
                <Button type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit support request"}</Button>
                {notice ? <p role="status" className="text-sm text-[#00f5a0]">{notice}</p> : null}
                {error ? <p role="alert" className="text-sm text-[#fda4af]">{error}</p> : null}
              </form>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader><CardTitle>Your requests</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {loading ? <p role="status" className="text-sm naksh-muted-text">Loading support requests...</p> : null}
              {!loading && tickets.length === 0 ? <p className="text-sm naksh-muted-text">You have no support requests.</p> : null}
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border border-[#263957] bg-[#061D3C]/75 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold">{ticket.subject}</h2>
                    <span className="text-xs font-semibold text-[#FFD700]">{ticket.status}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm naksh-muted-text">{firstMessage(ticket.messages)}</p>
                  <p className="mt-3 text-xs naksh-muted-text">Created {new Date(ticket.createdAt).toLocaleDateString("en-IN")} · Priority: {ticket.priority}</p>
                </div>
              ))}
              <p className="text-xs naksh-muted-text">Support tickets are visible only to your account and authorized staff. Never include passwords, OTPs or card details.</p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </main>
  );
}

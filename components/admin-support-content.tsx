"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { secureFetch } from "@/lib/security/csrf";

type Ticket = {
  id: string; subject: string; status: string; priority: string;
  createdAt: string; messages: unknown;
  user: { id: string; email: string; name: string | null };
};
const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const priorityOptions = ["LOW", "NORMAL", "HIGH"] as const;

function summary(messages: unknown) {
  if (!Array.isArray(messages)) return "";
  const entry = messages[0] as { text?: unknown } | undefined;
  return typeof entry?.text === "string" ? entry.text : "";
}

export function AdminSupportContent() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/support", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Support desk is unavailable.");
        return result.data?.tickets ?? [];
      })
      .then((items: Ticket[]) => { if (active) setTickets(items); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load tickets."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function edit(id: string, patch: Partial<Ticket>) {
    setTickets((existing) => existing.map((ticket) => ticket.id === id ? { ...ticket, ...patch } : ticket));
  }

  async function save(ticket: Ticket) {
    if (savingId) return;
    setSavingId(ticket.id);
    setError("");
    setNotice("");
    try {
      const response = await secureFetch("/api/admin/support", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id, status: ticket.status, priority: ticket.priority })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update ticket.");
      setNotice("Support ticket status saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Update failed.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <main className="star-field">
      <Section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Admin Operations</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">Support Desk</h1>
            <p className="mt-3 naksh-muted-text">Review customer requests and update their priority and status.</p>
          </div>
          <Button variant="outline" asChild><Link href="/admin">Back to Admin</Link></Button>
        </div>
        {loading ? <p role="status" className="mt-8 naksh-muted-text">Loading support tickets...</p> : null}
        {error ? <p role="alert" className="mt-6 text-sm text-[#fda4af]">{error}</p> : null}
        {notice ? <p role="status" className="mt-6 text-sm text-[#00f5a0]">{notice}</p> : null}
        <div className="mt-8 space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="glass">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-3">
                  <span>{ticket.subject}</span>
                  <span className="text-sm text-[#FFD700]">{ticket.user.name || ticket.user.email}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap break-words text-sm naksh-muted-text">{summary(ticket.messages)}</p>
                <div className="mt-4 flex flex-wrap items-end gap-4">
                  <label className="grid gap-2 text-sm">
                    <span>Status</span>
                    <select aria-label={"Status for " + ticket.subject} value={ticket.status}
                      onChange={(event) => edit(ticket.id, { status: event.target.value })}
                      className="h-10 rounded-md border border-[#263957] bg-[#02112C] px-3 text-white">
                      {statusOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span>Priority</span>
                    <select aria-label={"Priority for " + ticket.subject} value={ticket.priority}
                      onChange={(event) => edit(ticket.id, { priority: event.target.value })}
                      className="h-10 rounded-md border border-[#263957] bg-[#02112C] px-3 text-white">
                      {priorityOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <Button type="button" disabled={Boolean(savingId)} onClick={() => void save(ticket)}>
                    {savingId === ticket.id ? "Saving..." : "Save"}
                  </Button>
                </div>
                <p className="mt-3 text-xs naksh-muted-text">Created {new Date(ticket.createdAt).toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          ))}
          {!loading && tickets.length === 0 ? (
            <p className="rounded-xl border border-[#263957] p-6 naksh-muted-text">There are no support requests yet.</p>
          ) : null}
        </div>
      </Section>
    </main>
  );
}

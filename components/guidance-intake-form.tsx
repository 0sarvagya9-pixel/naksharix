"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";

type Kind = "WRITTEN_GUIDANCE" | "PUJA_ENQUIRY";
const topics = [
  { value: "CAREER", label: "Career and important decisions" },
  { value: "RELATIONSHIPS", label: "Relationships" },
  { value: "FAMILY", label: "Family" },
  { value: "SPIRITUAL_PRACTICE", label: "Spiritual practice" },
  { value: "GENERAL", label: "General enquiry" }
] as const;

export function GuidanceIntakeForm({ kind, availablePartners = [] }: { kind: Kind; availablePartners?: { id: string; name: string; region: string }[] }) {
  const [partnerId, setPartnerId] = useState("");
  const [topic, setTopic] = useState<(typeof topics)[number]["value"]>("GENERAL");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      const response = await secureFetch("/api/guidance-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, topic, message: message.trim(), ...(kind === "PUJA_ENQUIRY" && partnerId ? { partnerId } : {}) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request could not be recorded.");
      if (!result.data?.ticket?.id) throw new Error("A ticket identifier was not returned.");
      setTicketId(result.data.ticket.id);
      setMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Request failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#061D3C]/80 p-5 sm:p-7">
      {ticketId ? (
        <div role="status" className="space-y-3">
          <h2 className="font-cinzel text-xl font-bold">Your request was recorded</h2>
          <p className="text-sm naksh-muted-text">Reference: <code className="break-all">{ticketId}</code></p>
          <p className="text-sm naksh-muted-text">
            The support team can review the request and respond in your private Support Centre.
            No astrologer or temple partner has been assigned, and no delivery time is promised.
          </p>
          <Button asChild><Link href="/support">Track request and replies</Link></Button>
          <button type="button" onClick={() => setTicketId("")}
            className="block text-sm font-semibold text-[#FFD700] underline">
            Submit another request
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span>Enquiry topic</span>
            <select value={topic} onChange={(event) => setTopic(event.target.value as typeof topic)}
              className="w-full rounded-lg border border-[#263957] bg-[#02112C] p-3 text-white">
              {topics.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          {kind === "PUJA_ENQUIRY" && availablePartners.length ? (
            <label className="block space-y-2 text-sm">
              <span>Partner to ask about (optional, enquiry only)</span>
              <select value={partnerId} onChange={(event) => setPartnerId(event.target.value)}
                className="w-full rounded-lg border border-[#263957] bg-[#02112C] p-3 text-white">
                <option value="">General request — no partner assigned</option>
                {availablePartners.map((partner) => <option key={partner.id} value={partner.id}>
                  {partner.name} · {partner.region}
                </option>)}
              </select>
            </label>
          ) : null}
          <label className="block space-y-2 text-sm">
            <span>Your question or request</span>
            <textarea required minLength={20} maxLength={1200} rows={7}
              value={message} onChange={(event) => setMessage(event.target.value)}
              className="w-full rounded-lg border border-[#263957] bg-[#02112C] p-3 text-white"
              placeholder={kind === "WRITTEN_GUIDANCE"
                ? "Describe one question and what kind of guidance you are seeking."
                : "Describe the tradition or ceremony you want to learn about. This is an enquiry only."} />
            <span className="block text-xs naksh-muted-text">
              {message.length}/1200 characters. Avoid submitting passwords, OTPs, precise birth details,
              medical records, card details or other sensitive information.
            </span>
          </label>
          <Button type="submit" disabled={saving || message.trim().length < 20}>
            {saving ? "Recording request..." : "Submit private enquiry"}
          </Button>
          {error ? <p role="alert" className="text-sm text-[#fda4af]">{error}</p> : null}
          <p className="text-xs leading-6 naksh-muted-text">
            This form creates a customer-support request for review, not a confirmed consultation,
            personalized astrological answer, verified puja booking, or payment order.
          </p>
        </form>
      )}
    </div>
  );
}

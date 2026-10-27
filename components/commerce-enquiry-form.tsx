"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";

export type EnquiryOption = { id: string; label: string; note: string };

export function CommerceEnquiryForm({
  kind, options, initialItem
}: { kind: "SHOP" | "PUJA"; options: EnquiryOption[]; initialItem: string }) {
  const [itemId, setItemId] = useState(options.find(o => o.id === initialItem)?.id ?? options[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [issue, setIssue] = useState("");
  const [ticketId, setTicketId] = useState("");

  const current = options.find(o => o.id === itemId);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || !current) return;
    setIssue("");
    setSending(true);
    try {
      const body = kind === "SHOP" ?
        { kind, itemId: current.id, quantity: Number(quantity), message: message.trim() } :
        { kind, itemId: current.id, city: city.trim(), message: message.trim() };
      const response = await secureFetch("/api/commerce/enquiries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Enquiry could not be submitted.");
      const id = payload.data?.ticket?.id;
      if (typeof id !== "string") throw new Error("Support ticket was not confirmed.");
      setTicketId(id);
    } catch (error) {
      setIssue(error instanceof Error ? error.message : "Request failed.");
    } finally { setSending(false); }
  }

  if (ticketId) return (
    <div role="status" className="rounded-2xl border border-emerald-500/30 bg-[#061D3C]/80 p-6">
      <h2 className="font-cinzel text-2xl font-bold text-[#FFD700]">Enquiry recorded</h2>
      <p className="mt-3 text-sm leading-7 text-[#a8b3c7]">Your support ticket is open. This is not a confirmed purchase or Puja booking, and no payment was requested.</p>
      <p className="mt-2 break-all text-sm text-white">Ticket ID: {ticketId}</p>
      <Button asChild className="mt-5"><Link href="/support">Open your support tickets</Link></Button>
    </div>
  );
  if (!options.length) return <p className="rounded-xl border p-5 text-sm">No reviewed items are currently available for this enquiry.</p>;
  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-[#D4AF37]/25 bg-[#061D3C]/75 p-6">
      <label className="block text-sm font-semibold">
        {kind === "SHOP" ? "Catalogue item" : "Upcoming Puja / observance"}
        <select required value={itemId} onChange={e => setItemId(e.target.value)}
          className="mt-2 w-full rounded-lg border border-[#D4AF37]/25 bg-[#02112c] px-3 py-3 text-white">
          {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </label>
      <p className="text-sm text-[#a8b3c7]">{current?.note}</p>
      {kind === "SHOP" ?
        <label className="block text-sm">Quantity (1–10)
          <Input type="number" min={1} max={10} step={1} required value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-2" />
        </label> :
        <label className="block text-sm">City for local Panchang/temple review
          <Input required minLength={2} maxLength={90} value={city} onChange={e => setCity(e.target.value)} className="mt-2" placeholder="Your city" />
        </label>
      }
      <label className="block text-sm">Your enquiry (10–1200 characters)
        <textarea required minLength={10} maxLength={1200} rows={5}
          value={message} onChange={e => setMessage(e.target.value)}
          className="mt-2 w-full rounded-lg border border-[#D4AF37]/25 bg-[#02112c] px-3 py-3 text-white"
          placeholder={kind === "SHOP" ? "Ask about size, authenticity, stock and delivery..." : "Ask about ceremony requirements and preferred arrangements..."} />
      </label>
      <p className="text-xs leading-6 text-[#a8b3c7]">
        No payment or stock reservation. Availability, pricing, shipping, pandit/temple, dates and local muhurat require manual verification.
      </p>
      {issue && <p role="alert" className="text-sm text-amber-300">{issue}</p>}
      <Button type="submit" disabled={sending || !current} className="w-full">
        {sending ? "Submitting…" : "Submit private enquiry"}
      </Button>
    </form>
  );
}

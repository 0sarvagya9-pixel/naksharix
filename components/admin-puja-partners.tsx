"use client";

import { useEffect, useState, type FormEvent } from "react";
import { secureFetch } from "@/lib/security/csrf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Partner = {
  id: string; name: string; region: string; traditions: string[];
  reviewStatus: string; evidenceUrl: string | null;
};
export function AdminPujaPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [traditions, setTraditions] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const r = await fetch("/api/admin/puja-partners", { cache: "no-store" });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Partner records unavailable");
    setPartners(j.data.partners);
  }
  useEffect(() => {
    let active = true;
    fetch("/api/admin/puja-partners", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Partner registry unavailable");
        return j.data.partners as Partner[];
      })
      .then((list) => { if (active) setPartners(list); })
      .catch((error) => { if (active) setMessage(String(error)); });
    return () => { active = false; };
  }, []);
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    setBusy(true); setMessage("");
    try {
      const r = await secureFetch("/api/admin/puja-partners", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, region,
          traditions: traditions.split(",").map((s) => s.trim()).filter(Boolean),
          evidenceUrl: evidenceUrl || undefined
        })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Partner could not be added");
      setName(""); setRegion(""); setTraditions(""); setEvidenceUrl("");
      setMessage("Partner saved as PENDING. No public promise was made.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Partner creation failed");
    } finally { setBusy(false); }
  }
  async function review(partnerId: string, decision: "VERIFIED" | "REJECTED" | "SUSPENDED") {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const r = await secureFetch("/api/admin/puja-partners", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, decision, note: reviewNote.trim() })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Review could not be saved");
      setMessage("Partner review recorded. Public catalogue filters by VERIFIED status.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review failed");
    } finally { setBusy(false); }
  }
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <form onSubmit={create} className="space-y-3 rounded-2xl border border-[#D4AF37]/20 p-5">
        <h2 className="font-cinzel text-xl font-bold">Register partner for independent review</h2>
        <label className="grid gap-1 text-sm">Legal/public-facing name
          <Input required minLength={3} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">Service region
          <Input required minLength={3} maxLength={100} value={region} onChange={(e) => setRegion(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">Traditions (comma-separated)
          <Input required value={traditions} onChange={(e) => setTraditions(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">Public HTTPS verification evidence
          <Input type="url" maxLength={500} value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} />
        </label>
        <Button type="submit" disabled={busy}>Create pending partner</Button>
      </form>
      <div className="space-y-3">
        <h2 className="font-cinzel text-xl font-bold">Manual review queue</h2>
        <label className="grid gap-1 text-sm">Private review explanation
          <Input required minLength={5} maxLength={300} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
        </label>
        {partners.map((partner) => (
          <div key={partner.id} className="space-y-2 rounded-2xl border border-[#D4AF37]/20 p-4 text-sm">
            <h3 className="font-bold">{partner.name} · {partner.region}</h3>
            <p className="naksh-muted-text">{partner.traditions.join(", ")} · {partner.reviewStatus}</p>
            {partner.evidenceUrl ? <a target="_blank" rel="noopener noreferrer"
              href={partner.evidenceUrl} className="text-[#FFD700] underline">Examine partner evidence</a> :
              <p className="text-xs naksh-muted-text">No evidence; approval will be refused.</p>}
            <div className="flex flex-wrap gap-2">
              {(["VERIFIED", "REJECTED", "SUSPENDED"] as const).map((decision) => (
                <Button key={decision} type="button" size="sm" variant="outline"
                  disabled={busy || reviewNote.trim().length < 5}
                  onClick={() => void review(partner.id, decision)}>{decision}</Button>
              ))}
            </div>
          </div>
        ))}
        {!partners.length ? <p className="text-sm naksh-muted-text">No puja partners have been registered.</p> : null}
        {message ? <p role="status" className="text-sm naksh-muted-text">{message}</p> : null}
      </div>
    </div>
  );
}

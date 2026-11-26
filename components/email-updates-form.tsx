"use client";
import { useState, type FormEvent } from "react";
import { secureFetch } from "@/lib/security/csrf";
import { marketingInterests, marketingConsentText } from "@/lib/marketing-consent";

type Props = { eligible: boolean; initialSubscribed: boolean; initialInterest: string; initialCountry: string; initialLocale: string };
export function EmailUpdatesForm({ eligible, initialSubscribed, initialInterest, initialCountry, initialLocale }: Props) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [interest, setInterest] = useState(initialInterest);
  const [country, setCountry] = useState(initialCountry);
  const [locale, setLocale] = useState(initialLocale);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(action: "subscribe" | "unsubscribe") {
    if (busy || (action === "subscribe" && (!eligible || !consent || !interest))) return;
    setBusy(true); setMessage("");
    try {
      const response = await secureFetch("/api/marketing-consent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "unsubscribe" ? { action } : { action, consent, interest, country, locale }) });
      const result = await response.json();
      if (!response.ok || typeof result.data?.subscribed !== "boolean") { setMessage("Your preference was not saved. Please try again."); return; }
      setSubscribed(result.data.subscribed); setConsent(false);
      setMessage(result.data.subscribed ? "Your optional email permission has been recorded." : "Your website marketing permission has been withdrawn.");
    } catch { setMessage("Your preference could not be confirmed. Please try again."); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void save("subscribe"); }
  return <div className="mt-6 space-y-5 rounded-xl border p-5">
    <p className="font-semibold">{subscribed ? "Your email updates permission is active." : "You are not subscribed to email updates."}</p>
    {eligible && <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-1">Interested in<select className="rounded-md border bg-transparent p-2" value={interest} onChange={e => setInterest(e.target.value)} required><option value="">Choose an interest</option>{marketingInterests.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="grid gap-1">Country (optional)<input className="rounded-md border bg-transparent p-2" value={country} onChange={e => setCountry(e.target.value)} maxLength={70} autoComplete="country-name" /></label>
      <label className="grid gap-1">Email language<select className="rounded-md border bg-transparent p-2" value={locale} onChange={e => setLocale(e.target.value)}><option value="en">English</option><option value="hi">Hindi</option><option value="hinglish">Hinglish</option></select></label>
      <label className="flex items-start gap-3"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required className="mt-1" /><span>{marketingConsentText}</span></label>
      <button type="submit" className="rounded-lg bg-[#725022] px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={busy || !consent || !interest}>{subscribed ? "Save email preferences" : "Subscribe to updates"}</button>
    </form>}
    <button type="button" className="underline text-sm disabled:opacity-50" disabled={busy} onClick={() => void save("unsubscribe")}>Withdraw email permission</button>
    <p role="status" aria-live="polite" className="text-sm">{message}</p>
  </div>;
}

"use client";
import { useRef, useState, type FormEvent } from "react";
import { secureFetch } from "@/lib/security/csrf";
import { marketingInterests, marketingConsentAcknowledged, marketingPreferenceCopy, normalizeMarketingLocale } from "@/lib/marketing-consent";

type Props = { eligible: boolean; initialSubscribed: boolean; initialInterest: string; initialCountry: string; initialLocale: string };
export function EmailUpdatesForm({ eligible, initialSubscribed, initialInterest, initialCountry, initialLocale }: Props) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [interest, setInterest] = useState(initialInterest);
  const [country, setCountry] = useState(initialCountry);
  const [locale, setLocale] = useState(normalizeMarketingLocale(initialLocale));
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [message, setMessage] = useState<"saved" | "withdrawn" | "unconfirmed" | null>(null);
  const lock = useRef(false);
  const copy = marketingPreferenceCopy[locale];
  async function save(action: "subscribe" | "unsubscribe") {
    if (lock.current || (action === "subscribe" && (!eligible || !consent || uncertain || !marketingInterests.some(([id]) => id === interest)))) return;
    lock.current = true;
    setBusy(true); setMessage(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await secureFetch("/api/marketing-consent", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, silent: true,
        body: JSON.stringify(action === "unsubscribe" ? { action } : { action, consent, interest, country, locale })
      });
      const result = await response.json();
      if (!response.ok || !marketingConsentAcknowledged(action, result.data)) throw new Error("Preference acknowledgement unconfirmed");
      setSubscribed(action === "subscribe"); setConsent(false); setUncertain(false);
      setMessage(action === "subscribe" ? "saved" : "withdrawn");
    } catch {
      // The server may have persisted a timed-out mutation. Never assert success
      // or automatically send another opt-in. A deliberate withdrawal is allowed.
      setConsent(false); setUncertain(true); setMessage("unconfirmed");
    } finally {
      clearTimeout(timeout); lock.current = false; setBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void save("subscribe"); }
  return <div className="mt-6 space-y-5 rounded-xl border p-5" lang={locale === "hi" ? "hi" : locale === "hinglish" ? "hi-Latn" : "en"} aria-busy={busy}>
    {!uncertain && <p className="font-semibold">{subscribed ? copy.active : copy.inactive}</p>}
    {eligible && <form onSubmit={submit}>
      <fieldset disabled={busy || uncertain} className="grid gap-4">
        <label className="grid gap-1">{copy.language}<select className="rounded-md border bg-transparent p-2" value={locale} onChange={e => { setLocale(normalizeMarketingLocale(e.target.value)); setConsent(false); }}><option value="en">English</option><option value="hi">हिन्दी</option><option value="hinglish">Hinglish</option></select></label>
        <label className="grid gap-1">{copy.interest}<select className="rounded-md border bg-transparent p-2" value={interest} onChange={e => { setInterest(e.target.value); setConsent(false); }} required><option value="">{copy.choose}</option>{marketingInterests.map(([value], index) => <option key={value} value={value}>{copy.labels[index]}</option>)}</select></label>
        <label className="grid gap-1">{copy.country}<input className="rounded-md border bg-transparent p-2" value={country} onChange={e => { setCountry(e.target.value); setConsent(false); }} maxLength={70} autoComplete="country-name" /></label>
        <label className="flex items-start gap-3"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required className="mt-1" /><span>{copy.consent}</span></label>
        <button type="submit" className="rounded-lg bg-[#725022] px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={busy || uncertain || !consent || !interest}>{busy ? copy.saving : subscribed ? copy.save : copy.subscribe}</button>
      </fieldset>
    </form>}
    <button type="button" className="underline text-sm disabled:opacity-50" disabled={busy} onClick={() => void save("unsubscribe")}>{copy.withdraw}</button>
    {uncertain && <button type="button" className="block underline text-sm" onClick={() => window.location.reload()}>{copy.refresh}</button>}
    <p role="status" aria-live="polite" className="text-sm">{message ? copy[message] : busy ? copy.saving : ""}</p>
  </div>;
}

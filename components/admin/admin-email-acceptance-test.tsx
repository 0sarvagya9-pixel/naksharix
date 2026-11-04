"use client";

import { useState } from "react";
import { secureFetch } from "@/lib/security/csrf";

/** Only explicitly invoked by an authenticated administrator. */
export function AdminEmailAcceptanceTest({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  async function submit(mode: "single" | "suite") {
    if (pending || !enabled) return;
    setPending(true);
    setStatus("");
    try {
      const response = await secureFetch("/api/admin/email-test", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({mode})
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Email provider test failed.");
      if (mode === "suite") {
        const outcomes = payload.data?.outcomes ?? [];
        const accepted = Number(payload.data?.acceptedCount ?? 0);
        const lines = outcomes.map((item: {index:number;category:string;providerAccepted:boolean}) =>
          `#${String(item.index).padStart(2,"0")} ${item.category}: ${item.providerAccepted?"Provider accepted":"Not accepted"}`);
        setStatus(`Production Resend accepted ${accepted}/11 messages for the owner acceptance mailbox.\n${lines.join("\n")}\nInbox/Spam/Promotions receipt must be independently confirmed.`);
      } else {
        if (payload.data?.providerAccepted !== true) throw new Error("No provider acceptance recorded.");
        setStatus("Email provider accepted the test request. Check your configured Admin mailbox and spam folder. This is not proof of delivery.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Email provider test failed.");
    } finally {
      setPending(false);
    }
  }
  return <section className="mt-6 rounded-2xl border border-[#d5bb92] bg-[#231b27] p-5" aria-labelledby="admin-email-test-heading">
    <h2 id="admin-email-test-heading" className="font-cinzel text-lg font-bold text-white">Email acceptance test</h2>
    <p className="mt-2 text-sm leading-6 text-[#e3d5da]">
      Send an individual admin smoke message or a once-daily set of 11 clearly marked templates to the preconfigured owner acceptance mailbox.
      All messages use the real production Resend adapter; no OTP, purchase, Puja, order, or report record is created. Provider acceptance does not prove actual inbox delivery.
    </p>
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="button" disabled={!enabled || pending} onClick={()=>submit("single")}
        className="min-h-11 rounded-lg border border-[#d4ac67] bg-[#6c2f46] px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
        {pending ? "Checking provider..." : "Send single admin test"}
      </button>
      <button type="button" disabled={!enabled || pending} onClick={()=>submit("suite")}
        className="min-h-11 rounded-lg border border-[#d4ac67] bg-[#75452b] px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
        Send 11-category owner inbox tests
      </button>
    </div>
    {!enabled ? <p className="mt-2 text-sm text-[#f4d89d]">Email adapter is not configured as ready.</p> : null}
    {status ? <p role="status" aria-live="polite" className="mt-3 whitespace-pre-line text-sm leading-6 text-[#f4d89d]">{status}</p> : null}
  </section>;
}

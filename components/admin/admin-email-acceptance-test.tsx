"use client";

import { useState } from "react";
import { secureFetch } from "@/lib/security/csrf";

/** Only explicitly invoked by an authenticated administrator. */
export function AdminEmailAcceptanceTest({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  async function submit() {
    if (pending || !enabled) return;
    setPending(true);
    setStatus("");
    try {
      const response = await secureFetch("/api/admin/email-test", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Email provider test failed.");
      if (payload.data?.providerAccepted !== true) throw new Error("No provider acceptance recorded.");
      setStatus("Email provider accepted the test request. Check your configured Admin mailbox and spam folder. This is not proof of delivery.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Email provider test failed.");
    } finally {
      setPending(false);
    }
  }
  return <section className="mt-6 rounded-2xl border border-[#d5bb92] bg-[#231b27] p-5" aria-labelledby="admin-email-test-heading">
    <h2 id="admin-email-test-heading" className="font-cinzel text-lg font-bold text-white">Email acceptance test</h2>
    <p className="mt-2 text-sm leading-6 text-[#e3d5da]">
      Sends one explicitly requested diagnostic email to the preconfigured administrator mailbox only.
      Provider acceptance does not prove inbox delivery or sender authentication.
    </p>
    <button type="button" disabled={!enabled || pending} onClick={submit}
      className="mt-4 min-h-11 rounded-lg border border-[#d4ac67] bg-[#6c2f46] px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
      {pending ? "Requesting provider delivery..." : "Send test to configured Admin email"}
    </button>
    {!enabled ? <p className="mt-2 text-sm text-[#f4d89d]">Email adapter is not configured as ready.</p> : null}
    {status ? <p role="status" aria-live="polite" className="mt-3 text-sm leading-6 text-[#f4d89d]">{status}</p> : null}
  </section>;
}

"use client";

import { useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { secureFetch } from "@/lib/security/csrf";

export function AstrologerLogoutButton() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true); setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let confirmed = false;
    try {
      const response = await secureFetch("/api/auth/logout", { method: "POST", signal: controller.signal });
      const body = await response.json();
      if (!response.ok || body?.data?.loggedOut !== true) throw new Error("Logout not confirmed");
      // A fresh document discards authenticated router state after revocation.
      window.location.replace("/login");
      confirmed = true;
    } catch {
      setError("Sign-out could not be confirmed. Please try again.");
    } finally {
      clearTimeout(timeout);
      if (!confirmed) { pending.current = false; setBusy(false); }
    }
  }

  return (
    <div className="max-w-[170px] text-right">
      <button
        type="button"
        onClick={logout}
        disabled={busy}
        aria-busy={busy}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-[#d8e1ed] hover:border-[#d4af37]/35 hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />{busy ? "Signing out…" : "Logout"}
      </button>
      {error ? <p role="alert" className="mt-2 text-xs text-[#ffe1a5]">{error}</p> : null}
    </div>
  );
}

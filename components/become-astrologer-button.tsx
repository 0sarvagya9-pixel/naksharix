"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";

export function BecomeAstrologerButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function becomeAstrologer() {
    setBusy(true);
    setError(null);
    const response = await secureFetch("/api/astrologer/become", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ASTROLOGER" })
    });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(json.error ?? "Unable to start astrologer onboarding.");
      return;
    }
    router.push(json.data?.redirectTo ?? "/astrologer/profile");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={becomeAstrologer} disabled={busy}>
        <Sparkles className="h-4 w-4" />
        {busy ? "Preparing profile..." : "Become Astrologer"}
      </Button>
      {error ? <p className="text-sm text-[#FF4D4F]">{error}</p> : null}
    </div>
  );
}

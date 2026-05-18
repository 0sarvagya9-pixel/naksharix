"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";

export function AdminAstrologerReview({ profileId, status }: { profileId: string; status: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function review(action: "APPROVE" | "REJECT" | "PENDING") {
    setBusy(true);
    setMessage(null);
    const response = await secureFetch("/api/admin/astrologers/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, action, reason: action === "REJECT" ? "Profile needs more verification details." : undefined })
    });
    const json = await response.json();
    setBusy(false);
    const label = action === "APPROVE" ? "approved" : action === "REJECT" ? "rejected" : "moved to pending review";
    setMessage(response.ok ? `Profile ${label}. Refresh to see updated status.` : json.error ?? "Review failed.");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy || status === "APPROVED"} onClick={() => review("APPROVE")}>
          <CheckCircle2 className="h-4 w-4" />
          Approve
        </Button>
        <Button size="sm" variant="outline" disabled={busy || status === "REJECTED"} onClick={() => review("REJECT")}>
          <XCircle className="h-4 w-4" />
          Reject
        </Button>
        <Button size="sm" variant="outline" disabled={busy || status === "PENDING_REVIEW"} onClick={() => review("PENDING")}>
          <RotateCcw className="h-4 w-4" />
          Pending
        </Button>
      </div>
      {message ? <p className="text-xs naksh-muted-text">{message}</p> : null}
    </div>
  );
}
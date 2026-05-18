"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";

export function AstrologerBookingActions({ bookingId }: { bookingId: string }) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(action: "ACCEPT" | "REJECT" | "COMPLETE" | "RESCHEDULE") {
    setBusy(true);
    setMessage(null);
    const response = await secureFetch("/api/astrologer/bookings/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, action, scheduledAt: action === "RESCHEDULE" ? scheduledAt : undefined })
    });
    const json = await response.json();
    setBusy(false);
    setMessage(response.ok ? "Booking updated. Refresh to see the latest status." : json.error ?? "Could not update booking.");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => act("ACCEPT")}><CheckCircle2 className="h-4 w-4" />Accept</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => act("REJECT")}><XCircle className="h-4 w-4" />Reject</Button>
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => act("COMPLETE")}>Complete</Button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
        <Button size="sm" variant="outline" disabled={busy || !scheduledAt} onClick={() => act("RESCHEDULE")}><CalendarClock className="h-4 w-4" />Reschedule</Button>
      </div>
      {message ? <p className="text-xs naksh-muted-text">{message}</p> : null}
    </div>
  );
}

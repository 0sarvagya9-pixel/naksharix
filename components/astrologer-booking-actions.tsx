"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";
import { availableBookingActions, type BookingAction } from "@/lib/consultations/booking-policy";
import { parseConsultationLocalDateTime } from "@/lib/consultations/slot-time";

export function AstrologerBookingActions({ bookingId, status, paymentStatus }: {
  bookingId: string; status?: string; paymentStatus?: string;
}) {
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; inFlight.current?.abort(); }; }, []);
  const allowed = availableBookingActions(status, paymentStatus);

  async function act(action: BookingAction) {
    if (inFlight.current || !allowed.includes(action)) return;
    const instant = action === "RESCHEDULE" ? parseConsultationLocalDateTime(scheduledAt) : null;
    if (action === "RESCHEDULE" && (!instant || instant.getTime() <= Date.now())) {
      setFailed(true); setMessage("Choose a valid future date and time in IST (Asia/Kolkata)."); return;
    }
    const controller = new AbortController();
    inFlight.current = controller;
    const timeout = setTimeout(() => controller.abort(), 20000);
    setBusy(true); setFailed(false); setMessage(null);
    try {
      const response = await secureFetch("/api/astrologer/bookings/action", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ bookingId, action, scheduledAt: instant?.toISOString() })
      });
      const json: unknown = await response.json();
      const payload = json && typeof json === "object" ? json as Record<string, unknown> : {};
      if (!response.ok) {
        const error = typeof payload.error === "string" ? payload.error.slice(0, 350) : "Could not update booking.";
        if (mounted.current) { setFailed(true); setMessage(error); }
        return;
      }
      if (!payload.data) throw new Error("Invalid response");
      if (mounted.current) { setMessage("Booking updated. The latest status is being refreshed."); router.refresh(); }
    } catch {
      if (mounted.current) {
        setFailed(true);
        setMessage("The result could not be confirmed. Refresh the booking status before trying again.");
      }
    } finally {
      clearTimeout(timeout); inFlight.current = null;
      if (mounted.current) setBusy(false);
    }
  }

  if (!allowed.length) return <p className="text-sm naksh-muted-text">This booking is closed. No further status changes are available.</p>;
  return (
    <div className="space-y-3" data-booking-actions={bookingId} aria-busy={busy}>
      <div className="flex flex-wrap gap-2">
        {allowed.includes("ACCEPT") ? <Button type="button" size="sm" disabled={busy} onClick={() => act("ACCEPT")}><CheckCircle2 className="h-4 w-4" />Accept</Button> : null}
        {allowed.includes("REJECT") ? <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => act("REJECT")}><XCircle className="h-4 w-4" />Reject</Button> : null}
        {allowed.includes("COMPLETE") ? <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => act("COMPLETE")}>Complete</Button> : null}
      </div>
      {allowed.includes("RESCHEDULE") ? <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-xs naksh-muted-text">
          New date and time (IST)
          <Input type="datetime-local" aria-label="New consultation date and time in IST" disabled={busy} value={scheduledAt} onChange={event => setScheduledAt(event.target.value)} />
        </label>
        <Button type="button" size="sm" variant="outline" disabled={busy || !scheduledAt} onClick={() => act("RESCHEDULE")}><CalendarClock className="h-4 w-4" />Reschedule</Button>
      </div> : null}
      {busy ? <p role="status" className="text-xs naksh-muted-text">Updating booking…</p> : null}
      {message ? <p role={failed ? "alert" : "status"} className="text-sm naksh-muted-text">{message}</p> : null}
    </div>
  );
}

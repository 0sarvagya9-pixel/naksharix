"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";
import { availableBookingActions, type BookingAction } from "@/lib/consultations/booking-policy";
import { parseConsultationLocalDateTime } from "@/lib/consultations/slot-time";
import {useLanguage} from "@/components/language-provider";
import {workspaceCopy,workspaceFailure,type WorkspaceMessage} from "@/lib/astrologers/workspace-copy";

export function AstrologerBookingActions({ bookingId, status, paymentStatus }: {
  bookingId: string; status?: string; paymentStatus?: string;
}) {
  const {locale}=useLanguage(),copy=workspaceCopy(locale);
  const [uncertain,setUncertain]=useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState<WorkspaceMessage | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; inFlight.current?.abort(); }; }, []);
  const allowed = availableBookingActions(status, paymentStatus);

  async function act(action: BookingAction) {
    if (inFlight.current || busy || uncertain || !allowed.includes(action)) return;
    const instant = action === "RESCHEDULE" ? parseConsultationLocalDateTime(scheduledAt) : null;
    if (action === "RESCHEDULE" && (!instant || instant.getTime() <= Date.now())) {
      setFailed(true); setMessage("bookingDateInvalid"); return;
    }
    const controller = new AbortController();
    inFlight.current = controller;
    const timeout = setTimeout(() => controller.abort(), 20000);
    let committed = false;
    setBusy(true); setFailed(false); setMessage(null);
    try {
      const response = await secureFetch("/api/astrologer/bookings/action", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,silent:true,
        body: JSON.stringify({ bookingId, action, scheduledAt: instant?.toISOString() })
      });
      const json: unknown = await response.json();
      const payload = json && typeof json === "object" ? json as Record<string, unknown> : {};
      if (!response.ok) {
        const error=workspaceFailure(response.status);
        if (mounted.current) { setFailed(true); setMessage(error);setUncertain(error==="uncertain"||error==="conflict"); }
        return;
      }
      // A 200 response alone must not be mistaken for a confirmed mutation.
      const data = payload.data && typeof payload.data === "object" ? payload.data as Record<string, unknown> : {};
      const booking = data.booking && typeof data.booking === "object" ? data.booking as Record<string, unknown> : {};
      const expectedStatuses = action === "COMPLETE" ? ["COMPLETED"] : action === "REJECT" ? ["REJECTED"] : ["ACCEPTED", "CONFIRMED"];
      if (booking.id !== bookingId || typeof booking.status !== "string" || !expectedStatuses.includes(booking.status)) {
        throw new Error("Invalid booking confirmation");
      }
      if (action === "RESCHEDULE" && (typeof booking.scheduledAt !== "string" || Date.parse(booking.scheduledAt) !== instant?.getTime())) {
        throw new Error("Invalid reschedule confirmation");
      }
      if (mounted.current) {
        setMessage("bookingSaved");
        // Browser evidence showed a fresh RSC response while Chromium retained
        // the previous controls. A document GET replaces that stale router tree
        // and also updates counters/status badges. Never replay the POST.
        window.location.reload();
        committed = true;
      }
    } catch {
      if (mounted.current) {
        setFailed(true);
        setMessage("uncertain");setUncertain(true);
      }
    } finally {
      clearTimeout(timeout); inFlight.current = null;
      // Keep controls disabled after a confirmed write until the GET completes.
      if (mounted.current && !committed) setBusy(false);
    }
  }

  if (!allowed.length) return <p className="text-sm naksh-muted-text">{copy.bookingClosed}</p>;
  return (
    <div className="space-y-3" data-booking-actions={bookingId} aria-busy={busy}>
      <div className="flex flex-wrap gap-2">
        {allowed.includes("ACCEPT") ? <Button type="button" size="sm" disabled={busy||uncertain} onClick={() => act("ACCEPT")}><CheckCircle2 className="h-4 w-4" />{copy.ACCEPT}</Button> : null}
        {allowed.includes("REJECT") ? <Button type="button" size="sm" variant="outline" disabled={busy||uncertain} onClick={() => act("REJECT")}><XCircle className="h-4 w-4" />{copy.REJECT}</Button> : null}
        {allowed.includes("COMPLETE") ? <Button type="button" size="sm" variant="secondary" disabled={busy||uncertain} onClick={() => act("COMPLETE")}>{copy.COMPLETE}</Button> : null}
      </div>
      {allowed.includes("RESCHEDULE") ? <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-xs naksh-muted-text">
          {copy.bookingDate}
          <Input type="datetime-local" aria-label={copy.bookingDate} disabled={busy||uncertain} value={scheduledAt} onChange={event => setScheduledAt(event.target.value)} />
        </label>
        <Button type="button" size="sm" variant="outline" disabled={busy||uncertain||!scheduledAt} onClick={() => act("RESCHEDULE")}><CalendarClock className="h-4 w-4" />{copy.RESCHEDULE}</Button>
      </div> : null}
      {busy ? <p role="status" className="text-xs naksh-muted-text">{copy.bookingBusy}</p> : null}
      {uncertain?<Button type="button" variant="outline" onClick={()=>window.location.reload()}>{copy.refresh}</Button>:null}
      {message ? <p role={failed ? "alert" : "status"} className="text-sm naksh-muted-text">{copy[message]}</p> : null}
    </div>
  );
}

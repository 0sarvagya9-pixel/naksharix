"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";

export function ConsultationMeetingControl({ bookingId }: { bookingId: string }) {
  const [value, setValue] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/consultations/session-link?bookingId=" + encodeURIComponent(bookingId),
      { cache: "no-store" })
      .then(async (r) => r.ok ? r.json() : null)
      .then((j) => {
        if (!active || !j?.data?.eligible) return;
        setReady(true);
        setValue(j.data.meetingLink || "");
      })
      .catch(() => { if (active) setMessage("Could not check the session link."); });
    return () => { active = false; };
  }, [bookingId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !ready) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await secureFetch("/api/consultations/session-link", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, meetingLink: value.trim() })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Meeting link not saved.");
      setMessage("Session link saved for the customer and approved astrologer.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save meeting link.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;
  return (
    <form onSubmit={submit} className="mt-3 space-y-2 rounded-lg border border-[#D4AF37]/20 p-3">
      <label className="block space-y-2 text-xs">
        <span className="font-semibold text-[#FFD700]">Approved meeting link</span>
        <Input type="url" value={value} onChange={(event) => setValue(event.target.value)}
          placeholder="https://meet.jit.si/your-private-room" required maxLength={600}
          aria-label="HTTPS meeting link for this consultation" />
      </label>
      <Button size="sm" type="submit" disabled={busy || !value.trim()}>
        {busy ? "Saving..." : "Assign meeting link"}
      </Button>
      <p className="text-xs naksh-muted-text">
        Manually create a private session with a supported provider first.
        Naksharix does not host or automatically provision audio/video.
      </p>
      {message ? <p role="status" className="text-xs naksh-muted-text">{message}</p> : null}
    </form>
  );
}

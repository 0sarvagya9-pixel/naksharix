"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";

export function ConsultationReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    if (pending) return;
    setPending(true);
    setMessage(null);
    try {
      const response = await secureFetch("/api/consultation-bookings/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, body: formData.get("body") })
      });
      const json = await response.json();
      setMessage(response.ok ? "Your consultation rating has been saved." : json.error ?? "Could not save rating.");
    } catch {
      setMessage("Could not save rating. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="space-y-3 rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/60 p-4">
      <p className="text-sm font-semibold text-[#f9d980]">Rate your consultation</p>
      <div role="group" aria-label="Choose a rating from one to five stars" className="flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => setRating(value)} disabled={pending} aria-label={value + (value === 1 ? " star" : " stars")} aria-pressed={rating === value} className={value <= rating ? "text-[#FFD700]" : "naksh-muted-text"}>
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
      <Textarea name="body" maxLength={800} aria-label="Optional feedback about your consultation" placeholder="Optional: share your consultation experience..." />
      <Button size="sm" disabled={pending}>{pending ? "Saving rating..." : "Submit rating"}</Button>
      {message ? <p role="status" aria-live="polite" className="text-xs naksh-muted-text">{message}</p> : null}
    </form>
  );
}

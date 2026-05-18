"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";

export function ConsultationReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setMessage("Saving review...");
    const response = await secureFetch("/api/consultation-bookings/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, body: formData.get("body") })
    });
    const json = await response.json();
    setMessage(response.ok ? "Review saved. Thank you for rating your consultation." : json.error ?? "Could not save review.");
  }

  return (
    <form action={submit} className="space-y-3 rounded-lg border border-[#F5C542]/20 bg-[#12051f]/60 p-4">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => setRating(value)} className={value <= rating ? "text-[#FFD36A]" : "naksh-muted-text"}>
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
      <Textarea name="body" placeholder="Share your consultation experience..." />
      <Button size="sm">Submit review</Button>
      {message ? <p className="text-xs naksh-muted-text">{message}</p> : null}
    </form>
  );
}

"use client";

import { useRef, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { consultationCustomerCopy, consultationReviewError } from "@/lib/consultations/customer-copy";

export function ConsultationReviewForm({ bookingId }: { bookingId: string }) {
  const { locale } = useLanguage();
  const copy = consultationCustomerCopy(locale);
  const [rating, setRating] = useState(5);
  const [result, setResult] = useState<{ ok: boolean; status: number; error?: unknown } | null>(null);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const message = result ? result.ok ? copy.reviewSaved : consultationReviewError(result.status, result.error, locale) : null;

  async function submit(formData: FormData) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setResult(null);
    try {
      const response = await secureFetch("/api/consultation-bookings/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, body: formData.get("body") })
      });
      const json = await response.json().catch(() => null);
      const review = json?.data?.review;
      const acknowledged = response.ok && typeof review?.id === "string" && review.id.trim().length > 0 &&
        review.consultationBookingId === bookingId && review.rating === rating;
      setResult({ ok: acknowledged, status: response.status, error: json?.error });
    } catch {
      setResult({ ok: false, status: 0 });
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void submit(new FormData(event.currentTarget)); }} className="space-y-3 rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/60 p-4">
      <p className="text-sm font-semibold text-[#f9d980]">{copy.rateConsultation}</p>
      <div role="group" aria-label={copy.ratingGroup} className="flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => setRating(value)} disabled={pending} aria-label={`${value} ${value === 1 ? copy.star : copy.stars}`} aria-pressed={rating === value} className={value <= rating ? "text-[#FFD700]" : "naksh-muted-text"}>
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
      <Textarea name="body" maxLength={800} aria-label={copy.feedbackLabel} placeholder={copy.feedbackPlaceholder} />
      <Button size="sm" type="submit" disabled={pending}>{pending ? copy.saving : copy.submitRating}</Button>
      {message ? <p role="status" aria-live="polite" className="text-xs naksh-muted-text">{message}</p> : null}
    </form>
  );
}

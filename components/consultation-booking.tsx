"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { CalendarClock, Headphones, MessageCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { featuredAstrologers } from "@/lib/astrologers";
import type { MarketplaceAstrologer } from "@/components/astrologer-listing";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";

const modes = [
  { value: "CHAT", label: "Chat", icon: MessageCircle },
  { value: "AUDIO", label: "Call", icon: Headphones },
  { value: "VIDEO", label: "Video placeholder", icon: Video }
] as const;

const requiredFields = ["astrologerProfileId", "mode", "scheduledAt", "birthName", "birthDate", "birthTime", "birthPlace", "question"];

export function ConsultationBooking({ selectedAstrologerId, profiles = [] }: { selectedAstrologerId?: string; profiles?: MarketplaceAstrologer[] }) {
  const { requiredMessage, tr } = useLanguage();
  const [status, setStatus] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const demoAstrologers: MarketplaceAstrologer[] = featuredAstrologers;
  const astrologers = profiles.length ? [...profiles, ...demoAstrologers] : demoAstrologers;

  async function book(formData: FormData) {
    const validationErrors = requiredFields.reduce<FieldErrors>((errors, field) => {
      if (isBlank(formData.get(field))) errors[field] = requiredMessage;
      return errors;
    }, {});
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      scrollToFirstError(validationErrors);
      return;
    }

    setStatus("Booking your consultation...");
    const response = await secureFetch("/api/consultation-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        astrologerProfileId: formData.get("astrologerProfileId"),
        mode: formData.get("mode"),
        scheduledAt: formData.get("scheduledAt"),
        durationMins: Number(formData.get("durationMins") || 30),
        birthName: formData.get("birthName"),
        birthDate: formData.get("birthDate"),
        birthTime: formData.get("birthTime"),
        birthPlace: formData.get("birthPlace"),
        question: formData.get("question")
      })
    });
    const json = await response.json();
    setStatus(response.ok ? json.data?.paymentMessage ?? "Consultation request created." : json.error ?? "Unable to create booking.");
  }

  function clear(field: string) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-cinzel">Book a Consultation</CardTitle>
        <p className="text-sm text-muted-foreground">Phase 1 creates a secure booking request. Payments and live calling can be enabled later without changing this flow.</p>
      </CardHeader>
      <CardContent>
        <form action={book} className="grid gap-5">
          <div className="grid gap-3 md:grid-cols-3">
            {astrologers.map((astrologer) => (
              <label key={astrologer.id} className="cursor-pointer rounded-lg border border-amber-200/15 bg-card/70 p-4 transition hover:border-amber-200/45">
                <input
                  className="sr-only peer"
                  type="radio"
                  name="astrologerProfileId"
                  data-field="astrologerProfileId"
                  value={astrologer.id}
                  defaultChecked={(selectedAstrologerId ?? astrologers[0]?.id) === astrologer.id}
                  onChange={() => clear("astrologerProfileId")}
                />
                <span className="block font-cinzel font-bold peer-checked:text-amber-200">{astrologer.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{astrologer.specialty}</span>
                <span className="mt-3 block text-sm">INR {astrologer.pricePerMinute}/min | {astrologer.rating} rating</span>
                <span className="mt-2 inline-flex rounded-full border border-emerald-300/30 px-2 py-1 text-xs text-emerald-200">{astrologer.status ?? "Online demo"}</span>
              </label>
            ))}
          </div>
          {fieldErrors.astrologerProfileId ? <p className="text-sm text-destructive">{fieldErrors.astrologerProfileId}</p> : null}

          <div className="grid gap-3 sm:grid-cols-3">
            {modes.map(({ value, label, icon: Icon }) => (
              <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${errorClass(Boolean(fieldErrors.mode))}`}>
                <input type="radio" name="mode" value={value} defaultChecked={value === "CHAT"} data-field="mode" onChange={() => clear("mode")} />
                <Icon className="h-4 w-4 text-amber-200" />
                {label}
              </label>
            ))}
          </div>
          {fieldErrors.mode ? <p className="text-sm text-destructive">{fieldErrors.mode}</p> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date and time" name="scheduledAt" error={fieldErrors.scheduledAt}>
              <Input name="scheduledAt" data-field="scheduledAt" type="datetime-local" className={errorClass(Boolean(fieldErrors.scheduledAt))} onChange={() => clear("scheduledAt")} />
            </Field>
            <Field label="Duration" name="durationMins">
              <Input name="durationMins" data-field="durationMins" type="number" min="10" max="120" defaultValue="30" />
            </Field>
            <Field label="Birth name" name="birthName" error={fieldErrors.birthName}>
              <Input name="birthName" data-field="birthName" placeholder="Your full name" className={errorClass(Boolean(fieldErrors.birthName))} onChange={() => clear("birthName")} />
            </Field>
            <Field label="Birth date" name="birthDate" error={fieldErrors.birthDate}>
              <Input name="birthDate" data-field="birthDate" type="date" className={errorClass(Boolean(fieldErrors.birthDate))} onChange={() => clear("birthDate")} />
            </Field>
            <Field label="Birth time" name="birthTime" error={fieldErrors.birthTime}>
              <Input name="birthTime" data-field="birthTime" type="time" className={errorClass(Boolean(fieldErrors.birthTime))} onChange={() => clear("birthTime")} />
            </Field>
            <Field label="Birth place" name="birthPlace" error={fieldErrors.birthPlace}>
              <Input name="birthPlace" data-field="birthPlace" placeholder="Delhi, India" className={errorClass(Boolean(fieldErrors.birthPlace))} onChange={() => clear("birthPlace")} />
            </Field>
          </div>

          <Field label="Your question" name="question" error={fieldErrors.question}>
            <Textarea name="question" data-field="question" placeholder="Marriage, career, finance, health, muhurat..." className={errorClass(Boolean(fieldErrors.question))} onChange={() => clear("question")} />
          </Field>

          <div className="rounded-lg border border-amber-200/15 bg-card/60 p-4 text-sm text-muted-foreground">
            Payment coming soon. Demo bookings are allowed while Razorpay keys are not configured.
          </div>
          <Button>
            <CalendarClock className="h-4 w-4" />
            {tr("requestBooking")}
          </Button>
          {status ? <p className="rounded-lg border border-amber-200/15 bg-card/60 p-3 text-sm text-muted-foreground">{status}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

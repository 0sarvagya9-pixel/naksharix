"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationAutocomplete, type ResolvedLocation } from "@/components/location-autocomplete";
import { useLanguage } from "@/components/language-provider";
import { secureFetch } from "@/lib/security/csrf";
import { cn } from "@/lib/utils";

type Props = {
  userEmail: string;
  orderId?: string;
  plan: "PREMIUM" | "VIP";
  adminBypass?: boolean;
};

type Errors = Partial<Record<"fullName" | "dateOfBirth" | "birthPlace", string>>;

export function ReportRequestForm({ userEmail, orderId, plan, adminBypass = false }: Props) {
  const router = useRouter();
  const { tr, apiLocale, requiredMessage } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [phone, setPhone] = useState("");
  const [concern, setConcern] = useState("");
  const [language, setLanguage] = useState(apiLocale);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = requiredMessage;
    if (!dateOfBirth) next.dateOfBirth = requiredMessage;
    if (!birthPlace.trim() || !location) next.birthPlace = birthPlace.trim() ? tr("selectLocationFromSuggestions") : requiredMessage;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setStatus(null);
    const response = await secureFetch("/api/report-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        planType: plan,
        adminBypass,
        deliveryEmail: userEmail,
        fullName,
        gender,
        dateOfBirth,
        timeOfBirth,
        birthPlace: location?.displayName ?? birthPlace,
        latitude: location?.latitude,
        longitude: location?.longitude,
        timezone: location?.timezoneOffset,
        phone,
        concern,
        language
      })
    });
    const json = await response.json().catch(() => null);
    setLoading(false);
    if (!response.ok) {
      setStatus(json?.error ?? tr("errorGeneric"));
      return;
    }
    router.push(`/report-request/success?id=${json.data.reportRequest.id}`);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-lg border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-50">
        {tr("reportDeliveryEmailNotice")}: <span className="font-semibold">{userEmail}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={tr("fullName")} error={errors.fullName}>
          <Input value={fullName} onChange={(event) => { setFullName(event.target.value); setErrors((e) => ({ ...e, fullName: undefined })); }} className={cn(errors.fullName && "border-destructive")} />
        </Field>
        <Field label={tr("gender")}>
          <select value={gender} onChange={(event) => setGender(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">{tr("genderPreferNotToSay")}</option>
            <option value="Male">{tr("genderMale")}</option>
            <option value="Female">{tr("genderFemale")}</option>
            <option value="Other">{tr("genderOther")}</option>
          </select>
        </Field>
        <Field label={tr("dateOfBirth")} error={errors.dateOfBirth}>
          <Input type="date" value={dateOfBirth} onChange={(event) => { setDateOfBirth(event.target.value); setErrors((e) => ({ ...e, dateOfBirth: undefined })); }} className={cn(errors.dateOfBirth && "border-destructive")} />
        </Field>
        <Field label={tr("timeOfBirth")}>
          <Input type="time" value={timeOfBirth} onChange={(event) => setTimeOfBirth(event.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <LocationAutocomplete
            value={birthPlace}
            onChange={(value) => { setBirthPlace(value); setErrors((e) => ({ ...e, birthPlace: undefined })); }}
            onResolvedLocation={(next) => { setLocation(next); setErrors((e) => ({ ...e, birthPlace: undefined })); }}
            label={tr("birthPlace")}
            required
            error={errors.birthPlace}
          />
        </div>
        <Field label={tr("phone")}>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </Field>
        <Field label={tr("preferredLanguage")}>
          <select value={language} onChange={(event) => setLanguage(event.target.value as typeof apiLocale)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </Field>
        <Field label={tr("reportTypePlan")}>
          <Input value={plan === "VIP" ? tr("vip") : tr("premium")} readOnly />
        </Field>
        <div className="space-y-2 md:col-span-2">
          <Label>{tr("mainQuestionConcern")}</Label>
          <textarea value={concern} onChange={(event) => setConcern(event.target.value)} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
      </div>
      {adminBypass ? <p className="text-sm text-amber-100">{tr("adminTestingModePaymentBypassed")}</p> : null}
      {status ? <p className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{status}</p> : null}
      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? tr("submittingReportRequest") : tr("submitReportRequest")}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}


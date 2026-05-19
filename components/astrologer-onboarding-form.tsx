"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";
import { useLanguage } from "@/components/language-provider";

export function AstrologerOnboardingForm() {
  const router = useRouter();
  const { requiredMessage, tr } = useLanguage();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    const fields = ["name", "email", "password", "role", "specialization", "experienceYears", "languages", "consultationPrice", "bio"];
    const validation = fields.reduce<FieldErrors>((acc, field) => {
      if (isBlank(formData.get(field))) acc[field] = requiredMessage;
      return acc;
    }, {});
    setErrors(validation);
    if (Object.keys(validation).length) {
      scrollToFirstError(validation);
      return;
    }

    setLoading(true);
    setMessage(null);
    const response = await secureFetch("/api/astrologer/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(json.error ?? "Could not complete onboarding.");
      return;
    }
    router.push("/astrologer/dashboard");
  }

  return (
    <Card className="glass">
      <CardHeader><CardTitle className="font-cinzel">Astrologer / Consultant Onboarding</CardTitle></CardHeader>
      <CardContent>
        <form action={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="name" error={errors.name}><Input name="name" data-field="name" className={errorClass(Boolean(errors.name))} /></Field>
          <Field label={tr("email")} name="email" error={errors.email}><Input name="email" data-field="email" type="email" className={errorClass(Boolean(errors.email))} /></Field>
          <Field label={tr("password")} name="password" error={errors.password}><Input name="password" data-field="password" type="password" className={errorClass(Boolean(errors.password))} /></Field>
          <Field label="Account type" name="role" error={errors.role}>
            <select name="role" data-field="role" className={`h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm ${errorClass(Boolean(errors.role))}`}>
              <option value="ASTROLOGER">{tr("astrologer")}</option>
              <option value="CONSULTANT">{tr("consultant")}</option>
            </select>
          </Field>
          <Field label="Specialization" name="specialization" error={errors.specialization}><Input name="specialization" data-field="specialization" placeholder="Vedic Astrology, Tarot, Numerology" className={errorClass(Boolean(errors.specialization))} /></Field>
          <Field label="Experience years" name="experienceYears" error={errors.experienceYears}><Input name="experienceYears" data-field="experienceYears" type="number" min="0" className={errorClass(Boolean(errors.experienceYears))} /></Field>
          <Field label="Languages" name="languages" error={errors.languages}><Input name="languages" data-field="languages" placeholder="Hindi, English" className={errorClass(Boolean(errors.languages))} /></Field>
          <Field label="Price per minute" name="consultationPrice" error={errors.consultationPrice}><Input name="consultationPrice" data-field="consultationPrice" type="number" min="0" className={errorClass(Boolean(errors.consultationPrice))} /></Field>
          <Field label="Bio" name="bio" error={errors.bio} className="sm:col-span-2"><Textarea name="bio" data-field="bio" className={errorClass(Boolean(errors.bio))} /></Field>
          <Button className="sm:col-span-2" disabled={loading}><Sparkles className="h-4 w-4" />{loading ? "Creating profile..." : "Create astrologer account"}</Button>
        </form>
        {message ? <p className="mt-4 rounded-md border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">{message}</p> : null}
      </CardContent>
    </Card>
  );
}

function Field({ label, name, error, className, children }: { label: string; name: string; error?: string; className?: string; children: React.ReactNode }) {
  return <div className={`space-y-2 ${className ?? ""}`}><Label htmlFor={name}>{label}</Label>{children}{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>;
}

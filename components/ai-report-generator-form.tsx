"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";

export function AiReportGeneratorForm() {
  const { apiLocale, requiredMessage, tr } = useLanguage();
  const [report, setReport] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function generate(formData: FormData) {
    const requiredFields = ["reportType", "clientName", "birthDetails", "focusQuestion"] as const;
    const nextErrors = requiredFields.reduce<FieldErrors>((acc, field) => {
      if (isBlank(formData.get(field))) acc[field] = requiredMessage;
      return acc;
    }, {});
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      scrollToFirstError(nextErrors);
      return;
    }
    setBusy(true);
    setReport(null);
    const response = await secureFetch("/api/ai/report-generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const json = await response.json().catch(() => null);
    setBusy(false);
    setReport(response.ok && typeof json?.data?.report === "string" ? json.data.report : tr("errorGeneric"));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <form action={generate} className="space-y-4 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-5">
        <Field label={tr("reportType")} error={errors.reportType}><Input name="reportType" data-field="reportType" className={errorClass(Boolean(errors.reportType))} onChange={() => setErrors((current) => ({ ...current, reportType: undefined }))} defaultValue={tr("careerConsultationReport")} /></Field>
        <Field label={tr("clientName")} error={errors.clientName}><Input name="clientName" data-field="clientName" className={errorClass(Boolean(errors.clientName))} onChange={() => setErrors((current) => ({ ...current, clientName: undefined }))} placeholder={tr("clientName")} /></Field>
        <Field label={tr("birthDetails")} error={errors.birthDetails}><Textarea name="birthDetails" data-field="birthDetails" className={errorClass(Boolean(errors.birthDetails))} onChange={() => setErrors((current) => ({ ...current, birthDetails: undefined }))} placeholder={tr("birthDetailsReportPlaceholder")} /></Field>
        <Field label={tr("focusQuestion")} error={errors.focusQuestion}><Textarea name="focusQuestion" data-field="focusQuestion" className={errorClass(Boolean(errors.focusQuestion))} onChange={() => setErrors((current) => ({ ...current, focusQuestion: undefined }))} placeholder={tr("focusQuestionPlaceholder")} /></Field>
        <Field label={tr("language")}>
          <select name="language" defaultValue={reportLanguage(apiLocale)} className="h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm">
            <option>English</option>
            <option>Hindi</option>
            <option>Hinglish</option>
          </select>
        </Field>
        <Button disabled={busy}><WandSparkles className="h-4 w-4" />{busy ? tr("generatingAiReport") : tr("generateAiReport")}</Button>
      </form>
      <div className="min-h-80 whitespace-pre-line rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-5 text-sm leading-7 naksh-muted-text">
        {report ?? tr("generatedReportPlaceholder")}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>;
}

function reportLanguage(locale: string) {
  if (locale === "hi") return "Hindi";
  if (locale === "hinglish") return "Hinglish";
  return "English";
}

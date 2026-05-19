"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";

export function AiReportGeneratorForm() {
  const [report, setReport] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate(formData: FormData) {
    setBusy(true);
    setReport(null);
    const response = await secureFetch("/api/ai/report-generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const json = await response.json();
    setBusy(false);
    setReport(response.ok ? json.data?.report : json.error ?? "Could not generate report right now.");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <form action={generate} className="space-y-4 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-5">
        <Field label="Report type"><Input name="reportType" required defaultValue="Career consultation report" /></Field>
        <Field label="Client name"><Input name="clientName" required placeholder="Client name" /></Field>
        <Field label="Birth details"><Textarea name="birthDetails" required placeholder="DOB, time, place, sign, known kundli context..." /></Field>
        <Field label="Focus question"><Textarea name="focusQuestion" required placeholder="What does the client want to understand?" /></Field>
        <Field label="Language">
          <select name="language" defaultValue="English" className="h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm">
            <option>English</option>
            <option>Hindi</option>
            <option>Hinglish</option>
          </select>
        </Field>
        <Button disabled={busy}><WandSparkles className="h-4 w-4" />{busy ? "Generating..." : "Generate AI report"}</Button>
      </form>
      <div className="min-h-80 whitespace-pre-line rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-5 text-sm leading-7 naksh-muted-text">
        {report ?? "Generated report will appear here as clean, human-readable text. Gemini API stays server-side."}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";

export function PaidReportCheckout({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locale, tr } = useLanguage();

  async function checkout() {
    setLoading(true);
    setError(null);
    const response = await secureFetch("/api/reports/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId })
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(toPaymentMessage(json.error, locale));
      return;
    }
    window.location.href = json.url;
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={checkout} disabled={loading}>
        <FileText className="h-4 w-4" />
        {loading ? tr("processing") : tr("buyReport")}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function toPaymentMessage(error: string | undefined, locale: "en" | "hi" | "hinglish") {
  if (!error || /stripe|configured|price|server|unexpected|payments coming soon/i.test(error)) {
    if (locale === "hi") return "भुगतान जल्द उपलब्ध होगा";
    if (locale === "hinglish") return "Payments jald available honge";
    return "Payments coming soon";
  }
  if (/unauthenticated/i.test(error)) {
    if (locale === "hi") return "भुगतान जारी रखने के लिए साइन इन करें।";
    if (locale === "hinglish") return "Payment continue karne ke liye sign in karein.";
    return "Please sign in to continue with payment.";
  }
  return error;
}

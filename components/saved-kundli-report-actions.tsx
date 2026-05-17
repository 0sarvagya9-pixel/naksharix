"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

export function SavedKundliReportActions({ report, reportId, language, showView = true }: { report: unknown; reportId: string; language: Locale; showView?: boolean }) {
  const { tr } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadPdf() {
    setLoading(true);
    setError(null);
    try {
      const response = await secureFetch("/api/kundli/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, language, pdfType: "FREE" })
      });
      if (!response.ok) throw new Error("PDF download failed");
      const blob = await response.blob();
      if (!blob.size) throw new Error("PDF download failed");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "naksharix-free-kundli-report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError(tr("pdfDownloadFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {showView ? (
          <Button asChild size="sm" variant="outline">
            <Link href={`/kundli/report/${reportId}`}><Eye className="h-4 w-4" />{tr("viewReport")}</Link>
          </Button>
        ) : null}
        <Button size="sm" onClick={downloadPdf} disabled={loading}>
          <Download className="h-4 w-4" />{loading ? tr("preparingPdf") : tr("downloadFreePdf")}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

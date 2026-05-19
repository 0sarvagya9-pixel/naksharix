"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KundliReportDashboard } from "@/components/kundli/kundli-report-dashboard";
import { SavedKundliReportActions } from "@/components/saved-kundli-report-actions";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

type SavedReportPayload = {
  profile?: { name?: string; gender?: string };
  birthDetails?: { dateOfBirth?: string; timeOfBirth?: string; birthPlace?: string; timezone?: string };
  generatedAt?: string;
  aiSummary?: string;
  disclaimer?: string;
  [key: string]: unknown;
};

export function SavedKundliReportView({ report, reportId, language, createdAt }: { report: SavedReportPayload; reportId: string; language: Locale; createdAt: string }) {
  const { tr } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#D4AF37]/25 bg-[radial-gradient(circle_at_10%_10%,rgba(245,190,88,0.14),transparent_26rem),linear-gradient(135deg,rgba(126,72,255,0.18),rgba(8,4,18,0.94))] p-5 sm:p-6">
        <Button asChild variant="ghost" className="mb-4 px-0 naksh-muted-text hover:text-[#FFD700]">
          <Link href="/saved-reports"><ArrowLeft className="h-4 w-4" />{tr("savedReports")}</Link>
        </Button>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-cinzel text-xs uppercase tracking-[0.28em] text-[#FFD700]/75">Naksharix</p>
            <h1 className="mt-2 font-cinzel text-3xl font-black text-[#FFFFFF]">{tr("generatedKundliReport")}</h1>
            <div className="mt-4 grid gap-2 text-sm naksh-muted-text sm:grid-cols-2 lg:grid-cols-3">
              <Meta label={tr("name")} value={report.profile?.name} />
              <Meta label={tr("dateOfBirth")} value={report.birthDetails?.dateOfBirth} />
              <Meta label={tr("timeOfBirth")} value={report.birthDetails?.timeOfBirth} />
              <Meta label={tr("birthPlace")} value={report.birthDetails?.birthPlace} />
              <Meta label={tr("reportLanguage")} value={language} />
              <Meta label={tr("generatedDate")} value={new Date(createdAt).toLocaleString(language === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" })} />
            </div>
          </div>
          <SavedKundliReportActions report={report} reportId={reportId} language={language} showView={false} />
        </div>
      </div>

      {report.aiSummary ? (
        <section className="rounded-lg border border-[#D4AF37]/25 bg-[#061D3C]/70 p-4 text-sm leading-7 naksh-muted-text">
          <h2 className="mb-3 font-cinzel text-xl font-bold text-[#FFD700]">{tr("aiSummary")}</h2>
          <p>{report.aiSummary}</p>
        </section>
      ) : null}

      <KundliReportDashboard report={report} language={language} />

      {report.disclaimer ? (
        <section className="rounded-lg border border-[#D4AF37]/25 bg-[#061D3C]/70 p-4 text-sm leading-7 naksh-muted-text">
          <h2 className="mb-3 font-cinzel text-xl font-bold text-[#FFD700]">Disclaimer</h2>
          <p>{report.disclaimer}</p>
        </section>
      ) : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] naksh-muted-text">{label}</p>
      <p className="mt-1 break-words font-cinzel text-sm font-bold text-foreground">{value || "-"}</p>
    </div>
  );
}

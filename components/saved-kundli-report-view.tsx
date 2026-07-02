"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { KundliReportDashboard } from "@/components/kundli/kundli-report-dashboard";
import { SavedKundliReportActions } from "@/components/saved-kundli-report-actions";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
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

export function SavedKundliReportView({
  report,
  reportId,
  language,
  createdAt,
  isUnlocked = false
}: {
  report: SavedReportPayload;
  reportId: string;
  language: Locale;
  createdAt: string;
  isUnlocked?: boolean;
}) {
  const { tr } = useLanguage();
  const fallback = tr("notAvailable");
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[rgba(255,255,255,0.22)] bg-[radial-gradient(circle_at_10%_10%,rgba(220,169,86,0.13),transparent_26rem),linear-gradient(135deg,#080e1e,#020612_82%)] p-5 shadow-[0_24px_80px_rgba(2,6,18,0.45)] sm:p-6">
        <Button asChild variant="ghost" className="mb-4 px-0 text-[rgba(255,255,255,0.70)] hover:text-[#fffaf0] hover:bg-transparent">
          <Link href="/saved-reports"><ArrowLeft className="h-4 w-4" />{tr("savedReports")}</Link>
        </Button>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-cinzel text-xs uppercase tracking-[0.28em] text-[#f2c56b]">Naksharix</p>
            <h1 className="mt-2 font-cinzel text-3xl font-black text-[#fffaf0]">{tr("generatedKundliReport")}</h1>
            <div className="mt-4 grid gap-2 text-sm text-[rgba(255,255,255,0.70)] sm:grid-cols-2 lg:grid-cols-3">
              <Meta label={tr("name")} value={report.profile?.name} fallback={fallback} />
              <Meta label={tr("dateOfBirth")} value={report.birthDetails?.dateOfBirth} fallback={fallback} />
              <Meta label={tr("timeOfBirth")} value={report.birthDetails?.timeOfBirth} fallback={fallback} />
              <Meta label={tr("birthPlace")} value={report.birthDetails?.birthPlace} fallback={fallback} />
              <Meta label={tr("reportLanguage")} value={languageOptionLabel(language, language)} fallback={fallback} />
              <Meta label={tr("generatedDate")} value={new Date(createdAt).toLocaleString(language === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" })} />
            </div>
          </div>
          <SavedKundliReportActions report={report} reportId={reportId} language={language} showView={false} isUnlocked={isUnlocked} />
        </div>
      </div>

      {!isUnlocked ? (
        <div
          className="rounded-2xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#D4AF37]/10 via-[#0C152B]/40 to-[#D4AF37]/5 p-6 text-center"
          style={{
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
          }}
        >
          <Sparkles className="mx-auto h-8 w-8 text-[#FFD700] animate-pulse" />
          <h3 className="mt-3 font-cinzel text-xl font-bold text-[#fffaf0]">Unlock Pro Astrology Features</h3>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.70)] max-w-xl mx-auto">
            Get access to the premium printable PDF report containing high-resolution Vedic charts, advanced planet strength calculations, custom daily remedies, and personalized dasha predictions.
          </p>
          <div className="mt-4 flex justify-center">
            <RazorpayCheckoutButton
              payload={{ purpose: "KUNDLI_REPORT", reportId: "kundli-pro", savedReportId: reportId }}
              label="Unlock Premium Report for ₹799"
              variant="default"
            />
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-4 flex items-center justify-between"
          style={{
            backdropFilter: "blur(8px)"
          }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-[#fffaf0]">Premium Report Unlocked</p>
              <p className="text-xs text-[rgba(255,255,255,0.70)]">You have full access to premium predictions and printable PDF layout.</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-400">
            PRO ACTIVE
          </span>
        </div>
      )}

      {report.aiSummary ? (
        <section className="rounded-lg border border-[rgba(255,255,255,0.22)] bg-[rgba(8,14,30,0.88)] p-4 text-sm leading-7 text-[rgba(255,255,255,0.70)]">
          <h2 className="mb-3 font-cinzel text-xl font-bold text-[#fffaf0]">{tr("aiSummary")}</h2>
          <p>{report.aiSummary}</p>
        </section>
      ) : null}

      <KundliReportDashboard report={report} language={language} />

      {report.disclaimer ? (
        <section className="rounded-lg border border-[rgba(255,255,255,0.22)] bg-[rgba(8,14,30,0.88)] p-4 text-sm leading-7 text-[rgba(255,255,255,0.70)]">
          <h2 className="mb-3 font-cinzel text-xl font-bold text-[#fffaf0]">{tr("disclaimer")}</h2>
          <p>{report.disclaimer}</p>
        </section>
      ) : null}
    </div>
  );
}

function Meta({ label, value, fallback = "-" }: { label: string; value?: string; fallback?: string }) {
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.15)] bg-[rgba(8,14,30,0.56)] p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.60)]">{label}</p>
      <p className="mt-1 break-words font-cinzel text-sm font-bold text-[#fffaf0]">{value || fallback}</p>
    </div>
  );
}

function languageOptionLabel(option: Locale, current: Locale) {
  if (current === "hi") {
    if (option === "en") return "अंग्रेज़ी";
    if (option === "hi") return "हिंदी";
    return "हिंग्लिश";
  }
  if (option === "hinglish") return "Hinglish";
  if (option === "hi") return "Hindi";
  return "English";
}

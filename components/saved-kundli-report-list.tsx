import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavedKundliReportActions } from "@/components/saved-kundli-report-actions";
import type { Locale } from "@/lib/i18n";

type SavedReportCard = {
  id: string;
  name: string;
  gender?: string | null;
  dateOfBirth: Date;
  timeOfBirth: string;
  birthPlace: string;
  language: string;
  reportJson: unknown;
  createdAt: Date;
};

export function SavedKundliReportList({ reports, emptyText }: { reports: SavedReportCard[]; emptyText: string }) {
  if (!reports.length) {
    return (
      <Card className="glass">
        <CardContent className="space-y-4 p-6 text-sm naksh-muted-text">
          <p>{emptyText}</p>
          <Button asChild><Link href="/kundli">Generate Kundli</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {reports.map((report) => {
        const language = normalizeReportLanguage(report.language);
        return (
          <Card key={report.id} className="glass overflow-hidden">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-cinzel text-xl font-bold text-[#FFFFFF]">{report.name}</p>
                  <p className="mt-1 text-sm naksh-muted-text">{report.gender || "-"}</p>
                </div>
                <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#FFD700]">{report.language}</span>
              </div>
              <div className="grid gap-3 text-sm naksh-muted-text sm:grid-cols-2">
                <Meta icon={<CalendarDays className="h-4 w-4" />} label="DOB" value={`${formatDate(report.dateOfBirth, language)} | ${report.timeOfBirth}`} />
                <Meta icon={<MapPin className="h-4 w-4" />} label="Place" value={report.birthPlace} />
                <Meta icon={<UserRound className="h-4 w-4" />} label="Saved" value={formatDateTime(report.createdAt, language)} />
              </div>
              <SavedKundliReportActions report={report.reportJson} reportId={report.id} language={language} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-3">
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#FFD700]/80">{icon}{label}</p>
      <p className="mt-1 break-words text-[#FFFFFF]">{value}</p>
    </div>
  );
}

function normalizeReportLanguage(value: string): Locale {
  return value === "hi" || value === "hinglish" ? value : "en";
}

function formatDate(date: Date, language: Locale) {
  return date.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium" });
}

function formatDateTime(date: Date, language: Locale) {
  return date.toLocaleString(language === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" });
}


"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { paidReports } from "@/lib/paid-reports";
import { localizePaidReport } from "@/lib/paid-report-display";

export function ReportsContent() {
  const { locale, tr } = useLanguage();

  return (
    <main className="star-field bg-[#020612]">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{tr("premiumReports")}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382]">{tr("reportsTitle")}</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">{tr("reportsSubtitle")}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {paidReports.map((report) => {
            const copy = localizePaidReport(report, locale);
            return (
            <Card key={report.id} className="border-[#1e293b] bg-[#0f1c3a]/90 shadow-[0_18px_60px_rgba(2,6,18,0.42)] transition hover:-translate-y-1 hover:border-[#dca956]/45">
              <CardHeader>
                <CardTitle className="font-cinzel text-[#f3d382]">{copy.name}</CardTitle>
                <p className="text-3xl font-black text-[#fbc02d]">{report.price}</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm naksh-muted-text">{copy.description}</p>
                <ul className="space-y-2 text-sm">
                  {copy.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#dca956]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="grid gap-2">
                  <RazorpayCheckoutButton payload={{ purpose: report.purpose, reportId: report.id }} label={tr("buyReport")} variant="secondary" />
                  <Button variant="outline" asChild>
                    <Link href={`/reports/${report.id}`}>{tr("viewDetails")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </Section>
    </main>
  );
}

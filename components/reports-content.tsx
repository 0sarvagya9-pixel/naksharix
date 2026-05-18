"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { paidReports } from "@/lib/paid-reports";

export function ReportsContent() {
  const { tr } = useLanguage();

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">{tr("premiumReports")}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{tr("reportsTitle")}</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">{tr("reportsSubtitle")}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {paidReports.map((report) => (
            <Card key={report.id} className="glass">
              <CardHeader>
                <CardTitle className="font-cinzel">{report.name}</CardTitle>
                <p className="text-3xl font-black text-[#FFD36A]">{report.price}</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm naksh-muted-text">{report.description}</p>
                <ul className="space-y-2 text-sm">
                  {report.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#FFD36A]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="grid gap-2">
                  <RazorpayCheckoutButton payload={{ purpose: report.purpose, reportId: report.id }} label={tr("buyReport")} />
                  <Button variant="outline" asChild>
                    <Link href={`/reports/${report.id}`}>{tr("viewDetails")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

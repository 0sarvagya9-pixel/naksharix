import Link from "next/link";
import { redirect } from "next/navigation";
import { ReportPaymentStatus } from "@prisma/client";
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { isAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { safeServerTranslation } from "@/lib/i18n-server";
import { getManualReport } from "@/lib/manual-catalogue";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { decodeAutomaticReportInput,autoReportDeliveryMessage } from "@/lib/reports/automatic-report-input";
import { AutomaticReportProgress } from "@/components/report-request/automatic-report-progress";
import {fixedReportCheckout,hasCurrentPaidReportEntitlement} from "@/lib/reports/paid-entitlement";

type SearchParams = Promise<{ id?: string }>;

export default async function ReportRequestSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo="+encodeURIComponent("/report-request/success"+(params.id?"?id="+encodeURIComponent(params.id):"")));
  if (!params.id) redirect("/profile");

  const locale = await readLocale();
  const report = await prisma.reportRequest.findUnique({ where: { id: params.id } });
  if (!report || (!isAdmin(user) && report.userId !== user.id)) redirect("/profile");

  const catalogueReport = getManualReport(report.reportSlug);
  const reportName = catalogueReport?.name[locale] ?? report.reportSlug;
  const showAdminBypass = report.adminBypass && isAdmin(user);
  const recordedPaid=report.paymentStatus===ReportPaymentStatus.PAID;
  const paid=recordedPaid&&(!fixedReportCheckout(report.reportSlug)||await hasCurrentPaidReportEntitlement(report));
  const automatic=Boolean(decodeAutomaticReportInput(report.concern));
  const ready=Boolean(report.generatedPdfSize&&(report.generatedPdfBytes||report.generatedPdfStorageKey));
  const sent=report.deliveryStatus==="email_sent"&&Boolean(report.emailSentAt);
  const pending=automatic&&paid&&!sent&&["auto_queued","auto_generating","auto_generation_retry","auto_email_ready","auto_email_retry","auto_email_uncertain","auto_sending"].includes(report.deliveryStatus);
  const canRetry=pending&&env.AUTO_REPORT_DELIVERY_ENABLED==="true"&&report.userId===user.id;

  return (
    <Section className="max-w-3xl">
      <Card className="glass border-[#D4AF37]/30 text-center">
        <CardHeader>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
            {paid ? <CheckCircle2 className="h-7 w-7" /> : <Clock3 className="h-7 w-7" />}
          </div>
          <CardTitle className="mt-3 font-cinzel text-3xl text-[#FFFFFF]">{safeServerTranslation(locale, "reportRequestReceived")}</CardTitle>
          <p className="naksh-muted-text">{reportName}</p>
        </CardHeader>
        <CardContent className="space-y-4 naksh-muted-text">
          {showAdminBypass ? (
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-sm text-[#FFD700]">
              <ShieldCheck className="h-4 w-4" />
              {safeServerTranslation(locale, "adminTestingModePaymentBypassed")}
            </div>
          ) : null}

          {paid ? (
            <p className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-100">
              {sent?"Your report is ready and the email has been accepted by the delivery provider. If it is not in your inbox, use the secure download below.":ready?"Your report PDF is ready. Email delivery is pending; you can download it securely now.":automatic?autoReportDeliveryMessage(report.language):"Payment is verified and linked to this request. The request is in the paid review queue."}
            </p>
          ) : recordedPaid ? <p className="rounded-lg border border-[#D4AF37]/20 p-4">Payment evidence requires reconciliation. Do not pay again; contact support with your existing request reference.</p> : report.paymentStatus==="REFUNDED" ? <p className="rounded-lg border border-[#D4AF37]/20 p-4">This purchase has been refunded. Paid PDF access is no longer available.</p> : (
            <p className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-4">
              This is a manual-review request. No payment has been collected. The team will confirm scope and fee before any checkout is enabled.
            </p>
          )}

          {(paid||showAdminBypass)&&ready?<Button asChild><Link href={`/api/report-requests/${report.id}/download`}>Download private PDF</Link></Button>:<p>A download option will appear only after a real PDF has been generated.</p>}
          {automatic&&paid&&!sent&&report.deliveryError?<p className="rounded-lg border border-[#D4AF37]/20 p-3 text-sm">{report.deliveryError}</p>:null}
          {automatic&&paid&&<AutomaticReportProgress id={report.id} pending={pending} canRetry={canRetry}/>}
          {automatic&&!sent&&paid&&<p className="text-xs">Verify your registered account email to receive the report link. If delivery is delayed, contact care@naksharix.com with your request reference. No additional payment is needed.</p>}
          <p className="text-xs break-all">Request reference: {report.id}</p>
          <p>Request email: <span className="text-foreground">{report.deliveryEmail}</span></p>
          <p>{safeServerTranslation(locale, "needHelpCare")}</p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild><Link href="/my-readings">View My Readings</Link></Button>
            <Button variant="outline" asChild><Link href="/reports">Browse Reports</Link></Button>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}

async function readLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("naksharix-language")?.value);
}

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

type SearchParams = Promise<{ id?: string }>;

export default async function ReportRequestSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  if (!params.id) redirect("/profile");

  const locale = await readLocale();
  const report = await prisma.reportRequest.findUnique({ where: { id: params.id } });
  if (!report || (!isAdmin(user) && report.userId !== user.id)) redirect("/profile");

  const catalogueReport = getManualReport(report.reportSlug);
  const reportName = catalogueReport?.name[locale] ?? report.reportSlug;
  const showAdminBypass = report.adminBypass && isAdmin(user);
  const paid = report.paymentStatus === ReportPaymentStatus.PAID;

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
              Payment is verified and linked to this request. The request is now in the paid review queue.
            </p>
          ) : (
            <p className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-4">
              This is a manual-review request. No payment has been collected. The team will confirm scope and fee before any checkout is enabled.
            </p>
          )}

          <p>A download option will appear only after an actual PDF has been generated and attached to the request.</p>
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

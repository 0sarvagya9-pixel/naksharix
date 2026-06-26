import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { isAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { normalizeLocale, t, type Locale } from "@/lib/i18n";
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
  const showAdminBypass = report.adminBypass && isAdmin(user);

  return (
    <main className="inner-page-shell">
      <Section className="max-w-3xl">
      <Card className="border-[#E7D8BE] bg-white/90 text-center shadow-[0_18px_54px_rgba(86,64,31,0.10)]">
        <CardHeader>
          <CardTitle className="font-cinzel text-3xl text-[#1F2933]">{t(locale, "reportRequestReceived")}</CardTitle>
          <p className="naksh-muted-text">Your request has been saved for manual review.</p>
        </CardHeader>
        <CardContent className="space-y-4 naksh-muted-text">
          {showAdminBypass ? (
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D8AF66]/35 bg-[#F7EAD3]/70 px-4 py-2 text-sm text-[#B8862E]">
              <ShieldCheck className="h-4 w-4" />
              {t(locale, "adminTestingModePaymentBypassed")}
            </div>
          ) : null}
          <p>No online payment is required at this stage. The workflow is review-based, and generated files appear only after an admin creates a real report PDF.</p>
          <p>Request email: <span className="text-foreground">{report.deliveryEmail}</span></p>
          <p>{t(locale, "needHelpCare")}</p>
        </CardContent>
      </Card>
    </Section>
    </main>
  );
}

async function readLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("naksharix-language")?.value);
}

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
    <Section className="max-w-3xl">
      <Card className="glass border-[#D4AF37]/30 text-center">
        <CardHeader>
          <CardTitle className="font-cinzel text-3xl text-[#FFFFFF]">{t(locale, "reportRequestReceived")}</CardTitle>
          <p className="naksh-muted-text">{t(locale, "yourPaymentSuccessful")}</p>
        </CardHeader>
        <CardContent className="space-y-4 naksh-muted-text">
          {showAdminBypass ? (
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-sm text-[#FFD700]">
              <ShieldCheck className="h-4 w-4" />
              {t(locale, "adminTestingModePaymentBypassed")}
            </div>
          ) : null}
          <p>{t(locale, "reportSentWithin24Hours")}</p>
          <p>{t(locale, "reportWillBeSentTo")}: <span className="text-foreground">{report.deliveryEmail}</span></p>
          {report.planType === "VIP" ? <p>{t(locale, "consultingCredits1000")}</p> : null}
          <p>{t(locale, "needHelpCare")}</p>
        </CardContent>
      </Card>
    </Section>
  );
}

async function readLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("naksharix-language")?.value);
}

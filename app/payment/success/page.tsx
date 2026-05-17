import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { isAdmin as canUseAdminMode } from "@/lib/auth/permissions";
import { normalizeLocale, t, type Locale } from "@/lib/i18n";

type SearchParams = Promise<{ plan?: string; mode?: string }>;

export default async function PaymentSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const locale = await readLocale();
  const plan = params.plan?.toLowerCase() === "vip" ? "vip" : "premium";
  const isAdminMode = params.mode === "admin";
  const user = await getCurrentUser();
  const isAdmin = canUseAdminMode(user);

  if (isAdminMode && !isAdmin) redirect("/pricing");

  const isVip = plan === "vip";
  const title = isAdminMode ? t(locale, "adminAccess") : isVip ? "VIP" : "Premium";
  const thankYou = isVip ? t(locale, "vipSuccessMessage") : t(locale, "premiumSuccessMessage");
  const reportMessage = isVip ? t(locale, "vipReportPreparedEmail24Hours") : t(locale, "reportPreparedEmail24Hours");

  return (
    <Section className="max-w-3xl">
      <Card className="glass overflow-hidden border-amber-200/25">
        <CardHeader className="border-b border-amber-200/10 bg-[radial-gradient(circle_at_top,rgba(245,190,88,0.18),transparent_24rem)] text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-300/35 bg-emerald-300/12 text-emerald-200">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <CardTitle className="mt-4 font-cinzel text-3xl text-amber-50">{t(locale, "paymentSuccessful")}</CardTitle>
          <p className="text-sm text-muted-foreground">{title}</p>
        </CardHeader>
        <CardContent className="space-y-5 p-6 text-center">
          {isAdminMode ? (
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-100">
              <ShieldCheck className="h-4 w-4" />
              {t(locale, "adminTestingModePaymentBypassed")}
            </div>
          ) : null}
          <div className="space-y-3 text-base leading-8 text-muted-foreground">
            <p className="text-lg font-semibold text-foreground">{thankYou}</p>
            <p>{reportMessage}</p>
            {isVip ? <p>{t(locale, "consultingCredits1000")}</p> : null}
            <p>{t(locale, "contactSupportCare")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/dashboard">{t(locale, "goToDashboard")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">{t(locale, "backToPricing")}</Link>
            </Button>
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


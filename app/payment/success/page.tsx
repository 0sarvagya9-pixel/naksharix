import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { isAdmin as canUseAdminMode } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { normalizeLocale, t, type Locale } from "@/lib/i18n";

type SearchParams = Promise<{ plan?: string; mode?: string; paymentId?: string }>;

export default async function PaymentSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const locale = await readLocale();
  const plan = params.plan?.toLowerCase() === "vip" ? "vip" : "premium";
  const isAdminMode = params.mode === "admin";
  const user = await getCurrentUser();
  const isAdmin = canUseAdminMode(user);

  if (isAdminMode && !isAdmin) redirect("/pricing");
  if (!user) redirect("/login");

  const payment = params.paymentId
    ? await prisma.payment.findUnique({
        where: { id: params.paymentId },
        select: { id: true, userId: true, status: true, purpose: true, amount: true, currency: true, providerPaymentId: true }
      })
    : null;

  const verifiedPaid = Boolean(payment && payment.userId === user.id && payment.status === "PAID" && payment.providerPaymentId);
  if (!isAdminMode && !verifiedPaid) redirect("/dashboard");

  const isVip = plan === "vip";
  const title = isAdminMode ? t(locale, "adminAccess") : isVip ? "VIP" : "Premium";
  const thankYou = isVip ? t(locale, "vipSuccessMessage") : t(locale, "premiumSuccessMessage");
  const reportMessage = verifiedPaid
    ? "Payment is verified in Naksharix records. Continue to the report request form to submit accurate birth details for manual review."
    : "Admin mode does not create a payment.";

  return (
    <Section className="max-w-3xl">
      <Card className="glass overflow-hidden border-[#D4AF37]/30">
        <CardHeader className="border-b border-[#D4AF37]/15 bg-[radial-gradient(circle_at_top,rgba(245,190,88,0.18),transparent_24rem)] text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-300/35 bg-emerald-300/10 text-emerald-200">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <CardTitle className="mt-4 font-cinzel text-3xl text-[#FFFFFF]">{t(locale, "paymentSuccessful")}</CardTitle>
          <p className="text-sm naksh-muted-text">{title}</p>
        </CardHeader>
        <CardContent className="space-y-5 p-6 text-center">
          {isAdminMode ? (
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#FFD700]">
              <ShieldCheck className="h-4 w-4" />
              {t(locale, "adminTestingModePaymentBypassed")}
            </div>
          ) : null}
          <div className="space-y-3 text-base leading-8 naksh-muted-text">
            <p className="text-lg font-semibold text-[#FFFFFF]">{thankYou}</p>
            <p>{reportMessage}</p>
            {payment ? <p>Verified payment: {payment.currency} {String(payment.amount)} for {payment.purpose}</p> : null}
            <p>{t(locale, "contactSupportCare")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={payment ? `/report-request/new?orderId=${payment.id}&plan=${isVip ? "VIP" : "PREMIUM"}` : "/dashboard"}>{payment ? "Submit Report Details" : t(locale, "goToDashboard")}</Link>
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


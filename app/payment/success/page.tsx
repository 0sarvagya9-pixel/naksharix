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
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { safeServerTranslation } from "@/lib/i18n-server";
import {paymentCopy, paymentPurposeLabel} from "@/lib/payments/customer-copy";
import {getManualReport} from "@/lib/manual-catalogue";
import {getManualReportCheckout, getReportSlugForPaidId} from "@/lib/reports/checkout-catalogue";
import {personalizedPaymentContext} from "@/lib/reports/checkout-context";
import {subscriptionPlans} from "@/lib/subscription-plans";

type SearchParams = Promise<{ plan?: string; mode?: string; paymentId?: string }>;

export default async function PaymentSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const locale = await readLocale();
  const copy = paymentCopy(locale);
  const isAdminMode = params.mode === "admin";
  const user = await getCurrentUser();
  const isAdmin = canUseAdminMode(user);

  if (isAdminMode && !isAdmin) redirect("/pricing");
  if (!user) redirect("/login");

  const payment = !isAdminMode && params.paymentId
    ? await prisma.payment.findUnique({
        where: { id: params.paymentId },
        select: {
          id: true, userId: true, status: true, purpose: true, amount: true,
          currency: true, providerPaymentId: true, metadata: true,
          reportRequest: {select: {id: true, userId: true, reportSlug: true}}
        }
      })
    : null;

  const verifiedPaid = Boolean(payment && payment.userId === user.id && payment.status === "PAID" && payment.providerPaymentId);
  if (!isAdminMode && !verifiedPaid) redirect("/dashboard");

  // The stored purchase determines the product and continuation. A plan query
  // cannot establish a report request or change a fixed-price report's SKU.
  const metadata = payment?.metadata && typeof payment.metadata === "object" && !Array.isArray(payment.metadata)
    ? payment.metadata : {};
  const reportSlug = typeof metadata.reportId === "string" ? getReportSlugForPaidId(metadata.reportId) : undefined;
  const report = reportSlug ? getManualReport(reportSlug) : undefined;
  const checkout = report ? getManualReportCheckout(report.slug) : null;
  const matchesReportPurchase = Boolean(verifiedPaid && checkout && payment?.purpose === checkout.purpose
    && payment.currency === "INR" && Number(payment.amount) === checkout.amount);
  const linkedRequest = matchesReportPurchase && payment?.reportRequest
    && payment.reportRequest.userId === user.id && payment.reportRequest.reportSlug === report?.slug
    && personalizedPaymentContext(metadata, payment.reportRequest.id) ? payment.reportRequest : null;
  const canSubmitReport = matchesReportPurchase && !payment?.reportRequest && personalizedPaymentContext(metadata);
  const purchasedPlan = payment?.purpose === "SUBSCRIPTION" ? subscriptionPlans.find(plan => plan.id === metadata.plan) : undefined;
  const title = isAdminMode ? safeServerTranslation(locale, "adminAccess")
    : matchesReportPurchase && report ? report.name[locale]
    : purchasedPlan ? `${purchasedPlan.name} · ${paymentPurposeLabel("SUBSCRIPTION", locale)}`
    : payment ? paymentPurposeLabel(payment.purpose, locale) : copy.receipt;
  const nextStep = isAdminMode ? copy.adminNext : linkedRequest ? copy.linkedReportNext
    : canSubmitReport ? copy.reportNext : copy.purchaseNext;
  const continueHref = linkedRequest ? `/report-request/success?id=${encodeURIComponent(linkedRequest.id)}`
    : canSubmitReport && payment && report
      ? `/report-request/new?${new URLSearchParams({orderId: payment.id, reportSlug: report.slug}).toString()}`
      : "/dashboard";
  const continueLabel = linkedRequest ? copy.reportStatus : canSubmitReport ? copy.submitReport
    : safeServerTranslation(locale, "goToDashboard");

  return (
    <Section className="max-w-3xl">
      <Card className="glass overflow-hidden border-[#D4AF37]/30">
        <CardHeader className="border-b border-[#D4AF37]/15 bg-[radial-gradient(circle_at_top,rgba(245,190,88,0.18),transparent_24rem)] text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-300/35 bg-emerald-300/10 text-emerald-200">
            {isAdminMode ? <ShieldCheck className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
          </div>
          <CardTitle className="mt-4 font-cinzel text-3xl text-[#FFFFFF]">{isAdminMode ? copy.adminTitle : copy.verifiedTitle}</CardTitle>
          <p className="text-sm naksh-muted-text">{title}</p>
        </CardHeader>
        <CardContent className="space-y-5 p-6 text-center">
          {isAdminMode ? (
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#FFD700]">
              <ShieldCheck className="h-4 w-4" />
              {safeServerTranslation(locale, "adminAccess")}
            </div>
          ) : null}
          <div className="space-y-3 text-base leading-8 naksh-muted-text">
            <p className="text-lg font-semibold text-[#FFFFFF]">{isAdminMode ? copy.adminNoPayment : copy.paymentRecorded}</p>
            <p>{nextStep}</p>
            {payment ? <p>{copy.verifiedPayment}: {payment.currency} {String(payment.amount)} · {paymentPurposeLabel(payment.purpose,locale)}</p> : null}
            <p>{safeServerTranslation(locale, "contactSupportCare")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={continueHref}>{continueLabel}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">{safeServerTranslation(locale, "backToPricing")}</Link>
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

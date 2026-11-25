import { redirect } from "next/navigation";
import { PaymentStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { ReportRequestForm } from "@/components/report-request/report-request-form";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { safeServerTranslation } from "@/lib/i18n-server";
import { getManualReport } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { autoReportDeliveryMessage } from "@/lib/reports/automatic-report-input";

type SearchParams = Promise<{ orderId?: string; plan?: string; mode?: string; reportSlug?: string; prepare?: string }>;

export default async function NewReportRequestPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    const query = new URLSearchParams();
    if(params.orderId)query.set("orderId",params.orderId);
    if(params.reportSlug)query.set("reportSlug",params.reportSlug);
    if(params.plan)query.set("plan",params.plan);
    if(params.prepare==="1")query.set("prepare","1");
    redirect("/login?redirectTo="+encodeURIComponent("/report-request/new?"+query.toString()));
  }
  const locale = await readLocale();
  const adminMode = params.mode === "admin";
  const isAdmin = canBypassPayment(user);

  if (adminMode && !isAdmin) redirect("/reports");

  const reportSlug = params.reportSlug ?? "premium-kundli";
  const report = getManualReport(reportSlug);
  if (!report) redirect("/reports");

  const checkout = getManualReportCheckout(report.slug);
  const preparing=Boolean(checkout&&params.prepare==="1"&&!params.orderId&&!adminMode&&!isAdmin);
  let paymentVerified = false;
  let plan: "PREMIUM" | "VIP" = params.plan?.toLowerCase() === "vip" ? "VIP" : "PREMIUM";

  if (!adminMode && checkout && !preparing) {
    if (!params.orderId) redirect(`/reports/${report.slug}?checkout=required`);

    const payment = await prisma.payment.findUnique({ where: { id: params.orderId } });
    const metadata = (payment?.metadata as Record<string, unknown> | null) ?? {};
    const validPayment = Boolean(
      payment
      && payment.userId === user.id
      && payment.status === PaymentStatus.PAID
      && payment.purpose === checkout.purpose
      && Number(payment.amount) === checkout.amount
      && metadata.reportId === checkout.reportId
      && (env.AUTO_REPORT_DELIVERY_ENABLED!=="true"||(payment.provider==="RAZORPAY"&&payment.currency==="INR"))
    );

    if (!validPayment || !payment) redirect(`/reports/${report.slug}?checkout=invalid`);

    const existingRequest = await prisma.reportRequest.findUnique({ where: { paymentId: payment.id } });
    if (existingRequest) redirect(`/report-request/success?id=${existingRequest.id}`);

    paymentVerified = true;
    plan = "PREMIUM";
  } else if (!adminMode && params.orderId) {
    redirect(`/reports/${report.slug}`);
  }

  const automaticDelivery=paymentVerified&&env.AUTO_REPORT_DELIVERY_ENABLED==="true";
  return (
    <Section className="max-w-4xl">
      <Card className="glass overflow-visible border-[#D4AF37]/25">
        <CardHeader>
          <CardTitle className="font-cinzel text-3xl">{safeServerTranslation(locale, "reportRequestDetails")}</CardTitle>
          <p className="text-sm naksh-muted-text">
            {preparing?"Complete the required details before payment. Your information will not be added to payment metadata.":paymentVerified
              ? automaticDelivery ? autoReportDeliveryMessage(locale) : "Payment is verified. Submit accurate birth details to create the paid report request."
              : "Submit accurate birth details for manual review. No payment is collected for this review-only request."}
          </p>
        </CardHeader>
        <CardContent className="overflow-visible">
          <ReportRequestForm
            userEmail={user.email}
            orderId={params.orderId}
            plan={plan}
            reportSlug={report.slug}
            reportName={report.name[locale]}
            paymentVerified={paymentVerified}
            automaticDelivery={automaticDelivery}
            specialistDetails={Boolean(checkout)}
            adminBypass={adminMode && isAdmin}
            preflight={preparing&&checkout?{reportId:checkout.reportId,purpose:checkout.purpose,price:checkout.price}:undefined}
          />
        </CardContent>
      </Card>
    </Section>
  );
}

async function readLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("naksharix-language")?.value);
}

import { redirect } from "next/navigation";
import { PaymentPurpose, PaymentStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { ReportRequestForm } from "@/components/report-request/report-request-form";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { normalizeLocale, t, type Locale } from "@/lib/i18n";
import { cookies } from "next/headers";

type SearchParams = Promise<{ orderId?: string; plan?: string; mode?: string; reportSlug?: string }>;

export default async function NewReportRequestPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  const locale = await readLocale();
  const adminMode = params.mode === "admin";
  const isAdmin = canBypassPayment(user);

  if (adminMode && !isAdmin) redirect("/pricing");

  let plan: "PREMIUM" | "VIP" = params.plan?.toLowerCase() === "vip" ? "VIP" : "PREMIUM";

  if (!adminMode && params.orderId) {
    const payment = await prisma.payment.findUnique({ where: { id: params.orderId } });
    const allowedPurposes: PaymentPurpose[] = [PaymentPurpose.SUBSCRIPTION, PaymentPurpose.KUNDLI_REPORT, PaymentPurpose.YEARLY_REPORT, PaymentPurpose.MATCH_REPORT];
    if (!payment || payment.userId !== user.id || payment.status !== PaymentStatus.PAID || !allowedPurposes.includes(payment.purpose)) redirect("/pricing");
    const metadata = (payment.metadata as Record<string, unknown> | null) ?? {};
    plan = String(metadata.plan ?? plan).toUpperCase() === "VIP" ? "VIP" : "PREMIUM";
  }

  return (
    <Section className="max-w-4xl">
      <Card className="glass overflow-visible border-[#D4AF37]/25">
        <CardHeader>
          <CardTitle className="font-cinzel text-3xl">{t(locale, "reportRequestDetails")}</CardTitle>
          <p className="text-sm naksh-muted-text">Submit accurate birth details for manual review. Online payment is not required at request stage, and delivery appears only after a real PDF is generated.</p>
        </CardHeader>
        <CardContent className="overflow-visible">
          <ReportRequestForm userEmail={user.email} orderId={params.orderId} plan={plan} reportSlug={params.reportSlug} adminBypass={adminMode && isAdmin} />
        </CardContent>
      </Card>
    </Section>
  );
}

async function readLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("naksharix-language")?.value);
}

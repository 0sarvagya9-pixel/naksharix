import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ReportRequestForm } from "@/components/report-request/report-request-form";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { normalizeLocale } from "@/lib/i18n";
import { getManualReport } from "@/lib/manual-catalogue";
import { correctionCopy } from "@/lib/reports/report-correction-copy";
import { hasCurrentPaidReportEntitlement } from "@/lib/reports/paid-entitlement";
import { correctionAvailable, revisionRequestSelection } from "@/lib/reports/report-revisions";

export default async function CorrectReport({params}:{params:Promise<{id:string}>}) {
  const {id} = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo="+encodeURIComponent("/report-request/"+id+"/correct"));
  const parent = await prisma.reportRequest.findUnique({where:{id},select:revisionRequestSelection});
  if (!parent || parent.userId!==user.id || !correctionAvailable(parent) || !await hasCurrentPaidReportEntitlement(parent)) notFound();
  const locale = normalizeLocale((await cookies()).get("naksharix-language")?.value);
  const copy = correctionCopy[locale];
  return <Section className="max-w-3xl"><h1 className="mb-3 font-cinzel text-3xl">{copy.title}</h1>
    <p className="mb-5">{copy.instructions}</p>
    <ReportRequestForm userEmail={user.email} reportSlug={parent.reportSlug} reportName={getManualReport(parent.reportSlug)?.name[locale]}
      plan="PREMIUM" specialistDetails paymentVerified correctionId={id}/></Section>;
}

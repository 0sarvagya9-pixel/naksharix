import type {Metadata} from "next";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {reportOperationsCopy,reportOperationState,reportOperationDate} from "@/lib/admin/report-operations-copy";
import { reportConcernText,decodeAutomaticReportInput } from "@/lib/reports/automatic-report-input";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { ReportCorrectionReview } from "@/components/admin/report-correction-review";
import { ReportRequestActions } from "@/components/admin/report-request-actions";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

type Params = Promise<{ id: string }>;
export async function generateMetadata():Promise<Metadata>{const locale=normalizeLocale((await cookies()).get("naksharix-language")?.value);return {title:reportOperationsCopy(locale).title+" | Naksharix",robots:{index:false,follow:false}};}

export default async function AdminReportRequestDetailPage({ params }: { params: Params }) {
  await requireAdminRole();
  const locale=normalizeLocale((await cookies()).get("naksharix-language")?.value),copy=reportOperationsCopy(locale);
  const { id } = await params;
  const request = await prisma.reportRequest.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true, role: true } },
      payment: { select: { id: true, amount: true, currency: true, providerOrderId: true, providerPaymentId: true, status: true, createdAt: true } },
      revisions: {select:{version:true,status:true,input:true,reviewNote:true,emailStatus:true,providerEmailId:true},orderBy:{version:"desc"}},
      statusHistory: { orderBy: { createdAt: "desc" }, take: 12 }
    }
  });
  if (!request) notFound();

  return (
    <Section>
      <Card className="glass border-[#D4AF37]/25">
        <CardHeader>
          <CardTitle className="font-cinzel text-3xl">{copy.title}</CardTitle>
          <p className="text-sm naksh-muted-text">{copy.requested} {reportOperationDate(request.createdAt,locale)}</p>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <Detail label={copy.user} value={request.user?.name ?? request.fullName} />
          <Detail label={copy.loginEmail} value={request.user?.email ?? "-"} />
          <Detail label={copy.deliveryEmail} value={request.deliveryEmail} />
          <Detail label={copy.plan} value={request.planType} />
          <Detail label={copy.paymentStatus} value={reportOperationState(request.paymentStatus,locale)} />
          <Detail label={copy.reportStatus} value={reportOperationState(request.status,locale)} />
          <Detail label={copy.slug} value={request.reportSlug} />
          <Detail label={copy.file} value={request.generatedPdfFileName ?? copy.notGenerated} />
          <Detail label={copy.storage} value={request.generatedPdfStorageDriver ? `${request.generatedPdfStorageDriver}: ${request.generatedPdfStorageKey ?? "-"}` : "-"} />
          <Detail label={copy.deliveryStatus} value={reportOperationState(request.deliveryStatus,locale)} />
          <Detail label={copy.mode} value={decodeAutomaticReportInput(request.concern)?copy.automatic:copy.manual} />
          <Detail label={copy.size} value={request.generatedPdfSize ? `${request.generatedPdfSize} ${copy.bytes}` : "-"} />
          <Detail label={copy.paymentId} value={request.payment?.id ?? copy.notApplicable} />
          <Detail label={copy.orderId} value={request.payment?.providerOrderId ?? "-"} />
          <Detail label={copy.providerId} value={request.payment?.providerPaymentId ?? "-"} />
          <Detail label={copy.amount} value={request.payment ? `${request.payment.currency} ${request.payment.amount}` : "-"} />
          <Detail label={copy.fullName} value={request.fullName} />
          <Detail label={copy.gender} value={request.gender ?? "-"} />
          <Detail label={copy.birthDate} value={request.dateOfBirth} />
          <Detail label={copy.birthTime} value={request.timeOfBirth ?? "-"} />
          <Detail label={copy.place} value={request.birthPlace ?? "-"} />
          <Detail label={copy.phone} value={request.phone ?? "-"} />
          <Detail label={copy.language} value={request.language} />
          <Detail label={copy.support} value="care@naksharix.com" />
          <div className="md:col-span-2 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4">
            <p className="text-[#FFD700]">{copy.concern}</p>
            <p className="mt-2 naksh-muted-text">{reportConcernText(request.concern)||"-"}</p>
          </div>
          {request.revisions.map(revision=><section key={revision.version} className="md:col-span-2 rounded-lg border p-4">
            <h2>{copy.correction} · {copy.version} {revision.version} · {reportOperationState(revision.status,locale)}</h2>
            <details className="my-2"><summary>{copy.correctedDetails}</summary><pre className="mt-2 whitespace-pre-wrap break-words text-xs">{JSON.stringify(revision.input,null,2)}</pre></details>
            {revision.reviewNote&&<p>{revision.reviewNote}</p>}
            {revision.status==="READY"&&<p>{copy.email} · {reportOperationState(revision.emailStatus,locale)} {revision.providerEmailId&&`· ${revision.providerEmailId}`}</p>}
            {revision.status==="READY"&&revision.emailStatus!=="ACCEPTED"&&<ReportCorrectionReview id={id} version={revision.version} sendOnly/>}
            {["PENDING","GENERATING"].includes(revision.status)&&<ReportCorrectionReview id={id} version={revision.version}/>}
          </section>)}
          <div className="md:col-span-2">
            <ReportRequestActions
              requestId={request.id}
              initialStatus={request.status}
              initialNotes={request.adminNotes}
              hasPdf={Boolean(request.generatedPdfSize && (request.generatedPdfBytes || request.generatedPdfStorageKey))}
            />
          </div>
          <div className="md:col-span-2 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4">
            <p className="text-[#FFD700]">{copy.history}</p>
            <div className="mt-3 space-y-2">
              {request.statusHistory.length ? request.statusHistory.map((item) => (
                <div key={item.id} className="rounded-md border border-[#D4AF37]/10 bg-[#020612]/60 p-3">
                  <p className="text-sm text-foreground">{reportOperationState(item.oldStatus??"START",locale)} → {reportOperationState(item.newStatus,locale)}</p>
                  <p className="text-xs naksh-muted-text">{reportOperationDate(item.createdAt,locale)} {item.actorRole ? `${copy.by} ${item.actorRole}` : ""}</p>
                  {item.note ? <p className="mt-1 text-xs naksh-muted-text">{item.note}</p> : null}
                </div>
              )) : <p className="text-sm naksh-muted-text">{copy.emptyHistory}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#FFD700]">{label}</p>
      <p className="mt-2 text-foreground">{value}</p>
    </div>
  );
}

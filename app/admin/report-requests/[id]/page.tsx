import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { ReportRequestActions } from "@/components/admin/report-request-actions";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

type Params = Promise<{ id: string }>;

export default async function AdminReportRequestDetailPage({ params }: { params: Params }) {
  await requireAdminRole();
  const { id } = await params;
  const request = await prisma.reportRequest.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true, role: true } },
      payment: { select: { id: true, amount: true, currency: true, providerOrderId: true, providerPaymentId: true, status: true, createdAt: true } },
      statusHistory: { orderBy: { createdAt: "desc" }, take: 12 }
    }
  });
  if (!request) notFound();

  return (
    <main className="inner-page-shell min-h-screen">
    <Section>
      <Card className="glass border-[#E7D8BE]">
        <CardHeader>
          <CardTitle className="font-cinzel text-3xl text-[#1F2933]">Report Request Details</CardTitle>
          <p className="text-sm text-[#6B7280]">Purchased/requested at {request.createdAt.toLocaleString()}</p>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <Detail label="User" value={request.user?.name ?? request.fullName} />
          <Detail label="Login email" value={request.user?.email ?? "-"} />
          <Detail label="Delivery email" value={request.deliveryEmail} />
          <Detail label="Plan" value={request.planType} />
          <Detail label="Payment status" value={request.paymentStatus} />
          <Detail label="Report status" value={request.status} />
          <Detail label="Report slug" value={request.reportSlug} />
          <Detail label="PDF file" value={request.generatedPdfFileName ?? "Not generated"} />
          <Detail label="PDF storage" value={request.generatedPdfStorageDriver ? `${request.generatedPdfStorageDriver}: ${request.generatedPdfStorageKey ?? "-"}` : "-"} />
          <Detail label="Delivery status" value={request.deliveryStatus} />
          <Detail label="PDF size" value={request.generatedPdfSize ? `${request.generatedPdfSize} bytes` : "-"} />
          <Detail label="Payment ID" value={request.payment?.id ?? "Admin bypass / not applicable"} />
          <Detail label="Razorpay order ID" value={request.payment?.providerOrderId ?? "-"} />
          <Detail label="Razorpay payment ID" value={request.payment?.providerPaymentId ?? "-"} />
          <Detail label="Amount" value={request.payment ? `${request.payment.currency} ${request.payment.amount}` : "-"} />
          <Detail label="Full name" value={request.fullName} />
          <Detail label="Gender" value={request.gender ?? "-"} />
          <Detail label="Date of birth" value={request.dateOfBirth} />
          <Detail label="Time of birth" value={request.timeOfBirth ?? "-"} />
          <Detail label="Birth place" value={request.birthPlace ?? "-"} />
          <Detail label="Phone" value={request.phone ?? "-"} />
          <Detail label="Language" value={request.language} />
          <Detail label="Support email" value="care@naksharix.com" />
          <div className="md:col-span-2 rounded-lg border border-[#E7D8BE] bg-[#FFF9F0]/75 p-4">
            <p className="text-[#B8862E]">Concern</p>
            <p className="mt-2 text-[#6B7280]">{request.concern ?? "-"}</p>
          </div>
          <div className="md:col-span-2">
            <ReportRequestActions
              requestId={request.id}
              initialStatus={request.status}
              initialNotes={request.adminNotes}
              hasPdf={Boolean(request.generatedPdfBytes && request.generatedPdfSize)}
            />
          </div>
          <div className="md:col-span-2 rounded-lg border border-[#E7D8BE] bg-[#FFF9F0]/75 p-4">
            <p className="text-[#B8862E]">Status history</p>
            <div className="mt-3 space-y-2">
              {request.statusHistory.length ? request.statusHistory.map((item) => (
                <div key={item.id} className="rounded-md border border-[#E7D8BE] bg-white/80 p-3">
                  <p className="text-sm text-[#1F2933]">{item.oldStatus ?? "START"} → {item.newStatus}</p>
                  <p className="text-xs text-[#6B7280]">{item.createdAt.toLocaleString()} {item.actorRole ? `by ${item.actorRole}` : ""}</p>
                  {item.note ? <p className="mt-1 text-xs text-[#6B7280]">{item.note}</p> : null}
                </div>
              )) : <p className="text-sm text-[#6B7280]">No status history recorded yet.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#E7D8BE] bg-[#FFF9F0]/75 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#B8862E]">{label}</p>
      <p className="mt-2 text-[#1F2933]">{value}</p>
    </div>
  );
}

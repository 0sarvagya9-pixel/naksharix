import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
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
      payment: { select: { id: true, amount: true, currency: true, providerOrderId: true, providerPaymentId: true, status: true, createdAt: true } }
    }
  });
  if (!request) notFound();

  return (
    <Section>
      <Card className="glass border-amber-200/20">
        <CardHeader>
          <CardTitle className="font-cinzel text-3xl">Report Request Details</CardTitle>
          <p className="text-sm text-muted-foreground">Purchased/requested at {request.createdAt.toLocaleString()}</p>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <Detail label="User" value={request.user?.name ?? request.fullName} />
          <Detail label="Login email" value={request.user?.email ?? "-"} />
          <Detail label="Delivery email" value={request.deliveryEmail} />
          <Detail label="Plan" value={request.planType} />
          <Detail label="Payment status" value={request.paymentStatus} />
          <Detail label="Report status" value={request.status} />
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
          <div className="md:col-span-2 rounded-lg border border-amber-200/15 bg-white/[0.04] p-4">
            <p className="text-amber-100">Concern</p>
            <p className="mt-2 text-muted-foreground">{request.concern ?? "-"}</p>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-amber-200/15 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-amber-200">{label}</p>
      <p className="mt-2 text-foreground">{value}</p>
    </div>
  );
}
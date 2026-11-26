import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { readConsultationMeetingUrl } from "@/lib/consultations/meeting-link";
import { normalizeLocale } from "@/lib/i18n";
import { consultationCustomerCopy, consultationPaymentLabel, consultationStatusLabel, customerConsultationTime } from "@/lib/consultations/customer-copy";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function ConsultationSuccessPage({ params }: PageProps) {
  const { id } = await params;
  const locale = normalizeLocale((await cookies()).get("naksharix-language")?.value);
  const copy = consultationCustomerCopy(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const booking = await prisma.consultationBooking.findUnique({
    where: { id },
    include: { astrologerProfile: true }
  });
  if (!booking || (booking.userId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/astrologers");
  }

  const metadata = booking.metadata as { customerEmail?: string; adminBypass?: boolean } | null;
  const isConfirmed = booking.status === "CONFIRMED" || booking.status === "ACCEPTED";
  const isClosed = booking.status === "CANCELED" || booking.status === "REJECTED";
  const paymentEligible = ["PAID", "FREE", "ADMIN_BYPASS"].includes(booking.paymentStatus);
  const meetingUrl = readConsultationMeetingUrl(booking.metadata);
  const heading = booking.status === "ACCEPTED" ? copy.acceptedTitle : isConfirmed ? copy.confirmedTitle : booking.status === "COMPLETED" ? copy.completedTitle : isClosed ? copy.closedTitle : copy.receivedTitle;
  const summary = isConfirmed
    ? paymentEligible ? copy.confirmedBody.replace("{time}", customerConsultationTime(booking.scheduledAt, locale)) : copy.paymentCheck
    : booking.status === "COMPLETED" ? copy.completedBody : isClosed ? copy.closedBody
      : booking.paymentStatus === "PAID" ? copy.paidAwaitingApproval : copy.pendingBody;

  return (
    <main className="star-field">
      <Section className="max-w-2xl">
        <Card className="glass">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">
              {consultationStatusLabel(booking.status, locale)}
            </p>

            <h1 className="font-cinzel text-3xl font-black text-white">
              {heading}
            </h1>

            <p className="text-sm leading-6 text-slate-300">
              {summary}
            </p>

            <div className="rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/40 p-4 space-y-2 text-sm text-slate-300">
              <p><span className="text-[#FFD700] font-semibold">{copy.astrologer}:</span> {booking.astrologerProfile.displayName}</p>
              <p><span className="text-[#FFD700] font-semibold">{copy.dateTime}:</span> {customerConsultationTime(booking.scheduledAt, locale)} ({booking.durationMins} {copy.minutes})</p>
              <p><span className="text-[#FFD700] font-semibold">{copy.bookingStatus}:</span> {consultationStatusLabel(booking.status, locale)}</p>
              <p><span className="text-[#FFD700] font-semibold">{copy.paymentStatus}:</span> {consultationPaymentLabel(booking.paymentStatus, locale)}</p>
              <p><span className="text-[#FFD700] font-semibold">{copy.contactEmail}:</span> {metadata?.customerEmail ?? user.email}</p>
            </div>

            {isConfirmed && paymentEligible && meetingUrl ? (
              <a href={meetingUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex rounded-lg border border-[#D4AF37]/40 px-4 py-2 font-semibold text-[#FFD700]">
                {copy.joinExternal}
              </a>
            ) : null}

            {metadata?.adminBypass ? (
              <p className="rounded-md border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-3 text-xs text-[#FFD700]">
                {copy.adminBypass}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-4">
              <Button asChild>
                <Link href="/dashboard/bookings">{copy.myBookings}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/consultation">{copy.backAstrologers}</Link>
              </Button>
            </div>

            <p className="text-xs text-slate-400 pt-4">
              {copy.support} <a className="underline text-[#FFD700]" href="mailto:care@naksharix.com">care@naksharix.com</a>
            </p>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

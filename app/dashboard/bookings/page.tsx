import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ConsultationReviewForm } from "@/components/consultation-review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";
import { Video } from "lucide-react";
import { normalizeLocale } from "@/lib/i18n";
import { readConsultationMeetingUrl } from "@/lib/consultations/meeting-link";
import { consultationCustomerCopy, consultationModeLabel, consultationPaymentLabel, consultationStatusLabel, customerConsultationTime } from "@/lib/consultations/customer-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const copy = consultationCustomerCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));
  return {
    ...seo({ title: `${copy.bookingsTitle} - Naksharix`, description: copy.bookingsDescription, path: "/dashboard/bookings" }),
    robots: { index: false, follow: true }
  };
}

export default async function UserBookingsPage() {
  const locale = normalizeLocale((await cookies()).get("naksharix-language")?.value);
  const copy = consultationCustomerCopy(locale);
  const user = await getCurrentUser();
  const bookings = user ? await prisma.consultationBooking.findMany({
    where: { userId: user.id },
    orderBy: { scheduledAt: "desc" },
    include: { astrologerProfile: true, reviews: true }
  }) : [];

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{copy.dashboard}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{copy.bookingsTitle}</h1>
        <p className="mt-3 max-w-3xl naksh-muted-text">{copy.bookingsDescription}</p>

        {!user ? (
          <Card className="mt-8 glass">
            <CardContent className="p-6">
              <p className="text-sm">{copy.signInBookings}</p>
              <Button className="mt-4" asChild>
                <Link href="/login">{copy.signIn}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-8 grid gap-4">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === "CONFIRMED" || booking.status === "ACCEPTED";
            const paymentEligible = ["PAID", "FREE", "ADMIN_BYPASS"].includes(booking.paymentStatus);
            const meetingLink = readConsultationMeetingUrl(booking.metadata);

            return (
              <Card key={booking.id} className="glass">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="font-cinzel text-xl">{booking.astrologerProfile.displayName}</CardTitle>
                      <p className="mt-1 text-sm naksh-muted-text">
                        {consultationModeLabel(booking.mode, locale)} | {customerConsultationTime(booking.scheduledAt, locale)} ({booking.durationMins} {copy.minutes})
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#FFD700]">
                        {copy.booking}: {consultationStatusLabel(booking.status, locale)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        {copy.payment}: {consultationPaymentLabel(booking.paymentStatus, locale)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-[#D4AF37]/10 bg-[#02112C]/40 p-4 space-y-2">
                    <p className="text-sm font-semibold text-[#FFD700]">{copy.birthDetails}:</p>
                    <p className="text-xs naksh-muted-text">
                      {copy.name}: {booking.birthName || "-"} | {copy.dateOfBirth}: {booking.birthDate ? new Date(booking.birthDate).toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", { timeZone: "UTC" }) : "-"} | {copy.time}: {booking.birthTime || "-"} | {copy.place}: {booking.birthPlace || "-"}
                    </p>
                    <p className="text-sm font-semibold text-[#FFD700] pt-2">{copy.yourQuestion}:</p>
                    <p className="text-sm italic text-slate-300">&quot;{booking.question}&quot;</p>
                  </div>

                  {isConfirmed && paymentEligible && meetingLink ? (
                    <div className="flex flex-wrap gap-2">
                      <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                        <a href={meetingLink} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-2" /> {copy.joinSession}
                        </a>
                      </Button>
                    </div>
                  ) : isConfirmed && paymentEligible ? (
                    <p className="text-xs text-[#FFD700] italic">
                      {copy.meetingPending}
                    </p>
                  ) : isConfirmed ? <p className="text-xs text-[#FFD700]">{copy.paymentCheck}</p> : null}

                  {booking.status === "COMPLETED" && !booking.reviews.length ? (
                    <div className="pt-2">
                      <p className="text-sm font-semibold text-[#FFD700] mb-2">{copy.leaveReview}</p>
                      <ConsultationReviewForm bookingId={booking.id} />
                    </div>
                  ) : null}

                  {booking.reviews.length ? (
                    <p className="rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/60 p-3 text-xs text-[#FFD700]">
                      {copy.rated.replace("{rating}", String(booking.reviews[0].rating))}: &quot;{booking.reviews[0].body}&quot;
                    </p>
                  ) : null}

                  {booking.status === "REQUESTED" && booking.paymentStatus === "PENDING" ? (
                    <div className="rounded-md border border-[#FF4D4F]/20 bg-[#FF4D4F]/10 p-3 text-xs text-red-300">
                      {copy.pendingPayment}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
          {user && !bookings.length ? (
            <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">
              {copy.empty}
            </p>
          ) : null}
        </div>
      </Section>
    </main>
  );
}

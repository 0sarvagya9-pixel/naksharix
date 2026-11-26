import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ConsultationReviewForm } from "@/components/consultation-review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { readConsultationMeetingUrl } from "@/lib/consultations/meeting-link";
import { seo } from "@/lib/seo";
import { normalizeLocale } from "@/lib/i18n";
import { consultationCustomerCopy, consultationModeLabel, consultationStatusLabel, customerConsultationTime } from "@/lib/consultations/customer-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const copy = consultationCustomerCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));
  return seo({ title: `${copy.historyTitle} - Naksharix`, description: copy.historyDescription, path: "/dashboard/consultations" });
}

export default async function UserConsultationHistoryPage() {
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
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{copy.yourSessions}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{copy.historyTitle}</h1>
        {!user ? (
          <Card className="mt-8 glass"><CardContent className="p-6"><p>{copy.signInHistory}</p><Button className="mt-4" asChild><Link href="/auth/login">{copy.signIn}</Link></Button></CardContent></Card>
        ) : null}
        <div className="mt-8 grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="glass">
              <CardHeader>
                <CardTitle className="font-cinzel">{booking.astrologerProfile.displayName}</CardTitle>
                <p className="text-sm naksh-muted-text">{consultationModeLabel(booking.mode, locale)} | {customerConsultationTime(booking.scheduledAt, locale)} | {consultationStatusLabel(booking.status, locale)}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm naksh-muted-text">{booking.question}</p>
                {["CONFIRMED", "ACCEPTED"].includes(booking.status) &&
                  ["PAID", "FREE", "ADMIN_BYPASS"].includes(booking.paymentStatus) &&
                  readConsultationMeetingUrl(booking.metadata) ?
                  <div className="rounded-lg border border-[#D4AF37]/25 p-4">
                    <p className="text-xs naksh-muted-text">{copy.meetingAssigned}</p>
                    <a href={readConsultationMeetingUrl(booking.metadata)!} target="_blank" rel="noopener noreferrer"
                      className="mt-2 inline-block rounded-lg border border-[#D4AF37]/40 px-4 py-2 text-sm font-semibold text-[#FFD700]">
                      {copy.joinExternal}
                    </a>
                    <p className="mt-2 text-xs naksh-muted-text">{copy.meetingPrivacy}</p>
                  </div> : null}
                {["CONFIRMED", "ACCEPTED"].includes(booking.status) &&
                  !readConsultationMeetingUrl(booking.metadata) ?
                  <p className="text-xs naksh-muted-text">{copy.meetingPending}</p> : null}
                {booking.status === "COMPLETED" && !booking.reviews.length ? <ConsultationReviewForm bookingId={booking.id} /> : null}
                {booking.reviews.length ? <p className="rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/60 p-3 text-sm naksh-muted-text">{copy.rated.replace("{rating}", String(booking.reviews[0].rating))}.</p> : null}
              </CardContent>
            </Card>
          ))}
          {user && !bookings.length ? <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">{copy.empty}</p> : null}
        </div>
      </Section>
    </main>
  );
}

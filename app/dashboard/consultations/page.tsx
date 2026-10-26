import type { Metadata } from "next";
import Link from "next/link";
import { ConsultationReviewForm } from "@/components/consultation-review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { readConsultationMeetingUrl } from "@/lib/consultations/meeting-link";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  title: "Consultation History - Naksharix",
  description: "View your Naksharix consultation history and review completed astrologer sessions.",
  path: "/dashboard/consultations"
});

export default async function UserConsultationHistoryPage() {
  const user = await getCurrentUser();
  const bookings = user ? await prisma.consultationBooking.findMany({
    where: { userId: user.id },
    orderBy: { scheduledAt: "desc" },
    include: { astrologerProfile: true, reviews: true }
  }) : [];

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Your sessions</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Consultation History</h1>
        {!user ? (
          <Card className="mt-8 glass"><CardContent className="p-6"><p>Please sign in to view consultation history.</p><Button className="mt-4" asChild><Link href="/auth/login">Sign in</Link></Button></CardContent></Card>
        ) : null}
        <div className="mt-8 grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="glass">
              <CardHeader>
                <CardTitle className="font-cinzel">{booking.astrologerProfile.displayName}</CardTitle>
                <p className="text-sm naksh-muted-text">{booking.mode} | {booking.scheduledAt.toLocaleString("en-IN")} | {booking.status}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm naksh-muted-text">{booking.question}</p>
                {["CONFIRMED", "ACCEPTED"].includes(booking.status) &&
                  ["PAID", "FREE", "ADMIN_BYPASS"].includes(booking.paymentStatus) &&
                  readConsultationMeetingUrl(booking.metadata) ?
                  <div className="rounded-lg border border-[#D4AF37]/25 p-4">
                    <p className="text-xs naksh-muted-text">Your astrologer has assigned an external meeting room.</p>
                    <a href={readConsultationMeetingUrl(booking.metadata)!} target="_blank" rel="noopener noreferrer"
                      className="mt-2 inline-block rounded-lg border border-[#D4AF37]/40 px-4 py-2 text-sm font-semibold text-[#FFD700]">
                      Join external consultation room
                    </a>
                    <p className="mt-2 text-xs naksh-muted-text">The meeting is hosted by a third party. Confirm the time and privacy controls with your astrologer.</p>
                  </div> : null}
                {["CONFIRMED", "ACCEPTED"].includes(booking.status) &&
                  !readConsultationMeetingUrl(booking.metadata) ?
                  <p className="text-xs naksh-muted-text">No external meeting link has been assigned yet.</p> : null}
                {booking.status === "COMPLETED" && !booking.reviews.length ? <ConsultationReviewForm bookingId={booking.id} /> : null}
                {booking.reviews.length ? <p className="rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/60 p-3 text-sm naksh-muted-text">Reviewed with {booking.reviews[0].rating}/5 stars.</p> : null}
              </CardContent>
            </Card>
          ))}
          {user && !bookings.length ? <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">No consultation bookings yet.</p> : null}
        </div>
      </Section>
    </main>
  );
}

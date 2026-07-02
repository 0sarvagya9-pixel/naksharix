import type { Metadata } from "next";
import Link from "next/link";
import { ConsultationReviewForm } from "@/components/consultation-review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";
import { Video } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...seo({
    title: "My Consultation Bookings - Naksharix",
    description: "View and manage your upcoming Naksharix consultations, meeting links, and session history.",
    path: "/dashboard/bookings"
  }),
  robots: { index: false, follow: true }
};

export default async function UserBookingsPage() {
  const user = await getCurrentUser();
  const bookings = user ? await prisma.consultationBooking.findMany({
    where: { userId: user.id },
    orderBy: { scheduledAt: "desc" },
    include: { astrologerProfile: true, reviews: true }
  }) : [];

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">User Dashboard</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">My Bookings</h1>
        <p className="mt-3 max-w-3xl naksh-muted-text">Track your live consultation schedules, join credentials, and billing receipts.</p>

        {!user ? (
          <Card className="mt-8 glass">
            <CardContent className="p-6">
              <p className="text-sm">Please sign in to view your bookings.</p>
              <Button className="mt-4" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-8 grid gap-4">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === "CONFIRMED" || booking.status === "ACCEPTED";
            const metadata = booking.metadata && typeof booking.metadata === "object" ? booking.metadata as Record<string, unknown> : {};
            const meetingLink = String(metadata.meetingLink || "");

            return (
              <Card key={booking.id} className="glass">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="font-cinzel text-xl">{booking.astrologerProfile.displayName}</CardTitle>
                      <p className="mt-1 text-sm naksh-muted-text">
                        {booking.mode} Session | {booking.scheduledAt.toLocaleString("en-IN")} ({booking.durationMins} mins)
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#FFD700]">
                        Booking: {booking.status}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        Payment: {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-[#D4AF37]/10 bg-[#02112C]/40 p-4 space-y-2">
                    <p className="text-sm font-semibold text-[#FFD700]">Birth Details Submitted:</p>
                    <p className="text-xs naksh-muted-text">
                      Name: {booking.birthName || "-"} | DOB: {booking.birthDate ? new Date(booking.birthDate).toLocaleDateString("en-IN") : "-"} | Time: {booking.birthTime || "-"} | Place: {booking.birthPlace || "-"}
                    </p>
                    <p className="text-sm font-semibold text-[#FFD700] pt-2">Your Question:</p>
                    <p className="text-sm italic text-slate-300">&quot;{booking.question}&quot;</p>
                  </div>

                  {isConfirmed && meetingLink ? (
                    <div className="flex flex-wrap gap-2">
                      <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                        <a href={meetingLink} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-2" /> Join Session
                        </a>
                      </Button>
                    </div>
                  ) : isConfirmed ? (
                    <p className="text-xs text-[#FFD700] italic">
                      ✓ Paid. Meeting link will be updated by the astrologer or admin before the schedule starts.
                    </p>
                  ) : null}

                  {booking.status === "COMPLETED" && !booking.reviews.length ? (
                    <div className="pt-2">
                      <p className="text-sm font-semibold text-[#FFD700] mb-2">Leave a Review</p>
                      <ConsultationReviewForm bookingId={booking.id} />
                    </div>
                  ) : null}

                  {booking.reviews.length ? (
                    <p className="rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/60 p-3 text-xs text-[#FFD700]">
                      You rated this session {booking.reviews[0].rating}/5 stars: &quot;{booking.reviews[0].body}&quot;
                    </p>
                  ) : null}

                  {booking.status === "REQUESTED" && booking.paymentStatus === "PENDING" ? (
                    <div className="rounded-md border border-[#FF4D4F]/20 bg-[#FF4D4F]/10 p-3 text-xs text-red-300">
                      Payment is pending. Please complete checkout to secure your slot.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
          {user && !bookings.length ? (
            <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">
              No consultation bookings yet.
            </p>
          ) : null}
        </div>
      </Section>
    </main>
  );
}

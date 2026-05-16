import type { Metadata } from "next";
import Link from "next/link";
import { ConsultationReviewForm } from "@/components/consultation-review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
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
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Your sessions</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Consultation History</h1>
        {!user ? (
          <Card className="mt-8 glass"><CardContent className="p-6"><p>Please sign in to view consultation history.</p><Button className="mt-4" asChild><Link href="/auth/login">Sign in</Link></Button></CardContent></Card>
        ) : null}
        <div className="mt-8 grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="glass">
              <CardHeader>
                <CardTitle className="font-cinzel">{booking.astrologerProfile.displayName}</CardTitle>
                <p className="text-sm text-muted-foreground">{booking.mode} | {booking.scheduledAt.toLocaleString("en-IN")} | {booking.status}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{booking.question}</p>
                {booking.status === "COMPLETED" && !booking.reviews.length ? <ConsultationReviewForm bookingId={booking.id} /> : null}
                {booking.reviews.length ? <p className="rounded-lg border border-amber-200/15 bg-background/45 p-3 text-sm text-muted-foreground">Reviewed with {booking.reviews[0].rating}/5 stars.</p> : null}
              </CardContent>
            </Card>
          ))}
          {user && !bookings.length ? <p className="rounded-lg border border-amber-200/15 bg-card/60 p-4 text-sm text-muted-foreground">No consultation bookings yet.</p> : null}
        </div>
      </Section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, IndianRupee, Star, UserRound } from "lucide-react";
import { AstrologerBookingActions } from "@/components/astrologer-booking-actions";
import { AstrologerNoteForm } from "@/components/astrologer-note-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  title: "Astrologer Dashboard - Naksharix",
  description: "Manage Naksharix astrologer profile, availability, bookings, reviews, and earnings.",
  path: "/astrologer/dashboard"
});

export default async function AstrologerDashboardPage() {
  const user = await requireAstroRole();
  const [profile, consultantProfile] = await Promise.all([
    prisma.astrologerProfile.findUnique({
      where: { userId: user.id },
      include: { bookings: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { scheduledAt: "desc" }, take: 8 }, slots: true, payouts: true }
    }),
    prisma.consultantProfile.findUnique({ where: { userId: user.id } })
  ]);
  const activeProfile = profile ?? consultantProfile;
  const today = new Date().toDateString();
  const bookings = profile?.bookings ?? [];
  const todayBookings = bookings.filter((booking) => booking.scheduledAt.toDateString() === today).length;
  const pendingBookings = bookings.filter((booking) => booking.status === "REQUESTED" || booking.status === "PAYMENT_PENDING").length;
  const completedBookings = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const earnings = (profile?.payouts ?? []).reduce((sum, payout) => sum + Number(payout.amount), 0);
  const profileCompletion = activeProfile
    ? Math.round([
      activeProfile.displayName,
      activeProfile.bio,
      activeProfile.specialization,
      activeProfile.languages?.length,
      Number(activeProfile.consultationPrice) > 0
    ].filter(Boolean).length / 5 * 100)
    : 0;

  return (
    <main className="star-field">
      <Section>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Consultant Workspace</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">Welcome, {user.name}</h1>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              Manage your Naksharix marketplace profile, schedule, bookings, and payout readiness from one calm dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href="/astrologer/profile">Edit profile</Link></Button>
            <Button variant="outline" asChild><Link href="/astrologer/availability">Availability</Link></Button>
            <Button variant="outline" asChild><Link href="/astrologer/earnings">Earnings</Link></Button>
            <Button variant="secondary" asChild><Link href="/astrologer/report-generator">AI Reports</Link></Button>
          </div>
        </div>

        {!activeProfile ? (
          <Card className="mt-8 glass">
            <CardContent className="p-6">
              <p className="font-cinzel text-xl font-bold">Your profile is not created yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Complete your marketplace profile so admins can review and approve it for public booking.</p>
              <Button className="mt-4" asChild><Link href="/astrologer/profile">Create profile</Link></Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={UserRound} label="Profile completion" value={`${profileCompletion}%`} note={activeProfile?.status ?? "Not submitted"} />
          <Metric icon={CalendarClock} label="Today bookings" value={todayBookings.toString()} note={`${pendingBookings} pending`} />
          <Metric icon={Star} label="Rating" value={(activeProfile?.rating ?? 0).toFixed(1)} note={`${activeProfile?.reviewCount ?? 0} reviews`} />
          <Metric icon={IndianRupee} label="Earnings summary" value={`INR ${earnings.toLocaleString("en-IN")}`} note={activeProfile?.availabilityStatus ?? "OFFLINE"} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel">Booking Snapshot</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <p>Pending bookings: <span className="text-foreground">{pendingBookings}</span></p>
              <p>Completed consultations: <span className="text-foreground">{completedBookings}</span></p>
              <p>Next phase can connect accepted bookings to secure chat/audio/video without changing this data model.</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel">Approval Status</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <p>Status: <span className="text-amber-200">{activeProfile?.status ?? "DRAFT"}</span></p>
              <p>Availability: <span className="text-foreground">{activeProfile?.availabilityStatus ?? "OFFLINE"}</span></p>
              <p>Approved profiles appear on the public astrologer marketplace. Pending profiles stay private until admin review.</p>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-8 glass">
          <CardHeader><CardTitle className="font-cinzel">Recent Booking Actions</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border border-amber-200/15 bg-card/60 p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
                  <div>
                    <p className="font-cinzel font-bold">{booking.user.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.mode} | {booking.scheduledAt.toLocaleString("en-IN")} | {booking.status}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{booking.question}</p>
                  </div>
                  <AstrologerBookingActions bookingId={booking.id} />
                </div>
                <div className="mt-4">
                  <AstrologerNoteForm userId={booking.user.id} />
                </div>
              </div>
            ))}
            {!bookings.length ? <p className="text-sm text-muted-foreground">No bookings yet.</p> : null}
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof UserRound; label: string; value: string; note: string }) {
  return (
    <Card className="glass">
      <CardContent className="p-5">
        <Icon className="h-5 w-5 text-amber-200" />
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-cinzel text-2xl font-black">{value}</p>
        <p className="mt-2 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

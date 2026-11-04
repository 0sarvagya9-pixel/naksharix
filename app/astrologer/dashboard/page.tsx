import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, IndianRupee, MessageCircle, Star, UserRound, WalletCards } from "lucide-react";
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
  const isConsultant = user.effectiveRole === "CONSULTANT";
  const [profile, consultantProfile] = await Promise.all([
    prisma.astrologerProfile.findUnique({
      where: { userId: user.id },
      include: {
        bookings: { where: { status: { in: ["ACCEPTED", "CONFIRMED"] }, scheduledAt: { gte: new Date() } }, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { scheduledAt: "asc" }, take: 8 },
        slots: true,
        payouts: true,
        reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 3 }
      }
    }),
    prisma.consultantProfile.findUnique({ where: { userId: user.id } })
  ]);
  const activeProfile = profile ?? consultantProfile;
  const bookings = profile?.bookings ?? [];
  const now = new Date();
  const indiaOffsetMs = 330 * 60 * 1000;
  const startOfToday = new Date(
    Math.floor((now.getTime() + indiaOffsetMs) / 86_400_000) * 86_400_000 - indiaOffsetMs
  );
  const endOfToday = new Date(startOfToday.getTime() + 86_400_000);
  // Display rows are intentionally capped; counters and earnings must read the
  // full authorized profile records rather than just the 8 visible bookings.
  const bookingScope = profile ? { astrologerProfileId: profile.id } : null;
  const [todayBookings, upcomingBookings, pendingBookings, completedBookings, totalEarnings] =
    bookingScope ? await Promise.all([
      prisma.consultationBooking.count({
        where: { ...bookingScope, status: { in: ["ACCEPTED", "CONFIRMED"] },
          scheduledAt: { gte: startOfToday, lt: endOfToday } }
      }),
      prisma.consultationBooking.count({
        where: { ...bookingScope, status: { in: ["ACCEPTED", "CONFIRMED"] },
          scheduledAt: { gte: now } }
      }),
      prisma.consultationBooking.count({
        where: { ...bookingScope, status: { in: ["PENDING", "REQUESTED", "PAYMENT_PENDING"] } }
      }),
      prisma.consultationBooking.count({
        where: { ...bookingScope, status: "COMPLETED" }
      }),
      prisma.consultationBooking.aggregate({
        where: { ...bookingScope, status: "COMPLETED",
          paymentStatus: { in: ["PAID", "ADMIN_BYPASS", "FREE"] } },
        _sum: { amount: true }
      }).then(result => Number(result._sum.amount ?? 0))
    ]) : [0, 0, 0, 0, 0];
  const pendingPayout = (profile?.payouts ?? []).filter((payout) => payout.status === "PENDING").reduce((sum, payout) => sum + Number(payout.amount), 0);
  const completedPayout = (profile?.payouts ?? []).filter((payout) => payout.status === "PAID" || payout.status === "COMPLETED").reduce((sum, payout) => sum + Number(payout.amount), 0);
  const hasActiveSlots = (profile?.slots ?? []).some((slot) => slot.isActive && !slot.isHoliday);
  const completion = profileCompletion(activeProfile, hasActiveSlots);
  const status = activeProfile?.status ?? "DRAFT";

  return (
    <main className="star-field">
      <Section>
        <div className="relative overflow-hidden rounded-[28px] border border-[#d4af37]/25 bg-gradient-to-br from-[#102d4c] via-[#0b2441] to-[#07172b] p-6 shadow-[0_24px_60px_rgba(2,12,30,.25)] sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#d4af37]/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-[#d4af37]/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[.12em] text-[#ffe0a0]">
                  <Star className="h-3.5 w-3.5" aria-hidden="true" /> Professional workspace
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-[#d6e2ee]">
                  {statusLabel(status)} profile
                </span>
              </div>
              <h1 className="font-cinzel text-3xl font-black leading-tight text-white sm:text-4xl">
                Welcome, {activeProfile?.displayName ?? user.name}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#c6d6e6] sm:text-base">
                {isConsultant ? "Your consultation practice" : "Your astrology practice"} in one place.
                Review requests, manage availability and prepare for your next session.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button asChild className="nx-portal-action"><Link href="/astrologer/requests">Review requests</Link></Button>
              <Button variant="outline" asChild className="nx-portal-action"><Link href="/astrologer/availability">Update availability</Link></Button>
              <Button variant="outline" asChild className="nx-portal-action"><Link href="/astrologer/profile">Edit profile</Link></Button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-cinzel text-xl font-bold text-white">Practice overview</h2>
            <p className="mt-1 text-sm naksh-muted-text">Live counts for your complete booking history. Today follows IST.</p>
          </div>
          <Button variant="outline" asChild className="nx-portal-action"><Link href="/astrologer/bookings/upcoming">View upcoming sessions</Link></Button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <Metric icon={UserRound} label="Profile Status" value={statusLabel(status)} note={`${completion}% complete`} />
          <Metric icon={CalendarClock} label="Today’s Bookings" value={todayBookings.toString()} note={`${upcomingBookings} upcoming`} />
          <Metric icon={CalendarClock} label="Upcoming Bookings" value={upcomingBookings.toString()} note="Accepted future sessions" />
          <Metric icon={MessageCircle} label="Pending Requests" value={pendingBookings.toString()} note={`${completedBookings} completed`} />
          <Metric icon={MessageCircle} label="Completed Consultations" value={completedBookings.toString()} note="Finished sessions" />
          <Metric icon={IndianRupee} label="Total Earnings" value={`INR ${totalEarnings.toLocaleString("en-IN")}`} note="Completed eligible sessions" />
          <Metric icon={WalletCards} label="Pending Payout" value={`INR ${pendingPayout.toLocaleString("en-IN")}`} note="Awaiting payout" />
          <Metric icon={Star} label="Rating" value={(activeProfile?.rating ?? 0).toFixed(1)} note={`${activeProfile?.reviewCount ?? 0} reviews`} />
          <Metric icon={UserRound} label="Availability Status" value={hasActiveSlots ? "AVAILABLE" : "NOT AVAILABLE"} note="Chat, call, video controls" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="glass lg:col-span-2">
            <CardHeader><CardTitle className="font-cinzel">Profile Completion</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="h-3 overflow-hidden rounded-full bg-[#02112C]/70"><div className="h-full rounded-full bg-gradient-to-r from-[#01A361] to-[#FFD700]" style={{ width: `${completion}%` }} /></div>
              <div className="grid gap-2 text-sm naksh-muted-text sm:grid-cols-2">
                {completionItems(activeProfile, hasActiveSlots).map((item) => <p key={item.label} className={item.done ? "text-[#FFD700]" : "naksh-muted-text"}>{item.done ? "✓" : "○"} {item.label}</p>)}
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel">Approval Status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm naksh-muted-text">
              <p className="text-lg font-semibold text-[#FFD700]">{statusLabel(status)}</p>
              <p>{approvalMessage(status)}</p>
              {activeProfile?.rejectionReason ? <p className="rounded-md border border-[#FF4D4F]/30 bg-[#FF4D4F]/10 p-3 text-[#FFB4B5]">{activeProfile.rejectionReason}</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel">Earnings Overview</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm naksh-muted-text">
              <p>Total earnings: <span className="text-[#FFFFFF]">INR {totalEarnings.toLocaleString("en-IN")}</span></p>
              <p>Pending payout: <span className="text-[#FFFFFF]">INR {pendingPayout.toLocaleString("en-IN")}</span></p>
              <p>Completed payout: <span className="text-[#FFFFFF]">INR {completedPayout.toLocaleString("en-IN")}</span></p>
              <Button variant="outline" asChild className="nx-portal-action"><Link href="/astrologer/earnings"><WalletCards className="h-4 w-4" /> Payout Request</Link></Button>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel">Availability Status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm naksh-muted-text">
              <p>Current status: <span className="text-[#FFD700]">{hasActiveSlots ? "Available" : "Not available"}</span></p>
              <p>Chat: {activeProfile?.availableForChat ? "Available" : "Off"}</p>
              <p>Call: {activeProfile?.availableForCall ? "Available" : "Off"}</p>
              <p>Video: {activeProfile?.availableForVideo ? "Available" : "Off"}</p>
            </CardContent>
          </Card>
          <Card id="reviews" className="glass">
            <CardHeader><CardTitle className="font-cinzel">Reviews</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm naksh-muted-text">
              {(profile?.reviews ?? []).map((review) => <p key={review.id} className="rounded-md border border-[#D4AF37]/20 bg-[#02112C]/60 p-3">{review.rating}/5 - {review.body ?? "No written review"}</p>)}
              {!profile?.reviews.length ? <p>No reviews yet.</p> : null}
            </CardContent>
          </Card>
        </div>

        <Card id="bookings" className="mt-8 glass">
          <CardHeader><CardTitle className="font-cinzel">Upcoming Consultations</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
                  <div>
                    <p className="font-cinzel font-bold">{booking.user.name}</p>
                    <p className="text-sm naksh-muted-text">{booking.mode} | {booking.scheduledAt.toLocaleString("en-IN")} | {booking.status}</p>
                    <p className="mt-2 text-sm naksh-muted-text">{booking.question}</p>
                    <p className="mt-2 text-xs text-amber-200">
                      Birth Info: {booking.birthName || "-"} | DOB: {booking.birthDate ? booking.birthDate.toLocaleDateString("en-IN") : "-"} | TOB: {booking.birthTime || "-"} | POB: {booking.birthPlace || "-"}
                    </p>
                  </div>
                  <AstrologerBookingActions bookingId={booking.id} />
                </div>
                <div className="mt-4">
                  <AstrologerNoteForm userId={booking.user.id} />
                </div>
              </div>
            ))}
            {!bookings.length ? <p className="text-sm naksh-muted-text">No upcoming consultations yet.</p> : null}
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof UserRound; label: string; value: string; note: string }) {
  return (
    <Card className="glass border-[#d4af37]/20 bg-gradient-to-b from-[#0d2b48]/90 to-[#071e37]/85 transition-colors hover:border-[#d4af37]/45">
      <CardContent className="p-5">
        <Icon className="h-5 w-5 text-[#FFD700]" />
        <p className="mt-4 text-sm naksh-muted-text">{label}</p>
        <p className="mt-1 font-cinzel text-2xl font-black">{value}</p>
        <p className="mt-2 text-xs naksh-muted-text">{note}</p>
      </CardContent>
    </Card>
  );
}

function profileCompletion(profile: Record<string, unknown> | null | undefined, hasAvailability: boolean) {
  return Math.round(completionItems(profile, hasAvailability).filter((item) => item.done).length / 8 * 100);
}

function completionItems(profile: Record<string, unknown> | null | undefined, hasAvailability: boolean) {
  const languages = Array.isArray(profile?.languages) ? profile.languages : [];
  const price = Number(profile?.consultationPrice ?? 0);
  return [
    { label: "Display name", done: Boolean(profile?.displayName) },
    { label: "Bio", done: Boolean(profile?.bio) },
    { label: "Expertise", done: Boolean(profile?.specialization) || Boolean((profile?.skills as unknown[])?.length) },
    { label: "Languages", done: languages.length > 0 },
    { label: "Experience", done: Number(profile?.experienceYears ?? 0) > 0 },
    { label: "Consultation price", done: price > 0 },
    { label: "Availability", done: hasAvailability || profile?.availabilityStatus === "ONLINE" },
    { label: "Profile photo", done: Boolean(profile?.photoUrl) }
  ];
}

function statusLabel(status: string) {
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  if (status === "PENDING_REVIEW") return "Pending";
  return "Draft";
}

function approvalMessage(status: string) {
  if (status === "APPROVED") return "Your profile is live and visible to users.";
  if (status === "REJECTED") return "Your profile needs changes. Please update your details or contact support.";
  return "Your astrologer profile is under review. You will appear publicly after admin approval.";
}

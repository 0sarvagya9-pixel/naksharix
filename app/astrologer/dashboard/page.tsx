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
  const isConsultant = user.role === "CONSULTANT";
  const [profile, consultantProfile] = await Promise.all([
    prisma.astrologerProfile.findUnique({
      where: { userId: user.id },
      include: {
        bookings: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { scheduledAt: "asc" }, take: 8 },
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
  const todayKey = now.toDateString();
  const todayBookings = bookings.filter((booking) => booking.scheduledAt.toDateString() === todayKey).length;
  const upcomingBookings = bookings.filter((booking) => booking.scheduledAt >= now && booking.status !== "CANCELED").length;
  const pendingBookings = bookings.filter((booking) => booking.status === "REQUESTED" || booking.status === "PAYMENT_PENDING").length;
  const completedBookings = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const totalEarnings = (profile?.payouts ?? []).reduce((sum, payout) => sum + Number(payout.amount), 0);
  const pendingPayout = (profile?.payouts ?? []).filter((payout) => payout.status === "PENDING").reduce((sum, payout) => sum + Number(payout.amount), 0);
  const completedPayout = (profile?.payouts ?? []).filter((payout) => payout.status === "PAID" || payout.status === "COMPLETED").reduce((sum, payout) => sum + Number(payout.amount), 0);
  const completion = profileCompletion(activeProfile, (profile?.slots.length ?? 0) > 0);
  const status = activeProfile?.status ?? "DRAFT";

  return (
    <main className="star-field">
      <Section>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">{isConsultant ? "Consultant Dashboard" : "Astrologer Dashboard"}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">{isConsultant ? "Consultant Dashboard" : "Astrologer Dashboard"}</h1>
            <p className="mt-3 max-w-3xl naksh-muted-text">Manage your profile, bookings, availability, consultations, earnings, and reviews.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href="/astrologer/profile">Edit Astrologer Profile</Link></Button>
            <Button variant="outline" asChild><Link href="/astrologer/availability">Set Availability</Link></Button>
            <Button variant="outline" asChild><Link href="#bookings">View Bookings</Link></Button>
            <Button variant="outline" asChild><Link href="/astrologer/earnings">View Earnings</Link></Button>
            <Button variant="outline" asChild><Link href="#bookings">Start Consultation</Link></Button>
            <Button variant="outline" asChild><Link href="#reviews">View Reviews</Link></Button>
            <Button variant="outline" asChild><Link href="/astrologer/earnings">Payout Request</Link></Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric icon={UserRound} label="Profile Status" value={statusLabel(status)} note={`${completion}% complete`} />
          <Metric icon={CalendarClock} label="Today’s Bookings" value={todayBookings.toString()} note={`${upcomingBookings} upcoming`} />
          <Metric icon={CalendarClock} label="Upcoming Bookings" value={upcomingBookings.toString()} note="Scheduled consultations" />
          <Metric icon={MessageCircle} label="Pending Requests" value={pendingBookings.toString()} note={`${completedBookings} completed`} />
          <Metric icon={MessageCircle} label="Completed Consultations" value={completedBookings.toString()} note="Finished sessions" />
          <Metric icon={IndianRupee} label="Total Earnings" value={`INR ${totalEarnings.toLocaleString("en-IN")}`} note="Lifetime earnings" />
          <Metric icon={WalletCards} label="Pending Payout" value={`INR ${pendingPayout.toLocaleString("en-IN")}`} note="Awaiting payout" />
          <Metric icon={Star} label="Rating" value={(activeProfile?.rating ?? 0).toFixed(1)} note={`${activeProfile?.reviewCount ?? 0} reviews`} />
          <Metric icon={UserRound} label="Availability Status" value={activeProfile?.availabilityStatus ?? "OFFLINE"} note="Chat, call, video controls" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="glass lg:col-span-2">
            <CardHeader><CardTitle className="font-cinzel">Profile Completion</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="h-3 overflow-hidden rounded-full bg-[#12051f]/70"><div className="h-full rounded-full bg-gradient-to-r from-[#9B5CFF] to-[#FFD36A]" style={{ width: `${completion}%` }} /></div>
              <div className="grid gap-2 text-sm naksh-muted-text sm:grid-cols-2">
                {completionItems(activeProfile, (profile?.slots.length ?? 0) > 0).map((item) => <p key={item.label} className={item.done ? "text-[#FFD36A]" : "naksh-muted-text"}>{item.done ? "✓" : "○"} {item.label}</p>)}
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel">Approval Status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm naksh-muted-text">
              <p className="text-lg font-semibold text-[#FFD36A]">{statusLabel(status)}</p>
              <p>{approvalMessage(status)}</p>
              {activeProfile?.rejectionReason ? <p className="rounded-md border border-[#FF4D4F]/30 bg-[#FF4D4F]/10 p-3 text-[#FFB4B5]">{activeProfile.rejectionReason}</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel">Earnings Overview</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm naksh-muted-text">
              <p>Total earnings: <span className="text-[#FFF7E8]">INR {totalEarnings.toLocaleString("en-IN")}</span></p>
              <p>Pending payout: <span className="text-[#FFF7E8]">INR {pendingPayout.toLocaleString("en-IN")}</span></p>
              <p>Completed payout: <span className="text-[#FFF7E8]">INR {completedPayout.toLocaleString("en-IN")}</span></p>
              <Button variant="outline" asChild><Link href="/astrologer/earnings"><WalletCards className="h-4 w-4" /> Payout Request</Link></Button>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel">Availability Status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm naksh-muted-text">
              <p>Current status: <span className="text-[#FFD36A]">{activeProfile?.availabilityStatus ?? "OFFLINE"}</span></p>
              <p>Chat: {activeProfile?.availableForChat ? "Available" : "Off"}</p>
              <p>Call: {activeProfile?.availableForCall ? "Available" : "Off"}</p>
              <p>Video: {activeProfile?.availableForVideo ? "Available" : "Off"}</p>
            </CardContent>
          </Card>
          <Card id="reviews" className="glass">
            <CardHeader><CardTitle className="font-cinzel">Reviews</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm naksh-muted-text">
              {(profile?.reviews ?? []).map((review) => <p key={review.id} className="rounded-md border border-[#F5C542]/20 bg-[#12051f]/60 p-3">{review.rating}/5 - {review.body ?? "No written review"}</p>)}
              {!profile?.reviews.length ? <p>No reviews yet.</p> : null}
            </CardContent>
          </Card>
        </div>

        <Card id="bookings" className="mt-8 glass">
          <CardHeader><CardTitle className="font-cinzel">Upcoming Consultations</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border border-[#F5C542]/20 bg-[#201037]/70 p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
                  <div>
                    <p className="font-cinzel font-bold">{booking.user.name}</p>
                    <p className="text-sm naksh-muted-text">{booking.mode} | {booking.scheduledAt.toLocaleString("en-IN")} | {booking.status}</p>
                    <p className="mt-2 text-sm naksh-muted-text">{booking.question}</p>
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
    <Card className="glass">
      <CardContent className="p-5">
        <Icon className="h-5 w-5 text-[#FFD36A]" />
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

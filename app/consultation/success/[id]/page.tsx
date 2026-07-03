import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function ConsultationSuccessPage({ params }: PageProps) {
  const { id } = await params;
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
  const isConfirmed = booking.status === "CONFIRMED" || booking.status === "ACCEPTED" || booking.paymentStatus === "PAID";

  return (
    <main className="star-field">
      <Section className="max-w-2xl">
        <Card className="glass">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">
              {isConfirmed ? "Booking Confirmed" : "Booking Request Received"}
            </p>

            <h1 className="font-cinzel text-3xl font-black text-white">
              {isConfirmed
                ? "Your Consultation has been Secured!"
                : "Your request has been sent to the astrologer"}
            </h1>

            <p className="text-sm leading-6 text-slate-300">
              {isConfirmed
                ? `Booking confirmed for ${booking.scheduledAt.toLocaleString("en-IN")}. A meeting join link will be assigned and updated on your dashboard before the session starts.`
                : "Your slot request is saved. Please check your dashboard for updates or to complete pending payments."}
            </p>

            <div className="rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/40 p-4 space-y-2 text-sm text-slate-300">
              <p><span className="text-[#FFD700] font-semibold">Astrologer:</span> {booking.astrologerProfile.displayName}</p>
              <p><span className="text-[#FFD700] font-semibold">Date & Time:</span> {booking.scheduledAt.toLocaleString("en-IN")} ({booking.durationMins} mins)</p>
              <p><span className="text-[#FFD700] font-semibold">Booking Status:</span> {booking.status}</p>
              <p><span className="text-[#FFD700] font-semibold">Payment Status:</span> {booking.paymentStatus}</p>
              <p><span className="text-[#FFD700] font-semibold">Confirmation Email:</span> {metadata?.customerEmail ?? user.email}</p>
            </div>

            {metadata?.adminBypass ? (
              <p className="rounded-md border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-3 text-xs text-[#FFD700]">
                Admin testing mode - payment was bypassed.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-4">
              <Button asChild>
                <Link href="/dashboard/bookings">Go to My Bookings</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/consultation">Back to Astrologers</Link>
              </Button>
            </div>

            <p className="text-xs text-slate-400 pt-4">
              Need help? Reach out to support at <a className="underline text-[#FFD700]" href="mailto:care@naksharix.com">care@naksharix.com</a>
            </p>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}
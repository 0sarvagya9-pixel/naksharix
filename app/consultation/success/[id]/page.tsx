import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function ConsultationSuccessPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const booking = await prisma.consultationBooking.findUnique({ where: { id }, include: { astrologerProfile: true } });
  if (!booking || (booking.userId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) redirect("/astrologers");
  const metadata = booking.metadata as { customerEmail?: string; adminBypass?: boolean } | null;
  return (
    <main className="star-field">
      <Section className="max-w-2xl">
        <Card className="glass"><CardContent className="p-6"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Booking request received</p><h1 className="mt-3 font-cinzel text-3xl font-black">Your request has been sent to the astrologer</h1><p className="mt-3 naksh-muted-text">Status: Pending</p><p className="mt-2 naksh-muted-text">Confirmation will be sent to: {metadata?.customerEmail ?? user.email}</p><p className="mt-2 naksh-muted-text">Astrologer: {booking.astrologerProfile.displayName}</p>{metadata?.adminBypass ? <p className="mt-4 rounded-md border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-3 text-sm text-[#FFD700]">Admin testing mode - payment was bypassed.</p> : null}<p className="mt-5 text-sm naksh-muted-text">Support: care@naksharix.com</p></CardContent></Card>
      </Section>
    </main>
  );
}
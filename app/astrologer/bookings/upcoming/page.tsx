import { AstrologerBookingsList } from "@/components/astrologer-bookings-list";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireAstroRole();
  const now = new Date();
  const profile = await prisma.astrologerProfile.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        where: { status: "CONFIRMED", scheduledAt: { gte: now } },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { scheduledAt: "asc" }
      }
    }
  });

  return (
    <Section>
      <AstrologerBookingsList
        title="Upcoming Bookings"
        emptyText="No upcoming bookings yet."
        bookings={profile?.bookings ?? []}
        showActions
      />
    </Section>
  );
}

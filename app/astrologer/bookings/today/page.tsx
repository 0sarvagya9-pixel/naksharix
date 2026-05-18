import { AstrologerBookingsList } from "@/components/astrologer-bookings-list";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireAstroRole();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const profile = await prisma.astrologerProfile.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        where: { status: { in: ["ACCEPTED", "CONFIRMED"] }, scheduledAt: { gte: start, lt: end } },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { scheduledAt: "asc" }
      }
    }
  });

  return (
    <Section>
      <AstrologerBookingsList
        title="Today’s Bookings"
        emptyText="No bookings scheduled for today."
        bookings={profile?.bookings ?? []}
        showActions
      />
    </Section>
  );
}

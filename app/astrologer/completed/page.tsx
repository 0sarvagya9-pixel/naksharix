import { AstrologerBookingsList } from "@/components/astrologer-bookings-list";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireAstroRole();
  const profile = await prisma.astrologerProfile.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        where: { status: "COMPLETED" },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { scheduledAt: "desc" }
      }
    }
  });

  return (
    <Section>
      <AstrologerBookingsList
        title="Completed Consultations"
        emptyText="No completed consultations yet."
        bookings={profile?.bookings ?? []}
      />
    </Section>
  );
}

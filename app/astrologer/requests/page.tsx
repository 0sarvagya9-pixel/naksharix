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
        where: { status: { in: ["PENDING", "REQUESTED", "PAYMENT_PENDING"] } },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return (
    <Section>
      <AstrologerBookingsList
        title="Pending Requests"
        emptyText="No pending requests."
        bookings={profile?.bookings ?? []}
        showActions
      />
    </Section>
  );
}

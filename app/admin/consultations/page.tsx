import type { Metadata } from "next";
import { AdminConsultationsContent } from "@/components/admin-consultations-content";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...seo({
    title: "Admin Consultation Management - Naksharix",
    description: "View, allocate meeting links, and manage statuses of all user consultations.",
    path: "/admin/consultations"
  }),
  robots: { index: false, follow: true }
};

export default async function AdminConsultationsPage() {
  await requireAdminRole();

  const bookings = await prisma.consultationBooking.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      astrologerProfile: { select: { id: true, displayName: true } }
    }
  }).then((items) => items.map((booking) => ({
    id: booking.id,
    mode: booking.mode,
    status: booking.status,
    scheduledAt: booking.scheduledAt.toISOString(),
    durationMins: booking.durationMins,
    birthName: booking.birthName,
    birthDate: booking.birthDate ? booking.birthDate.toISOString() : null,
    birthTime: booking.birthTime,
    birthPlace: booking.birthPlace,
    question: booking.question,
    paymentStatus: booking.paymentStatus,
    amount: Number(booking.amount),
    metadata: booking.metadata,
    user: {
      name: booking.user.name,
      email: booking.user.email
    },
    astrologerProfile: {
      displayName: booking.astrologerProfile.displayName
    }
  }))).catch(() => []);

  return <AdminConsultationsContent initialBookings={bookings} />;
}

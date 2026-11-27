import type { Metadata } from "next";
import { AdminConsultationsContent } from "@/components/admin-consultations-content";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {fulfilmentCopy} from "@/lib/admin/fulfilment-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata():Promise<Metadata>{
  const copy=fulfilmentCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));
  return {
  ...seo({
    title: copy.consultationTitle+" - Naksharix",
    description: copy.consultationIntro,
    path: "/admin/consultations"
  }),
  robots: { index: false, follow: false }
  };
}

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
    updatedAt: booking.updatedAt.toISOString(),
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
  }))).catch(() => null);

  return <AdminConsultationsContent initialBookings={bookings??[]} initialAvailable={bookings!==null} />;
}

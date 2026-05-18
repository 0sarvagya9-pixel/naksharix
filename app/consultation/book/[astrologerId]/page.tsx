import { notFound } from "next/navigation";
import { ConsultationRequestForm } from "@/components/consultation-request-form";
import { Section } from "@/components/section";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ astrologerId: string }> };

export default async function BookAstrologerPage({ params }: PageProps) {
  const { astrologerId } = await params;
  const [user, astrologer] = await Promise.all([
    getCurrentUser(),
    prisma.astrologerProfile.findFirst({ where: { id: astrologerId, status: "APPROVED" }, include: { slots: { where: { isActive: true, isHoliday: false }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } } })
  ]);
  if (!astrologer) notFound();
  return (
    <main className="star-field">
      <Section className="max-w-3xl">
        <ConsultationRequestForm astrologerId={astrologer.id} astrologerName={astrologer.displayName} userEmail={user?.email} userName={user?.name} slots={astrologer.slots.map((slot) => ({ id: slot.id, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, consultationType: slot.consultationType, isActive: slot.isActive }))} />
      </Section>
    </main>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { AvailabilityForm } from "@/components/availability-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({ title: "Astrologer Availability - Naksharix", description: "Manage available days and time slots for Naksharix consultations.", path: "/astrologer/availability" });

export default async function AstrologerAvailabilityPage() {
  const user = await requireAstroRole();
  const profile = await prisma.astrologerProfile.findUnique({ where: { userId: user.id }, include: { slots: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } } });

  return (
    <main className="star-field">
      <Section>
        <Card className="glass">
          <CardHeader><p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Availability</p><CardTitle className="font-cinzel text-3xl">Consultation Slots</CardTitle><p className="text-sm naksh-muted-text">Add active chat, call, and video consultation windows for users to request bookings.</p></CardHeader>
          <CardContent>
            {profile ? <AvailabilityForm slots={profile.slots.map((slot) => ({ id: slot.id, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, isActive: slot.isActive, consultationType: slot.consultationType, status: slot.status, isHoliday: slot.isHoliday }))} /> : (
              <div className="rounded-lg border border-[#F5C542]/20 bg-[#201037]/70 p-4 text-sm naksh-muted-text">Create your astrologer profile before adding availability.<Button className="mt-4 block w-fit" asChild><Link href="/astrologer/profile">Create profile</Link></Button></div>
            )}
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}
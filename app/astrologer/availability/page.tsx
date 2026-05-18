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

export const metadata: Metadata = seo({
  title: "Astrologer Availability - Naksharix",
  description: "Manage available days, time slots, holiday marks, and online or busy status for Naksharix consultations.",
  path: "/astrologer/availability"
});

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function AstrologerAvailabilityPage() {
  const user = await requireAstroRole();
  const profile = await prisma.astrologerProfile.findUnique({ where: { userId: user.id }, include: { slots: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } } });

  return (
    <main className="star-field">
      <Section>
        <Card className="glass">
          <CardHeader>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Availability</p>
            <CardTitle className="font-cinzel text-3xl">Consultation Slots</CardTitle>
            <p className="text-sm naksh-muted-text">Add available days, time windows, holiday marks, and your current online/busy/offline status.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile ? <AvailabilityForm /> : (
              <div className="rounded-lg border border-[#F5C542]/20 bg-[#201037]/70 p-4 text-sm naksh-muted-text">
                Create your astrologer profile before adding availability.
                <Button className="mt-4 block w-fit" asChild><Link href="/astrologer/profile">Create profile</Link></Button>
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {(profile?.slots ?? []).map((slot) => (
                <div key={slot.id} className="rounded-lg border border-[#F5C542]/20 bg-[#201037]/70 p-4">
                  <p className="font-cinzel font-bold">{days[slot.dayOfWeek]} {slot.isHoliday ? "(Holiday)" : ""}</p>
                  <p className="mt-1 text-sm naksh-muted-text">{slot.startTime} - {slot.endTime} | {slot.status}</p>
                </div>
              ))}
            </div>
            {profile?.slots.length === 0 ? <p className="text-sm naksh-muted-text">No slots added yet.</p> : null}
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

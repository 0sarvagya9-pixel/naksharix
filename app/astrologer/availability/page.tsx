import type { Metadata } from "next";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {workspaceCopy} from "@/lib/astrologers/workspace-copy";
import Link from "next/link";
import { AvailabilityForm } from "@/components/availability-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function labels(){return workspaceCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));}
export async function generateMetadata():Promise<Metadata>{const copy=await labels();return {...seo({title:copy.availabilityTitle+" | Naksharix",description:copy.availabilityIntro,path:"/astrologer/availability"}),robots:{index:false,follow:false}};}

export default async function AstrologerAvailabilityPage() {
  const user = await requireAstroRole(),copy=await labels();
  const profile = await prisma.astrologerProfile.findUnique({ where: { userId: user.id }, include: { slots: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } } });

  return (
    <main className="star-field">
      <Section>
        <Card className="glass">
          <CardHeader><p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{copy.availabilityEyebrow}</p><CardTitle className="font-cinzel text-3xl">{copy.availabilityTitle}</CardTitle><p className="text-sm naksh-muted-text">{copy.availabilityIntro}</p></CardHeader>
          <CardContent>
            {profile ? <AvailabilityForm slots={profile.slots.map((slot) => ({ id: slot.id, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, isActive: slot.isActive, consultationType: slot.consultationType, status: slot.status, isHoliday: slot.isHoliday }))} /> : (
              <div className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">{copy.profileFirst}<Button className="mt-4 block w-fit" asChild><Link href="/astrologer/profile">{copy.createProfile}</Link></Button></div>
            )}
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}
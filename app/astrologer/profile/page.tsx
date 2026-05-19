import type { Metadata } from "next";
import { AstrologerProfileForm } from "@/components/astrologer-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  title: "Manage Astrologer Profile - Naksharix",
  description: "Update your Naksharix astrologer or consultant marketplace profile, pricing, skills, languages, and online status.",
  path: "/astrologer/profile"
});

export default async function AstrologerProfilePage() {
  const user = await requireAstroRole();
  const [profile, consultantProfile] = await Promise.all([
    prisma.astrologerProfile.findUnique({ where: { userId: user.id } }),
    prisma.consultantProfile.findUnique({ where: { userId: user.id } })
  ]);
  const activeProfile = profile ?? consultantProfile;

  return (
    <main className="star-field">
      <Section>
        <Card className="glass">
          <CardHeader>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Profile Management</p>
            <CardTitle className="font-cinzel text-3xl">Marketplace Profile</CardTitle>
            <p className="text-sm naksh-muted-text">Update your public profile, consultation pricing, expertise, languages, city, and availability for admin approval.</p>
          </CardHeader>
          <CardContent>
            <AstrologerProfileForm defaults={activeProfile ? {
              displayName: activeProfile.displayName,
              photoUrl: activeProfile.photoUrl ?? "",
              bio: activeProfile.bio,
              introLine: activeProfile.introLine ?? "",
              experienceYears: activeProfile.experienceYears,
              specialization: activeProfile.specialization,
              languages: activeProfile.languages,
              consultationPrice: Number(activeProfile.consultationPrice).toString(),
              pricePerSession: activeProfile.pricePerSession ? Number(activeProfile.pricePerSession).toString() : "",
              city: activeProfile.city ?? "",
              country: activeProfile.country ?? "",
              skills: activeProfile.skills,
              availabilityStatus: activeProfile.availabilityStatus,
              availableForChat: activeProfile.availableForChat,
              availableForCall: activeProfile.availableForCall,
              availableForVideo: activeProfile.availableForVideo
            } : { displayName: user.name }} />
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

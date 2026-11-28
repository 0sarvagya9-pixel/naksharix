import type { Metadata } from "next";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {workspaceCopy} from "@/lib/astrologers/workspace-copy";
import { AstrologerProfileForm } from "@/components/astrologer-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { AstrologerCredentialForm } from "@/components/astrologer-credential-form";
import { credentialState } from "@/lib/astrologers/credentials";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function labels(){return workspaceCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));}
export async function generateMetadata():Promise<Metadata>{const copy=await labels();return {...seo({title:copy.profileTitle+" | Naksharix",description:copy.profileIntro,path:"/astrologer/profile"}),robots:{index:false,follow:false}};}

export default async function AstrologerProfilePage() {
  const user = await requireAstroRole(),copy=await labels();
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
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{copy.profileEyebrow}</p>
            <CardTitle className="font-cinzel text-3xl">{copy.profileTitle}</CardTitle>
            <p className="text-sm naksh-muted-text">{copy.profileIntro}</p>
          </CardHeader>
          <CardContent>
            <AstrologerProfileForm userId={user.id} profileId={activeProfile?.id} defaults={activeProfile ? {
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
            {profile ? <AstrologerCredentialForm initialStatus={credentialState(profile.certificates).reviewStatus} /> : null}
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

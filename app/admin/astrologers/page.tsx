import type { Metadata } from "next";
import Link from "next/link";
import { AdminAstrologerReview } from "@/components/admin-astrologer-review";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  title: "Admin Astrologer Review - Naksharix",
  description: "Approve or reject Naksharix astrologer marketplace profiles from the admin panel.",
  path: "/admin/astrologers"
});

export default async function AdminAstrologersPage() {
  await requireAdminRole();
  const profiles = await prisma.astrologerProfile.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { email: true, name: true } } }
  });

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Admin Review</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Astrologer Approvals</h1>
        <p className="mt-3 max-w-3xl naksh-muted-text">Review marketplace submissions before they appear on the public Naksharix astrologer listing.</p>
        <div className="mt-8 grid gap-4">
          {profiles.map((profile) => (
            <Card key={profile.id} className="glass">
              <CardHeader>
                <CardTitle className="font-cinzel">{profile.displayName}</CardTitle>
                <p className="text-sm naksh-muted-text">{profile.user.email} | {profile.status} | Submitted {profile.createdAt.toLocaleString()}</p>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                <div className="space-y-2 text-sm naksh-muted-text">
                  <p><span className="text-foreground">Expertise:</span> {profile.skills.length ? profile.skills.join(", ") : profile.specialization}</p>
                  <p><span className="text-foreground">Languages:</span> {profile.languages.join(", ")}</p>
                  <p><span className="text-foreground">Experience:</span> {profile.experienceYears}+ years</p>
                  <p><span className="text-foreground">Price:</span> INR {Number(profile.consultationPrice).toLocaleString("en-IN")}/min{profile.pricePerSession ? ` | INR ${Number(profile.pricePerSession).toLocaleString("en-IN")}/session` : ""}</p>
                  <p><span className="text-foreground">Availability:</span> {[profile.availableForChat ? "Chat" : null, profile.availableForCall ? "Call" : null, profile.availableForVideo ? "Video" : null].filter(Boolean).join(", ") || "Not set"}</p>
                  {profile.city || profile.country ? <p><span className="text-foreground">Location:</span> {[profile.city, profile.country].filter(Boolean).join(", ")}</p> : null}
                  <p>{profile.bio || "No bio submitted yet."}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.status === "APPROVED" ? <Button size="sm" variant="outline" asChild><Link href={`/astrologers/${profile.id}`}>View public profile</Link></Button> : null}
                  </div>
                </div>
                <AdminAstrologerReview profileId={profile.id} status={profile.status} />
              </CardContent>
            </Card>
          ))}
        </div>
        {!profiles.length ? <p className="mt-6 rounded-lg border border-[#F5C542]/20 bg-[#201037]/70 p-4 text-sm naksh-muted-text">No astrologer profiles submitted yet.</p> : null}
      </Section>
    </main>
  );
}
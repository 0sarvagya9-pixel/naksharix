import type { Metadata } from "next";
import { AdminAstrologerReview } from "@/components/admin-astrologer-review";
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
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Admin Review</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Astrologer Approvals</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">Review marketplace submissions before they appear on the public Naksharix astrologer listing.</p>
        <div className="mt-8 grid gap-4">
          {profiles.map((profile) => (
            <Card key={profile.id} className="glass">
              <CardHeader>
                <CardTitle className="font-cinzel">{profile.displayName}</CardTitle>
                <p className="text-sm text-muted-foreground">{profile.user.email} | {profile.status}</p>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="text-foreground">Specialization:</span> {profile.specialization}</p>
                  <p><span className="text-foreground">Experience:</span> {profile.experienceYears}+ years</p>
                  <p><span className="text-foreground">Languages:</span> {profile.languages.join(", ")}</p>
                  <p><span className="text-foreground">Price:</span> INR {Number(profile.consultationPrice).toLocaleString("en-IN")}</p>
                  <p>{profile.bio}</p>
                </div>
                <AdminAstrologerReview profileId={profile.id} status={profile.status} />
              </CardContent>
            </Card>
          ))}
        </div>
        {!profiles.length ? <p className="mt-6 rounded-lg border border-amber-200/15 bg-card/60 p-4 text-sm text-muted-foreground">No astrologer profiles submitted yet.</p> : null}
      </Section>
    </main>
  );
}

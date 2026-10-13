import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  title: "Reviews and Ratings - Naksharix",
  description: "View verified customer feedback for your Naksharix astrologer profile.",
  path: "/astrologer/reviews"
});

export default async function AstrologerReviewsPage() {
  const user = await requireAstroRole();
  // Never accept a profile ID from the request: scope this view to the session owner.
  const profile = await prisma.astrologerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, displayName: true }
  });

  const [summary, reviews] = profile
    ? await Promise.all([
        prisma.review.aggregate({
          where: { astrologerProfileId: profile.id, consultationBookingId: { not: null } },
          _avg: { rating: true },
          _count: { rating: true }
        }),
        prisma.review.findMany({
          where: { astrologerProfileId: profile.id, consultationBookingId: { not: null } },
          select: {
            id: true,
            rating: true,
            body: true,
            createdAt: true,
            user: { select: { name: true } }
          },
          orderBy: { createdAt: "desc" },
          take: 100
        })
      ])
    : [null, []];

  const total = summary?._count.rating ?? 0;
  const average = summary?._avg.rating ?? 0;

  return (
    <main className="star-field">
      <Section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Client Feedback</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">Reviews and Ratings</h1>
            <p className="mt-3 max-w-3xl naksh-muted-text">
              {profile
                ? "Feedback from completed consultations for " + profile.displayName + "."
                : "An astrologer profile is required before you can receive consultation reviews."}
            </p>
          </div>
          <Button variant="outline" asChild><Link href="/astrologer/dashboard">Back to dashboard</Link></Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card className="glass">
            <CardContent className="p-6">
              <p className="text-sm naksh-muted-text">Average verified consultation rating</p>
              <p className="mt-3 flex items-center gap-3 font-cinzel text-3xl font-black">
                <Star aria-hidden="true" className="h-6 w-6 text-[#FFD700]" />
                {total ? average.toFixed(1) : "Not rated"}
              </p>
              <p className="mt-2 text-sm naksh-muted-text">Scale: 1 to 5</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-6">
              <p className="text-sm naksh-muted-text">Verified consultation reviews</p>
              <p className="mt-3 font-cinzel text-3xl font-black">{total.toLocaleString("en-IN")}</p>
              <p className="mt-2 text-sm naksh-muted-text">Only completed consultation reviews are counted.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="font-cinzel text-2xl font-bold">Latest Client Reviews</h2>
          {reviews.map((review) => (
            <Card key={review.id} className="glass">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base">
                  <span>{review.user.name?.trim() || "Client"}</span>
                  <span className="flex items-center gap-2 text-[#FFD700]">
                    <Star aria-hidden="true" className="h-4 w-4" />
                    <span aria-label={review.rating + " out of 5 stars"}>{review.rating}/5</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="whitespace-pre-wrap break-words text-sm naksh-muted-text">
                  {review.body?.trim() || "The client left a rating without a written review."}
                </p>
                <p className="text-xs naksh-muted-text">
                  {review.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Kolkata" })}
                </p>
              </CardContent>
            </Card>
          ))}
          {reviews.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-6 text-sm naksh-muted-text">
                No verified consultation reviews have been recorded yet.
              </CardContent>
            </Card>
          ) : null}
          {total > reviews.length ? (
            <p className="text-sm naksh-muted-text">Showing the latest 100 of {total} reviews.</p>
          ) : null}
        </div>
      </Section>
    </main>
  );
}

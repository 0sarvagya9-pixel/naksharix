import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  title: "Admin Payout Dashboard - Naksharix",
  description: "Review Naksharix astrologer payouts, pending earnings, and manual payout records.",
  path: "/admin/payouts"
});

export default async function AdminPayoutsPage() {
  await requireAdminRole();
  const [payouts, profiles] = await Promise.all([
    prisma.payout.findMany({ orderBy: { createdAt: "desc" }, include: { astrologerProfile: true, user: true }, take: 50 }),
    prisma.astrologerProfile.findMany({ include: { bookings: true, payouts: true, user: true } })
  ]);
  const pendingRows = profiles.map((profile) => {
    const gross = profile.bookings.filter((booking) => booking.status === "COMPLETED").reduce((sum, booking) => sum + Number(booking.amount), 0);
    const paid = profile.payouts.filter((payout) => payout.status === "PAID").reduce((sum, payout) => sum + Number(payout.amount), 0);
    return { profile, pending: Math.max(0, gross - paid), gross, paid };
  }).filter((row) => row.pending > 0);

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Finance Ops</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Admin Payout Dashboard</h1>
        <div className="mt-8 grid gap-4">
          {pendingRows.map(({ profile, pending, gross, paid }) => (
            <Card key={profile.id} className="glass">
              <CardContent className="grid gap-2 p-5 md:grid-cols-4">
                <p className="font-cinzel font-bold">{profile.displayName}</p>
                <p className="text-sm naksh-muted-text">Gross INR {gross.toLocaleString("en-IN")}</p>
                <p className="text-sm naksh-muted-text">Paid INR {paid.toLocaleString("en-IN")}</p>
                <p className="text-sm text-[#FFD700]">Pending INR {pending.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          ))}
          {!pendingRows.length ? <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">No pending payout balances found.</p> : null}
        </div>
        <h2 className="mt-10 font-cinzel text-2xl font-bold">Recent payout records</h2>
        <div className="mt-4 grid gap-4">
          {payouts.map((payout) => (
            <Card key={payout.id} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
              <CardContent className="grid gap-2 p-5 md:grid-cols-4">
                <p className="font-cinzel font-bold">{payout.astrologerProfile.displayName}</p>
                <p className="text-sm naksh-muted-text">INR {Number(payout.amount).toLocaleString("en-IN")}</p>
                <p className="text-sm naksh-muted-text">{payout.status}</p>
                <p className="text-sm naksh-muted-text">{payout.createdAt.toDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

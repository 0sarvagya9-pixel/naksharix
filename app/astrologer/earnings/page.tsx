import type { Metadata } from "next";
import { IndianRupee, Wallet } from "lucide-react";
import { AstrologerEarningsChart } from "@/components/astrologer-earnings-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/section";
import { requireAstroRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = seo({
  title: "Astrologer Earnings - Naksharix",
  description: "Track consultation revenue, completed bookings, pending payouts, and earnings trends for Naksharix astrologers.",
  path: "/astrologer/earnings"
});

export default async function AstrologerEarningsPage() {
  const user = await requireAstroRole();
  const profile = await prisma.astrologerProfile.findUnique({
    where: { userId: user.id },
    include: { bookings: true, payouts: { orderBy: { createdAt: "desc" } } }
  });
  const bookings = profile?.bookings ?? [];
  const completed = bookings.filter((booking) => booking.status === "COMPLETED");
  const gross = completed.reduce((sum, booking) => sum + Number(booking.amount), 0);
  const paid = (profile?.payouts ?? []).filter((payout) => payout.status === "PAID").reduce((sum, payout) => sum + Number(payout.amount), 0);
  const pending = gross - paid;
  const chartData = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const monthBookings = completed.filter((booking) => booking.scheduledAt.getMonth() === date.getMonth() && booking.scheduledAt.getFullYear() === date.getFullYear());
    return {
      name: date.toLocaleString("en-IN", { month: "short" }),
      bookings: monthBookings.length,
      earnings: monthBookings.reduce((sum, booking) => sum + Number(booking.amount), 0)
    };
  });

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Earnings</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Astrologer Earnings Dashboard</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Metric label="Gross earnings" value={`INR ${gross.toLocaleString("en-IN")}`} />
          <Metric label="Paid payouts" value={`INR ${paid.toLocaleString("en-IN")}`} />
          <Metric label="Pending payout" value={`INR ${pending.toLocaleString("en-IN")}`} />
        </div>
        <Card className="mt-8 glass">
          <CardHeader><CardTitle className="font-cinzel">Monthly earnings and bookings</CardTitle></CardHeader>
          <CardContent><AstrologerEarningsChart data={chartData} /></CardContent>
        </Card>
        <div className="mt-8 grid gap-4">
          {(profile?.payouts ?? []).map((payout) => (
            <Card key={payout.id} className="border-amber-200/15 bg-card/70">
              <CardContent className="flex flex-col gap-2 p-5 md:flex-row md:items-center md:justify-between">
                <p className="font-cinzel font-bold">INR {Number(payout.amount).toLocaleString("en-IN")}</p>
                <p className="text-sm text-muted-foreground">{payout.status} | {payout.provider} | {payout.createdAt.toDateString()}</p>
              </CardContent>
            </Card>
          ))}
          {!profile?.payouts.length ? <p className="rounded-lg border border-amber-200/15 bg-card/60 p-4 text-sm text-muted-foreground">No payouts recorded yet.</p> : null}
        </div>
      </Section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="glass">
      <CardContent className="p-5">
        {label.includes("Pending") ? <Wallet className="h-5 w-5 text-amber-200" /> : <IndianRupee className="h-5 w-5 text-amber-200" />}
        <p className="mt-4 font-cinzel text-2xl font-black">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

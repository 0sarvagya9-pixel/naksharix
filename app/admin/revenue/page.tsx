"use client";

import { useEffect, useState } from "react";
import { ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RevenueData = {
  paid: { _sum: { amount: string | null }; _count: number };
  pending: { _sum: { amount: string | null }; _count: number };
  invoices: number;
  subscriptions: number;
  reportSales: { captured: number; review: number };
  amountsByCurrency: Array<{ status: string; currency: string; _sum: { amount: string | null } }>;
  recent: Array<{ id: string; amount: string; currency: string; status: string; purpose: string; user: { email: string; name: string }; invoice?: { number: string } | null }>;
};

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);

  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/revenue").then(async response => {
      if (!response.ok) throw new Error();
      const json = await response.json();
      if (!json.data) throw new Error();
      setData(json.data);
    }).catch(() => setLoadFailed(true));
  }, []);

  const amountLabel = (status: string) => {
    if (!data) return "—";
    const amounts = data.amountsByCurrency.filter(row => row.status === status);
    return amounts.map(row => row.currency + " " + row._sum.amount).join(" · ") || "0";
  };
  const cards = [
    { label: "Payments marked paid", value: amountLabel("PAID"), icon: TrendingUp },
    { label: "Pending payments", value: amountLabel("PENDING"), icon: Wallet },
    { label: "Invoices", value: String(data?.invoices ?? "-"), icon: ReceiptText },
    { label: "Active subscriptions", value: String(data?.subscriptions ?? "-"), icon: TrendingUp },
    { label: "Captured live report orders", value: String(data?.reportSales.captured ?? "—"), icon: ReceiptText }
  ];

  return (
    <Section>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Revenue Ops</p>
      <h1 className="mt-3 font-cinzel text-4xl font-black">Admin Revenue Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-[#D4AF37]/20 bg-[#061D3C]/80">
            <CardContent className="pt-5">
              <Icon className="h-5 w-5 text-[#FFD700]" />
              <p className="mt-4 text-2xl font-black">{value}</p>
              <p className="text-sm naksh-muted-text">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {loadFailed && <p role="alert">Revenue data could not be loaded. Refresh to try again.</p>}
      {data && <p className="mt-4 text-sm naksh-muted-text">The report-order count excludes recorded refunds and test payments. Paid report orders needing reconciliation: {data.reportSales.review}.</p>}
      <Card className="mt-6 border-[#D4AF37]/20 bg-[#061D3C]/80">
        <CardHeader><CardTitle className="font-cinzel">Recent Payments</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data?.recent?.map((payment) => (
            <div key={payment.id} className="rounded-md border border-[#D4AF37]/20 bg-[#02112C]/60 p-3">
              <p className="font-medium">{payment.user.name} - {payment.purpose}</p>
              <p className="text-sm naksh-muted-text">{payment.currency} {payment.amount} - {payment.status} - {payment.user.email}</p>
            </div>
          )) ?? <p className="text-sm naksh-muted-text">{loadFailed ? "Payments unavailable." : "Loading revenue data…"}</p>}
        </CardContent>
      </Card>
    </Section>
  );
}

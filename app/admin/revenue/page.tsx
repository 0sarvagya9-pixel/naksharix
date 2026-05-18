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
  reports: number;
  recent: Array<{ id: string; amount: string; currency: string; status: string; purpose: string; user: { email: string; name: string }; invoice?: { number: string } | null }>;
};

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    fetch("/api/admin/revenue").then((response) => response.json()).then((json) => setData(json.data)).catch(() => setData(null));
  }, []);

  const cards = [
    { label: "Paid revenue", value: `INR ${data?.paid?._sum.amount ?? "0"}`, icon: TrendingUp },
    { label: "Pending revenue", value: `INR ${data?.pending?._sum.amount ?? "0"}`, icon: Wallet },
    { label: "Invoices", value: String(data?.invoices ?? "-"), icon: ReceiptText },
    { label: "Active subscriptions", value: String(data?.subscriptions ?? "-"), icon: TrendingUp },
    { label: "Purchased reports", value: String(data?.reports ?? "-"), icon: ReceiptText }
  ];

  return (
    <Section>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Revenue Ops</p>
      <h1 className="mt-3 font-cinzel text-4xl font-black">Admin Revenue Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-[#F5C542]/20 bg-[#201037]/80">
            <CardContent className="pt-5">
              <Icon className="h-5 w-5 text-[#FFD36A]" />
              <p className="mt-4 text-2xl font-black">{value}</p>
              <p className="text-sm naksh-muted-text">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6 border-[#F5C542]/20 bg-[#201037]/80">
        <CardHeader><CardTitle className="font-cinzel">Recent Payments</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data?.recent?.map((payment) => (
            <div key={payment.id} className="rounded-md border border-[#F5C542]/20 bg-[#12051f]/60 p-3">
              <p className="font-medium">{payment.user.name} - {payment.purpose}</p>
              <p className="text-sm naksh-muted-text">{payment.currency} {payment.amount} - {payment.status} - {payment.user.email}</p>
            </div>
          )) ?? <p className="text-sm naksh-muted-text">Loading revenue data...</p>}
        </CardContent>
      </Card>
    </Section>
  );
}

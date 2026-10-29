"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Payment = {
  id: string;
  purpose: string;
  status: string;
  amount: string;
  currency: string;
  createdAt: string;
  invoice?: { id: string; number: string } | null;
  purchasedReport?: { title: string; status: string } | null;
  metadata?: { reportId?: string; savedReportId?: string } | null;
  reportRequest?: { id: string; status: string } | null;
};

const manualSlugForPaidReport: Record<string, string> = {
  "kundli-pro": "premium-kundli",
  "marriage-report": "couple-kundli",
  "career-report": "career-report",
  "finance-report": "wealth-report",
  "numerology-report": "numerology-lo-shu-report",
  "yearly-ai": "yearly-horoscope-report"
};

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments/history")
      .then((response) => response.json())
      .then((json) => setPayments(json.data?.payments ?? []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-[#D4AF37]/20 bg-[#061D3C]/80">
      <CardHeader><CardTitle className="font-cinzel">Payment History</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {loading ? <p className="text-sm naksh-muted-text">Loading payments...</p> : null}
        {!loading && !payments.length ? <p className="text-sm naksh-muted-text">No payments yet.</p> : null}
        {payments.map((payment) => (
          <div key={payment.id} className="flex flex-col gap-3 rounded-md border border-[#D4AF37]/20 bg-[#02112C]/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{payment.purchasedReport?.title ?? payment.purpose}</p>
              <p className="text-sm naksh-muted-text">{payment.currency} {payment.amount} - {payment.status}</p>
            </div>
            {payment.status === "PAID" && !payment.reportRequest &&
             !payment.metadata?.savedReportId && payment.metadata?.reportId &&
             manualSlugForPaidReport[payment.metadata.reportId] ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/report-request/new?plan=PREMIUM&reportSlug=${encodeURIComponent(manualSlugForPaidReport[payment.metadata.reportId])}&orderId=${encodeURIComponent(payment.id)}`}>
                  Complete purchased report details
                </Link>
              </Button>
            ) : null}
            {payment.invoice ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/api/invoices/${payment.invoice.id}`} target="_blank"><ReceiptText className="h-4 w-4" /> Payment receipt</Link>
              </Button>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

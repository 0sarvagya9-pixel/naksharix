"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import {paymentCopy, paymentPurposeLabel, paymentStatusLabel} from "@/lib/payments/customer-copy";
import {getManualReport} from "@/lib/manual-catalogue";

import { getReportSlugForPaidId } from "@/lib/reports/checkout-catalogue";

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



export function PaymentHistory() {
  const {locale} = useLanguage();
  const copy = paymentCopy(locale);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/payments/history")
      .then(async (response) => {
        if (!response.ok) throw new Error("Payment history unavailable");
        const json = await response.json();
        if (!Array.isArray(json.data?.payments)) throw new Error("Payment history incomplete");
        setPayments(json.data.payments);
      })
      .catch(() => { setPayments([]); setFailed(true); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-[#D4AF37]/20 bg-[#061D3C]/80">
      <CardHeader><CardTitle className="font-cinzel">{copy.history}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {loading ? <p className="text-sm naksh-muted-text">{copy.loading}</p> : null}
        {failed ? <p role="status" className="text-sm naksh-muted-text">{copy.loadFailed}</p> : null}
        {!loading && !failed && !payments.length ? <p className="text-sm naksh-muted-text">{copy.empty}</p> : null}
        {payments.map((payment) => (
          <div key={payment.id} className="flex flex-col gap-3 rounded-md border border-[#D4AF37]/20 bg-[#02112C]/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{getManualReport(getReportSlugForPaidId(payment.metadata?.reportId ?? "") ?? "")?.name[locale] ?? payment.purchasedReport?.title ?? paymentPurposeLabel(payment.purpose, locale)}</p>
              <p className="text-sm naksh-muted-text">{payment.currency} {payment.amount} - {paymentStatusLabel(payment.status, locale)}</p>
            </div>
            {["PENDING","FAILED"].includes(payment.status)&&payment.metadata?.reportId&&getReportSlugForPaidId(payment.metadata.reportId)&&!payment.metadata?.savedReportId&&!payment.reportRequest?(
              <Button asChild variant="outline" size="sm"><Link href={`/reports/${encodeURIComponent(getReportSlugForPaidId(payment.metadata.reportId)!)}`}>{copy.resume}</Link></Button>
            ):null}
            {payment.status === "PAID" && !payment.reportRequest &&
             !payment.metadata?.savedReportId && payment.metadata?.reportId &&
             getReportSlugForPaidId(payment.metadata.reportId) ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/report-request/new?plan=PREMIUM&reportSlug=${encodeURIComponent(getReportSlugForPaidId(payment.metadata.reportId)!)}&orderId=${encodeURIComponent(payment.id)}`}>
                  {copy.completeReport}
                </Link>
              </Button>
            ) : null}
            {payment.reportRequest&&payment.status==="PAID"?<Button variant="outline" size="sm" asChild><Link href={`/report-request/success?id=${encodeURIComponent(payment.reportRequest.id)}`}>{copy.reportStatus}</Link></Button>:null}
            {payment.purpose==="AI_MEMBERSHIP"?<Button asChild variant="outline" size="sm"><Link href="/ai-membership">{copy.membership}</Link></Button>:null}
            {payment.purpose==="EXPERT_SERVICE"?<Button asChild variant="outline" size="sm"><Link href="/expert-services">{copy.expert}</Link></Button>:null}
            {payment.purpose==="DIGITAL_PACKAGE"?<Button asChild variant="outline" size="sm"><Link href="/digital-packages">{copy.packages}</Link></Button>:null}
            {payment.purpose==="AI_CREDITS"&&["PENDING","FAILED","PAID"].includes(payment.status)?<Button asChild variant="outline" size="sm"><Link href="/ai-astrologer">{copy.credits}</Link></Button>:null}
            {payment.invoice ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/api/invoices/${payment.invoice.id}`} target="_blank"><ReceiptText className="h-4 w-4" /> {copy.receipt}</Link>
              </Button>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

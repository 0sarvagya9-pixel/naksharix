import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Quote, Sparkles } from "lucide-react";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
import { ReportPdfTemplate } from "@/components/report-pdf-template";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPaidReport, paidReports } from "@/lib/paid-reports";
import { seo } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return paidReports.map((report) => ({ slug: report.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const report = getPaidReport(slug);
  if (!report) return {};
  return seo({
    title: `${report.name} - Naksharix`,
    description: report.description,
    path: `/reports/${report.id}`,
    keywords: [report.name, "Astrology Report", "Kundli Report", "Naksharix"]
  });
}

export default async function ReportDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const report = getPaidReport(slug);
  if (!report) notFound();

  return (
    <main className="star-field">
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.42fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Premium Report</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">{report.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 naksh-muted-text">{report.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild><Link href="/kundli">Generate Free Kundli First</Link></Button>
              <Button variant="outline" asChild><Link href="/chatbot">Ask AI Before Buying</Link></Button>
            </div>
          </div>
          <Card className="glass h-fit">
            <CardContent className="p-6">
              <p className="text-sm naksh-muted-text">One-time report</p>
              <p className="mt-2 font-cinzel text-4xl font-black text-[#FFD36A]">{report.price}</p>
              <div className="mt-5"><RazorpayCheckoutButton payload={{ purpose: report.purpose, reportId: report.id }} label="Buy report" /></div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {report.features.map((feature) => (
            <Card key={feature} className="border-[#F5C542]/20 bg-[#201037]/75">
              <CardContent className="p-5">
                <CheckCircle2 className="h-5 w-5 text-[#FFD36A]" />
                <p className="mt-3 text-sm leading-6 naksh-muted-text">{feature}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="glass">
            <CardContent className="p-6">
              <Sparkles className="h-6 w-6 text-[#FFD36A]" />
              <h2 className="mt-4 font-cinzel text-2xl font-black">Sample preview</h2>
              <ul className="mt-4 space-y-3 text-sm naksh-muted-text">
                {report.sample.map((item) => <li key={item} className="rounded-md border border-[#F5C542]/20 bg-[#12051f]/60 p-3">{item}</li>)}
              </ul>
            </CardContent>
          </Card>
          <ReportPdfTemplate reportName={report.name} />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {["Clear, practical and easy to read.", "The sample report made the upgrade decision simple.", "Loved the remedies because they were grounded."].map((quote, index) => (
            <Card key={quote} className="border-[#F5C542]/20 bg-[#201037]/75">
              <CardContent className="p-5">
                <Quote className="h-5 w-5 text-[#FFD36A]" />
                <p className="mt-4 text-sm leading-6 naksh-muted-text">{quote}</p>
                <p className="mt-4 font-cinzel font-bold">Naksharix user {index + 1}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {report.faqs.map((question) => (
            <Card key={question} className="border-[#F5C542]/20 bg-[#201037]/75">
              <CardContent className="p-5">
                <h2 className="font-cinzel text-lg font-bold">{question}</h2>
                <p className="mt-3 text-sm leading-6 naksh-muted-text">Naksharix keeps this report practical, ethical, and personalized around the details you provide.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

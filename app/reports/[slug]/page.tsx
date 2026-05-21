import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, Quote, Sparkles } from "lucide-react";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
import { ReportPdfTemplate } from "@/components/report-pdf-template";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { normalizeLocale, t } from "@/lib/i18n";
import { localizePaidReport, localizePaidReportDetailItems } from "@/lib/paid-report-display";
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
  const locale = normalizeLocale((await cookies()).get("naksharix-language")?.value);
  const copy = localizePaidReport(report, locale);
  const detailItems = localizePaidReportDetailItems(report, locale);
  const labels = reportDetailLabels(locale);

  return (
    <main className="star-field">
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.42fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{t(locale, "premiumReports")}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382]">{copy.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 naksh-muted-text">{copy.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="secondary"><Link href="/kundli">{t(locale, "generateFreeKundli")}</Link></Button>
              <Button variant="outline" asChild><Link href="/chatbot">{t(locale, "askAiAstrologer")}</Link></Button>
            </div>
          </div>
          <Card className="glass h-fit">
            <CardContent className="p-6">
              <p className="text-sm naksh-muted-text">{labels.oneTime}</p>
              <p className="mt-2 font-cinzel text-4xl font-black text-[#fbc02d]">{report.price}</p>
              <div className="mt-5"><RazorpayCheckoutButton payload={{ purpose: report.purpose, reportId: report.id }} label={t(locale, "buyReport")} /></div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {copy.features.map((feature) => (
            <Card key={feature} className="border-[#1e293b] bg-[#0f1c3a]/88">
              <CardContent className="p-5">
                <CheckCircle2 className="h-5 w-5 text-[#dca956]" />
                <p className="mt-3 text-sm leading-6 naksh-muted-text">{feature}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="glass">
            <CardContent className="p-6">
              <Sparkles className="h-6 w-6 text-[#dca956]" />
              <h2 className="mt-4 font-cinzel text-2xl font-black text-[#f3d382]">{labels.samplePreview}</h2>
              <ul className="mt-4 space-y-3 text-sm naksh-muted-text">
                {detailItems.sample.map((item) => <li key={item} className="rounded-md border border-[#1e293b] bg-[#0f1c3a]/80 p-3">{item}</li>)}
              </ul>
            </CardContent>
          </Card>
          <ReportPdfTemplate reportName={copy.name} />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {labels.quotes.map((quote, index) => (
            <Card key={quote} className="border-[#1e293b] bg-[#0f1c3a]/88">
              <CardContent className="p-5">
                <Quote className="h-5 w-5 text-[#dca956]" />
                <p className="mt-4 text-sm leading-6 naksh-muted-text">{quote}</p>
                <p className="mt-4 font-cinzel font-bold text-[#ffffff]">{labels.userLabel} {index + 1}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {detailItems.faqs.map((question) => (
            <Card key={question} className="border-[#1e293b] bg-[#0f1c3a]/88">
              <CardContent className="p-5">
                <h2 className="font-cinzel text-lg font-bold text-[#f3d382]">{question}</h2>
                <p className="mt-3 text-sm leading-6 naksh-muted-text">{labels.faqCopy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

function reportDetailLabels(locale: "en" | "hi" | "hinglish") {
  if (locale === "hi") {
    return {
      oneTime: "एक बार की रिपोर्ट",
      samplePreview: "नमूना पूर्वावलोकन",
      userLabel: "Naksharix उपयोगकर्ता",
      faqCopy: "Naksharix इस रिपोर्ट को आपके दिए गए विवरणों के आधार पर व्यावहारिक, नैतिक और व्यक्तिगत रखता है।",
      quotes: ["स्पष्ट, व्यावहारिक और पढ़ने में आसान।", "नमूना रिपोर्ट ने अपग्रेड निर्णय आसान कर दिया।", "उपाय संतुलित और जमीन से जुड़े लगे।"]
    };
  }
  if (locale === "hinglish") {
    return {
      oneTime: "One-time report",
      samplePreview: "Sample preview",
      userLabel: "Naksharix user",
      faqCopy: "Naksharix is report ko practical, ethical aur aapke details ke around personalized rakhta hai.",
      quotes: ["Clear, practical aur easy to read.", "Sample report ne upgrade decision simple bana diya.", "Remedies grounded aur useful lage."]
    };
  }
  return {
    oneTime: "One-time report",
    samplePreview: "Sample preview",
    userLabel: "Naksharix user",
    faqCopy: "Naksharix keeps this report practical, ethical, and personalized around the details you provide.",
    quotes: ["Clear, practical and easy to read.", "The sample report made the upgrade decision simple.", "Loved the remedies because they were grounded."]
  };
}

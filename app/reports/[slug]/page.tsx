import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, ClipboardList, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { contactHref } from "@/lib/contact-cta";
import { getManualReport, manualReports } from "@/lib/manual-catalogue";
import { normalizeLocale } from "@/lib/i18n";
import { seo } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return manualReports.map((report) => ({ slug: report.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const report = getManualReport(slug);
  if (!report) return {};
  return seo({
    title: `${report.name.en} | Naksharix Premium Astrology Report`,
    description: report.description.en,
    path: `/reports/${report.slug}`,
    keywords: [report.name.en, "Premium Astrology Report", "Manual Astrology Report", "Naksharix"]
  });
}

export default async function ReportDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const report = getManualReport(slug);
  if (!report) notFound();
  const locale = normalizeLocale((await cookies()).get("naksharix-language")?.value);
  const labels = detailLabels(locale);
  const requestHref = `/report-request/new?plan=PREMIUM&reportSlug=${report.slug}`;

  return (
    <main className="inner-page-shell star-field">
      <Section>
        <div className="inner-section grid gap-8 rounded-3xl border border-[#263957] p-6 md:p-8 lg:grid-cols-[1fr_0.52fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{report.category}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{report.name[locale]}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#a8b3c7]">{report.description[locale]}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]">
                <Link href={requestHref}><ClipboardList className="h-4 w-4" />{labels.request}</Link>
              </Button>
              <Button variant="outline" asChild><Link href="/contact">{labels.contactSupport}</Link></Button>
            </div>
          </div>
          <Card className="inner-card h-fit">
            <CardContent className="p-6">
              <FileText className="h-6 w-6 text-[#00f5a0]" />
              <p className="mt-4 text-sm text-[#a8b3c7]">{labels.price}</p>
              <p className="mt-2 font-cinzel text-3xl font-black text-[#fbc02d]">{labels.priceOnRequest}</p>
              <p className="mt-4 text-sm leading-6 text-[#a8b3c7]">{labels.manualNote}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <InfoSection title={labels.included} items={report.includes[locale]} />
          <InfoSection title={labels.whoShouldRequest} items={report.who[locale]} />
          <InfoSection title={labels.requiredDetails} items={report.required[locale]} />
          <InfoSection title={labels.languageOptions} items={labels.languages} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="inner-card">
            <CardContent className="p-6">
              <Sparkles className="h-6 w-6 text-[#dca956]" />
              <h2 className="mt-4 font-cinzel text-2xl font-bold text-[#f3d382]">{labels.samplePreview}</h2>
              <p className="mt-3 text-sm leading-6 text-[#a8b3c7]">{report.preview[locale]}</p>
            </CardContent>
          </Card>
          <Card className="inner-card">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-[#00f5a0]" />
              <h2 className="mt-4 font-cinzel text-2xl font-bold text-[#f3d382]">{labels.deliveryProcess}</h2>
              <ol className="mt-4 grid gap-3 text-sm text-[#dbeafe]">
                {labels.steps.map((step, index) => (
                  <li key={step} className="rounded-lg border border-[#263957] bg-[#142647]/72 p-3"><span className="mr-2 text-[#fbc02d]">{index + 1}.</span>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="inner-card mt-10">
          <CardContent className="p-6">
            <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{labels.disclaimer}</h2>
            <p className="mt-3 text-sm leading-6 text-[#a8b3c7]">{labels.disclaimerCopy}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]">
                <Link href={requestHref}><ClipboardList className="h-4 w-4" />{labels.request}</Link>
              </Button>
              <Button variant="outline" asChild><a href={contactHref()}>{labels.emailSupport}</a></Button>
            </div>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

function InfoSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="inner-card">
      <CardContent className="p-6">
        <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{title}</h2>
        <ul className="mt-4 grid gap-3 text-sm text-[#dbeafe]">
          {items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#00f5a0]" />{item}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
}

function detailLabels(locale: "en" | "hi" | "hinglish") {
  if (locale === "hi") {
    return {
      request: "Report request submit करें",
      contactSupport: "सपोर्ट से संपर्क करें",
      emailSupport: "ईमेल सपोर्ट",
      price: "Report fee",
      priceOnRequest: "Price on request",
      manualNote: "Request DB में pending review के रूप में save होती है। Payment request stage पर required नहीं है।",
      included: "क्या शामिल है",
      whoShouldRequest: "किसे request करनी चाहिए",
      requiredDetails: "आवश्यक विवरण",
      languageOptions: "भाषा विकल्प",
      languages: ["English", "Hindi", "Hinglish"],
      samplePreview: "Sample preview",
      deliveryProcess: "Delivery process",
      steps: ["Secure form में accurate birth details submit करें", "Request DB में pending review status के साथ save होगी", "Admin review के बाद real PDF generation हो सकता है", "Download सिर्फ actual generated file पर दिखेगा", "Payment केवल secure checkout ready होने पर अलग से enable होगा"],
      disclaimer: "अस्वीकरण",
      disclaimerCopy: "ज्योतिष रिपोर्ट चिंतनात्मक मार्गदर्शन के साधन हैं। ये परिणामों की गारंटी नहीं देतीं और चिकित्सा, कानूनी, वित्तीय या पेशेवर सलाह का विकल्प नहीं हैं।"
    };
  }
  if (locale === "hinglish") {
    return {
      request: "Submit Request",
      contactSupport: "Contact Support",
      emailSupport: "Email Support",
      price: "Report fee",
      priceOnRequest: "Price on request",
      manualNote: "Request DB me pending review ke roop me save hoti hai. Request stage par payment required nahi hai.",
      included: "What is included",
      whoShouldRequest: "Who should request this report",
      requiredDetails: "Required details",
      languageOptions: "Language options",
      languages: ["English", "Hindi", "Hinglish"],
      samplePreview: "Sample preview",
      deliveryProcess: "Delivery process",
      steps: ["Secure form me accurate birth details submit karein", "Request DB me pending review status ke saath save hogi", "Admin review ke baad real PDF generation ho sakta hai", "Download sirf actual generated file par dikhega", "Payment secure checkout ready hone par alag se enable hoga"],
      disclaimer: "Disclaimer",
      disclaimerCopy: "Astrology reports reflective guidance tools hain. Ye guaranteed outcomes nahi deti aur medical, legal, financial ya professional advice ka replacement nahi hain."
    };
  }
  return {
    request: "Submit Request",
    contactSupport: "Contact Support",
    emailSupport: "Email Support",
    price: "Report fee",
    priceOnRequest: "Price on request",
    manualNote: "Requests are saved to the database as pending review. Payment is not required at request stage.",
    included: "What is included",
    whoShouldRequest: "Who should request this report",
    requiredDetails: "Required details",
    languageOptions: "Language options",
    languages: ["English", "Hindi", "Hinglish"],
    samplePreview: "Sample preview",
    deliveryProcess: "Delivery process",
    steps: ["Submit accurate birth details through the secure form", "Request is saved with pending review status", "Admin can generate a real PDF after review", "Download appears only when an actual file exists", "Payment can be enabled later through secure checkout only"],
    disclaimer: "Disclaimer",
    disclaimerCopy: "Astrology reports are reflective guidance tools. They do not guarantee outcomes and should not replace medical, legal, financial, or professional advice."
  };
}

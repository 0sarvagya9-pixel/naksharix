import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, ClipboardList, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
import { Section } from "@/components/section";
import { contactHref } from "@/lib/contact-cta";
import { getManualReport, manualReports } from "@/lib/manual-catalogue";
import { normalizeLocale } from "@/lib/i18n";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
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
  const checkout = getManualReportCheckout(report.slug);
  const requestHref = `/report-request/new?plan=PREMIUM&reportSlug=${encodeURIComponent(report.slug)}`;
  const adminBypassHref = `${requestHref}&mode=admin`;

  return (
    <main className="inner-page-shell star-field">
      <Section>
        <div className="inner-section grid gap-8 rounded-3xl border border-[#263957] p-6 md:p-8 lg:grid-cols-[1fr_0.52fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{report.category}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{report.name[locale]}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#a8b3c7]">{report.description[locale]}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {checkout ? (
                <div className="min-w-56">
                  <RazorpayCheckoutButton
                    payload={{ purpose: checkout.purpose, reportId: checkout.reportId }}
                    label={`${labels.payAndContinue} ${checkout.price}`}
                    successHref={(paymentId) => `${requestHref}&orderId=${encodeURIComponent(paymentId)}`}
                    adminBypassHref={adminBypassHref}
                  />
                </div>
              ) : (
                <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]">
                  <Link href={requestHref}><ClipboardList className="h-4 w-4" />{labels.request}</Link>
                </Button>
              )}
              <Button variant="outline" asChild><Link href="/contact">{labels.contactSupport}</Link></Button>
            </div>
          </div>
          <Card className="inner-card h-fit">
            <CardContent className="p-6">
              <FileText className="h-6 w-6 text-[#00f5a0]" />
              <p className="mt-4 text-sm text-[#a8b3c7]">{labels.price}</p>
              <p className="mt-2 font-cinzel text-3xl font-black text-[#fbc02d]">{checkout?.price ?? labels.manualReview}</p>
              <p className="mt-4 text-sm leading-6 text-[#a8b3c7]">{checkout ? labels.paidNote : labels.manualNote}</p>
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
                {(checkout ? labels.paidSteps : labels.manualSteps).map((step, index) => (
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
              {checkout ? (
                <div className="min-w-56">
                  <RazorpayCheckoutButton
                    payload={{ purpose: checkout.purpose, reportId: checkout.reportId }}
                    label={`${labels.payAndContinue} ${checkout.price}`}
                    successHref={(paymentId) => `${requestHref}&orderId=${encodeURIComponent(paymentId)}`}
                    adminBypassHref={adminBypassHref}
                  />
                </div>
              ) : (
                <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]">
                  <Link href={requestHref}><ClipboardList className="h-4 w-4" />{labels.request}</Link>
                </Button>
              )}
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
          {items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00f5a0]" />{item}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
}

function detailLabels(locale: "en" | "hi" | "hinglish") {
  if (locale === "hi") {
    return {
      request: "Review request submit करें",
      payAndContinue: "भुगतान करके आगे बढ़ें",
      contactSupport: "सपोर्ट से संपर्क करें",
      emailSupport: "ईमेल सपोर्ट",
      price: "Report fee",
      manualReview: "Manual review",
      paidNote: "Razorpay payment server पर verify होने के बाद secure birth-details form खुलेगा।",
      manualNote: "इस specialist report के लिए payment claim नहीं किया जाता। Request DB में pending review के रूप में save होगी।",
      included: "क्या शामिल है",
      whoShouldRequest: "किसे request करनी चाहिए",
      requiredDetails: "आवश्यक विवरण",
      languageOptions: "भाषा विकल्प",
      languages: ["English", "Hindi", "Hinglish"],
      samplePreview: "Sample preview",
      deliveryProcess: "Delivery process",
      paidSteps: ["Razorpay पर listed fee का secure payment करें", "Server payment capture और signature verify करेगा", "Accurate birth details secure form में submit करें", "Request paid status के साथ review queue में जाएगी", "Download केवल actual generated PDF पर दिखेगा"],
      manualSteps: ["Secure form में accurate birth details submit करें", "Request pending review status के साथ save होगी", "Admin scope और fee confirm करेगा", "कोई unsupported payment या delivery confirmation नहीं दिखाई जाएगी", "Download केवल actual generated PDF पर दिखेगा"],
      disclaimer: "अस्वीकरण",
      disclaimerCopy: "ज्योतिष रिपोर्ट चिंतनात्मक मार्गदर्शन के साधन हैं। ये परिणामों की गारंटी नहीं देतीं और चिकित्सा, कानूनी, वित्तीय या पेशेवर सलाह का विकल्प नहीं हैं।"
    };
  }

  if (locale === "hinglish") {
    return {
      request: "Submit Review Request",
      payAndContinue: "Pay and Continue",
      contactSupport: "Contact Support",
      emailSupport: "Email Support",
      price: "Report fee",
      manualReview: "Manual review",
      paidNote: "Razorpay payment server par verify hone ke baad secure birth-details form khulega.",
      manualNote: "Is specialist report ke liye payment claim nahi hota. Request DB me pending review ke roop me save hogi.",
      included: "What is included",
      whoShouldRequest: "Who should request this report",
      requiredDetails: "Required details",
      languageOptions: "Language options",
      languages: ["English", "Hindi", "Hinglish"],
      samplePreview: "Sample preview",
      deliveryProcess: "Delivery process",
      paidSteps: ["Razorpay par listed fee ka secure payment karein", "Server payment capture aur signature verify karega", "Accurate birth details secure form me submit karein", "Request paid status ke saath review queue me jayegi", "Download sirf actual generated PDF par dikhega"],
      manualSteps: ["Secure form me accurate birth details submit karein", "Request pending review status ke saath save hogi", "Admin scope aur fee confirm karega", "Koi unsupported payment ya delivery confirmation nahi dikhaya jayega", "Download sirf actual generated PDF par dikhega"],
      disclaimer: "Disclaimer",
      disclaimerCopy: "Astrology reports reflective guidance tools hain. Ye guaranteed outcomes nahi deti aur medical, legal, financial ya professional advice ka replacement nahi hain."
    };
  }

  return {
    request: "Submit Review Request",
    payAndContinue: "Pay and Continue",
    contactSupport: "Contact Support",
    emailSupport: "Email Support",
    price: "Report fee",
    manualReview: "Manual review",
    paidNote: "The secure birth-details form opens only after Razorpay payment is captured and verified by the server.",
    manualNote: "This specialist report does not make an upfront payment claim. The request is saved for manual review.",
    included: "What is included",
    whoShouldRequest: "Who should request this report",
    requiredDetails: "Required details",
    languageOptions: "Language options",
    languages: ["English", "Hindi", "Hinglish"],
    samplePreview: "Sample preview",
    deliveryProcess: "Delivery process",
    paidSteps: ["Pay the listed fee through secure Razorpay checkout", "The server verifies the payment capture and signature", "Submit accurate birth details through the secure form", "The request enters review with paid status", "Download appears only when an actual generated PDF exists"],
    manualSteps: ["Submit accurate birth details through the secure form", "The request is saved with pending-review status", "An administrator confirms scope and fee", "No unsupported payment or delivery confirmation is displayed", "Download appears only when an actual generated PDF exists"],
    disclaimer: "Disclaimer",
    disclaimerCopy: "Astrology reports are reflective guidance tools. They do not guarantee outcomes and should not replace medical, legal, financial, or professional advice."
  };
}

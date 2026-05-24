"use client";

import Link from "next/link";
import { CheckCircle2, FileText, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { manualReports } from "@/lib/manual-catalogue";
import { requestCta } from "@/lib/contact-cta";

export function ReportsContent() {
  const { locale } = useLanguage();
  const labels = reportLabels(locale);

  return (
    <main className="inner-page-shell star-field">
      <Section>
        <div className="inner-section grid gap-8 rounded-3xl border border-[#263957] p-6 md:p-8 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{labels.eyebrow}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{labels.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#a8b3c7]">{labels.subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]"><a href="#report-catalogue">{labels.exploreReports}</a></Button>
              <Button variant="outline" asChild><Link href="/contact">{labels.contactSupport}</Link></Button>
            </div>
          </div>
          <Card className="inner-card">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-[#00f5a0]" />
              <h2 className="mt-4 font-cinzel text-2xl font-bold text-[#f3d382]">{labels.manualDelivery}</h2>
              <p className="mt-3 text-sm leading-6 text-[#a8b3c7]">{labels.manualDeliveryCopy}</p>
            </CardContent>
          </Card>
        </div>

        <div id="report-catalogue" className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {manualReports.map((report) => {
            const cta = requestCta(report.name[locale], locale);
            return (
              <Card key={report.slug} className="inner-card flex flex-col">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#00f5a0]">{report.category}</p>
                      <h2 className="mt-2 font-cinzel text-2xl font-bold text-[#f3d382]">{report.name[locale]}</h2>
                    </div>
                    <FileText className="h-5 w-5 shrink-0 text-[#dca956]" />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#a8b3c7]">{report.description[locale]}</p>
                  <ul className="mt-4 space-y-2 text-sm text-white">
                    {report.includes[locale].slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#00f5a0]" />{item}</li>
                    ))}
                  </ul>
                  <p className="mt-4 rounded-lg border border-[#263957] bg-[#142647]/75 px-3 py-2 text-sm font-semibold text-[#fbc02d]">{labels.priceOnRequest}</p>
                  <p className="mt-2 text-xs text-[#94a3b8]">{labels.deliveryLabel}</p>
                  <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
                    <Button variant="outline" asChild><Link href={`/reports/${report.slug}`}>{labels.viewDetails}</Link></Button>
                    <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]">
                      <a href={cta.href} target={cta.external ? "_blank" : undefined} rel={cta.external ? "noreferrer" : undefined}><MessageCircle className="h-4 w-4" />{labels.request}</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="inner-card mt-10">
          <CardContent className="p-6">
            <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{labels.disclaimer}</h2>
            <p className="mt-3 text-sm leading-6 text-[#a8b3c7]">{labels.disclaimerCopy}</p>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

function reportLabels(locale: "en" | "hi" | "hinglish") {
  if (locale === "hi") {
    return {
      eyebrow: "Manual Astrology Reports",
      title: "प्रीमियम ज्योतिष रिपोर्ट",
      subtitle: "कुंडली, मिलान, अंक ज्योतिष, लो शू, करियर, धन, प्रेम और गोचर से जुड़ी विस्तृत रिपोर्ट देखें।",
      exploreReports: "रिपोर्ट देखें",
      contactSupport: "सपोर्ट से संपर्क करें",
      manualDelivery: "Manual delivery only",
      manualDeliveryCopy: "यहाँ payment automation active नहीं है। Team request confirm करेगी और report manually prepare होगी।",
      priceOnRequest: "Price on request",
      deliveryLabel: "Manual delivery by email/WhatsApp",
      viewDetails: "विवरण देखें",
      request: "WhatsApp/Contact अनुरोध",
      disclaimer: "अस्वीकरण",
      disclaimerCopy: "ज्योतिष रिपोर्ट चिंतनात्मक मार्गदर्शन के साधन हैं। ये परिणामों की गारंटी नहीं देतीं और चिकित्सा, कानूनी, वित्तीय या पेशेवर सलाह का विकल्प नहीं हैं।"
    };
  }
  if (locale === "hinglish") {
    return {
      eyebrow: "Manual Astrology Reports",
      title: "Premium Astrology Reports",
      subtitle: "Kundli, Milan, Numerology, Lo Shu, Career, Wealth, Love aur Transit se judi detailed reports explore karein.",
      exploreReports: "Explore Reports",
      contactSupport: "Contact Support",
      manualDelivery: "Manual delivery only",
      manualDeliveryCopy: "Payment automation active nahi hai. Team request confirm karegi aur report manually prepare hogi.",
      priceOnRequest: "Price on request",
      deliveryLabel: "Manual delivery by email/WhatsApp",
      viewDetails: "View Details",
      request: "Request on WhatsApp",
      disclaimer: "Disclaimer",
      disclaimerCopy: "Astrology reports reflective guidance tools hain. Ye guaranteed outcomes nahi deti aur medical, legal, financial ya professional advice ka replacement nahi hain."
    };
  }
  return {
    eyebrow: "Manual Astrology Reports",
    title: "Premium Astrology Reports",
    subtitle: "Explore detailed astrology, Kundli, match making, numerology, Lo Shu, career, wealth, love, and transit reports prepared for deeper guidance.",
    exploreReports: "Explore Reports",
    contactSupport: "Contact Support",
    manualDelivery: "Manual delivery only",
    manualDeliveryCopy: "No payment automation is active here. The team confirms each request and prepares reports manually.",
    priceOnRequest: "Price on request",
    deliveryLabel: "Manual delivery by email/WhatsApp",
    viewDetails: "View Details",
    request: "Request on WhatsApp",
    disclaimer: "Disclaimer",
    disclaimerCopy: "Astrology reports are reflective guidance tools. They do not guarantee outcomes and should not replace medical, legal, financial, or professional advice."
  };
}

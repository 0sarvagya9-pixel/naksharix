"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/section";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/language-provider";
import { manualReports } from "@/lib/manual-catalogue";

type ReportIntentState = { name: string; email: string; phone: string; report: string; dob: string; tob: string; place: string; concern: string; language: string };

export function ReportsContent() {
  const { locale } = useLanguage();
  const labels = reportLabels(locale);
  const [intent, setIntent] = useState<ReportIntentState>({ name: "", email: "", phone: "", report: manualReports[0]?.slug ?? "", dob: "", tob: "", place: "", concern: "", language: locale });
  const [review, setReview] = useState(false);

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
                      <a href="#report-request-intent" onClick={() => setIntent((current) => ({ ...current, report: report.slug }))}><ClipboardList className="h-4 w-4" />{labels.request}</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card id="report-request-intent" className="inner-card mt-10">
          <CardContent className="p-6">
            <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
              <div>
                <ClipboardList className="h-6 w-6 text-[#00f5a0]" />
                <h2 className="mt-4 font-cinzel text-2xl font-bold text-[#f3d382]">{labels.intentTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-[#a8b3c7]">{labels.intentCopy}</p>
                <p className="mt-4 rounded-xl border border-[#dca956]/25 bg-[#142647]/75 p-4 text-sm leading-6 text-[#fbc02d]">{labels.intentSafety}</p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <IntentField label={labels.name} value={intent.name} onChange={(value) => setIntent((current) => ({ ...current, name: value }))} />
                  <IntentField label={labels.email} value={intent.email} onChange={(value) => setIntent((current) => ({ ...current, email: value }))} />
                  <IntentField label={labels.phoneOptional} value={intent.phone} onChange={(value) => setIntent((current) => ({ ...current, phone: value }))} />
                  <div>
                    <Label className="text-[#f3d382]">{labels.reportType}</Label>
                    <select value={intent.report} onChange={(event) => setIntent((current) => ({ ...current, report: event.target.value }))} className="mt-2 w-full rounded-xl border border-[#263957] bg-[#07111f] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00f5a0]">
                      {manualReports.map((report) => <option key={report.slug} value={report.slug}>{report.name[locale]}</option>)}
                    </select>
                  </div>
                  <IntentField label={labels.dob} value={intent.dob} onChange={(value) => setIntent((current) => ({ ...current, dob: value }))} />
                  <IntentField label={labels.tob} value={intent.tob} onChange={(value) => setIntent((current) => ({ ...current, tob: value }))} />
                  <IntentField label={labels.birthPlace} value={intent.place} onChange={(value) => setIntent((current) => ({ ...current, place: value }))} />
                  <IntentField label={labels.preferredLanguage} value={intent.language} onChange={(value) => setIntent((current) => ({ ...current, language: value }))} />
                </div>
                <div>
                  <Label className="text-[#f3d382]">{labels.concern}</Label>
                  <Textarea value={intent.concern} onChange={(event) => setIntent((current) => ({ ...current, concern: event.target.value }))} className="mt-2 min-h-24 border-[#263957] bg-[#07111f] text-white" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" className="bg-[#009b72] text-white hover:bg-[#008766]" onClick={() => setReview(true)}>{labels.prepareRequest}</Button>
                  <Button variant="outline" asChild><Link href="/contact">{labels.contactSupport}</Link></Button>
                </div>
                {review ? (
                  <div className="rounded-2xl border border-[#263957] bg-[#0a1224]/88 p-4 text-sm leading-7 text-[#dbeafe]">
                    <p className="font-semibold text-[#f3d382]">{labels.reviewDetails}</p>
                    <p>{labels.onlineComingSoon}</p>
                    <p className="mt-2 text-[#94a3b8]">{labels.reviewHint}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

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

function IntentField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Label className="text-[#f3d382]">{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 border-[#263957] bg-[#07111f] text-white" />
    </div>
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
      manualDeliveryCopy: "यहाँ online payment automation active नहीं है। Report workflow manual/review-based रहेगा।",
      priceOnRequest: "Price on request",
      deliveryLabel: "Manual review-based workflow",
      viewDetails: "विवरण देखें",
      request: "Request details तैयार करें",
      intentTitle: "Report request intent",
      intentCopy: "अपनी details review करने के लिए यह form उपयोग करें। अभी online submission/payment active नहीं है।",
      intentSafety: "Online request submission coming soon. No payment, order confirmation, or report delivery is created from this form.",
      name: "नाम",
      email: "ईमेल",
      phoneOptional: "फोन (optional)",
      reportType: "Report type",
      dob: "जन्म तिथि",
      tob: "जन्म समय",
      birthPlace: "जन्म स्थान",
      preferredLanguage: "भाषा",
      concern: "प्रश्न / concern",
      prepareRequest: "Request तैयार करें",
      reviewDetails: "Review details",
      onlineComingSoon: "Online request submission जल्द आएगा। अभी यह review-only intent है।",
      reviewHint: "Report workflow active होने पर details submit करने से पहले user confirmation लिया जाएगा।",
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
      manualDeliveryCopy: "Online payment automation active nahi hai. Report workflow manual/review-based rahega.",
      priceOnRequest: "Price on request",
      deliveryLabel: "Manual review-based workflow",
      viewDetails: "View Details",
      request: "Prepare Request",
      intentTitle: "Report Request Intent",
      intentCopy: "Apni details review karne ke liye ye form use karein. Online submission/payment abhi active nahi hai.",
      intentSafety: "Online request submission coming soon. Is form se payment, order confirmation ya report delivery create nahi hoti.",
      name: "Name",
      email: "Email",
      phoneOptional: "Phone (optional)",
      reportType: "Report type",
      dob: "Date of birth",
      tob: "Time of birth",
      birthPlace: "Birth place",
      preferredLanguage: "Preferred language",
      concern: "Question / concern",
      prepareRequest: "Prepare Request",
      reviewDetails: "Review Details",
      onlineComingSoon: "Online request submission jaldi aayega. Abhi ye review-only intent hai.",
      reviewHint: "Report workflow active hone par details submit karne se pehle user confirmation liya jayega.",
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
    manualDeliveryCopy: "No online payment automation is active here. The report workflow remains manual/review-based.",
    priceOnRequest: "Price on request",
    deliveryLabel: "Manual review-based workflow",
    viewDetails: "View Details",
    request: "Prepare Request",
    intentTitle: "Report Request Intent",
    intentCopy: "Use this form to review the details needed for a report request. Online submission and payment are not active in this phase.",
    intentSafety: "Online request submission is coming soon. This form does not create payment, order confirmation, or report delivery.",
    name: "Name",
    email: "Email",
    phoneOptional: "Phone (optional)",
    reportType: "Report type",
    dob: "Date of birth",
    tob: "Time of birth",
    birthPlace: "Birth place",
    preferredLanguage: "Preferred language",
    concern: "Question / concern",
    prepareRequest: "Prepare Request",
    reviewDetails: "Review Details",
    onlineComingSoon: "Online request submission is coming soon. For now, this is a review-only intent flow.",
    reviewHint: "When report workflow is active, Naksharix will ask for confirmation before submitting details.",
    disclaimer: "Disclaimer",
    disclaimerCopy: "Astrology reports are reflective guidance tools. They do not guarantee outcomes and should not replace medical, legal, financial, or professional advice."
  };
}

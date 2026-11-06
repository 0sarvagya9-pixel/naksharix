"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ClipboardList, CreditCard, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout-button";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { manualReports } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";

export function ReportsContent({manualOfferings}:{manualOfferings:Record<string,{pricePaise:number;deliveryDays:number|null;note:string}>}) {
  const { locale } = useLanguage();
  const labels = reportLabels(locale);

  return (
    <main className="min-h-screen bg-[#fffbf5] text-[#372630]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(216,175,102,0.22),transparent_26rem),radial-gradient(circle_at_86%_18%,rgba(137,169,197,0.24),transparent_30rem),linear-gradient(135deg,#fffaf1_0%,#fbf6ea_52%,#eef5fb_100%)]" />
      <Section>
        <div className="nx-gallery-reports-intro">
          <p>CURATED DIGITAL REPORTS</p>
          <h1>{labels.title}</h1>
          <h2>{locale === "hi" ? "व्यक्तिगत रिपोर्ट देखें" : "Explore personal insights"}</h2>
          <span>Clear report formats and the actual published prices for your account.</span>
          <a href="#report-information">How reports work</a>
        </div>
        <div id="report-catalogue" className="mt-10 grid grid-cols-2 gap-3 xl:grid-cols-3">
          {manualReports.map((report) => {
            const checkout = getManualReportCheckout(report.slug);
            const manualPrice=!checkout?manualOfferings[report.slug]:undefined;
            const formattedManualPrice=manualPrice?new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(manualPrice.pricePaise/100):null;
            const requestHref = `/report-request/new?plan=PREMIUM&reportSlug=${encodeURIComponent(report.slug)}`;
            const adminBypassHref = `${requestHref}&mode=admin`;

            return (
              <Card key={report.slug} className="flex flex-col border-[#e7d8be] bg-white/82 shadow-[0_18px_58px_rgba(31,41,51,0.08)] backdrop-blur">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div aria-hidden="true" className="nx-gallery-report-art relative mb-4 overflow-hidden rounded-xl border border-[#c79c65]/45">
                    <Image src={reportGalleryImage(report.slug)} alt="" fill unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="nx-gallery-report-art-img"/>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#b8862e]">{report.category}</p>
                      <h2 className="mt-2 font-cinzel text-2xl font-bold text-[#372630]">{report.name[locale]}</h2>
                    </div>
                    <FileText className="h-5 w-5 shrink-0 text-[#b8862e]" />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#566575]">{report.description[locale]}</p>
                  <ul className="mt-4 space-y-2 text-sm font-semibold text-[#372630]">
                    {report.includes[locale].slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8b3244]" />{item}</li>
                    ))}
                  </ul>
                  <p className="mt-4 rounded-lg border border-[#e7d8be] bg-[#fff9f0] px-3 py-2 text-sm font-bold text-[#b8862e]">
                    {checkout?.price ?? formattedManualPrice ?? labels.manualReview}
                  </p>
                  <p className="mt-2 text-xs text-[#6b7280]">{checkout ? labels.secureCheckout :
                      manualPrice ? "We will confirm the service fee before you pay." :
                      labels.manualWorkflow}</p>
                  <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
                    <Button variant="outline" asChild className="border-[#d8af66] bg-white text-[#372630]"><Link href={`/reports/${report.slug}`}>{labels.viewDetails}</Link></Button>
                    {checkout ? (
                      <RazorpayCheckoutButton
                        payload={{ purpose: checkout.purpose, reportId: checkout.reportId }}
                        label={`${labels.pay} ${checkout.price}`}
                        successHref={`${requestHref}&orderId={paymentId}`}
                        adminBypassHref={adminBypassHref}
                      />
                    ) : (
                      <Button asChild className="bg-[#832d40] text-white hover:bg-[#6f2335]">
                        <Link href={requestHref}><ClipboardList className="h-4 w-4" />{formattedManualPrice ? labels.requestReview+" · "+formattedManualPrice : labels.requestReview}</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div id="report-information" className="nx-gallery-reports-summary rounded-[2rem] border border-[#e7d8be] bg-white/78 p-6 shadow-[0_24px_80px_rgba(31,41,51,0.08)] backdrop-blur md:p-8 lg:grid lg:grid-cols-[1fr_0.72fr] lg:gap-8">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#b8862e]">{labels.eyebrow}</p>
            <h2 className="mt-3 font-cinzel text-4xl font-black text-[#372630] sm:text-5xl">{labels.title}</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#566575]">{labels.subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="bg-[#b8862e] text-white hover:bg-[#9f721f]"><a href="#report-catalogue">{labels.exploreReports}</a></Button>
              <Button variant="outline" asChild className="border-[#d8af66] bg-white/70 text-[#372630]"><Link href="/contact">{labels.contactSupport}</Link></Button>
            </div>
          </div>
          <Card className="mt-6 border-[#e7d8be] bg-[#fff9f0]/80 shadow-[0_18px_55px_rgba(31,41,51,0.06)] lg:mt-0">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-[#b8862e]" />
              <h2 className="mt-4 font-cinzel text-2xl font-bold text-[#372630]">{labels.deliveryTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-[#566575]">{labels.deliveryCopy}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <ProcessCard icon={CreditCard} title={labels.stepOneTitle} copy={labels.stepOneCopy} />
          <ProcessCard icon={ClipboardList} title={labels.stepTwoTitle} copy={labels.stepTwoCopy} />
          <ProcessCard icon={FileText} title={labels.stepThreeTitle} copy={labels.stepThreeCopy} />
        </div>

        <Card className="mt-10 border-[#e7d8be] bg-white/82 shadow-[0_18px_58px_rgba(31,41,51,0.08)] backdrop-blur">
          <CardContent className="p-6">
            <h2 className="font-cinzel text-2xl font-bold text-[#372630]">{labels.disclaimer}</h2>
            <p className="mt-3 text-sm leading-6 text-[#566575]">{labels.disclaimerCopy}</p>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

function ProcessCard({ icon: Icon, title, copy }: { icon: typeof CreditCard; title: string; copy: string }) {
  return (
    <Card className="border-[#e7d8be] bg-white/82 shadow-[0_18px_58px_rgba(31,41,51,0.08)] backdrop-blur">
      <CardContent className="p-6">
        <Icon className="h-6 w-6 text-[#b8862e]" />
        <h2 className="mt-4 font-cinzel text-xl font-bold text-[#372630]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-[#566575]">{copy}</p>
      </CardContent>
    </Card>
  );
}

function reportLabels(locale: "en" | "hi" | "hinglish") {
  if (locale === "hi") {
    return {
      eyebrow: "Premium Astrology Reports",
      title: "प्रीमियम ज्योतिष रिपोर्ट",
      subtitle: "सभी 15 रिपोर्टों की कीमत पहले से दिखाई गई है। एक ही सुरक्षित Razorpay checkout से भुगतान करें और सत्यापन के बाद जन्म विवरण जमा करें।",
      exploreReports: "रिपोर्ट देखें",
      contactSupport: "सपोर्ट से संपर्क करें",
      deliveryTitle: "सुरक्षित और स्पष्ट workflow",
      deliveryCopy: "Paid reports में payment server पर verify होने के बाद ही birth-details form खुलता है। Manual-review reports में कोई payment claim नहीं किया जाता।",
      manualReview: "Fee confirmation required",
      secureCheckout: "Razorpay payment और server verification",
      manualWorkflow: "बिना भुगतान के पहले शुल्क की पुष्टि",
      viewDetails: "विवरण देखें",
      pay: "भुगतान करें",
      requestReview: "शुल्क पूछें",
      stepOneTitle: "1. सही report चुनें",
      stepOneCopy: "सभी प्रकाशित रिपोर्टों की एकमुश्त कीमत checkout से पहले स्पष्ट दिखाई देती है।",
      stepTwoTitle: "2. सुरक्षित details दें",
      stepTwoCopy: "Payment verification के बाद या manual request में accurate birth place, date, time और concern submit करें।",
      stepThreeTitle: "3. वास्तविक delivery",
      stepThreeCopy: "Download link केवल actual generated PDF उपलब्ध होने पर दिखता है।",
      disclaimer: "अस्वीकरण",
      disclaimerCopy: "ज्योतिष रिपोर्ट चिंतनात्मक मार्गदर्शन के साधन हैं। ये परिणामों की गारंटी नहीं देतीं और चिकित्सा, कानूनी, वित्तीय या पेशेवर सलाह का विकल्प नहीं हैं।"
    };
  }

  if (locale === "hinglish") {
    return {
      eyebrow: "Premium Astrology Reports",
      title: "Premium Astrology Reports",
      subtitle: "Sabhi 15 reports ke fixed prices listed hain. Ek hi secure Razorpay checkout se pay karein, verification ke baad birth details submit karein.",
      exploreReports: "Explore Reports",
      contactSupport: "Contact Support",
      deliveryTitle: "Secure aur clear workflow",
      deliveryCopy: "Paid reports me payment server par verify hone ke baad birth-details form khulta hai. Manual-review reports me koi payment claim nahi hota.",
      manualReview: "Fee confirmation required",
      secureCheckout: "Razorpay payment aur server verification",
      manualWorkflow: "Personalized quote before any payment",
      viewDetails: "View Details",
      pay: "Pay",
      requestReview: "Get a quote",
      stepOneTitle: "1. Sahi report choose karein",
      stepOneCopy: "Sabhi published reports me exact one-time price checkout se pehle dikhta hai.",
      stepTwoTitle: "2. Secure details submit karein",
      stepTwoCopy: "Payment verification ke baad ya manual request me accurate birth place, date, time aur concern submit karein.",
      stepThreeTitle: "3. Real delivery",
      stepThreeCopy: "Download link sirf actual generated PDF available hone par dikhta hai.",
      disclaimer: "Disclaimer",
      disclaimerCopy: "Astrology reports reflective guidance tools hain. Ye guaranteed outcomes nahi deti aur medical, legal, financial ya professional advice ka replacement nahi hain."
    };
  }

  return {
    eyebrow: "Premium Astrology Reports",
    title: "Premium Astrology Reports",
    subtitle: "Choose from 15 clearly priced personalized reports. Pay securely through the single Razorpay checkout, then submit birth details after server verification.",
    exploreReports: "Explore Reports",
    contactSupport: "Contact Support",
    deliveryTitle: "A secure, transparent workflow",
    deliveryCopy: "Complete secure checkout, then enter your birth details to request a personalized report.",
    manualReview: "Fee confirmation required",
    secureCheckout: "Secure online payment",
    manualWorkflow: "Personalized quote before any payment",
    viewDetails: "View Details",
    pay: "Pay",
    requestReview: "Get a quote",
    stepOneTitle: "1. Choose the right report",
    stepOneCopy: "All published reports show their exact one-time payable price before secure checkout.",
    stepTwoTitle: "2. Submit secure details",
    stepTwoCopy: "After payment verification, or for a manual request, submit accurate birth place, date, time, and concern.",
    stepThreeTitle: "3. Receive a real deliverable",
    stepThreeCopy: "Download your report when it is ready.",
    disclaimer: "Disclaimer",
    disclaimerCopy: "Astrology reports are reflective guidance tools. They do not guarantee outcomes and should not replace medical, legal, financial, or professional advice."
  };
}

/** Visual categories only; displayed prices and product facts remain live. */
function reportGalleryImage(slug: string) {
  if (/love|marriage|couple|match|compatib|relationship/i.test(slug)) return "/approved-gallery/consult-photo.jpg";
  if (/career|wealth|business|finance|year|transit|sade|dosha/i.test(slug)) return "/approved-gallery/hero-astrolabe.jpg";
  return "/approved-gallery/kundli-report.jpg";
}

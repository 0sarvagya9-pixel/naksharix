"use client";

import Link from "next/link";
import { AlertTriangle, FileText, Mail, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/section";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n";

export type TrustPageKey = "about" | "contact" | "privacy" | "terms" | "disclaimer" | "refund";

type TrustSection = { title: string; body: string; bullets?: string[] };
type TrustCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  badge: string;
  highlights: string[];
  sections: TrustSection[];
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  emailLabel: string;
  form?: {
    title: string;
    note: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    button: string;
  };
};

const supportEmail = "care@naksharix.com";

const copy: Record<Locale, Record<TrustPageKey, TrustCopy>> = {
  en: {
    about: {
      eyebrow: "About Naksharix",
      title: "Spiritual-tech guidance for modern decisions",
      intro: "Naksharix brings AI-powered Vedic astrology, Kundli, matching, numerology, Lo Shu, tarot, and reflective guidance into one calm premium experience.",
      badge: "AI + Vedic Astrology",
      highlights: ["Vedic Kundli and Dasha context", "Numerology and Lo Shu insights", "English, Hindi, and Hinglish support"],
      sections: [
        { title: "What Naksharix Is", body: "Naksharix is a spiritual-tech platform for people who want clearer self-reflection through astrology, numerology, tarot, matching, and AI-guided questions." },
        { title: "Our Approach", body: "We design guidance as a planning and reflection tool. Reports and AI answers are meant to support awareness, not replace practical judgment or qualified professional advice." },
        { title: "Trust Promise", body: "We avoid fear-based claims, guaranteed outcomes, and extreme recommendations. When information is incomplete, Naksharix should say so clearly." }
      ],
      ctaTitle: "Need help?",
      ctaBody: "For support, policy questions, or product feedback, write to the Naksharix care team.",
      ctaButton: "Contact Support",
      emailLabel: "Support email"
    },
    contact: {
      eyebrow: "Contact",
      title: "We are here to help you use Naksharix with confidence",
      intro: "For report questions, AI guidance issues, account help, or product feedback, contact us directly.",
      badge: "Support",
      highlights: ["Primary email support", "No fake form submission", "Clear support expectations"],
      sections: [
        { title: "Email Support", body: `Please email us directly at ${supportEmail}. Include the page, report, or account detail related to your question.` },
        { title: "Response Window", body: "We aim to review support messages carefully. Complex report or account questions may require additional context." },
        { title: "Safe Contact Policy", body: "This form is a UI foundation only until backend email delivery is configured. It will not pretend to send a message." }
      ],
      ctaTitle: "Direct support",
      ctaBody: "The safest current support path is direct email.",
      ctaButton: "Email Naksharix",
      emailLabel: "Support email",
      form: { title: "Support message", note: `Please email us directly at ${supportEmail}.`, name: "Name", email: "Email", subject: "Subject", message: "Message", button: "Email us directly" }
    },
    privacy: {
      eyebrow: "Privacy Policy",
      title: "How Naksharix handles your information",
      intro: "This policy explains the information you may provide, how it is used, and how to contact us about privacy questions.",
      badge: "Privacy",
      highlights: ["Birth details power chart calculations", "AI queries may be processed by AI providers", "Language and session preferences may use local storage"],
      sections: [
        { title: "Information You Provide", body: "You may provide name, email, birth date, birth time, birth place, gender, messages, support requests, and report-related details." },
        { title: "How We Use Data", body: "Information is used to generate Kundli, matching, numerology, Lo Shu, tarot, AI responses, support replies, and product safety improvements." },
        { title: "AI Provider Use", body: "When you use AI features, your question and available context may be processed by an AI provider only to generate a response." },
        { title: "Cookies and Local Storage", body: "Naksharix may store language preference, session preferences, and local chat memory in your browser so the app feels consistent." },
        { title: "Payments", body: "Automatic paid reports and payment automation are not active in this safe phase. If payments are enabled later, payment data should be handled by the payment provider." },
        { title: "Your Rights", body: `For privacy questions or correction requests, contact ${supportEmail}.` }
      ],
      ctaTitle: "Privacy questions",
      ctaBody: "Write to us for privacy, data correction, or support questions.",
      ctaButton: "Contact Privacy Support",
      emailLabel: "Privacy contact"
    },
    terms: {
      eyebrow: "Terms & Conditions",
      title: "Use Naksharix responsibly",
      intro: "These terms explain the responsible use of Naksharix guidance, tools, AI responses, and content.",
      badge: "Terms",
      highlights: ["Guidance, not guarantees", "User-entered data must be accurate", "AI answers may be imperfect"],
      sections: [
        { title: "Use of Service", body: "Naksharix provides astrology, numerology, tarot, matching, reports, and AI guidance for reflection and planning." },
        { title: "User Responsibility", body: "You are responsible for the accuracy of birth details, questions, and contact information you enter." },
        { title: "No Guaranteed Results", body: "Naksharix does not guarantee marriage, career, health, finance, legal, or personal outcomes." },
        { title: "AI Limitations", body: "AI-generated responses may be incomplete or inaccurate. Use practical judgment and seek qualified help where needed." },
        { title: "Intellectual Property", body: "Naksharix branding, UI, reports, and content are protected platform assets unless otherwise stated." },
        { title: "Limitation of Liability", body: "Use guidance thoughtfully. Critical decisions should not be made only from Naksharix output." }
      ],
      ctaTitle: "Questions about terms?",
      ctaBody: "Contact the care team for product or policy clarification.",
      ctaButton: "Contact Support",
      emailLabel: "Terms contact"
    },
    disclaimer: {
      eyebrow: "Disclaimer",
      title: "Reflective guidance, not professional advice",
      intro: "Naksharix guidance is designed for spiritual insight, self-reflection, and general planning.",
      badge: "Important",
      highlights: ["No guaranteed outcomes", "Not medical, legal, financial, or psychological advice", "Critical decisions need practical review"],
      sections: [
        { title: "Guidance Scope", body: "Astrology, numerology, tarot, and AI guidance on Naksharix are for reflection, spiritual insight, and general guidance." },
        { title: "Professional Advice", body: "Naksharix does not replace medical, legal, financial, psychological, or other professional advice." },
        { title: "Major Decisions", body: "Marriage, career, health, finance, and family decisions should include practical judgment, lived context, and qualified professionals where needed." },
        { title: "AI Accuracy", body: "AI-generated answers may be incomplete or inaccurate. Do not make critical decisions only based on AI output." }
      ],
      ctaTitle: "Use with judgment",
      ctaBody: "If a matter is urgent, medical, legal, financial, or mental-health related, contact a qualified professional.",
      ctaButton: "Contact Naksharix",
      emailLabel: "Support email"
    },
    refund: {
      eyebrow: "Refund & Cancellation Policy",
      title: "Current payment and refund status",
      intro: "This page explains the safe current policy while automatic paid reports and payment automation are not active.",
      badge: "Billing",
      highlights: ["Automatic payments are not active in this phase", "No fake automated refund system", "Billing questions go to care support"],
      sections: [
        { title: "Automatic Payments", body: "Online automatic paid reports and payment automation are not active in this safe phase of Naksharix." },
        { title: "Manual Services", body: "If any manual service or payment is arranged separately in the future, refund and cancellation terms will be shared before confirmation." },
        { title: "Billing Questions", body: `For any billing, report, or payment query, contact ${supportEmail}.` },
        { title: "No Automated Refund Claim", body: "Naksharix does not currently claim an automated refund dashboard or instant refund workflow." }
      ],
      ctaTitle: "Billing support",
      ctaBody: "For report or billing questions, write to the care team.",
      ctaButton: "Contact Billing Support",
      emailLabel: "Billing contact"
    }
  },
  hi: {
    about: {
      eyebrow: "Naksharix के बारे में",
      title: "आधुनिक निर्णयों के लिए आध्यात्मिक-टेक मार्गदर्शन",
      intro: "Naksharix AI-संचालित वैदिक ज्योतिष, कुंडली, मिलान, अंक ज्योतिष, लो शू, टैरो और चिंतनात्मक मार्गदर्शन को एक प्रीमियम अनुभव में जोड़ता है।",
      badge: "AI + वैदिक ज्योतिष",
      highlights: ["वैदिक कुंडली और दशा संदर्भ", "अंक ज्योतिष और लो शू अंतर्दृष्टि", "English, Hindi और Hinglish समर्थन"],
      sections: [
        { title: "Naksharix क्या है", body: "Naksharix एक spiritual-tech प्लेटफ़ॉर्म है जो ज्योतिष, अंक ज्योतिष, टैरो, मिलान और AI-आधारित प्रश्नों के माध्यम से आत्मचिंतन में सहायता करता है।" },
        { title: "हमारा दृष्टिकोण", body: "हम मार्गदर्शन को योजना और चिंतन का साधन मानते हैं। रिपोर्ट और AI उत्तर व्यावहारिक निर्णय या योग्य पेशेवर सलाह का विकल्प नहीं हैं।" },
        { title: "विश्वास का वादा", body: "हम डर-आधारित दावे, गारंटी और अतिवादी सुझावों से बचते हैं। जानकारी अधूरी होने पर Naksharix को यह साफ बताना चाहिए।" }
      ],
      ctaTitle: "सहायता चाहिए?",
      ctaBody: "सपोर्ट, नीति प्रश्न या फीडबैक के लिए Naksharix care team को लिखें।",
      ctaButton: "सपोर्ट से संपर्क करें",
      emailLabel: "सपोर्ट ईमेल"
    },
    contact: {
      eyebrow: "संपर्क",
      title: "Naksharix को आत्मविश्वास से उपयोग करने में हम आपकी मदद करेंगे",
      intro: "रिपोर्ट, AI guidance, account help या product feedback के लिए हमें सीधे संपर्क करें।",
      badge: "सपोर्ट",
      highlights: ["प्राथमिक ईमेल सपोर्ट", "फर्जी form success नहीं", "साफ support expectations"],
      sections: [
        { title: "ईमेल सपोर्ट", body: `कृपया सीधे ${supportEmail} पर ईमेल करें। अपने प्रश्न से जुड़ा page, report या account detail जोड़ें।` },
        { title: "उत्तर समय", body: "हम support messages को ध्यान से review करने का प्रयास करते हैं। जटिल report या account questions में अतिरिक्त context लग सकता है।" },
        { title: "सुरक्षित संपर्क नीति", body: "Backend email delivery configure होने तक यह form केवल UI foundation है। यह message भेजने का झूठा दावा नहीं करेगा।" }
      ],
      ctaTitle: "सीधा support",
      ctaBody: "अभी सबसे सुरक्षित support path direct email है।",
      ctaButton: "Naksharix को ईमेल करें",
      emailLabel: "सपोर्ट ईमेल",
      form: { title: "सपोर्ट संदेश", note: `कृपया सीधे ${supportEmail} पर ईमेल करें।`, name: "नाम", email: "ईमेल", subject: "विषय", message: "संदेश", button: "सीधे ईमेल करें" }
    },
    privacy: {
      eyebrow: "गोपनीयता नीति",
      title: "Naksharix आपकी जानकारी कैसे संभालता है",
      intro: "यह नीति बताती है कि आप कौन सी जानकारी दे सकते हैं, उसका उपयोग कैसे होता है, और privacy questions के लिए कैसे संपर्क करें।",
      badge: "गोपनीयता",
      highlights: ["जन्म विवरण chart calculations में मदद करते हैं", "AI queries response बनाने के लिए AI provider से process हो सकती हैं", "Language और session preferences browser storage में रह सकती हैं"],
      sections: [
        { title: "आपके द्वारा दी गई जानकारी", body: "आप नाम, ईमेल, जन्म तिथि, जन्म समय, जन्म स्थान, लिंग, messages, support requests और report details दे सकते हैं।" },
        { title: "डेटा का उपयोग", body: "जानकारी Kundli, matching, numerology, Lo Shu, tarot, AI responses, support replies और product safety improvement के लिए उपयोग होती है।" },
        { title: "AI Provider उपयोग", body: "AI features में आपका question और उपलब्ध context response generate करने के लिए AI provider से process हो सकता है।" },
        { title: "Cookies और Local Storage", body: "Naksharix browser में language preference, session preferences और local chat memory store कर सकता है।" },
        { title: "Payments", body: "Automatic paid reports और payment automation इस safe phase में active नहीं हैं। भविष्य में payments enabled होने पर payment data payment provider handle करेगा।" },
        { title: "आपके अधिकार", body: `Privacy questions या correction requests के लिए ${supportEmail} पर संपर्क करें।` }
      ],
      ctaTitle: "Privacy questions",
      ctaBody: "Privacy, data correction या support questions के लिए लिखें।",
      ctaButton: "Privacy support से संपर्क करें",
      emailLabel: "Privacy contact"
    },
    terms: {
      eyebrow: "नियम और शर्तें",
      title: "Naksharix का जिम्मेदारी से उपयोग करें",
      intro: "ये terms Naksharix guidance, tools, AI responses और content के जिम्मेदार उपयोग को समझाते हैं।",
      badge: "Terms",
      highlights: ["Guidance है, guarantee नहीं", "User-entered data सही होना चाहिए", "AI answers imperfect हो सकते हैं"],
      sections: [
        { title: "सेवा का उपयोग", body: "Naksharix reflection और planning के लिए astrology, numerology, tarot, matching, reports और AI guidance देता है।" },
        { title: "User responsibility", body: "आप अपने entered birth details, questions और contact information की accuracy के लिए responsible हैं।" },
        { title: "No guaranteed results", body: "Naksharix marriage, career, health, finance, legal या personal outcomes की guarantee नहीं देता।" },
        { title: "AI limitations", body: "AI-generated responses अधूरे या inaccurate हो सकते हैं। Practical judgment और qualified help जरूरी हो सकती है।" },
        { title: "Intellectual property", body: "Naksharix branding, UI, reports और content platform assets हैं जब तक अलग से न कहा जाए।" },
        { title: "Liability limitation", body: "Guidance thoughtfully use करें। Critical decisions केवल Naksharix output पर आधारित नहीं होने चाहिए।" }
      ],
      ctaTitle: "Terms पर प्रश्न?",
      ctaBody: "Product या policy clarification के लिए care team से संपर्क करें।",
      ctaButton: "Support से संपर्क करें",
      emailLabel: "Terms contact"
    },
    disclaimer: {
      eyebrow: "अस्वीकरण",
      title: "चिंतनात्मक मार्गदर्शन, पेशेवर सलाह नहीं",
      intro: "Naksharix guidance spiritual insight, self-reflection और general planning के लिए बनाया गया है।",
      badge: "महत्वपूर्ण",
      highlights: ["कोई guaranteed outcome नहीं", "Medical, legal, financial या psychological advice नहीं", "Critical decisions में practical review जरूरी है"],
      sections: [
        { title: "Guidance scope", body: "Naksharix पर astrology, numerology, tarot और AI guidance reflection, spiritual insight और general guidance के लिए है।" },
        { title: "Professional advice", body: "Naksharix medical, legal, financial, psychological या अन्य professional advice का विकल्प नहीं है।" },
        { title: "Major decisions", body: "Marriage, career, health, finance और family decisions में practical judgment, जीवन context और qualified professionals को शामिल करें।" },
        { title: "AI accuracy", body: "AI-generated answers incomplete या inaccurate हो सकते हैं। Critical decisions केवल AI output पर आधारित न करें।" }
      ],
      ctaTitle: "समझदारी से उपयोग करें",
      ctaBody: "Urgent, medical, legal, financial या mental-health matter हो तो qualified professional से संपर्क करें।",
      ctaButton: "Naksharix से संपर्क करें",
      emailLabel: "सपोर्ट ईमेल"
    },
    refund: {
      eyebrow: "Refund और Cancellation Policy",
      title: "Current payment और refund status",
      intro: "यह page safe current policy बताता है क्योंकि automatic paid reports और payment automation active नहीं हैं।",
      badge: "Billing",
      highlights: ["Automatic payments इस phase में active नहीं हैं", "Fake automated refund system नहीं", "Billing questions care support को जाएँगे"],
      sections: [
        { title: "Automatic payments", body: "Naksharix के इस safe phase में online automatic paid reports और payment automation active नहीं हैं।" },
        { title: "Manual services", body: "भविष्य में कोई manual service/payment अलग से arrange होने पर confirmation से पहले refund और cancellation terms share किए जाएँगे।" },
        { title: "Billing questions", body: `Billing, report या payment query के लिए ${supportEmail} पर संपर्क करें।` },
        { title: "No automated refund claim", body: "Naksharix अभी automated refund dashboard या instant refund workflow का दावा नहीं करता।" }
      ],
      ctaTitle: "Billing support",
      ctaBody: "Report या billing questions के लिए care team को लिखें।",
      ctaButton: "Billing support से संपर्क करें",
      emailLabel: "Billing contact"
    }
  },
  hinglish: {
    about: {
      eyebrow: "About Naksharix",
      title: "Modern decisions ke liye spiritual-tech guidance",
      intro: "Naksharix AI-powered Vedic astrology, Kundli, matching, numerology, Lo Shu, tarot aur reflective guidance ko ek premium experience me laata hai.",
      badge: "AI + Vedic Astrology",
      highlights: ["Vedic Kundli aur Dasha context", "Numerology aur Lo Shu insights", "English, Hindi aur Hinglish support"],
      sections: [
        { title: "Naksharix kya hai", body: "Naksharix ek spiritual-tech platform hai jo astrology, numerology, tarot, matching aur AI-guided questions ke through self-reflection support karta hai." },
        { title: "Humara approach", body: "Guidance ko planning aur reflection tool maana gaya hai. Reports aur AI answers practical judgment ya professional advice ka replacement nahi hain." },
        { title: "Trust promise", body: "Hum fear-based claims, guaranteed outcomes aur extreme recommendations se bachkar clear, calm guidance dete hain." }
      ],
      ctaTitle: "Help chahiye?",
      ctaBody: "Support, policy questions ya feedback ke liye Naksharix care team ko likhein.",
      ctaButton: "Contact Support",
      emailLabel: "Support email"
    },
    contact: {
      eyebrow: "Contact",
      title: "Naksharix ko confidence ke saath use karne me hum help karenge",
      intro: "Report questions, AI guidance issues, account help ya product feedback ke liye direct contact karein.",
      badge: "Support",
      highlights: ["Primary email support", "Fake form success nahi", "Clear support expectations"],
      sections: [
        { title: "Email support", body: `Please direct ${supportEmail} par email karein. Apne question se related page, report ya account detail include karein.` },
        { title: "Response window", body: "Hum support messages carefully review karte hain. Complex report ya account questions me extra context lag sakta hai." },
        { title: "Safe contact policy", body: "Backend email delivery configure hone tak yeh form UI foundation hai. Yeh fake send success nahi dikhayega." }
      ],
      ctaTitle: "Direct support",
      ctaBody: "Abhi safest support path direct email hai.",
      ctaButton: "Email Naksharix",
      emailLabel: "Support email",
      form: { title: "Support message", note: `Please direct ${supportEmail} par email karein.`, name: "Name", email: "Email", subject: "Subject", message: "Message", button: "Email us directly" }
    },
    privacy: {
      eyebrow: "Privacy Policy",
      title: "Naksharix aapki information kaise handle karta hai",
      intro: "Yeh policy explain karti hai ki aap kya information provide kar sakte hain aur uska use kaise hota hai.",
      badge: "Privacy",
      highlights: ["Birth details chart calculation me help karte hain", "AI queries response ke liye AI provider se process ho sakti hain", "Language/session preferences local storage me reh sakti hain"],
      sections: [
        { title: "Information you provide", body: "Aap name, email, birth date, birth time, birth place, gender, messages, support requests aur report details provide kar sakte hain." },
        { title: "Data use", body: "Data Kundli, matching, numerology, Lo Shu, tarot, AI responses, support replies aur product safety improvements ke liye use hota hai." },
        { title: "AI provider use", body: "AI features me question aur context response generate karne ke liye AI provider se process ho sakte hain." },
        { title: "Cookies/localStorage", body: "Naksharix browser me language preference, session preferences aur local chat memory store kar sakta hai." },
        { title: "Payments", body: "Automatic paid reports aur payment automation is safe phase me active nahi hain. Future me payment provider payment data handle karega." },
        { title: "Your rights", body: `Privacy questions ya correction requests ke liye ${supportEmail} par contact karein.` }
      ],
      ctaTitle: "Privacy questions",
      ctaBody: "Privacy, data correction ya support questions ke liye likhein.",
      ctaButton: "Contact Privacy Support",
      emailLabel: "Privacy contact"
    },
    terms: {
      eyebrow: "Terms & Conditions",
      title: "Naksharix responsibly use karein",
      intro: "Yeh terms Naksharix guidance, tools, AI responses aur content ka responsible use explain karte hain.",
      badge: "Terms",
      highlights: ["Guidance hai, guarantee nahi", "Entered data accurate hona chahiye", "AI answers imperfect ho sakte hain"],
      sections: [
        { title: "Use of service", body: "Naksharix reflection aur planning ke liye astrology, numerology, tarot, matching, reports aur AI guidance provide karta hai." },
        { title: "User responsibility", body: "Aap entered birth details, questions aur contact information ki accuracy ke liye responsible hain." },
        { title: "No guaranteed results", body: "Naksharix marriage, career, health, finance, legal ya personal outcomes guarantee nahi karta." },
        { title: "AI limitations", body: "AI-generated responses incomplete ya inaccurate ho sakte hain. Practical judgment aur qualified help zaroori ho sakti hai." },
        { title: "Intellectual property", body: "Naksharix branding, UI, reports aur content protected platform assets hain." },
        { title: "Liability limitation", body: "Guidance thoughtfully use karein. Critical decisions sirf Naksharix output par based nahi hone chahiye." }
      ],
      ctaTitle: "Terms questions?",
      ctaBody: "Product ya policy clarification ke liye care team se contact karein.",
      ctaButton: "Contact Support",
      emailLabel: "Terms contact"
    },
    disclaimer: {
      eyebrow: "Disclaimer",
      title: "Reflective guidance, professional advice nahi",
      intro: "Naksharix guidance spiritual insight, self-reflection aur general planning ke liye hai.",
      badge: "Important",
      highlights: ["Guaranteed outcomes nahi", "Medical, legal, financial ya psychological advice nahi", "Critical decisions practical review maangte hain"],
      sections: [
        { title: "Guidance scope", body: "Naksharix par astrology, numerology, tarot aur AI guidance reflection, spiritual insight aur general guidance ke liye hai." },
        { title: "Professional advice", body: "Naksharix medical, legal, financial, psychological ya other professional advice ka replacement nahi hai." },
        { title: "Major decisions", body: "Marriage, career, health, finance aur family decisions me practical judgment, lived context aur qualified professionals ko include karein." },
        { title: "AI accuracy", body: "AI-generated answers incomplete ya inaccurate ho sakte hain. Critical decisions sirf AI output par based na karein." }
      ],
      ctaTitle: "Judgment ke saath use karein",
      ctaBody: "Urgent, medical, legal, financial ya mental-health matter ho to qualified professional se contact karein.",
      ctaButton: "Contact Naksharix",
      emailLabel: "Support email"
    },
    refund: {
      eyebrow: "Refund & Cancellation Policy",
      title: "Current payment aur refund status",
      intro: "Yeh page safe current policy explain karta hai kyunki automatic paid reports aur payment automation active nahi hain.",
      badge: "Billing",
      highlights: ["Automatic payments active nahi hain", "Fake automated refund system nahi", "Billing questions care support ko jaate hain"],
      sections: [
        { title: "Automatic payments", body: "Naksharix ke is safe phase me online automatic paid reports aur payment automation active nahi hain." },
        { title: "Manual services", body: "Future me koi manual service/payment separately arrange hua to confirmation se pehle refund/cancellation terms share kiye jayenge." },
        { title: "Billing questions", body: `Billing, report ya payment query ke liye ${supportEmail} par contact karein.` },
        { title: "No automated refund claim", body: "Naksharix abhi automated refund dashboard ya instant refund workflow claim nahi karta." }
      ],
      ctaTitle: "Billing support",
      ctaBody: "Report ya billing questions ke liye care team ko likhein.",
      ctaButton: "Contact Billing Support",
      emailLabel: "Billing contact"
    }
  }
};

export function LegalTrustPage({ page }: { page: TrustPageKey }) {
  const { locale } = useLanguage();
  const data = copy[locale][page];
  const Icon = page === "disclaimer" ? AlertTriangle : page === "contact" ? Mail : page === "about" ? Sparkles : page === "privacy" ? ShieldCheck : FileText;

  return (
    <main className="inner-page-shell star-field">
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{data.eyebrow}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{data.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#94a3b8]">{data.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dca956]/35 bg-[#0a1224]/85 px-4 py-2 text-sm font-semibold text-[#f3d382]">
                <Icon className="h-4 w-4" />
                {data.badge}
              </span>
              <span className="rounded-full border border-[#009b72]/35 bg-[#009b72]/10 px-4 py-2 text-sm font-semibold text-[#00f5a0]">{supportEmail}</span>
            </div>
          </div>
          <Card className="border-[#1e293b] bg-[#0a1224]/88">
            <CardHeader>
              <CardTitle className="font-cinzel text-[#f3d382]">{data.ctaTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-7 text-[#94a3b8]">{data.ctaBody}</p>
              <div className="rounded-lg border border-[#1e293b] bg-[#0f1c3a]/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#94a3b8]">{data.emailLabel}</p>
                <p className="mt-2 font-semibold text-white">{supportEmail}</p>
              </div>
              <Button asChild className="bg-[#009b72] text-white hover:bg-[#008766]">
                <Link href={`mailto:${supportEmail}`}>{data.ctaButton}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {data.highlights.map((item) => (
            <Card key={item} className="border-[#1e293b] bg-[#0f1c3a]/78">
              <CardContent className="p-5">
                <ShieldCheck className="h-5 w-5 text-[#00f5a0]" />
                <p className="mt-3 text-sm leading-6 text-white">{item}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {data.form ? <ContactFoundationForm form={data.form} /> : null}

        <div className="mt-10 grid gap-5">
          {data.sections.map((section) => (
            <Card key={section.title} className="border-[#1e293b] bg-[#0a1224]/82">
              <CardContent className="p-6">
                <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{section.title}</h2>
                <p className="mt-3 leading-7 text-[#cbd5e1]">{section.body}</p>
                {section.bullets?.length ? (
                  <ul className="mt-4 grid gap-2 text-sm text-[#94a3b8]">
                    {section.bullets.map((bullet) => <li key={bullet}>• {bullet}</li>)}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

function ContactFoundationForm({ form }: { form: NonNullable<TrustCopy["form"]> }) {
  return (
    <Card className="mt-10 border-[#1e293b] bg-[#0a1224]/88">
      <CardHeader>
        <CardTitle className="font-cinzel text-[#f3d382]">{form.title}</CardTitle>
        <p className="text-sm text-[#94a3b8]">{form.note}</p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{form.name}</Label>
            <Input className="border-[#1e293b] bg-[#0f1c3a]" />
          </div>
          <div className="space-y-2">
            <Label>{form.email}</Label>
            <Input type="email" className="border-[#1e293b] bg-[#0f1c3a]" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{form.subject}</Label>
            <Input className="border-[#1e293b] bg-[#0f1c3a]" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{form.message}</Label>
            <Textarea className="min-h-32 border-[#1e293b] bg-[#0f1c3a]" />
          </div>
          <div className="md:col-span-2">
            <Button type="button" asChild className="bg-[#009b72] text-white hover:bg-[#008766]">
              <Link href={`mailto:${supportEmail}`}>
                <Send className="h-4 w-4" />
                {form.button}
              </Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

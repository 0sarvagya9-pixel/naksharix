import Link from "next/link";
import {
  AlertTriangle,
  BadgeIndianRupee,
  BookOpenCheck,
  FileCheck2,
  HelpCircle,
  Mail,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";

export type PolicyPageKey =
  | "about"
  | "contact"
  | "privacy"
  | "terms"
  | "disclaimer"
  | "refund"
  | "delivery"
  | "faq";

type PolicySection = {
  title: string;
  body: string;
  bullets?: string[];
};

type PolicyPage = {
  eyebrow: string;
  title: string;
  intro: string;
  badge: string;
  icon: typeof ShieldCheck;
  highlights: string[];
  sections: PolicySection[];
};

const SUPPORT_EMAIL = "care@naksharix.com";
const LAST_UPDATED = "12 July 2026";

const policyPages: Record<PolicyPageKey, PolicyPage> = {
  about: {
    eyebrow: "About Naksharix",
    title: "Traditional astrology tools, delivered with modern product discipline",
    intro:
      "Naksharix provides Vedic astrology tools, Kundli reports, Panchang, horoscope guidance, numerology, tarot, consultations, and saved digital reports in one account-based experience.",
    badge: "About",
    icon: Sparkles,
    highlights: [
      "Calculation-led tools with stated limitations",
      "Digital reports and consultation workflows",
      "Guidance for reflection, not guaranteed outcomes",
    ],
    sections: [
      {
        title: "What We Provide",
        body:
          "Naksharix combines chart calculations, traditional interpretive frameworks, digital reports, and consultation workflows. Some features may be marked as coming soon while they are being validated.",
      },
      {
        title: "How We Build Trust",
        body:
          "We aim to separate verified calculations from interpretation, avoid fear-based language, disclose unavailable modules, and keep payment and account actions server-verified.",
      },
      {
        title: "Current Product Scope",
        body:
          "Core tools, saved reports, premium report payments, and consultation booking are part of the active platform. The AI Astrologer and physical shop remain intentionally parked until separately approved for public release.",
      },
      {
        title: "Responsible Use",
        body:
          "Astrology and related tools can support reflection and planning, but they do not replace practical judgment or qualified medical, legal, financial, psychological, or emergency advice.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Support for accounts, reports, payments, and consultations",
    intro:
      "Use the support email below for account access, saved reports, payment questions, consultation bookings, privacy requests, or technical issues.",
    badge: "Support",
    icon: Mail,
    highlights: [
      "Direct email support",
      "Include the relevant order or booking reference",
      "Never send passwords, OTPs, card numbers, or banking credentials",
    ],
    sections: [
      {
        title: "Support Email",
        body: `Write to ${SUPPORT_EMAIL}. Include the page or feature involved and the email address used for your Naksharix account.`,
      },
      {
        title: "Payment and Booking Questions",
        body:
          "For a duplicate charge, failed unlock, booking issue, or payment-status mismatch, include the Razorpay payment or order reference visible in your receipt or dashboard. Do not send card or bank credentials.",
      },
      {
        title: "Privacy and Data Requests",
        body:
          "You may request correction or deletion of eligible account and saved-report data. We may ask for reasonable account verification before acting on a request.",
      },
      {
        title: "Response Expectations",
        body:
          "Requests are reviewed manually. Complex payment, consultation, or account investigations may require additional information and processing time.",
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy Policy",
    title: "How Naksharix handles account, birth, report, and payment information",
    intro:
      "This policy explains the categories of information used to provide Naksharix services and the choices available to account holders.",
    badge: "Privacy",
    icon: ShieldCheck,
    highlights: [
      "Birth details are used for requested calculations and reports",
      "Razorpay processes payment credentials",
      "Naksharix does not sell personal information to advertisers",
    ],
    sections: [
      {
        title: "Information You Provide",
        body:
          "Depending on the feature, you may provide your name, email, password hash, birth date, birth time, birth place, coordinates, timezone, language, questions, consultation details, reviews, support messages, and saved-report inputs.",
      },
      {
        title: "Account and Session Data",
        body:
          "Naksharix uses session cookies or tokens to keep you signed in and to protect account-only pages. Language and interface preferences may be stored in your browser.",
      },
      {
        title: "How Information Is Used",
        body:
          "Information is used to calculate requested astrology outputs, generate and save reports, process premium access, manage consultations, prevent abuse, provide support, maintain security, and improve reliability.",
      },
      {
        title: "Payments",
        body:
          "Payments are processed through Razorpay. Naksharix may store payment references, amount, currency, status, and the associated report or booking identifier. Naksharix does not store full card numbers, CVV, UPI PINs, or online-banking passwords.",
      },
      {
        title: "Consultation Data",
        body:
          "Consultation bookings may include your question, birth details, selected astrologer, time slot, payment status, meeting link, booking status, and notes required to deliver or administer the service.",
      },
      {
        title: "AI Features",
        body:
          "The public AI Astrologer is currently parked. If an AI feature is enabled later, the feature should explain what context is sent to the configured provider before a user submits sensitive information.",
      },
      {
        title: "Data Sharing",
        body:
          "Information may be shared with service providers only as needed to operate hosting, authentication, payment processing, email delivery, monitoring, and consultations. Approved astrologers should receive only the information needed for the booked service.",
      },
      {
        title: "Retention, Security, and Deletion",
        body:
          "Data is retained as needed for account operation, service delivery, payment records, fraud prevention, legal obligations, and dispute handling. Security controls reduce risk but no online system can guarantee absolute security. Contact support to request correction or deletion of eligible data.",
      },
      {
        title: "Children and Sensitive Decisions",
        body:
          "Naksharix is not designed to collect information from children without appropriate guardian involvement. Do not submit third-party birth or personal data unless you are authorized to do so.",
      },
    ],
  },
  terms: {
    eyebrow: "Terms & Conditions",
    title: "Terms for using Naksharix tools, reports, payments, and consultations",
    intro:
      "By using Naksharix, you agree to use the platform lawfully, provide accurate information, protect your account, and treat astrology output as guidance rather than a guaranteed result.",
    badge: "Terms",
    icon: FileCheck2,
    highlights: [
      "Guidance and calculation tools, not guaranteed outcomes",
      "Server-verified premium and consultation payments",
      "One user may access only their own protected records",
    ],
    sections: [
      {
        title: "Service Scope",
        body:
          "Naksharix provides astrology, Panchang, horoscope, numerology, tarot, matching, reports, consultation booking, and related digital services. Features may be changed, paused, or marked coming soon while reliability or compliance work is completed.",
      },
      {
        title: "Account Responsibility",
        body:
          "You are responsible for accurate information, account security, and activity performed through your account. Do not share passwords or attempt to access another user’s reports, bookings, payments, or administrative functions.",
      },
      {
        title: "Payments and Premium Access",
        body:
          "Prices and payable amounts are calculated by Naksharix servers and payment is processed through Razorpay. Premium access or a confirmed consultation is granted only after server-side payment verification. A checkout success screen alone does not create entitlement.",
      },
      {
        title: "Consultations",
        body:
          "Consultation availability, assigned astrologer, meeting method, and timing depend on approved profiles and available slots. Users and astrologers must communicate respectfully and must not use the service for unlawful, abusive, emergency, or professional-advice substitution purposes.",
      },
      {
        title: "Acceptable Use",
        body:
          "You must not probe or bypass security, automate abusive requests, scrape protected data, impersonate another person, upload unlawful content, misuse payment flows, or interfere with platform operation.",
      },
      {
        title: "No Guaranteed Outcome",
        body:
          "Naksharix does not guarantee marriage, pregnancy, employment, profit, investment return, health recovery, legal success, reconciliation, or any other future result.",
      },
      {
        title: "Intellectual Property",
        body:
          "Naksharix branding, software, page design, report layouts, and original content are protected assets. A purchased report is for the purchaser’s personal use unless written permission states otherwise.",
      },
      {
        title: "Availability and Limitation",
        body:
          "Services may be interrupted by maintenance, provider outages, payment networks, internet failures, or inaccurate user input. To the extent allowed by applicable law, Naksharix is not responsible for decisions made solely from astrology or tarot guidance.",
      },
      {
        title: "Changes and Applicable Law",
        body:
          "These terms may be updated as the product changes. Mandatory consumer rights continue to apply. Questions about these terms can be sent to the support email listed on this page.",
      },
    ],
  },
  disclaimer: {
    eyebrow: "Disclaimer",
    title: "Spiritual and reflective guidance, not professional advice",
    intro:
      "Naksharix tools and consultations are intended for spiritual reflection, cultural interest, and general planning support.",
    badge: "Important",
    icon: AlertTriangle,
    highlights: [
      "No guaranteed prediction or remedy result",
      "Not medical, legal, financial, psychological, or emergency advice",
      "Use qualified professionals for high-impact decisions",
    ],
    sections: [
      {
        title: "Astrology and Tarot Limitations",
        body:
          "Astrology, numerology, tarot, matching, horoscope content, and interpretive reports are belief-based or traditional guidance systems. Outputs may be incomplete, uncertain, or affected by inaccurate birth details and provider limitations.",
      },
      {
        title: "Professional Advice",
        body:
          "Naksharix does not provide medical diagnosis, treatment, legal representation, financial planning, investment advice, psychological treatment, crisis support, or emergency services.",
      },
      {
        title: "Health and Safety",
        body:
          "Do not delay medical care, stop prescribed treatment, or rely on gemstones, mantras, rituals, tarot, or astrology to address a health or safety emergency.",
      },
      {
        title: "Money, Career, and Legal Matters",
        body:
          "Do not trade, invest, borrow, resign, enter a contract, or take legal action solely because of a Naksharix output or consultation.",
      },
      {
        title: "Relationships and Personal Decisions",
        body:
          "Compatibility and marriage tools do not determine consent, safety, character, or relationship success. Personal decisions remain the user’s responsibility.",
      },
      {
        title: "Emergency Help",
        body:
          "For an urgent medical, mental-health, safety, abuse, or legal emergency, contact the appropriate local emergency service or a qualified professional immediately.",
      },
    ],
  },
  refund: {
    eyebrow: "Refund & Cancellation Policy",
    title: "How payment, digital delivery, and consultation concerns are reviewed",
    intro:
      "Naksharix provides digital reports and consultation services. Refund eligibility depends on payment status, service delivery, duplication, technical failure, and applicable consumer rights.",
    badge: "Billing",
    icon: BadgeIndianRupee,
    highlights: [
      "Duplicate and failed-but-charged payments are reviewed",
      "Consumed digital access is generally not reversible",
      "Consultation changes depend on booking status and availability",
    ],
    sections: [
      {
        title: "Duplicate, Failed, or Mismatched Payments",
        body:
          "Contact support if you were charged more than once, charged after a failed flow, or paid but did not receive the associated report unlock or booking confirmation. Provide the Razorpay order or payment reference.",
      },
      {
        title: "Digital Reports",
        body:
          "A verified payment may unlock a digital report immediately in the user account. Once digital content has been successfully unlocked, generated, downloaded, or substantially consumed, it is generally not refundable except for duplicate charging, technical non-delivery, material service failure, or rights required by applicable law.",
      },
      {
        title: "Consultation Cancellation or Reschedule",
        body:
          "Cancellation and reschedule requests are reviewed according to booking status, astrologer availability, payment state, and whether the consultation has started or been completed. Submitting a request does not automatically guarantee a refund or a new slot.",
      },
      {
        title: "Non-Refundable Situations",
        body:
          "A change of mind after successful digital delivery, dissatisfaction with a non-guaranteed prediction, inaccurate user-entered birth details, or a completed consultation does not automatically qualify for a refund.",
      },
      {
        title: "How to Request Review",
        body: `Email ${SUPPORT_EMAIL} with your account email, service type, order or booking reference, payment reference, and a concise description. Never send card numbers, CVV, OTP, UPI PIN, or banking password.`,
      },
      {
        title: "Processing",
        body:
          "Approved refunds are returned through the original payment method where supported. Processing time may depend on Razorpay, the issuing bank, UPI provider, or other payment network.",
      },
    ],
  },
  delivery: {
    eyebrow: "Delivery Policy",
    title: "Digital reports, premium access, and consultation delivery",
    intro:
      "Naksharix currently delivers active paid services digitally. The physical shop remains coming soon and is not part of the active checkout flow.",
    badge: "Delivery",
    icon: PackageCheck,
    highlights: [
      "Premium report access is tied to server-verified payment",
      "Saved reports remain available in the user account",
      "Consultation details appear in the booking dashboard",
    ],
    sections: [
      {
        title: "Digital Report Delivery",
        body:
          "After successful server-side payment verification, eligible premium report content is unlocked for the associated saved report. Availability may be immediate or may require report generation, depending on the product.",
      },
      {
        title: "Saved Report Access",
        body:
          "Authenticated users can access eligible saved reports from their account. Users should keep their account email and sign-in method secure.",
      },
      {
        title: "Consultation Delivery",
        body:
          "A verified paid booking appears in the booking dashboard with its status, selected time, consultation type, and meeting information when assigned. Changes may be communicated through the dashboard and, when configured, email.",
      },
      {
        title: "Email Is Supplementary",
        body:
          "Email delivery may depend on configured email infrastructure and recipient-provider filtering. A missing email does not necessarily mean the report or booking failed; check the Naksharix dashboard first.",
      },
      {
        title: "Physical Shipping",
        body:
          "The Naksharix physical shop is currently parked as coming soon. No active physical-product checkout or shipping commitment is made until the shop is separately launched.",
      },
      {
        title: "Delivery Problems",
        body: `If verified payment is complete but access or booking details are missing, contact ${SUPPORT_EMAIL} with the relevant order, payment, report, or booking reference.`,
      },
    ],
  },
  faq: {
    eyebrow: "Frequently Asked Questions",
    title: "Clear answers about reports, payments, consultations, and privacy",
    intro:
      "These answers describe the current public product. Features labelled coming soon are not part of the active paid service.",
    badge: "Help",
    icon: HelpCircle,
    highlights: [
      "Payments are processed through Razorpay",
      "Premium reports and consultations require verified payment",
      "Shop and AI Astrologer remain parked",
    ],
    sections: [
      {
        title: "Are Naksharix predictions guaranteed?",
        body:
          "No. Astrology, numerology, tarot, matching, and consultation guidance are for reflection and planning support. Naksharix does not guarantee future outcomes.",
      },
      {
        title: "How is a premium Kundli report unlocked?",
        body:
          "The signed-in user opens an eligible saved report, completes Razorpay checkout, and the server verifies the payment. Premium access is granted only after successful verification.",
      },
      {
        title: "How are consultations booked?",
        body:
          "Choose an approved astrologer, consultation type, and available slot, enter the required details, and complete the verified payment flow. Confirmed bookings appear in the booking dashboard.",
      },
      {
        title: "Does Naksharix store card or UPI credentials?",
        body:
          "No. Razorpay handles the payment interface. Naksharix stores only the references and status needed to associate a verified payment with a report or booking.",
      },
      {
        title: "Where are reports and bookings delivered?",
        body:
          "Saved reports are available in the signed-in account. Consultation status, schedule, and meeting information appear in the booking dashboard. Email may be supplementary when configured.",
      },
      {
        title: "Can I request deletion of my information?",
        body:
          "You may contact support to request correction or deletion of eligible account and saved data. Some payment, security, or dispute records may need to be retained for legitimate or legal reasons.",
      },
      {
        title: "Is the AI Astrologer active?",
        body:
          "No. The public AI Astrologer is intentionally parked while reliability work continues. It should not be treated as an active paid feature.",
      },
      {
        title: "Is the shop active?",
        body:
          "No. The physical-product shop remains coming soon. Naksharix does not currently make an active physical-shipping promise through the public shop page.",
      },
      {
        title: "How do I contact support?",
        body: `Email ${SUPPORT_EMAIL} and include the account email and relevant report, booking, order, or payment reference. Never send passwords, OTPs, or complete payment credentials.`,
      },
    ],
  },
};

export function LegalPolicyPage({ page }: { page: PolicyPageKey }) {
  const content = policyPages[page];
  const Icon = content.icon;

  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section first>
        <div className="inner-section nx-glass-card-strong rounded-3xl p-6 text-center md:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#d89a2b]/30 bg-white/50 text-[#c98924] shadow-[0_12px_32px_rgba(0,0,0,0.10)]">
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#c98924]">{content.eyebrow}</p>
          <h1 className="mx-auto mt-3 max-w-4xl font-cinzel text-3xl font-black text-[#17181d] sm:text-5xl">
            {content.title}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#525866]">{content.intro}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-[#d89a2b]/25 bg-[#d89a2b]/10 px-3 py-1 text-xs font-bold text-[#9a6517]">
              {content.badge}
            </span>
            <span className="rounded-full border border-white/60 bg-white/45 px-3 py-1 text-xs font-semibold text-[#525866]">
              Last updated: {LAST_UPDATED}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {content.highlights.map((item) => (
            <div key={item} className="nx-glass-card rounded-2xl p-4 text-sm font-semibold leading-6 text-[#343844]">
              <BookOpenCheck className="mb-3 h-5 w-5 text-[#c98924]" aria-hidden="true" />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5">
          {content.sections.map((section) => (
            <Card key={section.title} className="nx-glass-card rounded-2xl border-white/55">
              <CardContent className="p-6 md:p-7">
                <h2 className="font-cinzel text-xl font-bold text-[#17181d]">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#525866]">{section.body}</p>
                {section.bullets?.length ? (
                  <ul className="mt-4 space-y-2 text-sm leading-7 text-[#525866]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#c98924]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 nx-glass-card-strong rounded-2xl p-6 md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <h2 className="font-cinzel text-xl font-bold text-[#17181d]">Need support or clarification?</h2>
            <p className="mt-2 text-sm leading-7 text-[#525866]">
              Contact Naksharix with the relevant account, report, booking, order, or payment reference. Do not send passwords, OTPs, or complete payment credentials.
            </p>
          </div>
          <Link
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-4 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f2c56b] to-[#c98924] px-5 py-3 text-sm font-bold text-[#17181d] shadow-[0_10px_28px_rgba(201,137,36,0.22)] transition-transform hover:-translate-y-0.5 md:mt-0"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {SUPPORT_EMAIL}
          </Link>
        </div>
      </Section>
    </main>
  );
}

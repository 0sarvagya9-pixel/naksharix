import Link from "next/link";
import { AlertTriangle, FileText, Mail, ShieldCheck } from "lucide-react";

export type CurrentLegalPageKey =
  | "about"
  | "contact"
  | "privacy"
  | "terms"
  | "refund"
  | "disclaimer"
  | "delivery";

type Section = { title: string; body: string; bullets?: string[] };
type PageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  highlights: string[];
  sections: Section[];
};

const supportEmail = "care@naksharix.com";

const pages: Record<CurrentLegalPageKey, PageCopy> = {
  about: {
    eyebrow: "About Naksharix",
    title: "Vedic astrology tools for reflection and planning",
    intro:
      "Naksharix brings Kundli, Panchang, horoscope, numerology, tarot, premium reports, and consultation booking into one digital experience.",
    highlights: ["Vedic calculation-based tools", "Saved digital reports", "English, Hindi, and Hinglish support"],
    sections: [
      { title: "What We Provide", body: "Naksharix provides digital astrology tools, reports, and consultation workflows designed for personal reflection and general guidance." },
      { title: "How We Work", body: "We combine traditional astrology concepts with modern software while avoiding guaranteed outcomes, fear-based claims, and unsupported promises." },
      { title: "Current Product Scope", body: "AI Astrologer and Shop are currently parked as future features. Active services are shown as available inside the product." },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Support for accounts, reports, payments, and consultations",
    intro: `For help, contact ${supportEmail}. Please include the relevant page, report, booking, or payment reference without sharing passwords or full card details.`,
    highlights: ["Account and report support", "Payment and booking assistance", "Privacy requests"],
    sections: [
      { title: "Support Email", body: `Write to ${supportEmail} for account, report, consultation, payment, refund, or privacy questions.` },
      { title: "Sensitive Information", body: "Do not send passwords, one-time codes, bank PINs, CVVs, or full card details. Naksharix does not need these to investigate a support request." },
      { title: "Response Expectations", body: "We review support requests as soon as practical. Complex payment, report, or consultation cases may require verification and additional time." },
    ],
  },
  privacy: {
    eyebrow: "Privacy Policy",
    title: "How Naksharix handles personal information",
    intro: "This policy explains the data used for accounts, astrology calculations, saved reports, consultations, payments, and support.",
    highlights: ["Birth details are used for calculations", "Payment processing is handled by Razorpay", "Users may request correction or deletion"],
    sections: [
      { title: "Information We Collect", body: "Depending on the feature, you may provide your name, email, birth date, birth time, birth place, gender, questions, saved reports, consultation details, and support messages." },
      { title: "How We Use Information", body: "We use information to create accounts, calculate astrology outputs, generate and save reports, manage consultations, verify payments, prevent abuse, and provide support." },
      { title: "Payments", body: "Payments are processed through Razorpay. Naksharix does not store full card numbers, CVVs, bank PINs, or UPI PINs. We may store limited payment identifiers, amount, currency, and status for order verification and support." },
      { title: "Cookies and Sessions", body: "We may use secure cookies and browser storage for authentication, language preferences, and essential product functionality." },
      { title: "Service Providers", body: "Hosting, payment, email, analytics, or calculation providers may process limited data only as needed to deliver their service." },
      { title: "Data Rights", body: `Contact ${supportEmail} to request access, correction, or deletion, subject to legal, security, fraud-prevention, and transaction-record obligations.` },
      { title: "Security", body: "We use reasonable technical and organizational safeguards, but no online service can guarantee absolute security." },
    ],
  },
  terms: {
    eyebrow: "Terms & Conditions",
    title: "Terms for using Naksharix",
    intro: "By using Naksharix, you agree to use its digital astrology tools, reports, payments, and consultation services responsibly.",
    highlights: ["Guidance, not guaranteed outcomes", "Accurate user input is required", "Digital services may have feature-specific terms"],
    sections: [
      { title: "Service Scope", body: "Naksharix offers digital astrology tools, reports, account features, payments, and consultation booking. Features marked Coming Soon are not part of the active paid service." },
      { title: "User Responsibility", body: "You are responsible for providing accurate information, protecting your login credentials, and reviewing details before purchase or booking." },
      { title: "No Guaranteed Results", body: "Astrology, numerology, tarot, remedies, reports, and consultations do not guarantee marriage, career, financial, health, legal, or other outcomes." },
      { title: "Payments and Access", body: "Prices and applicable taxes are shown before payment. Premium digital access or consultation confirmation occurs only after successful server-side payment verification." },
      { title: "Acceptable Use", body: "You must not misuse the service, attempt unauthorized access, interfere with payments, scrape protected content, or use Naksharix for unlawful activity." },
      { title: "Availability", body: "We may maintain, change, suspend, or discontinue features where necessary. We will not represent a parked feature as active." },
      { title: "Limitation", body: "Use Naksharix as a reflection and planning aid. Important decisions should include practical judgment and qualified professional advice where appropriate." },
    ],
  },
  refund: {
    eyebrow: "Refund & Cancellation Policy",
    title: "Refund rules for digital reports and consultations",
    intro: "This policy covers verified duplicate or failed payments, digital premium access, and consultation bookings.",
    highlights: ["Duplicate or failed-payment cases are reviewed", "Digital unlocks are generally final", "Consultation cancellations follow booking status"],
    sections: [
      { title: "Duplicate or Failed Payments", body: `If money is debited but access or booking is not confirmed, contact ${supportEmail} with the payment reference. Verified duplicate or failed-payment cases will be reviewed and resolved.` },
      { title: "Digital Reports", body: "Because premium reports and digital access are delivered immediately after verified payment, completed unlocks are generally non-refundable except where required by law or where Naksharix confirms a technical failure that prevented delivery." },
      { title: "Consultation Cancellation", body: "Cancellation or rescheduling eligibility depends on the booking status, scheduled time, astrologer availability, and any terms shown before payment. Completed or missed consultations are generally non-refundable unless required by law." },
      { title: "Refund Method and Time", body: "Approved refunds are returned through the original payment method. Bank or payment-provider processing time may vary." },
      { title: "How to Request Review", body: `Email ${supportEmail} with your account email, payment or booking reference, date, amount, and a brief explanation. Never send card PINs, CVVs, or one-time passwords.` },
    ],
  },
  disclaimer: {
    eyebrow: "Disclaimer",
    title: "Spiritual guidance is not professional advice",
    intro: "Naksharix astrology, numerology, tarot, reports, remedies, and consultations are intended for reflection and general guidance.",
    highlights: ["No future outcome is guaranteed", "Not medical, legal, financial, or emergency advice", "Users remain responsible for decisions"],
    sections: [
      { title: "Guidance Only", body: "Outputs and consultations are interpretive and may differ between traditions, practitioners, providers, and calculation methods." },
      { title: "Professional Advice", body: "Naksharix is not a substitute for medical, mental-health, legal, financial, tax, or emergency advice. Contact a qualified professional for those matters." },
      { title: "No Guarantees", body: "We do not guarantee a marriage, job, profit, cure, pregnancy, legal result, relationship outcome, or any other future event." },
      { title: "Remedies and Products", body: "Traditional remedies and spiritual products, when offered, are for personal or spiritual use and do not guarantee measurable results." },
      { title: "User Decisions", body: "You remain responsible for your actions, purchases, bookings, and decisions based on any Naksharix content or consultation." },
    ],
  },
  delivery: {
    eyebrow: "Delivery Policy",
    title: "How digital services are delivered",
    intro: "Naksharix currently delivers premium reports and consultation confirmations digitally. The Shop remains Coming Soon.",
    highlights: ["Digital report access", "Account-based saved reports", "No physical shipping for active services"],
    sections: [
      { title: "Premium Reports", body: "After successful payment verification, eligible premium content is unlocked in your Naksharix account. Saved reports can be reopened from the account where supported." },
      { title: "Consultations", body: "Confirmed consultation details, status, and meeting information are shown in the booking dashboard. Email notifications are supplementary and a missing email does not cancel a confirmed dashboard booking." },
      { title: "Delivery Problems", body: `If payment succeeds but digital access or booking confirmation is missing, contact ${supportEmail} with the relevant payment or booking reference.` },
      { title: "Physical Shipping", body: "The Shop is currently parked as Coming Soon. Naksharix is not currently accepting public physical-product orders through the active service." },
    ],
  },
};

export function LegalCurrentPage({ page }: { page: CurrentLegalPageKey }) {
  const content = pages[page];
  const isImportant = page === "refund" || page === "disclaimer";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="nx-glass-card-strong rounded-[28px] p-6 sm:p-10">
        <div className="flex flex-col gap-5">
          <span className="nx-section-kicker">{content.eyebrow}</span>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-white/50 bg-white/45 p-3 text-[#c98924]">
              {isImportant ? <AlertTriangle className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="nx-serif-heading text-3xl font-semibold text-[#17181d] sm:text-5xl">{content.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#525866]">{content.intro}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {content.highlights.map((item) => (
              <div key={item} className="nx-glass-card rounded-2xl px-4 py-3 text-sm font-semibold text-[#343945]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {content.sections.map((section) => (
          <article key={section.title} className="nx-glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#c98924]" />
              <h2 className="text-lg font-bold text-[#17181d]">{section.title}</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-[#525866]">{section.body}</p>
            {section.bullets ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#525866]">
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <section className="nx-glass-card-strong mt-8 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-[#17181d]">Need help or clarification?</p>
          <p className="mt-1 text-sm text-[#525866]">Contact the Naksharix care team and include the relevant account, report, booking, or payment reference.</p>
        </div>
        <Link href={`mailto:${supportEmail}`} className="nx-gold-button inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold">
          <Mail className="h-4 w-4" /> {supportEmail}
        </Link>
      </section>
    </main>
  );
}

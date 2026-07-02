import type { Metadata } from "next";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  ...seo({
    title: "Frequently Asked Questions - Naksharix",
    description: "Find answers to common questions about Naksharix Kundli, Panchang, matching, numerology, reports, and data privacy policies.",
    path: "/faq",
    keywords: ["Naksharix FAQ", "Astrology FAQ", "Kundli Help", "Astrology Questions"]
  }),
  robots: { index: true, follow: true }
};

const faqItems = [
  {
    q: "How are the Kundli and Panchang calculated?",
    a: "Our calculations are powered by a combination of verified high-precision astronomical ephemeris models and traditional Vedic astrology principles (Lahiri Ayanamsa). We do not use simplified approximations, ensuring that planetary degrees, Dasha timelines, and chart maps are precise."
  },
  {
    q: "How are premium PDF reports delivered?",
    a: "Once a premium report request is finalized and payment is confirmed, the request enters our admin queue. The reports are manually reviewed for astronomical correctness and generated into high-quality PDFs. You will receive an email confirmation and the report will be available in your Dashboard's 'Saved Reports' section."
  },
  {
    q: "Is my birth details data private?",
    a: "Yes. Your birth details (date, time, and location) are processed strictly to perform astronomical math. We do not sell your personal data. You can clear your locally saved profiles at any time directly from the chat or dashboard interfaces."
  },
  {
    q: "Are calculations and guidance guaranteed?",
    a: "Vedic astrology offers indicators, trends, and planetary alignment contexts for self-reflection. Naksharix does not make deterministic predictions, fear-based claims, or offer guarantees about marriage, finance, health, or legal outcomes."
  },
  {
    q: "How can I contact care or request refunds?",
    a: "For all support, billing, and policy inquiries, please email care@naksharix.com. We review requests manually and respond within standard support hours."
  }
];

export default function FaqPage() {
  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section first>
        <div className="inner-section rounded-3xl border border-[#263957] p-6 text-center md:p-10 bg-[#0a1224]/85">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#dca956]/35 bg-[#142647] text-[#f3d382] shadow-[0_0_34px_rgba(0,245,160,0.14)]">
            <HelpCircle className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#00f5a0]">Help & Support</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[#cbd5e1]">
            Clear, practical answers about Naksharix calculations, reports, privacy, and policies.
          </p>
        </div>

        <div className="mt-10 grid gap-5">
          {faqItems.map((item) => (
            <Card key={item.q} className="border-[#1e293b] bg-[#0a1224]/82 p-6">
              <CardContent className="p-0">
                <h2 className="font-cinzel text-xl font-bold text-[#f3d382]">{item.q}</h2>
                <p className="mt-3 leading-7 text-[#cbd5e1] text-sm">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { getManualReport } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
import { ProductShareActions } from "@/components/shop/product-share-actions";
import { canonicalSeoOrigin } from "@/lib/seo-origin";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Editorial and referral collaborations | Naksharix",
  description: "Explore voluntary educational collaborations and public links to Naksharix's personalized report details. Send an enquiry through the private support centre.",
  path: "/partnerships"
});

const reportTopics = [
  { slug: "premium-kundli", audience: "Readers interested in understanding their traditional birth chart", hindi: "जन्म कुंडली को समझने में रुचि रखने वाले पाठक" },
  { slug: "couple-kundli", audience: "Consenting adults exploring traditional matching before their wedding", hindi: "विवाह से पहले स्वेच्छा से कुंडली मिलान समझने वाले वयस्क" },
  { slug: "numerology-lo-shu-report", audience: "Readers exploring personal numerology and Lo Shu", hindi: "अंक ज्योतिष और लो शू को समझने वाले पाठक" }
] as const;

export default function PartnershipsPage() {
  const origin = canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL);
  const reports = reportTopics.flatMap(topic => {
    const report = getManualReport(topic.slug);
    const checkout = getManualReportCheckout(topic.slug);
    return report && checkout && Number.isFinite(checkout.amount) && checkout.amount > 0
      ? [{ ...topic, report, checkout }] : [];
  });

  return (
    <main className="min-h-screen bg-[#fffaf2] text-[#432d31]">
      <Section first>
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#793746]">Editorial collaborations</p>
          <h1 className="mt-3 font-cinzel text-3xl font-bold sm:text-4xl">Explore a partnership with Naksharix</h1>
          <p className="mt-4 max-w-3xl leading-7">Wedding publishers, educational creators and astrology learning communities can explore relevant, transparent content collaborations. This is an invitation to discuss a voluntary collaboration, not an affiliate agreement or a paid placement offer.</p>
          <p lang="hi" className="mt-3 max-w-3xl text-sm leading-7">विवाह, कुंडली और अंक ज्योतिष से जुड़ी उपयोगी शैक्षिक सामग्री के लिए सहयोग का प्रस्ताव भेजें। कोई अग्रिम शुल्क, खरीद की बाध्यता या परिणाम की गारंटी नहीं है।</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/support?topic=partnership" className="inline-flex min-h-11 items-center rounded-xl bg-[#793746] px-5 py-3 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#793746]">Send a private collaboration enquiry</Link>
            <Link href="/reports" className="inline-flex min-h-11 items-center rounded-xl border border-[#793746] px-5 py-3 font-semibold text-[#793746]">Browse all reports</Link>
          </div>
          <section aria-labelledby="partner-enquiry-heading" className="mt-8 rounded-2xl border border-[#ddc19b] bg-white p-5 sm:p-7">
            <h2 id="partner-enquiry-heading" className="font-cinzel text-xl font-bold">How to discuss a collaboration</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7">
              <li>Sign in to your own Naksharix account and open the private Support Centre.</li>
              <li>Describe your organization, relevant audience, public channel link and proposed educational format. Do not include anyone else's personal birth details, passwords or payment credentials.</li>
              <li>Submit your enquiry and check the same Support Centre for any staff response. Submission is not approval, a booking, a fee agreement or a commission commitment.</li>
            </ol>
            <p className="mt-3 text-sm leading-6">No purchase is needed to enquire. Do not make commercial commitments or spend money on behalf of Naksharix without a separate agreement.</p>
            <p lang="hi" className="mt-3 text-sm leading-6">अपने अकाउंट में लॉग इन करके Support Centre में प्रस्ताव भेजें और वहीं उत्तर देखें। ईमेल पर निर्भर रहना जरूरी नहीं है।</p>
          </section>
          <section aria-labelledby="partner-report-heading" className="mt-10">
            <h2 id="partner-report-heading" className="font-cinzel text-2xl font-bold">Public report links for interested readers</h2>
            <p className="mt-3 text-sm leading-7">Share only where a reader has a genuine interest and the publisher permits it. Paid report details are separate from free educational tools. The listed price is the current catalogue fee; readers decide for themselves.</p>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {reports.map(({ slug, report, checkout, audience, hindi }) => {
                const path = "/reports/" + slug;
                return (
                  <article key={slug} className="min-w-0 rounded-2xl border border-[#ddc19b] bg-white p-5">
                    <h3 className="font-cinzel text-lg font-bold">{report.name.en}</h3>
                    <p lang="hi" className="mt-2 font-semibold">{report.name.hi}</p>
                    <p className="mt-3 text-sm leading-6">{audience}</p>
                    <p lang="hi" className="mt-2 text-sm leading-6">{hindi}</p>
                    <p className="mt-3 font-bold text-[#762536]">{checkout.price} · one-time report fee</p>
                    <Link href={path} className="mt-3 inline-block font-semibold underline underline-offset-4">View report details</Link>
                    <ProductShareActions name={report.name.en} productUrl={new URL(path, origin).toString()} kind="report" />
                  </article>
                );
              })}
            </div>
          </section>
          <section aria-label="Responsible publishing" className="mt-8 rounded-2xl border border-[#ddc19b] p-5 text-sm leading-7">
            <h2 className="font-cinzel text-lg font-bold">Responsible publishing</h2>
            <p>Disclose any relationship with Naksharix. Never promise guaranteed predictions, claim a medical or financial outcome, pressure a purchase, collect someone else's private details, or send unsolicited bulk promotions. Astrology is interpretive; free tools and choosing not to purchase remain valid options.</p>
            <p className="mt-3"><Link className="underline underline-offset-4" href="/blog/personalized-astrology-report-delivery-guide">Read the report delivery guide</Link> · <Link className="underline underline-offset-4" href="/privacy-policy">Privacy policy</Link> · <Link className="underline underline-offset-4" href="/refund-policy">Refund policy</Link></p>
          </section>
        </div>
      </Section>
    </main>
  );
}

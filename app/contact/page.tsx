import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal-policy-page";
import { seo } from "@/lib/seo";
import { shopProducts } from "@/lib/manual-catalogue";

export const metadata: Metadata = seo({
  title: "Contact Naksharix Support",
  description:
    "Contact Naksharix support for account access, saved reports, Razorpay payments, consultation bookings, privacy requests, and technical help.",
  path: "/contact",
  keywords: ["Naksharix Contact", "Astrology Support", "Kundli Payment Support", "Consultation Support"],
});

export default async function ContactPage({
  searchParams
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const product = shopProducts.find((item) => item.status === "active" && item.slug === topic);
  if (!product) return <LegalPolicyPage page="contact" />;

  const subject = "Naksharix product availability: " + product.name.en;
  const mailto = "mailto:care@naksharix.com?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent("Hello Naksharix,\n\nPlease confirm availability and further details for: " + product.name.en + ".\n\nThank you.");

  return (
    <>
      <LegalPolicyPage page="contact" />
      <section aria-label="Selected product availability enquiry" className="mx-auto w-full max-w-4xl px-4 pb-10 sm:px-6">
        <div className="rounded-2xl border border-amber-500/30 bg-black/15 p-5">
          <h2 className="text-xl font-semibold">Availability enquiry: {product.name.en}</h2>
          <p className="mt-2 text-sm">Product availability, price, authenticity and fulfilment are confirmed by Naksharix support. No checkout occurs on this page.</p>
          <a href={mailto} className="mt-4 inline-flex rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-600">
            Email Naksharix about {product.name.en}
          </a>
        </div>
      </section>
    </>
  );
}

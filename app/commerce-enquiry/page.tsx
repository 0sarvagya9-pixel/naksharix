import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { CommerceEnquiryForm, type EnquiryOption } from "@/components/commerce-enquiry-form";
import { getCurrentUser } from "@/lib/auth/jwt";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { nextTwoYearsPujaCalendar } from "@/lib/puja/observances";
import { pujaTopics } from "@/lib/puja/service-catalogue";
import { seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = seo({
  title: "Product and Puja Availability Enquiry",
  description: "Request private review of a Naksharix catalogue item or upcoming Hindu Puja. Staff confirm prices and actual availability separately; no payment is taken.",
  path: "/commerce-enquiry"
});
export default async function CommerceEnquiryPage({
  searchParams
}: { searchParams: Promise<{ kind?: string; item?: string }> }) {
  const params = await searchParams;
  const kind = params.kind === "PUJA" ? "PUJA" : "SHOP";
  const user = await getCurrentUser();
  const options: EnquiryOption[] = kind === "SHOP" ?
    (await getShopCatalogue()).products
      .filter(p => p.status === "active")
      .map(p => ({ id: p.id, label: p.name.en, note: "Price, image and inventory confirmation pending staff review." })) :
    [
      ...pujaTopics.map(p => ({ id: "ritual:" + p.id, label: p.name + " · " + p.category,
        note: p.description + ". Date and operator availability require review." })),
      ...nextTwoYearsPujaCalendar().events.map(e =>
        ({ id: e.id, label: e.name + " — " + e.date,
          note: "India reference date: " + e.date + ". Local tithi and availability must be confirmed." }))
    ];
  return (
    <main className="star-field min-h-screen">
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-[#FFD700]">Verified operations first</p>
          <h1 className="mt-3 font-cinzel text-3xl font-bold sm:text-4xl">
            {kind === "SHOP" ? "Product availability enquiry" : "Puja date and availability enquiry"}
          </h1>
          <p className="mb-8 mt-4 text-sm leading-7 naksh-muted-text">
            Submit a secure request directly to the Naksharix support desk.
            This is not an order, booked ritual or confirmed quote.
          </p>
          {user ? <CommerceEnquiryForm kind={kind} options={options} initialItem={params.item ?? ""}/> :
            <div className="rounded-2xl border border-[#D4AF37]/30 p-6">
              <p className="mb-4">Sign in to submit and track a private enquiry.</p>
              <Button asChild><Link href={"/auth/login?next=" + encodeURIComponent("/commerce-enquiry?kind=" + kind +
                (params.item ? "&item=" + encodeURIComponent(params.item) : ""))}>Sign in</Link></Button>
            </div>}
        </div>
      </Section>
    </main>
  );
}

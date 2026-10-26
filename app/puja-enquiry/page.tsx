import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { GuidanceIntakeForm } from "@/components/guidance-intake-form";
import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
import { getCurrentUser } from "@/lib/auth/jwt";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = seo({
  title: "Traditional Puja Information & Enquiries",
  description: "Learn about traditional puja practices and submit an enquiry for review. No temple booking or performance is promised.",
  path: "/puja-enquiry"
});

const traditions = [
  {
    name: "Navagraha Shanti",
    description: "A traditional prayer focused on the nine grahas; practices differ by family, temple and community."
  },
  {
    name: "Rudrabhishek",
    description: "A devotional ritual associated with Shiva, often including water offerings, chanting and worship."
  },
  {
    name: "Ganesh Puja",
    description: "A traditional offering of prayer and devotion before beginning a new undertaking."
  },
  {
    name: "Family and Festival Puja",
    description: "Practices shaped by regional customs, family traditions, dates and the guidance of local priests."
  }
];

export default async function PujaEnquiryPage() {
  const user = await getCurrentUser();
  const partners = await prisma.pujaPartner.findMany({
    where: { reviewStatus: "VERIFIED" },
    select: { id: true, name: true, region: true, traditions: true },
    take: 50, orderBy: { createdAt: "asc" }
  }).catch((error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") return [];
    throw error;
  });
  return (
    <main className="star-field">
      <EditorialServiceBanner eyebrow="PUJA & TRADITIONS"
        headline="A space for sacred traditions"
        caption="Explore customary practices and submit a private enquiry. Ceremonies, priest availability and delivery are not automatically guaranteed."
        image="/naksharix/ganesh-hero-light-saffron.jpg" imageAlt="Saffron-toned traditional Ganesh artwork"
        link="/ask-astrologer" linkLabel="Ask a written question" />
      <Section>
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Traditional Practices</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black">Puja Information and Enquiries</h1>
          <p className="mt-4 max-w-3xl naksh-muted-text">
            Explore common traditions and ask our support team for information about the
            type of ceremony you are considering. Traditions, local requirements and
            practical availability must be independently confirmed.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {traditions.map((item) => (
              <article key={item.name} className="rounded-2xl border border-[#D4AF37]/25 bg-[#061D3C]/75 p-5">
                <h2 className="font-cinzel text-xl font-bold">{item.name}</h2>
                <p className="mt-3 text-sm leading-7 naksh-muted-text">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="my-8 rounded-xl border border-amber-500/30 p-5 text-sm leading-7 naksh-muted-text">
            Naksharix has not certified temple partners, pandits, puja dates, prasad delivery
            or fulfillment for this enquiry channel. Submitting does not book a ritual,
            collect payment or guarantee a spiritual, medical or financial outcome.
          </div>
          <div className="mb-8 rounded-xl border border-[#D4AF37]/20 p-5">
            <h2 className="font-cinzel text-xl font-bold">Partner review registry</h2>
            {partners.length ? (
              <ul className="mt-4 space-y-3 text-sm">
                {partners.map((partner) => (
                  <li key={partner.id}>
                    <strong>{partner.name}</strong> — {partner.region}. Topics: {partner.traditions.join(", ")}.
                    Partner review does not confirm available dates or fulfillment.
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm naksh-muted-text">
              No operator-reviewed partners are listed yet. General puja information requests remain available.
            </p>}
          </div>
          {user ? (
            <GuidanceIntakeForm kind="PUJA_ENQUIRY" availablePartners={partners.map((partner) => ({
              id: partner.id, name: partner.name, region: partner.region
            }))} />
          ) : (
            <div className="rounded-xl border border-[#D4AF37]/20 p-6">
              <p className="mb-4 text-sm naksh-muted-text">Sign in to submit and track an enquiry privately.</p>
              <Button asChild><Link href="/auth/login?next=%2Fpuja-enquiry">Sign in to enquire</Link></Button>
            </div>
          )}
        </div>
      </Section>
    </main>
  );
}

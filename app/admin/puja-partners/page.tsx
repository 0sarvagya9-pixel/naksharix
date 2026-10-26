import type { Metadata } from "next";
import { Section } from "@/components/section";
import { AdminPujaPartners } from "@/components/admin-puja-partners";
import { requireAdminRole } from "@/lib/auth/roles";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  ...seo({
    title: "Puja Partner Review | Admin",
    description: "Manage evidence-based partner records and restrict public visibility until reviewed.",
    path: "/admin/puja-partners"
  }),
  robots: { index: false, follow: false }
};

export default async function AdminPujaPartnersPage() {
  await requireAdminRole();
  return <main className="star-field"><Section>
    <div className="max-w-5xl">
      <h1 className="font-cinzel text-3xl font-black">Puja Partner Review</h1>
      <p className="mt-3 text-sm naksh-muted-text">
        No partners are automatically approved. Evidence, authenticity, legal permissions,
        available ceremonies and fulfilment must be checked outside this software.
      </p>
      <AdminPujaPartners />
    </div>
  </Section></main>;
}

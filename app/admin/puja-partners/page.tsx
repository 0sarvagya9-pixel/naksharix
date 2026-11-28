import type { Metadata } from "next";
import { Section } from "@/components/section";
import { AdminPujaPartners } from "@/components/admin-puja-partners";
import { requireAdminRole } from "@/lib/auth/roles";
import { seo } from "@/lib/seo";

export const dynamic = "force-dynamic";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {adminCatalogueCopy} from "@/lib/admin/catalogue-copy";
async function pageCopy(){return adminCatalogueCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));}
export async function generateMetadata():Promise<Metadata>{const copy=await pageCopy();return {...seo({title:copy.partnerTitle+" | Admin",description:copy.partnerIntro,path:"/admin/puja-partners"}),robots:{index:false,follow:false}};}

export default async function AdminPujaPartnersPage() {
  await requireAdminRole();const copy=await pageCopy();
  return <main className="star-field"><Section>
    <div className="max-w-5xl">
      <h1 className="font-cinzel text-3xl font-black">{copy.partnerTitle}</h1>
      <p className="mt-3 text-sm naksh-muted-text">
        {copy.partnerIntro}
      </p>
      <AdminPujaPartners />
    </div>
  </Section></main>;
}

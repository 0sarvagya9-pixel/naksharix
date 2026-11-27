import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/roles";
import Link from "next/link";
import { AdminPujaOfferEditor } from "@/components/admin-puja-offerings";
export const dynamic="force-dynamic";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {adminCatalogueCopy} from "@/lib/admin/catalogue-copy";
async function pageCopy(){return adminCatalogueCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));}
export async function generateMetadata():Promise<Metadata>{return {title:(await pageCopy()).pujaTitle+" | Naksharix Admin",robots:{index:false,follow:false}};}
export default async function AdminPujaOfferPage(){
 await requireAdminRole();const copy=await pageCopy();
 return <main className="min-h-screen bg-[#fffaf4] px-5 py-12 text-[#3c2730]">
  <div className="mx-auto max-w-6xl"><h1 className="font-cinzel text-3xl font-bold">{copy.pujaTitle}</h1>
   <p className="mt-4 max-w-3xl leading-7 text-[#6f545e]">{copy.pujaIntro}</p>
   <Link href="/admin/puja-launch-readiness" className="mt-3 inline-block text-sm font-bold text-[#823246] underline">{copy.readiness}</Link>
   <AdminPujaOfferEditor/>
  </div>
 </main>
}

import type {Metadata} from "next";
import { requireAdminRole } from "@/lib/auth/roles";
import { AdminManualReportPrices } from "@/components/admin-manual-report-prices";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {adminCatalogueCopy} from "@/lib/admin/catalogue-copy";
export async function generateMetadata():Promise<Metadata>{const copy=adminCatalogueCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));return {title:copy.manualTitle+" | Naksharix",robots:{index:false,follow:false}};}
export const dynamic="force-dynamic";
export default async function AdminReportOffersPage(){await requireAdminRole();return <main className="min-h-screen bg-[#fffbf4]"><AdminManualReportPrices/></main>}

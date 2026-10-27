import type {Metadata} from "next";
import { requireAdminRole } from "@/lib/auth/roles";
import { AdminManualReportPrices } from "@/components/admin-manual-report-prices";
export const metadata:Metadata={title:"Report Pricing Admin | Naksharix",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function AdminReportOffersPage(){await requireAdminRole();return <main className="min-h-screen bg-[#fffbf4]"><AdminManualReportPrices/></main>}

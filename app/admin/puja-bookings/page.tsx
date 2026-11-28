import type {Metadata} from "next";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {fulfilmentCopy} from "@/lib/admin/fulfilment-copy";
import { requireAdminRole } from "@/lib/auth/roles";
import { AdminPujaBookings } from "@/components/admin-puja-bookings";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const copy=fulfilmentCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));return {title:copy.pujaTitle+" | Naksharix",robots:{index:false,follow:false}};}
export default async function AdminPujaBookingsPage(){await requireAdminRole();return <main className="min-h-screen bg-[#fffbf4]"><AdminPujaBookings/></main>}

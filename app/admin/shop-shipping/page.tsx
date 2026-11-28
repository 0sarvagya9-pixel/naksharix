import type {Metadata} from "next";
import {cookies} from "next/headers";
import {requireAdminRole} from "@/lib/auth/roles";
import {normalizeLocale} from "@/lib/i18n";
import {shopAdminCopy} from "@/lib/shop/admin-copy";
import {AdminShippingRates} from "@/components/shop/admin-shipping-rates";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const copy=shopAdminCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));return {title:copy.shippingTitle+" | Naksharix",robots:{index:false,follow:false}};}
export default async function Page(){await requireAdminRole();return <AdminShippingRates/>;}

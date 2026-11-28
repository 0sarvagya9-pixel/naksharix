import type {Metadata} from "next";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {fulfilmentCopy} from "@/lib/admin/fulfilment-copy";
import { requireAdminRole } from "@/lib/auth/roles";
import { AdminShopOrders } from "@/components/admin-shop-orders";
export async function generateMetadata():Promise<Metadata>{const copy=fulfilmentCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));return {title:copy.shopTitle+" | Naksharix",robots:{index:false,follow:false}};}
export const dynamic="force-dynamic";
export default async function ShopOrdersAdminPage(){await requireAdminRole();return <main className="min-h-screen bg-[#fffbf5]"><AdminShopOrders/></main>}

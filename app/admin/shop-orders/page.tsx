import type {Metadata} from "next";
import { requireAdminRole } from "@/lib/auth/roles";
import { AdminShopOrders } from "@/components/admin-shop-orders";
export const metadata:Metadata={title:"Manage Shop Orders | Naksharix",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function ShopOrdersAdminPage(){await requireAdminRole();return <main className="min-h-screen bg-[#fffbf5]"><AdminShopOrders/></main>}

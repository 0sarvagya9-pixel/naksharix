import type { Metadata } from "next";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { CartPageClient } from "@/components/shop/cart-page-client";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Shopping Cart | Naksharix",robots:{index:false,follow:false}};
export default async function CartPage(){const s=await getShopCatalogue();return <main className="min-h-screen bg-[#fffbf6] text-[#372630]"><CartPageClient products={s.products}/></main>}

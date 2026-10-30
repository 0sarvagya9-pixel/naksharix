import type { Metadata } from "next";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { CartPageClient } from "@/components/shop/cart-page-client";
import { getCurrentUser } from "@/lib/auth/jwt";
import { env } from "@/lib/env";
import { getRazorpayReadiness } from "@/lib/payments/readiness";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Shopping Cart | Naksharix",robots:{index:false,follow:false}};
export default async function CartPage(){
 const [catalogue,user]=await Promise.all([getShopCatalogue(),getCurrentUser()]);
 const checkoutAvailable=env.SHOP_PAYMENTS_ENABLED==="true"&&getRazorpayReadiness().enabled;
 return <main className="min-h-screen bg-[#fffbf6] text-[#372630]">
  <CartPageClient products={catalogue.products} signedIn={Boolean(user)} checkoutAvailable={checkoutAvailable}/>
 </main>;
}

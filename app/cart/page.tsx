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
 const checkoutAvailable=catalogue.storageReady&&env.SHOP_PAYMENTS_ENABLED==="true"&&getRazorpayReadiness().enabled;
 return <main className="min-h-screen bg-[#fffbf6] text-[#372630]">
  {catalogue.storageReady ? <CartPageClient products={catalogue.products} signedIn={Boolean(user)} checkoutAvailable={checkoutAvailable}/> :
   <section role="alert" className="mx-auto max-w-3xl px-5 py-20">
     <h1 className="font-cinzel text-3xl font-bold">Checkout temporarily unavailable</h1>
     <p className="mt-4 leading-7">The catalogue database cannot verify your current prices. No payment is being requested. Your saved browser cart will be available when the service returns.</p>
     <a href="/cart" className="mt-6 inline-block rounded-lg bg-[#8b3343] px-5 py-3 font-bold text-white">Retry Cart</a>
   </section>}
 </main>;
}

import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/roles";
import { AdminPujaOfferEditor } from "@/components/admin-puja-offerings";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Puja Pricing and Availability | Naksharix Admin",robots:{index:false,follow:false}};
export default async function AdminPujaOfferPage(){
 await requireAdminRole();
 return <main className="min-h-screen bg-[#fffaf4] px-5 py-12 text-[#3c2730]">
  <div className="mx-auto max-w-6xl"><h1 className="font-cinzel text-3xl font-bold">Puja rates and availability</h1>
   <p className="mt-4 max-w-3xl leading-7 text-[#6f545e]">Set genuine rates for any of the 94 Puja topics. No default rates are invented. Publishing does not create booked dates, temple reservations, payment links or guaranteed completion.</p>
   <AdminPujaOfferEditor/>
  </div>
 </main>
}

import type {Metadata} from "next";
import {requireAdminRole} from "@/lib/auth/roles";
import {AdminShippingRates} from "@/components/shop/admin-shipping-rates";
export const metadata:Metadata={title:"International Shipping Rates | Naksharix",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function ShopShippingPage(){await requireAdminRole();return <AdminShippingRates/>}

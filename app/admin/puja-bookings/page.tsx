import type {Metadata} from "next";
import { requireAdminRole } from "@/lib/auth/roles";
import { AdminPujaBookings } from "@/components/admin-puja-bookings";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Puja Booking Management | Naksharix",robots:{index:false,follow:false}};
export default async function AdminPujaBookingsPage(){await requireAdminRole();return <main className="min-h-screen bg-[#fffbf4]"><AdminPujaBookings/></main>}

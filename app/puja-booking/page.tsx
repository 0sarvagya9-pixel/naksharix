import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Puja Booking Coming Soon | Naksharix",
  robots: { index: false, follow: true }
};
export default function PujaBookingPage() {
  redirect("/pujas");
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Puja Services Coming Soon | Naksharix",
  robots: { index: false, follow: true }
};
export default function PujaEnquiryPage() {
  redirect("/pujas");
}

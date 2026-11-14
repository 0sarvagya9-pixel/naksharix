import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pujaTopics } from "@/lib/puja/service-catalogue";

export const metadata: Metadata = {
  title: "Puja Services Coming Soon | Naksharix",
  robots: { index: false, follow: true }
};
export const dynamic = "force-dynamic";
export const dynamicParams = false;
export function generateStaticParams() {
  return pujaTopics.map(p => ({ id: p.id }));
}
// Previously indexed Puja details must never expose an old Book Now button.
export default function PujaTopicPage() {
  redirect("/pujas");
}

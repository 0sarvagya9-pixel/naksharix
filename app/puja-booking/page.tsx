import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPujaRequestState as getPujaLaunchState } from "@/lib/puja/request-readiness";
import { findPujaTopic, findKumbhEvent } from "@/lib/puja/service-catalogue";
import { PujaRequestClient } from "@/components/puja/booking-request-client";
import { getCurrentUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Request a Puja Date | Naksharix",
  robots: { index: false, follow: true }
};
export default async function PujaBookingPage({
  searchParams
}: {searchParams:Promise<{item?:string}>}) {
  const {item}=await searchParams;
  const release=await getPujaLaunchState();
  if (!item || !release.enabled || !release.offers[item]) redirect("/pujas");
  const topic=findPujaTopic(item);
  if (!topic) redirect("/pujas");
  const user=await getCurrentUser();
  return <PujaRequestClient topicId={topic.id} name={topic.name}
    pricePaise={release.offers[item].pricePaise} signedIn={Boolean(user)} event={findKumbhEvent(item)} />;
}

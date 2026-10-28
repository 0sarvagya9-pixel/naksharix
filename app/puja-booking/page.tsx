import type {Metadata} from "next";
import Link from "next/link";
import { findPujaTopic } from "@/lib/puja/service-catalogue";
import { getPublishedPujaOffers } from "@/lib/puja/offerings";
import { PujaRequestClient } from "@/components/puja/booking-request-client";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Book Puja | Naksharix",robots:{index:false,follow:false}};
export default async function PujaBookingPage({searchParams}:{searchParams:Promise<{item?:string}>}){
 const {item}=await searchParams;
 const topic=item?findPujaTopic(item):undefined;
 const price=item?(await getPublishedPujaOffers())[item]:undefined;
 if(!topic||!price)return <main className="mx-auto max-w-4xl px-5 py-16"><h1 className="font-cinzel text-3xl">Puja offer not currently bookable</h1>
  <p className="mt-4">Browse the Puja directory and submit an enquiry for availability.</p>
  <Link href="/pujas" className="mt-4 inline-block font-bold text-[#82304b] underline">Explore Pujas</Link></main>;
 return <main className="min-h-screen bg-[#fffbf5]"><PujaRequestClient topicId={topic.id} name={topic.name} pricePaise={price.pricePaise}/></main>;
}

import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { PujaServicesDirectory } from "@/components/puja/puja-services-directory";
import { getPublishedPujaOffers } from "@/lib/puja/offerings";

export const metadata:Metadata=seo({
  title:"Traditional Puja Directory | Shiva, Devi, Navagraha and Festivals",
  description:"Explore traditional Hindu Puja types by deity, festival and occasion. Request a private review; priest availability and muhurat must be confirmed.",
  path:"/pujas", keywords:["Hindu Puja","Puja Directory","Rudrabhishek","Navagraha Shanti","Lakshmi Puja"]
});
export const dynamic="force-dynamic";
export default async function PujasPage(){const offerings=await getPublishedPujaOffers();return <PujaServicesDirectory offerings={offerings}/>;}

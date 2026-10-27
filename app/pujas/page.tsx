import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { PujaServicesDirectory } from "@/components/puja/puja-services-directory";

export const metadata:Metadata=seo({
  title:"Traditional Puja Directory | Shiva, Devi, Navagraha and Festivals",
  description:"Explore traditional Hindu Puja types by deity, festival and occasion. Request a private review; priest availability and muhurat must be confirmed.",
  path:"/pujas", keywords:["Hindu Puja","Puja Directory","Rudrabhishek","Navagraha Shanti","Lakshmi Puja"]
});
export default function PujasPage(){return <PujaServicesDirectory/>;}

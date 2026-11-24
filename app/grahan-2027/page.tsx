import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { SeasonalGuide } from "@/components/seo/seasonal-guides";
export const dynamic = "force-dynamic";
export const metadata: Metadata = seo({title:"Grahan 2027: Solar & Lunar Eclipses in India",description:"India-visible 2027 Surya Grahan and Chandra Grahan dates, local visibility, Sutak context and safe solar viewing.",path:"/grahan-2027"});
export default function SeasonalPage(){return <SeasonalGuide guide="eclipses" locale="en" />;}

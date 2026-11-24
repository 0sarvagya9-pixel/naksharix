import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { SeasonalGuide } from "@/components/seo/seasonal-guides";
export const dynamic = "force-dynamic";
export const metadata: Metadata = seo({title:"Hindu Festival Calendar & Vrat Dates",description:"Reviewed upcoming Hindu festival dates, Ekadashi, Purnima, Amavasya, local Panchang and calendar references.",path:"/festival-calendar"});
export default function SeasonalPage(){return <SeasonalGuide guide="festivals" locale="en" />;}

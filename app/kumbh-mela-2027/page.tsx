import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { SeasonalGuide } from "@/components/seo/seasonal-guides";
export const dynamic = "force-dynamic";
export const metadata: Metadata = seo({title:"Nashik Kumbh Mela 2027 Dates & Amrut Snan",description:"Official-source Simhastha dates, Amrut Snan calendar and visitor planning for Nashik and Trimbakeshwar.",path:"/kumbh-mela-2027"});
export default function SeasonalPage(){return <SeasonalGuide guide="kumbh" locale="en" />;}

import type {Metadata} from "next";
import {seo} from "@/lib/seo";
import {getAnnualSnapshots} from "@/lib/horoscope/annual";
import {AnnualGuideView} from "@/components/horoscope/annual-guide-view";
export const metadata:Metadata=seo({title:"2027 Yearly Horoscope & Rashi Guide",description:"Explore twelve monthly Jupiter and Saturn reference positions for 2027, with traditional rashi-relative themes and calculation limitations.",path:"/yearly-horoscope-2027"});
export default function Annual2027Page(){return <AnnualGuideView year={2027} snapshots={getAnnualSnapshots(2027)} locale="en"/>;}

import type {Metadata} from "next";
import {seo} from "@/lib/seo";
import {getAnnualSnapshots} from "@/lib/horoscope/annual";
import {AnnualGuideView} from "@/components/horoscope/annual-guide-view";
export const metadata:Metadata=seo({title:"2027 वार्षिक राशिफल और गोचर संदर्भ",description:"2027 में हर महीने गुरु और शनि की गणना, राशि के अनुसार पारंपरिक भाव और स्पष्ट सीमाएँ।",path:"/hi/yearly-horoscope-2027"});
export default function Annual2027Page(){return <AnnualGuideView year={2027} snapshots={getAnnualSnapshots(2027)} locale="hi"/>;}

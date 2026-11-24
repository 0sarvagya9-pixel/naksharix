import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { SeasonalGuide } from "@/components/seo/seasonal-guides";
export const dynamic = "force-dynamic";
export const metadata: Metadata = seo({title:"ग्रहण 2027: भारत में सूर्य और चंद्र ग्रहण",description:"2027 में भारत से दिखाई देने वाले सूर्य और चंद्र ग्रहण की तिथियाँ, सूतक संदर्भ और सुरक्षित दर्शन।",path:"/hi/grahan-2027"});
export default function SeasonalPage(){return <SeasonalGuide guide="eclipses" locale="hi" />;}

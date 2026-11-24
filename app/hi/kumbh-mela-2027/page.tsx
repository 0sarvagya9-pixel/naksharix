import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { SeasonalGuide } from "@/components/seo/seasonal-guides";
export const dynamic = "force-dynamic";
export const metadata: Metadata = seo({title:"नाशिक कुंभ मेला 2027: अमृत स्नान तिथियाँ",description:"नाशिक और त्र्यंबकेश्वर सिंहस्थ कुंभ की प्रमुख स्नान तिथियाँ और आधिकारिक स्रोत।",path:"/hi/kumbh-mela-2027"});
export default function SeasonalPage(){return <SeasonalGuide guide="kumbh" locale="hi" />;}

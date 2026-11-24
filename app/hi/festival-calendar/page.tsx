import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { SeasonalGuide } from "@/components/seo/seasonal-guides";
export const dynamic = "force-dynamic";
export const metadata: Metadata = seo({title:"हिंदू त्योहार कैलेंडर और आगामी व्रत तिथियाँ",description:"आगामी हिंदू पर्व, एकादशी, पूर्णिमा, अमावस्या और व्रत की संदर्भ तिथियाँ। स्थानीय पंचांग देखें।",path:"/hi/festival-calendar"});
export default function SeasonalPage(){return <SeasonalGuide guide="festivals" locale="hi" />;}

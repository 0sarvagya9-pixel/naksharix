import type { Metadata } from "next";
import { FocusedCalculatorContent } from "@/components/focused-calculator-content";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({ title: "Free Manglik Calculator | Manglik Dosha Check | Naksharix", description: "Check Manglik indication from complete birth details with calm relationship guidance.", path: "/free-calculators/manglik-calculator" });
export default function Page() { return <FocusedCalculatorContent kind="manglik" />; }

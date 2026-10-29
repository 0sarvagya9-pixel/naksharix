import type { Metadata } from "next";
import { KundliEducationPage } from "@/components/seo/kundli-education-page";
import { kundliEducation, kundliGuidePath } from "@/lib/kundli-education";
import { seo } from "@/lib/seo";
export const metadata: Metadata = seo({
  title: kundliEducation.en.title,
  description: kundliEducation.en.description,
  path: kundliGuidePath("en"),
  keywords: ["Kundli meaning", "Vedic birth chart", "Lagna", "Rashi", "Nakshatra", "Dasha"]
});
export default function EnglishKundliGuide() { return <KundliEducationPage locale="en" />; }

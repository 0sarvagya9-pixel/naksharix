import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KundliEducationPage } from "@/components/seo/kundli-education-page";
import { kundliEducation, kundliGuideLanguages, kundliGuidePath, type KundliGuideLanguage } from "@/lib/kundli-education";
import { seo } from "@/lib/seo";

type Params = { params: Promise<{ language: string }> };
function recognizedLanguage(language: string): language is KundliGuideLanguage {
  return language !== "en" && kundliGuideLanguages.some((code) => code === language);
}
export function generateStaticParams() {
  return kundliGuideLanguages.filter((language) => language !== "en").map((language) => ({ language }));
}
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { language } = await params;
  if (!recognizedLanguage(language)) return { robots: { index: false, follow: false } };
  const page = kundliEducation[language];
  return seo({ title: page.title, description: page.description, path: kundliGuidePath(language) });
}
export default async function NativeKundliGuide({ params }: Params) {
  const { language } = await params;
  if (!recognizedLanguage(language)) notFound();
  return <KundliEducationPage locale={language} />;
}

import type { Metadata } from "next";
import { HoroscopePageShell } from "@/components/horoscope/horoscope-page-shell";
import { horoscopePageConfig } from "@/lib/horoscope/constants";
import { seo } from "@/lib/seo";

const page = horoscopePageConfig["numerology-monthly"];
export const metadata: Metadata = seo({ title: page.metadata.title, description: page.metadata.description, path: page.path, keywords: page.metadata.keywords });
export default function NumerologyMonthlyHoroscopePage() { return <HoroscopePageShell kind="numerology-monthly" />; }

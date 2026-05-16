import type { Metadata } from "next";
import { SeoGrowthPage } from "@/components/seo-growth-page";
import { growthPages } from "@/lib/growth-pages";
import { seo } from "@/lib/seo";

const page = growthPages["kundli-matching"];
export const metadata: Metadata = seo({ title: page.title, description: page.description, path: page.path, keywords: ["Kundli Matching", "Guna Milan"] });
export default function KundliMatchingSeoPage() { return <SeoGrowthPage page={page} />; }

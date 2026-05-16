import type { Metadata } from "next";
import { SeoGrowthPage } from "@/components/seo-growth-page";
import { growthPages } from "@/lib/growth-pages";
import { seo } from "@/lib/seo";

const page = growthPages["career-astrology"];
export const metadata: Metadata = seo({ title: page.title, description: page.description, path: page.path, keywords: ["Career Astrology"] });
export default function CareerAstrologySeoPage() { return <SeoGrowthPage page={page} />; }

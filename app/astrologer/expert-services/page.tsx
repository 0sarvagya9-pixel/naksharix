import type {Metadata} from "next";
import {cookies} from "next/headers";
import {requireRole} from "@/lib/auth/roles";
import {Section} from "@/components/section";
import {ExpertProviderWorkspace} from "@/components/expert-provider-workspace";
import {normalizeLocale} from "@/lib/i18n";
import {expertOperationsCopy} from "@/lib/expert-services/operations-copy";
export const dynamic="force-dynamic";
async function copy(){return expertOperationsCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));}
export async function generateMetadata():Promise<Metadata>{const c=await copy();return {title:c.providerTitle+" | Naksharix",robots:{index:false,follow:false}};}
export default async function Page(){await requireRole(["ASTROLOGER"]);const c=await copy();return <Section><h1 className="mb-5 font-cinzel text-3xl font-bold">{c.providerTitle}</h1><p className="mb-6">{c.providerIntro}</p><ExpertProviderWorkspace/></Section>;}

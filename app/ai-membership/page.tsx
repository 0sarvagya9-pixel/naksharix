import type {Metadata} from "next";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {AiMembershipWorkspace} from "@/components/ai-membership-workspace";
import {normalizeLocale} from "@/lib/i18n";
import {aiCustomerCopy} from "@/lib/ai/customer-copy";
export const dynamic="force-dynamic";
async function labels(){return aiCustomerCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));}
export async function generateMetadata():Promise<Metadata>{const copy=await labels();return {title:copy.pageTitle+" | Naksharix",robots:{index:false,follow:false}};}
export default async function Page(){if(!await getCurrentUser())redirect("/login?redirectTo=%2Fai-membership");const copy=await labels();return <Section className="max-w-5xl"><div className="rounded-3xl bg-[#fff8ee] p-5 sm:p-8 text-[#35242b]"><h1 className="font-cinzel text-3xl font-black text-[#70283d]">{copy.pageTitle}</h1><p className="my-5">{copy.introduction}</p><AiMembershipWorkspace/></div></Section>;}

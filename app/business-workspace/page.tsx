import type {Metadata} from "next";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {BusinessWorkspace,BusinessWorkspaceHeading} from "@/components/business-workspace";
import {normalizeLocale} from "@/lib/i18n";
import {businessWorkspaceCopy} from "@/lib/business-integrations/workspace-copy";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const locale=normalizeLocale((await cookies()).get("naksharix-language")?.value);return {title:businessWorkspaceCopy[locale].pageTitle+" | Naksharix",robots:{index:false,follow:false}};}
export default async function Page(){if(!await getCurrentUser())redirect("/login?redirectTo=%2Fbusiness-workspace");return <Section className="max-w-6xl"><div className="rounded-3xl bg-[#fff8ee] text-[#35242b] p-6 sm:p-8"><BusinessWorkspaceHeading/><BusinessWorkspace/></div></Section>}

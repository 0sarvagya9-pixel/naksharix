import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {BusinessWorkspace} from "@/components/business-workspace";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Business Integrations | Naksharix",robots:{index:false,follow:false}};
export default async function Page(){if(!await getCurrentUser())redirect("/login?redirectTo=%2Fbusiness-workspace");return <Section className="max-w-6xl"><div className="rounded-3xl bg-[#fff8ee] text-[#35242b] p-6 sm:p-8"><h1 className="font-cinzel text-3xl font-black text-[#70283d]">Business Integration Workspace</h1><p className="my-5">Manage approved tenant contracts, scoped keys and actual usage. No self-service purchase or automatically billed subscription is active.</p><BusinessWorkspace/></div></Section>}

import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {AiMembershipWorkspace} from "@/components/ai-membership-workspace";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Private AI Membership | Naksharix",robots:{index:false,follow:false}};
export default async function Page(){if(!await getCurrentUser())redirect("/login?redirectTo=%2Fai-membership");return <Section className="max-w-5xl"><div className="rounded-3xl bg-[#fff8ee] p-5 sm:p-8 text-[#35242b]"><h1 className="font-cinzel text-3xl font-black text-[#70283d]">AI Membership and Renewals</h1><p className="my-5">Manage genuine recurring billing and time-limited response credits. Authorization is not paid access; verified captured cycles grant credits.</p><AiMembershipWorkspace/></div></Section>}

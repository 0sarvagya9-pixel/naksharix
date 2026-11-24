import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {ExpertCustomerWorkspace} from "@/components/expert-customer-workspace";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Private Expert Services | Naksharix",robots:{index:false,follow:false}};
export default async function Page(){if(!await getCurrentUser())redirect("/login?redirectTo=%2Fexpert-services");return <Section className="max-w-5xl"><div className="rounded-3xl bg-[#fff8ee] text-[#35242b] p-5 sm:p-8"><ExpertCustomerWorkspace/></div></Section>}

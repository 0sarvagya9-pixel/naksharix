import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {DigitalPackageWorkspace} from "@/components/digital-package-workspace";
export const dynamic="force-dynamic";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {packageCustomerCopy} from "@/lib/digital-packages/customer-copy";
export async function generateMetadata():Promise<Metadata>{const copy=packageCustomerCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));return {title:copy.pageTitle+" | Naksharix",robots:{index:false,follow:false}};}
export default async function DigitalPackagesPage(){
 const user=await getCurrentUser();if(!user)redirect("/login?redirectTo=%2Fdigital-packages");
 const copy=packageCustomerCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));
 return <Section className="max-w-6xl"><div className="rounded-3xl bg-[#fff8ee] p-5 text-[#35242b] sm:p-8"><h1 className="font-cinzel text-3xl font-black text-[#70283d] sm:text-4xl">{copy.pageTitle}</h1><p className="mt-3 mb-6 max-w-3xl leading-7">{copy.introduction}</p><DigitalPackageWorkspace/></div></Section>;
}

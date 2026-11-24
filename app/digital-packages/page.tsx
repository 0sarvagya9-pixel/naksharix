import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {DigitalPackageWorkspace} from "@/components/digital-package-workspace";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Digital Packages | Naksharix",robots:{index:false,follow:false}};
export default async function DigitalPackagesPage(){
 const user=await getCurrentUser();if(!user)redirect("/login?redirectTo=%2Fdigital-packages");
 return <Section className="max-w-6xl"><div className="rounded-3xl bg-[#fff8ee] p-5 text-[#35242b] sm:p-8"><h1 className="font-cinzel text-3xl font-black text-[#70283d] sm:text-4xl">Your Digital Packages</h1><p className="mt-3 mb-6 max-w-3xl leading-7">Private personalized report bundles and original learning material. Review exact contents and verified prices before payment. Generate each purchased document separately. Traditional guidance is not a guaranteed prediction.</p><DigitalPackageWorkspace/></div></Section>;
}

import { redirect } from "next/navigation";
import type {Metadata} from "next";
export const metadata:Metadata={title:"Complete sign in",robots:{index:false,follow:false},referrer:"no-referrer"};
import { getCurrentUser } from "@/lib/auth/jwt";
import { safeInternalAuthPath } from "@/lib/auth/safe-redirect";
import { ProfessionalApplicationConfirmation } from "@/components/auth/professional-application-confirmation";
import { Section } from "@/components/section";
type SearchParams=Promise<{role?:string|string[];redirectTo?:string|string[]}>;
export default async function GoogleCompletePage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;
 const current=await getCurrentUser();
 if(!current)redirect("/login");
 const resume=safeInternalAuthPath(params.redirectTo);
 if(current.role==="ASTROLOGER"||current.role==="CONSULTANT")redirect(resume||"/astrologer/dashboard");
 // A GET is strictly read-only. The professional role is changed only by an
 // authenticated CSRF-protected POST following an explicit confirmation.
 if(current.role==="USER"&&!current.isAdminLogin&&(params.role==="ASTROLOGER"||params.role==="CONSULTANT")){
   return <Section className="max-w-lg"><ProfessionalApplicationConfirmation role={params.role} resume={resume}/></Section>;
 }
 redirect(resume||"/dashboard");
}

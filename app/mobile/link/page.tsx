import {redirect} from "next/navigation";
import type {Metadata} from "next";
import {cookies} from "next/headers";
import {normalizeLocale} from "@/lib/i18n";
import {deviceCopy} from "@/lib/account/device-copy";
import {getCurrentUser} from "@/lib/auth/jwt";
import {MobileAccountLinkApproval} from "@/components/mobile-account-link-approval";
export const dynamic="force-dynamic";
async function labels(){return deviceCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));}
export async function generateMetadata():Promise<Metadata>{const copy=await labels();return {title:copy.mobileTitle+" | Naksharix",robots:{index:false,follow:false},referrer:"no-referrer"};}
export default async function MobileLinkPage({searchParams}:{
  searchParams:Promise<{ticket?:string}>
}){
  const copy=await labels(),{ticket}=await searchParams;
  if(!ticket||!/^[A-Za-z0-9_-]{43}$/.test(ticket))
    return <main className="mx-auto max-w-lg p-8"><h1>{copy.mobileInvalid}</h1>
      <p>{copy.mobileRestart}</p></main>;
  const user=await getCurrentUser();
  if(!user){
    const next="/mobile/link?ticket="+encodeURIComponent(ticket);
    redirect("/login?redirectTo="+encodeURIComponent(next));
  }
  return <main className="mx-auto max-w-xl px-5 py-12">
    <MobileAccountLinkApproval ticket={ticket} accountName={user.name}/>
  </main>;
}

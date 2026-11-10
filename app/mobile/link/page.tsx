import {redirect} from "next/navigation";
import type {Metadata} from "next";
import {getCurrentUser} from "@/lib/auth/jwt";
import {MobileAccountLinkApproval} from "@/components/mobile-account-link-approval";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Connect Naksharix Android App",
  robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function MobileLinkPage({searchParams}:{
  searchParams:Promise<{ticket?:string}>
}){
  const {ticket}=await searchParams;
  if(!ticket||!/^[A-Za-z0-9_-]{43}$/.test(ticket))
    return <main className="mx-auto max-w-lg p-8"><h1>Invalid app connection</h1>
      <p>Start connecting again from your Naksharix Android app.</p></main>;
  const user=await getCurrentUser();
  if(!user){
    const next="/mobile/link?ticket="+encodeURIComponent(ticket);
    redirect("/login?redirectTo="+encodeURIComponent(next));
  }
  return <main className="mx-auto max-w-xl px-5 py-12">
    <MobileAccountLinkApproval ticket={ticket} accountName={user.name}/>
  </main>;
}

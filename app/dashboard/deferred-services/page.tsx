import { notFound, redirect } from "next/navigation";
import type {Metadata} from "next";
import {cookies} from "next/headers";
import { getCurrentUser } from "@/lib/auth/jwt";
import { DeferredServiceRequestForm } from "@/components/deferred-service-request-form";
import { DeferredServiceAllocations } from "@/components/deferred-service-allocations";
import {normalizeLocale} from "@/lib/i18n";
import {deferredCopy} from "@/lib/deferred-services/copy";
export const dynamic="force-dynamic";
async function locale(){return normalizeLocale((await cookies()).get("naksharix-language")?.value);}
export async function generateMetadata():Promise<Metadata>{const c=deferredCopy(await locale());return {title:c.pageTitle+" | Naksharix",robots:{index:false,follow:false}};}
export default async function Page(){
  if(process.env.DEFERRED_SERVICE_REQUESTS_ENABLED!=="true")notFound();
  const user=await getCurrentUser();
  if(!user||user.role!=="USER"||user.isAdminLogin)redirect("/dashboard");
  const c=deferredCopy(await locale());
  return <main className="mx-auto max-w-2xl p-6"><h1 className="text-2xl font-semibold">{c.pageTitle}</h1><p className="my-4">{c.intro}</p><DeferredServiceRequestForm/>{process.env.DEFERRED_SERVICE_OPERATIONS_ENABLED==='true'?<DeferredServiceAllocations/>:null}</main>;
}

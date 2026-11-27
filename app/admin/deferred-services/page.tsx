import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {cookies} from "next/headers";
import {requireAdminRole} from "@/lib/auth/roles";
import {DeferredServicePlanning} from "@/components/admin/deferred-service-planning";
import {normalizeLocale} from "@/lib/i18n";
import {deferredCopy} from "@/lib/deferred-services/copy";
export const dynamic="force-dynamic";
async function locale(){return normalizeLocale((await cookies()).get("naksharix-language")?.value);}
export async function generateMetadata():Promise<Metadata>{const c=deferredCopy(await locale());return {title:c.adminTitle+" | Naksharix",robots:{index:false,follow:false}};}
export default async function Page(){await requireAdminRole();if(process.env.DEFERRED_SERVICE_OPERATIONS_ENABLED!=="true")notFound();const c=deferredCopy(await locale());return <main className="mx-auto max-w-5xl space-y-4 p-5"><h1 className="text-3xl font-bold">{c.adminTitle}</h1><DeferredServicePlanning/></main>}

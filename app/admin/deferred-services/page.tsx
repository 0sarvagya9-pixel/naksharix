import {notFound} from "next/navigation";
import {requireAdminRole} from "@/lib/auth/roles";
import {DeferredServicePlanning} from "@/components/admin/deferred-service-planning";
export const dynamic="force-dynamic";
export const metadata={title:"Private service planning | Naksharix",robots:{index:false,follow:false}};
export default async function Page(){await requireAdminRole();if(process.env.DEFERRED_SERVICE_OPERATIONS_ENABLED!=="true")notFound();return <main className="mx-auto max-w-5xl space-y-4 p-5"><h1 className="text-3xl font-bold">Deferred service planning</h1><DeferredServicePlanning/></main>}

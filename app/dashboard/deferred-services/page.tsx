import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";
import { DeferredServiceRequestForm } from "@/components/deferred-service-request-form";
import { DeferredServiceAllocations } from "@/components/deferred-service-allocations";
export const dynamic="force-dynamic";
export const metadata={title:"Private service review | Naksharix",robots:{index:false,follow:false}};
export default async function Page(){
  if(process.env.DEFERRED_SERVICE_REQUESTS_ENABLED!=="true")notFound();
  const user=await getCurrentUser();
  if(!user||user.role!=="USER"||user.isAdminLogin)redirect("/dashboard");
  return <main className="mx-auto max-w-2xl p-6"><h1 className="text-2xl font-semibold">Request a service review</h1><p className="my-4">These services are not available for purchase or confirmed booking. A private review request does not reserve a date, stock or capacity.</p><DeferredServiceRequestForm/>{process.env.DEFERRED_SERVICE_OPERATIONS_ENABLED==='true'?<DeferredServiceAllocations/>:null}</main>;
}

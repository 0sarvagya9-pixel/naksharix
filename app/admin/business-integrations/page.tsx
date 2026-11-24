import type {Metadata} from "next";
import {requireAdminRole} from "@/lib/auth/roles";
import {Section} from "@/components/section";
import {AdminBusinessIntegrations} from "@/components/admin-business-integrations";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Business Integrations Administration",robots:{index:false,follow:false}};
export default async function Page(){await requireAdminRole();return <Section><h1 className="mb-5 font-cinzel text-3xl font-bold">Business Integration Administration</h1><AdminBusinessIntegrations/></Section>}

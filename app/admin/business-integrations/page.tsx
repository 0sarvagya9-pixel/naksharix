import type {Metadata} from "next";
import {cookies} from "next/headers";
import {requireAdminRole} from "@/lib/auth/roles";
import {Section} from "@/components/section";
import {AdminBusinessIntegrations,AdminBusinessIntegrationsHeading} from "@/components/admin-business-integrations";
import {normalizeLocale} from "@/lib/i18n";
import {businessWorkspaceCopy} from "@/lib/business-integrations/workspace-copy";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const locale=normalizeLocale((await cookies()).get("naksharix-language")?.value);return {title:businessWorkspaceCopy[locale].adminTitle+" | Naksharix",robots:{index:false,follow:false}};}
export default async function Page(){await requireAdminRole();return <Section><AdminBusinessIntegrationsHeading/><AdminBusinessIntegrations/></Section>}

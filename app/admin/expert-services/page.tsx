import {requireAdminRole} from "@/lib/auth/roles";
import {Section} from "@/components/section";
import {AdminExpertWorkspace} from "@/components/admin-expert-workspace";
export const dynamic="force-dynamic";
export default async function Page(){await requireAdminRole();return <Section><h1 className="mb-5 font-cinzel text-3xl font-bold">Expert Service Administration</h1><AdminExpertWorkspace/></Section>}

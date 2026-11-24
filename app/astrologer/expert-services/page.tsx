import {requireRole} from "@/lib/auth/roles";
import {Section} from "@/components/section";
import {ExpertProviderWorkspace} from "@/components/expert-provider-workspace";
export const dynamic="force-dynamic";
export default async function Page(){await requireRole(["ASTROLOGER"]);return <Section><h1 className="mb-5 font-cinzel text-3xl font-bold">Written Services and Human Reviews</h1><p className="mb-6">Only approved, assigned practitioners may accept quotes, read authorized documents or submit actual responses.</p><ExpertProviderWorkspace/></Section>}

import {getAdminApiUser} from "@/lib/auth/roles";
import {fail,ok,handleApiError,validateJson} from "@/lib/api";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
import {adminSchema} from "@/lib/expert-services/input";
import {expertSchemaReady,expertIntakeEnabled,listExpertAdmin,actExpertAdmin} from "@/lib/expert-services/ledger";
import {isOwnerRecoveryOperator} from "@/lib/ops/owner-recovery-authorization";
export const dynamic="force-dynamic";
export async function GET(){try{const admin=await getAdminApiUser();if(!admin)return fail("Forbidden",403);if(!await expertSchemaReady())return fail("Expert service registry unavailable.",503);return ok({intake:expertIntakeEnabled(),...await listExpertAdmin()});}catch(e){return handleApiError(e);}}
export async function PATCH(request:Request){try{
 const admin=await getAdminApiUser();if(!admin)return fail("Forbidden",403);if(!await expertSchemaReady())return fail("Expert service registry unavailable.",503);
 const limit=await sharedRateLimitResponse("expert-admin",admin.id,20,60000);if(limit)return limit;
 const input=await validateJson(request,adminSchema);
 if(!await isOwnerRecoveryOperator(admin))return fail("Only the authorized owner may approve expert quotes or record settlement.",403);
 return await actExpertAdmin(admin.id,input)?ok({saved:true,id:input.id,action:input.action}):fail("Request state, practitioner approval, quote or settlement evidence is invalid.",409);
 }catch(e){return handleApiError(e);}}

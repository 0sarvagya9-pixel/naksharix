import {getCurrentUser} from "@/lib/auth/jwt";
import {fail,ok,handleApiError,validateJson} from "@/lib/api";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
import {providerSchema} from "@/lib/expert-services/input";
import {expertSchemaReady,listExpertProvider,actExpertProvider} from "@/lib/expert-services/ledger";
export const dynamic="force-dynamic";
export async function GET(){try{const user=await getCurrentUser();if(!user||user.role!=="ASTROLOGER")return fail("Forbidden",403);if(!await expertSchemaReady())return fail("Expert service registry unavailable.",503);return ok({requests:await listExpertProvider(user.id)});}catch(e){return handleApiError(e);}}
export async function PATCH(request:Request){try{const user=await getCurrentUser();if(!user||user.role!=="ASTROLOGER")return fail("Forbidden",403);if(!await expertSchemaReady())return fail("Expert service registry unavailable.",503);const limit=await sharedRateLimitResponse("expert-provider",user.id,20,60000);if(limit)return limit;const input=await validateJson(request,providerSchema);return await actExpertProvider(user.id,input)?ok({saved:true,id:input.id,action:input.action}):fail("Assigned approved practitioner, valid state and verified entitlement required.",409);}catch(e){return handleApiError(e);}}

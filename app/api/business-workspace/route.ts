import {z} from "zod";
import {getCurrentUser} from "@/lib/auth/jwt";
import {ok,fail,handleApiError,validateJson} from "@/lib/api";
import {businessEnabled,businessSchemaReady,ownedBusinessTenants,issueBusinessKey,revokeBusinessKey} from "@/lib/business-integrations/ledger";
import {keySchema} from "@/lib/business-integrations/input";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
export const dynamic="force-dynamic";
export async function GET(){
 try{const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);if(!await businessSchemaReady())return fail("Business workspace registry unavailable.",503);return ok({enabled:businessEnabled(),tenants:await ownedBusinessTenants(user.id)});}catch(e){return handleApiError(e);}
}
export async function POST(request:Request){
 try{const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);if(!businessEnabled()||!await businessSchemaReady())return fail("Key issuance unavailable.",503);
 const limited=await sharedRateLimitResponse("business-key-create",user.id,5,60000);if(limited)return limited;
 const input=await validateJson(request,keySchema),result=await issueBusinessKey(user.id,input);
 if(!result)return fail("Contract, scopes or active key limit prevents issuance.",403);
 return ok(result,{headers:{"Cache-Control":"private, no-store"}});
 }catch(e){return handleApiError(e);}
}
export async function DELETE(request:Request){
 try{const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
 const input=await validateJson(request,z.object({tenantId:z.string().min(1).max(100),keyId:z.string().regex(/^[0-9a-f]{32}$/)}).strict());
 if(!await businessSchemaReady())return fail("Key registry unavailable.",503);
 if(!await revokeBusinessKey(user.id,input.tenantId,input.keyId))return fail("Key not found or already revoked.",404);
 return ok({revoked:true});}catch(e){return handleApiError(e);}
}

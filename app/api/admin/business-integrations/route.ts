import {z} from "zod";
import {getAdminApiUser} from "@/lib/auth/roles";
import {ok,fail,handleApiError,validateJson} from "@/lib/api";
import {prisma} from "@/lib/db";
import {env} from "@/lib/env";
import {businessEnabled,businessSchemaReady,tenantSelect,createTenant,revokeTenant} from "@/lib/business-integrations/ledger";
import {tenantSchema} from "@/lib/business-integrations/input";
async function owner(){
 const admin=await getAdminApiUser();if(!admin)return null;
 if(admin.role==="SUPER_ADMIN"||env.ADMIN_EMAIL?.toLowerCase()===admin.email.toLowerCase())return admin;
 // Match the existing single-owner admin policy; additional admins cannot approve a contract.
 const count=await prisma.user.count({where:{role:{in:["ADMIN","SUPER_ADMIN"]}}});return count===1?admin:null;
}
export const dynamic="force-dynamic";
export async function GET(){
 try{if(!await owner())return fail("Forbidden",403);if(!await businessSchemaReady())return fail("Business registry unavailable.",503);
 return ok({enabled:businessEnabled(),tenants:await prisma.businessTenant.findMany({select:{...tenantSelect,contractReference:true},orderBy:{createdAt:"desc"},take:100})});}catch(e){return handleApiError(e);}
}
export async function POST(request:Request){
 try{const admin=await owner();if(!admin)return fail("Forbidden",403);if(!businessEnabled()||!await businessSchemaReady())return fail("Contract admission is unavailable.",503);
 const input=await validateJson(request,tenantSchema),tenant=await createTenant(admin.id,input);
 if(!tenant)return fail("Check verified account, distinct contract reference and expiry within one year.",422);
 return ok({tenant});}catch(e){return handleApiError(e);}
}
export async function DELETE(request:Request){
 try{const admin=await owner();if(!admin)return fail("Forbidden",403);const input=await validateJson(request,z.object({tenantId:z.string().min(1).max(100),confirmed:z.literal(true)}).strict());
 if(!await businessSchemaReady())return fail("Business registry unavailable.",503);
 if(!await revokeTenant(admin.id,input.tenantId))return fail("Active tenant not found.",404);
 return ok({revoked:true});}catch(e){return handleApiError(e);}
}

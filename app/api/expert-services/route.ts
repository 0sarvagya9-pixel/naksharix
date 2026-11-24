import {z} from "zod";
import {getCurrentUser} from "@/lib/auth/jwt";
import {prisma} from "@/lib/db";
import {fail,ok,handleApiError,validateJson} from "@/lib/api";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
import {requestSchema} from "@/lib/expert-services/input";
import {expertIntakeEnabled,expertSalesEnabled,expertSchemaReady,createExpertRequest,listExpertCustomer,cancelExpertCustomer} from "@/lib/expert-services/ledger";
export const dynamic="force-dynamic";
export async function GET(){try{const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);if(!await expertSchemaReady())return fail("Expert service registry unavailable.",503);return ok({intake:expertIntakeEnabled(),sales:expertSalesEnabled(),...await listExpertCustomer(user.id)});}catch(e){return handleApiError(e);}}
export async function POST(request:Request){try{
 const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
 if(!expertIntakeEnabled()||!await expertSchemaReady())return fail("New expert requests are not active.",503);
 const limit=await sharedRateLimitResponse("expert-intake",user.id,5,60000);if(limit)return limit;
 const account=await prisma.user.findUnique({where:{id:user.id},select:{role:true,emailVerified:true,emailVerifiedAt:true}});if(!account||["ADMIN","SUPER_ADMIN"].includes(account.role)||(!account.emailVerified&&!account.emailVerifiedAt))return fail("Verified customer account required.",403);
 const input=await validateJson(request,requestSchema),row=await createExpertRequest(user.id,input);
 return row?ok({request:{id:row.id,status:row.status}}):fail("Check the selected paid report, existing requests and request limit.",409);
 }catch(e){return handleApiError(e);}}
export async function DELETE(request:Request){try{const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);if(!await expertSchemaReady())return fail("Expert service registry unavailable.",503);const input=await validateJson(request,z.object({id:z.string().min(1).max(100)}).strict());return await cancelExpertCustomer(user.id,input.id)?ok({canceled:true}):fail("Only an unpaid request without a payment attempt can be canceled.",409);}catch(e){return handleApiError(e);}}

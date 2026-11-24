import {z} from "zod";
import {getCurrentUser} from "@/lib/auth/jwt";
import {fail,ok,handleApiError,validateJson} from "@/lib/api";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
import {MEMBERSHIP_TERMS_VERSION} from "@/lib/ai/membership-contract";
import {availableMembershipOffer,listMemberships,startMembership,refreshMembership,requestMembershipCancellation,membershipSchemaReady} from "@/lib/ai/membership-ledger";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){try{const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);if(!await membershipSchemaReady())return fail("Membership registry unavailable.",503);const [offer,memberships]=await Promise.all([availableMembershipOffer(),listMemberships(user.id)]);return ok({offer,memberships});}catch(e){return handleApiError(e);}}
export async function POST(request:Request){try{const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);const limit=await sharedRateLimitResponse("membership-create",user.id,3,60000);if(limit)return limit;
 const input=await validateJson(request,z.object({clientIntent:z.string().uuid(),version:z.string().max(64),planId:z.string().max(100),pricePaise:z.number().int().min(100).max(1000000),unitsPerCycle:z.number().int().min(1).max(500),totalCycles:z.number().int().min(2).max(12),approvedModel:z.string().max(120),termsVersion:z.literal(MEMBERSHIP_TERMS_VERSION),accepted:z.literal(true)}).strict());
 const {clientIntent,termsVersion,accepted,...offer}=input;const membership=await startMembership(user.id,clientIntent,offer);
 return membership?ok({membership}):fail("No matching approved plan, verified account, or an earlier mandate needs review.",409);
 }catch(e){return handleApiError(e);}}
export async function PATCH(request:Request){try{const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);if(!await membershipSchemaReady())return fail("Membership registry unavailable.",503);const limit=await sharedRateLimitResponse("membership-control",user.id,12,60000);if(limit)return limit;
 const input=await validateJson(request,z.discriminatedUnion("action",[z.object({action:z.literal("REFRESH"),id:z.string().min(1).max(100)}).strict(),z.object({action:z.literal("CANCEL"),id:z.string().min(1).max(100),confirmed:z.literal(true)}).strict()]));
 const membership=input.action==="CANCEL"?await requestMembershipCancellation(user.id,input.id):await refreshMembership(user.id,input.id);
 return membership?ok({membership}):fail("Mandate needs merchant reconciliation. Do not create another subscription.",409);
 }catch(e){return handleApiError(e);}}

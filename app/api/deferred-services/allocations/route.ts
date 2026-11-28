import {getCurrentUser} from "@/lib/auth/jwt";
import {fail,ok,validateJson,handleApiError} from "@/lib/api";
import {rateLimit} from "@/lib/rate-limit";
import {customerPlanning,customerPlanningInput,customerPlanningView,PlanningConflict,planningEnabled} from "@/lib/deferred-services/planning-ledger";
import {planningAcknowledgement} from "@/lib/deferred-services/client";
export const dynamic="force-dynamic";
const privateResponse=(data:unknown)=>{const response=ok(data);response.headers.set("Cache-Control","private, no-store");return response};
export async function GET(){
 if(!planningEnabled())return fail("Not found",404);
 try{const user=await getCurrentUser();if(!user)return fail("Sign in first.",401);if(user.role!=="USER"||user.isAdminLogin)return fail("Customer account required.",403);return privateResponse(await customerPlanningView(user.id));}catch(e){return handleApiError(e);}
}
export async function POST(request:Request){
 if(!planningEnabled())return fail("Not found",404);
 try{
  const user=await getCurrentUser();if(!user)return fail("Sign in first.",401);if(user.role!=="USER"||user.isAdminLogin)return fail("Customer account required.",403);
  if(!(await rateLimit("deferred-plan-user:"+user.id,30,3600)).allowed)return fail("Review operation limit reached.",429);
  const input=await validateJson(request,customerPlanningInput),outcome=await customerPlanning(user.id,input);
  return privateResponse({...outcome,acknowledgement:planningAcknowledgement(input)});
 }catch(e){if(e instanceof PlanningConflict)return fail(e.message,409);return handleApiError(e);}
}

import {getAdminApiUser} from "@/lib/auth/roles";
import {fail,ok,validateJson,handleApiError} from "@/lib/api";
import {rateLimit} from "@/lib/rate-limit";
import {Prisma} from "@prisma/client";
import {adminPlanning,adminPlanningInput,adminPlanningView,PlanningConflict,planningEnabled} from "@/lib/deferred-services/planning-ledger";
export const dynamic="force-dynamic";
const privateResponse=(data:unknown)=>{const response=ok(data);response.headers.set("Cache-Control","private, no-store");return response};
export async function GET(){
 if(!planningEnabled())return fail("Not found",404);
 try{if(!await getAdminApiUser())return fail("Not found",404);return privateResponse(await adminPlanningView());}catch(e){return handleApiError(e);}
}
export async function POST(request:Request){
 if(!planningEnabled())return fail("Not found",404);
 try{
  const admin=await getAdminApiUser();if(!admin)return fail("Not found",404);
  if(!(await rateLimit("deferred-plan-admin:"+admin.id,120,3600)).allowed)return fail("Review operation limit reached.",429);
  return privateResponse(await adminPlanning(admin.id,await validateJson(request,adminPlanningInput)));
 }catch(e){if(e instanceof PlanningConflict)return fail(e.message,409);if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2002")return fail("Concurrent or duplicate review operation.",409);return handleApiError(e);}
}

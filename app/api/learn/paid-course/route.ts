import {z} from "zod";
import {getCurrentUser} from "@/lib/auth/jwt";
import {fail,ok,handleApiError,validateJson} from "@/lib/api";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
import {readPaidCourse,assessPaidCourse} from "@/lib/learning/paid-course";
const orderId=z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const moduleId=z.string().regex(/^[a-z-]{1,50}$/);
export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
 const q=new URL(request.url).searchParams;
 const input=z.object({orderId,moduleId:moduleId.optional()}).safeParse({orderId:q.get("orderId"),moduleId:q.get("moduleId")??undefined});
 if(!input.success)return fail("Select a valid purchased course.",422);
 const limit=await sharedRateLimitResponse("paid-course-read",user.id,60,60000);if(limit)return limit;
 const data=await readPaidCourse(user.id,input.data.orderId,input.data.moduleId);
 return data?ok(data):fail("Verified, non-refunded course purchase required.",403);
 }catch(e){return handleApiError(e);}
}
export async function POST(request:Request){
 try{const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
 const limit=await sharedRateLimitResponse("paid-course-assessment",user.id,20,60000);if(limit)return limit;
 const input=await validateJson(request,z.object({orderId,moduleId,answers:z.array(z.number().int().min(0).max(2)).length(2)}).strict());
 const result=await assessPaidCourse(user.id,input.orderId,input.moduleId,input.answers);
 return result?ok(result):fail("Course entitlement or module is unavailable.",403);
 }catch(e){return handleApiError(e);}
}

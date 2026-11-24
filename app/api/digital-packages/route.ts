import {z} from "zod";
import {getCurrentUser} from "@/lib/auth/jwt";
import {prisma} from "@/lib/db";
import {fail,ok,handleApiError,validateJson} from "@/lib/api";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
import {packageDraftSchema,preparePackageItems} from "@/lib/digital-packages/input";
import {availablePackageOffers,packageSchemaReady,packageOrderSelect,preparePackage,cancelPackageDraft} from "@/lib/digital-packages/ledger";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const user=await getCurrentUser();if(!user)return fail("Sign in to manage your packages.",401);
  if(!await packageSchemaReady())return ok({offers:[],orders:[],available:false});
  const [offers,orders]=await Promise.all([availablePackageOffers(),prisma.digitalPackageOrder.findMany({where:{userId:user.id},select:packageOrderSelect,orderBy:{createdAt:"desc"},take:30})]);
  return ok({offers,orders,available:true});
 }catch(e){return handleApiError(e);}
}
export async function POST(request:Request){
 try{
  const user=await getCurrentUser();if(!user)return fail("Sign in to prepare a package.",401);
  const limited=await sharedRateLimitResponse("digital-package-draft",user.id,6,60000);if(limited)return limited;
  const account=await prisma.user.findUnique({where:{id:user.id},select:{role:true,emailVerified:true,emailVerifiedAt:true}});
  if(!account||["ADMIN","SUPER_ADMIN"].includes(account.role)||(!account.emailVerified&&!account.emailVerifiedAt))return fail("A verified customer account is required.",403);
  const input=await validateJson(request,packageDraftSchema);
  try{preparePackageItems(input);}catch(e){return fail(e instanceof Error?e.message:"Invalid package details.",422);}
  const result=await preparePackage(user.id,input);
  if(result.kind!=="saved")return fail(result.kind==="limit"?"Review existing unpaid packages before preparing another.":result.kind==="conflict"?"This request identifier already belongs to a different package.":"This offer is not currently available at the selected price.",409);
  return ok({order:result.order});
 }catch(e){return handleApiError(e);}
}
export async function DELETE(request:Request){
 try{
  const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
  const body=await validateJson(request,z.object({orderId:z.string().min(1).max(100)}).strict());
  if(!await packageSchemaReady())return fail("Package registry unavailable.",503);
  if(!await cancelPackageDraft(user.id,body.orderId))return fail("Only an unpaid draft without a payment attempt can be canceled.",409);
  return ok({canceled:true});
 }catch(e){return handleApiError(e);}
}

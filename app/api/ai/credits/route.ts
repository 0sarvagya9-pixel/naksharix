import {getCurrentUser} from "@/lib/auth/jwt";
import {fail,ok,handleApiError} from "@/lib/api";
import {availableCreditOffer,creditAccountSummary,creditSchemaReady,creditUsageEnabled} from "@/lib/ai/credit-ledger";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
  if(["ADMIN","SUPER_ADMIN"].includes(user.role)||!creditUsageEnabled())return ok({enabled:false,offer:null});
  if(!await creditSchemaReady())return fail("AI credit accounts are not yet available.",503);
  const [summary,offer]=await Promise.all([creditAccountSummary(user.id),availableCreditOffer()]);
  return ok({enabled:true,offer,...summary});
 }catch(e){return handleApiError(e);}
}

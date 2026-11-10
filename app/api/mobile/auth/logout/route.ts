import {revokeMobileSession} from "@/lib/mobile/account-link";
import {fail,handleApiError,ok} from "@/lib/api";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{
  if(!await revokeMobileSession(request))return fail("Mobile session is not active.",401);
  return ok({loggedOut:true});
 }catch(error){return handleApiError(error);}
}

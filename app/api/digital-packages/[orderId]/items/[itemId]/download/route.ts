import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth/jwt";
import {fail,handleApiError} from "@/lib/api";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
import {loadPackageItemForDownload} from "@/lib/digital-packages/ledger";
export const runtime="nodejs";
export const dynamic="force-dynamic";
type Params=Promise<{orderId:string;itemId:string}>;
export async function GET(_request:Request,{params}:{params:Params}){
 try{
 const user=await getCurrentUser();if(!user)return fail("Unauthenticated",401);
 const limited=await sharedRateLimitResponse("package-item-download",user.id,30,60000);if(limited)return limited;
 const {orderId,itemId}=await params;
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(orderId)||!/^[a-zA-Z0-9_-]{1,100}$/.test(itemId))return fail("Invalid reference",422);
 const item=await loadPackageItemForDownload(user.id,orderId,itemId);
 if(!item)return fail("A verified, non-refunded purchase with a completed document is required.",403);
 const body=new Uint8Array(item.bytes.length);body.set(item.bytes);
 const safe=item.kind.replace(/[^a-z0-9-]/g,"-");
 return new NextResponse(body.buffer,{headers:{"Content-Type":"application/pdf","Content-Length":String(body.length),"Content-Disposition":'attachment; filename="naksharix-'+safe+'-'+itemId+'.pdf"',"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex, nofollow"}});
 }catch(e){return handleApiError(e);}
}

import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth/jwt";
import {fail,handleApiError} from "@/lib/api";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
import {providerSourceForDownload,recordExpertSourceRead} from "@/lib/expert-services/ledger";
import {loadReportPdf} from "@/lib/storage/report-storage";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await getCurrentUser();if(!user||user.role!=="ASTROLOGER")return fail("Forbidden",403);
 const limit=await sharedRateLimitResponse("expert-source-download",user.id,20,60000);if(limit)return limit;
 const {id}=await params;if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id))return fail("Invalid reference",422);
 const source=await providerSourceForDownload(user.id,id);if(!source?.expectedChecksum)return fail("Assigned paid review with original report entitlement required.",403);
 const bytes=await loadReportPdf(source);
 if(!await recordExpertSourceRead(user.id,id,source.expectedChecksum))return fail("Review entitlement changed.",409);
 const body=new Uint8Array(bytes.byteLength);body.set(bytes);
 return new NextResponse(body.buffer,{headers:{"Content-Type":"application/pdf","Content-Disposition":"attachment; filename=naksharix-review-source.pdf","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex, nofollow"}});
 }catch(e){return handleApiError(e);}}

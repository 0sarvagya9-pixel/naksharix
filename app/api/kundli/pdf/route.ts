import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cacheGet, cacheSet } from "@/lib/cache";
import { cacheTtl, createHashKey, pdfCacheKey } from "@/lib/report-hash";
import type { KundliReport } from "@/lib/astrology/types";
import { renderBundledKundliPdf } from "@/lib/pdf/kundli-renderer";
import { normalizeKundliPdfData } from "@/lib/kundli/pdf-data";
import { readLanguageFromRequest } from "@/lib/server-language";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { savedKundliAccessMap } from "@/lib/reports/saved-kundli-access";
import { unwrapSavedKundliReport, hasSavedKundliPayload } from "@/lib/reports/saved-kundli-contract";

const schema=z.object({
 report:z.record(z.string(),z.unknown()).optional(),
 savedReportId:z.string().min(1).max(128).optional(),
 pdfType:z.enum(["FREE","PREMIUM"]).default("FREE"),
 language:z.enum(["en","hi","hinglish"]).optional()
}).strict();
function errorResponse(error:string,status:number){
 return NextResponse.json({ok:false,error},{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}
export async function POST(request:NextRequest){
 try{
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return errorResponse("Invalid PDF request body",400);
  const body=parsed.data;
  let reportPayload:Record<string,unknown>|null;
  if(body.pdfType==="PREMIUM"){
   const user=await getCurrentUser();
   if(!user)return errorResponse("Sign in to download a purchased saved Kundli.",401);
   if(!body.savedReportId)return errorResponse("Select a purchased saved Kundli from your account.",403);
   const saved=await prisma.kundliReport.findFirst({where:{id:body.savedReportId,userId:user.id},select:{id:true,reportJson:true}});
   if(!saved)return errorResponse("Saved report not found",404);
   if(!canBypassPayment(user)){
    const access=await savedKundliAccessMap(user.id,[saved.id]);
    if(access.get(saved.id)!=="UNLOCKED")return errorResponse("This saved report has no verified unrefunded premium entitlement. Review Payment History before paying again.",403);
   }
   // Premium content is always read from the owned persisted chart. A client
   // cannot attach arbitrary birth data or substitute another report's hash.
   reportPayload=unwrapSavedKundliReport(saved.reportJson);
  }else{
   reportPayload=unwrapSavedKundliReport(body.report);
  }
  if(!reportPayload||!hasSavedKundliPayload(reportPayload))return errorResponse("Missing kundli report payload",400);
  const language=readLanguageFromRequest(request,body.language??reportPayload.language);
  // Public free PDFs may be reused only for the entire identical payload.
  // Never consult the old caller-controlled hash cache; never cache a paid PDF.
  const key=body.pdfType==="FREE"?pdfCacheKey("v2:"+createHashKey(reportPayload)+":"+language,"FREE"):null;
  if(key){const cached=await cacheGet<string>(key);if(cached)return pdfResponse(Buffer.from(cached,"base64"),"FREE");}
  const data=normalizeKundliPdfData(reportPayload as unknown as KundliReport);
  const buffer=await renderBundledKundliPdf(data,language,body.pdfType);
  if(key)await cacheSet(key,buffer.toString("base64"),cacheTtl.daily);
  return pdfResponse(buffer,body.pdfType);
 }catch{
  // Do not emit report contents, raw errors or stack traces to clients/logs.
  return errorResponse("Could not generate the requested Kundli PDF. Please try again.",500);
 }
}
function pdfResponse(body:Buffer|Uint8Array|ArrayBuffer,pdfType:"FREE"|"PREMIUM"){
 const responseBody=body instanceof ArrayBuffer?body:new Uint8Array(body);
 return new NextResponse(responseBody,{headers:{
  "Content-Type":"application/pdf",
  "Content-Disposition":'attachment; filename="naksharix-'+(pdfType==="PREMIUM"?"premium":"free")+'-kundli-report.pdf"',
  "Cache-Control":"no-store","X-Content-Type-Options":"nosniff"
 }});
}

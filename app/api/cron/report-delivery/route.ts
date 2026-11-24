import { NextResponse } from "next/server";
import { createHash,timingSafeEqual } from "node:crypto";
import { runAutomaticReportRecovery } from "@/lib/reports/automatic-report-worker";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=300;
const headers={"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"};
function authorized(request:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret||secret.length<32)return false;
  const hash=(s:string)=>createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(request.headers.get("authorization")??""),hash("Bearer "+secret));
}
export async function GET(request:Request){
  if(!authorized(request))return NextResponse.json({error:"Unauthorized"},{status:401,headers});
  try{return NextResponse.json({data:await runAutomaticReportRecovery()},{headers});}
  catch{return NextResponse.json({error:"Report recovery unavailable"},{status:503,headers});}
}

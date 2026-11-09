import { NextResponse } from "next/server";
import { recoveryHealth } from "@/lib/ops/daily-recovery";
export const dynamic='force-dynamic';
export async function GET() {
  const data=await recoveryHealth().catch(()=>({configured:true,operational:false,reason:'backup_status_unavailable'}));
  return NextResponse.json({data},{status:data.operational?200:503,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
}

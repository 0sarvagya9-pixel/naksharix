import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fail } from "@/lib/api";
import { recordAggregate } from "@/lib/analytics/aggregate";
import { analyticsEventNames, publicAnalyticsRoute } from "@/lib/analytics/public-routes";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";
const schema=z.object({consent:z.literal(true),event:z.enum(analyticsEventNames),path:z.string().max(180)}).strict();
export async function POST(request: NextRequest) {
  if(request.headers.get("dnt")==="1" || request.headers.get("sec-gpc")==="1")return new NextResponse(null,{status:204});
  if(process.env.FIRST_PARTY_ANALYTICS_DISABLED==='true')return fail('Analytics disabled',503);
  const limited=rateLimitResponse('aggregate-analytics',getRequestIp(request),30,60000);if(limited)return limited;
  const origin=request.headers.get('origin');
  if(origin && ![request.nextUrl.origin,process.env.NEXT_PUBLIC_APP_URL,'https://www.naksharix.com','https://naksharix.com'].includes(origin))return fail('Invalid origin',403);
  if(Number(request.headers.get('content-length')||0)>512)return fail('Payload too large',413);
  const raw=await request.text();if(raw.length>512)return fail('Payload too large',413);
  const data=schema.safeParse((()=>{try{return JSON.parse(raw);}catch{return null;}})());
  if(!data.success)return fail('Explicit consent and an allowlisted public event are required.',422);
  const path=publicAnalyticsRoute(data.data.path);if(!path)return fail('Private or unknown route cannot be tracked.',422);
  try {await recordAggregate(data.data.event,path);return new NextResponse(null,{status:204});}
  catch {return fail('Analytics temporarily unavailable',503);}
}

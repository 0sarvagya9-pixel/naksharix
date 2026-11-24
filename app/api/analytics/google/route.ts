import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fail } from "@/lib/api";
import { analyticsEventNames, publicAnalyticsRoute } from "@/lib/analytics/public-routes";
import { analyticsPrivacyAllowed, googleAnalyticsEnabled, googleSessionSchema, sendPublicGoogleEvent } from "@/lib/analytics/google";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";

const schema=z.object({consent:z.literal(true),event:z.enum(analyticsEventNames),path:z.string().max(180),session:googleSessionSchema}).strict();
export async function POST(request:NextRequest) {
  if(!analyticsPrivacyAllowed(request) || !googleAnalyticsEnabled())return new NextResponse(null,{status:204});
  const origin=request.headers.get("origin");
  if(!origin || ![request.nextUrl.origin,"https://www.naksharix.com","https://naksharix.com"].includes(origin))return fail("Invalid origin",403);
  const limited=rateLimitResponse("google-analytics",getRequestIp(request),30,60000);if(limited)return limited;
  if(Number(request.headers.get("content-length")||0)>1024)return fail("Payload too large",413);
  const raw=await request.text();if(raw.length>1024)return fail("Payload too large",413);
  const data=schema.safeParse((()=>{try{return JSON.parse(raw);}catch{return null;}})());
  if(!data.success)return fail("Invalid analytics event",422);
  const route=publicAnalyticsRoute(data.data.path);if(!route)return fail("Private or unknown route",422);
  await sendPublicGoogleEvent(data.data.session,data.data.event,route);
  return new NextResponse(null,{status:204});
}

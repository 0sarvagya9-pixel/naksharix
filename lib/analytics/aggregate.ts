import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import type { AggregateEventName } from "@/lib/analytics/public-routes";
let lastCleanupDay="";
export async function recordAggregate(event: AggregateEventName, route: string) {
  const day=new Date().toISOString().slice(0,10);
  if(lastCleanupDay!==day){await prisma.auditLog.deleteMany({where:{action:"analytics.aggregate",createdAt:{lt:new Date(Date.now()-90*86400000)}}});lastCleanupDay=day;}
  const id='fpa:'+day+':'+createHash('sha256').update(event+'|'+route).digest('hex').slice(0,24);
  const metadata=JSON.stringify({day,event,route,count:1});
  await prisma.$executeRaw`
    INSERT INTO "AuditLog" (id,action,"targetType","targetId",metadata,"createdAt")
    VALUES (${id},'analytics.aggregate','public_route',${route},${metadata}::jsonb,NOW())
    ON CONFLICT (id) DO UPDATE SET metadata=jsonb_set("AuditLog".metadata,'{count}',
      to_jsonb(LEAST(COALESCE(("AuditLog".metadata->>'count')::bigint,0)+1,1000000000)))`;
}
export async function aggregateAnalytics(days=30) {
  const records=await prisma.auditLog.findMany({where:{action:'analytics.aggregate',createdAt:{gte:new Date(Date.now()-Math.min(90,Math.max(1,days))*86400000)}},select:{metadata:true},take:10000,orderBy:{createdAt:'desc'}});
  const rows=records.flatMap(row=>{
    const m=row.metadata as {day?:unknown;event?:unknown;route?:unknown;count?:unknown}|null;
    return m&&typeof m.day==='string'&&typeof m.event==='string'&&typeof m.route==='string'&&typeof m.count==='number'
      ?[{day:m.day,event:m.event,route:m.route,count:m.count}]:[];
  });
  return {provider:'first_party_aggregate',consentRequired:true,windowDays:days,
    pageviews:rows.filter(r=>r.event==='page_view').reduce((n,r)=>n+r.count,0),
    interactions:rows.filter(r=>r.event!=='page_view').reduce((n,r)=>n+r.count,0),
    uniqueVisitors:null,customerDataCollected:false,rows};
}

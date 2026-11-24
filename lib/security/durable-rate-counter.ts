import "server-only";
import {createHmac} from "node:crypto";
import {prisma} from "@/lib/db";
import {env} from "@/lib/env";
import {validDurableRateInput} from "@/lib/security/durable-rate-contract";

let prunedDay="";
/** Atomic SQL upsert: one rolling window per keyed digest across all app instances.
 * Redis is optional. No per-request raw IP, account ID, prompt or email is stored.
 */
export async function durableRateCount(key:string,ttlSeconds:number){
 if(!validDurableRateInput(key,ttlSeconds)||env.JWT_SECRET.length<32||env.JWT_SECRET.includes("development-secret"))throw new Error("RATE_COUNTER_SETUP_INVALID");
 const digest=createHmac("sha256",env.JWT_SECRET).update("naksharix-rate-v2:"+key).digest("hex");
 const id="rate-v2:"+digest, ttlMs=ttlSeconds*1000;
 const [row]=await prisma.$queryRaw<{count:number;resetAt:bigint}[]>`
 WITH clock AS (SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint AS ms)
 INSERT INTO "AuditLog" (id,action,"targetType","targetId",metadata,"createdAt")
 SELECT ${id},'ops.rate.counter','DurableRateCounter',${digest},jsonb_build_object('count',1,'resetAt',ms+${ttlMs}::bigint),NOW() FROM clock
 ON CONFLICT (id) DO UPDATE SET
 metadata=CASE WHEN COALESCE(("AuditLog".metadata->>'resetAt')::bigint,0)<=(SELECT ms FROM clock)
 THEN EXCLUDED.metadata ELSE jsonb_set("AuditLog".metadata,'{count}',to_jsonb(LEAST(("AuditLog".metadata->>'count')::bigint+1,1000000000))) END,
 "createdAt"=CASE WHEN COALESCE(("AuditLog".metadata->>'resetAt')::bigint,0)<=(SELECT ms FROM clock) THEN NOW() ELSE "AuditLog"."createdAt" END
 WHERE "AuditLog".action='ops.rate.counter'
 RETURNING (metadata->>'count')::int AS count,(metadata->>'resetAt')::bigint AS "resetAt"
 `;
 if(!row||!Number.isSafeInteger(row.count)||row.count<1||!Number.isSafeInteger(Number(row.resetAt)))throw new Error("RATE_COUNTER_UNAVAILABLE");
 const day=new Date().toISOString().slice(0,10);
 if(prunedDay!==day){
  prunedDay=day;
  // Bounded deletion of expired keyed counters only; never touch business/audit records.
  await prisma.$executeRaw`DELETE FROM "AuditLog" WHERE id IN (SELECT id FROM "AuditLog" WHERE action='ops.rate.counter' AND "createdAt"<NOW()-INTERVAL '3 days' ORDER BY "createdAt" LIMIT 2000)`.catch(()=>{});
 }
 return {count:row.count,resetAt:Number(row.resetAt)};
}

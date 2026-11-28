import "server-only";
import {prisma} from "@/lib/db";
import {isOpsMetric,opsMetricNames,type OpsMetric} from "@/lib/ops/metric-contract";
let prunedDay="";
/** No customer, route, provider request ID, raw error, browser session or IP in these rows. */
export async function recordOpsMetric(metric:OpsMetric){
 if(process.env.VERCEL_ENV!=="production"||!isOpsMetric(metric))return;
 try{
 const day=new Date().toISOString().slice(0,10),id="ops-metric-v1:"+day+":"+metric;
 const metadata=JSON.stringify({day,metric,count:1});
 await prisma.$executeRaw`
 INSERT INTO "AuditLog"(id,action,"targetType","targetId",metadata,"createdAt") VALUES(${id},'ops.metric','OperationalMetric',${metric},${metadata}::jsonb,NOW())
 ON CONFLICT(id) DO UPDATE SET metadata=jsonb_set("AuditLog".metadata,'{count}',to_jsonb(LEAST(("AuditLog".metadata->>'count')::bigint+1,1000000000))) WHERE "AuditLog".action='ops.metric'
 `;
 if(prunedDay!==day){prunedDay=day;await prisma.auditLog.deleteMany({where:{action:"ops.metric",createdAt:{lt:new Date(Date.now()-90*86400000)}}}).catch(()=>{});}
 }catch{/* Telemetry failure cannot fail a customer or payment request. */}
}
export async function operationalMetrics(){
 try{
 const records=await prisma.auditLog.findMany({where:{action:"ops.metric",createdAt:{gte:new Date(Date.now()-7*86400000)}},select:{metadata:true},take:100,orderBy:{createdAt:"desc"}});
 const counts=Object.fromEntries(opsMetricNames.map(k=>[k,0])) as Record<OpsMetric,number>;
 for(const {metadata} of records){
  if(!metadata||typeof metadata!=="object"||Array.isArray(metadata))continue;
  const m=metadata as {metric?:unknown;count?:unknown};if(isOpsMetric(m.metric)&&typeof m.count==="number"&&Number.isSafeInteger(m.count)&&m.count>=0)counts[m.metric]+=m.count;
 }
 return {available:true as const,recordedDays:7,counts,hasEvidence:records.length>0};
 }catch{return {available:false as const};}
}

import "server-only";
import {createHash} from "node:crypto";
import {Prisma} from "@prisma/client";
import {prisma} from "@/lib/db";
import {isShippingCountry} from "@/lib/shop/shipping-rules";
import {SERVICES} from "./contract";
import {consumedCapacity,decodeReviewTicket,preparePlanTarget,progressState,validPlanWindow,visibleAllocationState,canReissueReview,PLAN_TERMS,type AllocationPlanWindow} from "./planning-contract";
import {z} from "zod";

export const planningEnabled=()=>process.env.DEFERRED_SERVICE_OPERATIONS_ENABLED==="true";
const ref=z.string().trim().min(3).max(160).regex(/^[\p{L}\p{N} ._:/#-]+$/u);
const id=z.string().min(1).max(128);
const time=z.string().datetime({offset:true});
export const adminPlanningInput=z.discriminatedUnion("action",[
 z.object({action:z.literal("CREATE_PLAN"),mutationId:z.string().uuid(),kind:z.string().max(40),target:z.string().max(100),label:z.string().trim().min(3).max(100),providerRef:ref,evidenceRef:ref,termsRef:ref,capacity:z.number().int().min(1).max(10000),startsAt:time,endsAt:time}).strict(),
 z.object({action:z.literal("REVIEW_PLAN"),planId:id,acknowledge:z.literal(true)}).strict(),
 z.object({action:z.literal("CLOSE_PLAN"),planId:id}).strict(),
 z.object({action:z.literal("ALLOCATE"),planId:id,ticketId:id}).strict(),
 z.object({action:z.literal("REISSUE"),allocationId:id,planId:id,version:z.number().int().positive()}).strict(),
 z.object({action:z.literal("RECORD_PROGRESS"),allocationId:id,version:z.number().int().positive(),operationId:z.string().uuid(),units:z.number().int().min(1).max(20),evidenceRef:ref,occurredAt:time}).strict(),
 z.object({action:z.literal("CANCEL"),allocationId:id,version:z.number().int().positive()}).strict()
]);
export const customerPlanningInput=z.discriminatedUnion("action",[
 z.object({action:z.literal("ACCEPT"),allocationId:id,version:z.number().int().positive(),consent:z.literal(PLAN_TERMS)}).strict(),
 z.object({action:z.literal("CANCEL"),allocationId:id,version:z.number().int().positive()}).strict()
]);
type AdminInput=z.infer<typeof adminPlanningInput>;
type CustomerInput=z.infer<typeof customerPlanningInput>;
type Tx=Prisma.TransactionClient;
export class PlanningConflict extends Error{}
function refuse(message:string):never{throw new PlanningConflict(message)}
const lockPlan=async(tx:Tx,planId:string)=>{
 const found=await tx.$queryRaw<Array<{id:string}>>`SELECT id FROM public."DeferredServicePlan" WHERE id=${planId} FOR UPDATE`;
 if(!found.length)refuse("Plan not found.");
};
const audit=async(tx:Tx,actorId:string,action:string,targetId:string,metadata:Prisma.InputJsonObject)=>{
 await tx.adminActionLog.create({data:{adminId:actorId,action,targetType:"DeferredServicePlanning",targetId,metadata}});
};
const dto=(row:{id:string;units:number;completedUnits:number;state:string;holdUntil:Date;version:number;acceptedAt:Date|null;plan?:AllocationPlanWindow},now=new Date())=>({id:row.id,units:row.units,completedUnits:row.completedUnits,state:visibleAllocationState(row,now,row.plan),holdUntil:row.holdUntil,version:row.version,acceptedAt:row.acceptedAt});
function scopeValid(kind:string,target:string){
 const value=preparePlanTarget(kind,target);
 return value!==null&&(SERVICES.find(s=>s.kind===kind)?.target!=="country"||isShippingCountry(value))?value:null;
}
export async function adminPlanning(actorId:string,input:AdminInput){
 const now=new Date();
 return prisma.$transaction(async tx=>{
  if(input.action==="CREATE_PLAN"){
   const target=scopeValid(input.kind,input.target),startsAt=new Date(input.startsAt),endsAt=new Date(input.endsAt);
   if(target===null||!validPlanWindow(startsAt,endsAt,now))refuse("Invalid service scope or dates.");
   const planId="plan-"+createHash("sha256").update(actorId+":"+input.mutationId).digest("hex");
   const values={kind:input.kind,target,label:input.label,providerRef:input.providerRef,evidenceRef:input.evidenceRef,termsRef:input.termsRef,capacity:input.capacity,startsAt,endsAt};
   const created=await tx.deferredServicePlan.createMany({data:[{id:planId,...values}],skipDuplicates:true});
   const p=await tx.deferredServicePlan.findUniqueOrThrow({where:{id:planId}});
   if(p.kind!==values.kind||p.target!==values.target||p.label!==values.label||p.providerRef!==values.providerRef||p.evidenceRef!==values.evidenceRef||p.termsRef!==values.termsRef||p.capacity!==values.capacity||p.startsAt.getTime()!==startsAt.getTime()||p.endsAt.getTime()!==endsAt.getTime())refuse("Plan reference reused with different details.");
   if(created.count)await audit(tx,actorId,"deferred_plan.created",p.id,{kind:p.kind,capacity:p.capacity});
   return {plan:p,duplicate:created.count===0};
  }
  if(input.action==="REVIEW_PLAN"||input.action==="CLOSE_PLAN"){
   await lockPlan(tx,input.planId);
   const p=await tx.deferredServicePlan.findUniqueOrThrow({where:{id:input.planId}});
   if(input.action==="REVIEW_PLAN"){
    if(p.state==="REVIEWED")return {plan:p,duplicate:true};
    if(p.state!=="DRAFT"||p.endsAt<=now)refuse("Only a current draft can be reviewed.");
    const reviewed=await tx.deferredServicePlan.update({where:{id:p.id},data:{state:"REVIEWED",reviewedById:actorId,reviewedAt:now}});
    await audit(tx,actorId,"deferred_plan.reviewed",p.id,{kind:p.kind,operatorAttested:true});
    return {plan:reviewed};
   }
   if(p.state==="CLOSED")return {plan:p,duplicate:true};
   const closed=await tx.deferredServicePlan.update({where:{id:p.id},data:{state:"CLOSED"}});
   await audit(tx,actorId,"deferred_plan.closed",p.id,{kind:p.kind});return {plan:closed};
  }
  if(input.action==="ALLOCATE"){
   await lockPlan(tx,input.planId);
   const p=await tx.deferredServicePlan.findUniqueOrThrow({where:{id:input.planId}});
   if(p.state!=="REVIEWED"||!p.reviewedAt||!p.reviewedById||p.endsAt<=now)refuse("No reviewed current plan.");
   const ticket=await tx.supportTicket.findUnique({where:{id:input.ticketId},include:{user:{select:{role:true,emailVerified:true,emailVerifiedAt:true}}}});
   if(!ticket||!["OPEN","IN_PROGRESS"].includes(ticket.status)||ticket.user.role!=="USER"||(!ticket.user.emailVerified&&!ticket.user.emailVerifiedAt))refuse("Eligible verified customer request required.");
   const request=decodeReviewTicket(ticket);
   if(!request||request.kind!==p.kind||request.target!==p.target)refuse("Request does not match the reviewed service scope.");
   if(request.preferredDate&&(request.preferredDate<p.startsAt.toISOString().slice(0,10)||request.preferredDate>p.endsAt.toISOString().slice(0,10)))refuse("Preferred date is outside the plan.");
   const existing=await tx.deferredServiceAllocation.findUnique({where:{ticketId:input.ticketId}});
   if(existing){if(existing.planId===p.id)return {allocation:dto(existing,now),duplicate:true};refuse("Request already has an allocation.");}
   const rows=await tx.deferredServiceAllocation.findMany({where:{planId:p.id},select:{units:true,completedUnits:true,state:true,holdUntil:true}});
   if(consumedCapacity(rows,now)+request.units>p.capacity)refuse("Insufficient remaining planning capacity.");
   const allocation=await tx.deferredServiceAllocation.create({data:{planId:p.id,ticketId:ticket.id,userId:ticket.userId,units:request.units,holdUntil:new Date(Math.min(p.endsAt.getTime(),now.getTime()+48*3600000))}});
   await audit(tx,actorId,"deferred_allocation.created",allocation.id,{planId:p.id,units:allocation.units});
   return {allocation:dto(allocation,now)};
  }
  const initial=await tx.deferredServiceAllocation.findUnique({where:{id:input.allocationId}});
  if(!initial)refuse("Allocation not found.");
  // Acquire every involved plan in stable order. A concurrent reissue can move
  // the allocation after the initial read; re-read under lock and reject it.
  const locks=[...new Set([initial.planId,...(input.action==="REISSUE"?[input.planId]:[])])].sort();
  for(const planId of locks)await lockPlan(tx,planId);
  const a=await tx.deferredServiceAllocation.findUniqueOrThrow({where:{id:input.allocationId},include:{plan:true}});
  if(a.planId!==initial.planId)refuse("Allocation moved. Refresh before retrying.");
  if(input.action==="REISSUE"){
   if(a.version!==input.version||!canReissueReview(a,a.plan,now))refuse("Only an expired or canceled allocation with no recorded progress may be reissued.");
   if(await tx.deferredServiceReceipt.count({where:{allocationId:a.id}}))refuse("Existing progress receipts prevent reissue.");
   const p=await tx.deferredServicePlan.findUniqueOrThrow({where:{id:input.planId}});
   if(p.state!=="REVIEWED"||!p.reviewedAt||!p.reviewedById||p.endsAt<=now)refuse("No reviewed current plan.");
   const ticket=await tx.supportTicket.findUnique({where:{id:a.ticketId},include:{user:{select:{role:true,emailVerified:true,emailVerifiedAt:true}}}});
   if(!ticket||ticket.userId!==a.userId||!["OPEN","IN_PROGRESS"].includes(ticket.status)||ticket.user.role!=="USER"||(!ticket.user.emailVerified&&!ticket.user.emailVerifiedAt))refuse("Eligible verified customer request required.");
   const request=decodeReviewTicket(ticket);
   if(!request||request.kind!==p.kind||request.target!==p.target||request.units!==a.units)refuse("Request does not match the reviewed service scope.");
   if(request.preferredDate&&(request.preferredDate<p.startsAt.toISOString().slice(0,10)||request.preferredDate>p.endsAt.toISOString().slice(0,10)))refuse("Preferred date is outside the plan.");
   const rows=await tx.deferredServiceAllocation.findMany({where:{planId:p.id,id:{not:a.id}},select:{units:true,completedUnits:true,state:true,holdUntil:true}});
   if(consumedCapacity(rows,now)+a.units>p.capacity)refuse("Insufficient remaining planning capacity.");
   const previous={planId:a.planId,state:a.state,visibleState:visibleAllocationState(a,now,a.plan),version:a.version,holdUntil:a.holdUntil.toISOString(),acceptedAt:a.acceptedAt?.toISOString()??null,canceledAt:a.canceledAt?.toISOString()??null};
   const changed=await tx.deferredServiceAllocation.update({where:{id:a.id},data:{planId:p.id,state:"HELD",holdUntil:new Date(Math.min(p.endsAt.getTime(),now.getTime()+48*3600000)),acceptedAt:null,canceledAt:null,version:{increment:1}}});
   await audit(tx,actorId,"deferred_allocation.reissued",a.id,{previous,next:{planId:p.id,version:changed.version,holdUntil:changed.holdUntil.toISOString()},units:a.units,requiresFreshAcknowledgement:true});
   return {allocation:dto(changed,now)};
  }
  if(input.action==="RECORD_PROGRESS"){
   const prior=await tx.deferredServiceReceipt.findUnique({where:{operationId:input.operationId}});
   const occurredAt=new Date(input.occurredAt);
   if(prior){
    if(prior.allocationId!==a.id||prior.evidenceRef!==input.evidenceRef||prior.units!==input.units||prior.occurredAt.getTime()!==occurredAt.getTime()||prior.actorId!==actorId)refuse("Progress reference reused with different details.");
    return {allocation:dto(a,now),duplicate:true};
   }
   if(a.version!==input.version||!["ACCEPTED","PARTIAL"].includes(a.state)||!a.acceptedAt)refuse("Allocation is stale or not acknowledged.");
   if(!Number.isFinite(occurredAt.getTime())||occurredAt<a.plan.startsAt||occurredAt>a.plan.endsAt||occurredAt>now||occurredAt<a.acceptedAt)refuse("Progress evidence date is outside acknowledged service window.");
   const next=progressState(a.units,a.completedUnits,input.units);
   if(!next)refuse("Progress exceeds assigned units.");
   await tx.deferredServiceReceipt.create({data:{allocationId:a.id,operationId:input.operationId,evidenceRef:input.evidenceRef,units:input.units,occurredAt,actorId}});
   const changed=await tx.deferredServiceAllocation.update({where:{id:a.id},data:{...next,version:{increment:1}}});
   await audit(tx,actorId,"deferred_allocation.progress",a.id,{units:input.units,operatorAttested:true});
   return {allocation:dto(changed,now)};
  }
  if(a.state==="CANCELED")return {allocation:dto(a,now),duplicate:true};
  if(a.version!==input.version||a.state==="COMPLETED")refuse("Allocation is stale or completed.");
  const changed=await tx.deferredServiceAllocation.update({where:{id:a.id},data:{state:"CANCELED",canceledAt:now,version:{increment:1}}});
  await audit(tx,actorId,"deferred_allocation.canceled",a.id,{releasedUnits:a.units-a.completedUnits});
  return {allocation:dto(changed,now)};
 });
}
export async function customerPlanning(userId:string,input:CustomerInput){
 const now=new Date();
 return prisma.$transaction(async tx=>{
  const initial=await tx.deferredServiceAllocation.findFirst({where:{id:input.allocationId,userId}});
  if(!initial)refuse("Allocation not found.");
  await lockPlan(tx,initial.planId);
  const a=await tx.deferredServiceAllocation.findUniqueOrThrow({where:{id:initial.id},include:{plan:true,user:{select:{role:true,emailVerified:true,emailVerifiedAt:true}}}});
  if(a.planId!==initial.planId)refuse("Allocation moved. Refresh before retrying.");
  if(a.userId!==userId||a.user.role!=="USER"||(!a.user.emailVerified&&!a.user.emailVerifiedAt))refuse("Verified customer required.");
  if(input.action==="ACCEPT"){
   if(a.acceptedAt&&["ACCEPTED","PARTIAL","COMPLETED"].includes(a.state))return {allocation:dto(a,now),duplicate:true};
   if(a.version!==input.version||a.state!=="HELD"||a.holdUntil<=now||a.plan.endsAt<=now||a.plan.state!=="REVIEWED")refuse("Proposal is stale or expired.");
   const changed=await tx.deferredServiceAllocation.update({where:{id:a.id},data:{state:"ACCEPTED",acceptedAt:now,version:{increment:1}}});
   return {allocation:dto(changed,now),consent:PLAN_TERMS};
  }
  if(a.state==="CANCELED")return {allocation:dto(a,now),duplicate:true};
  if(a.version!==input.version||a.state==="COMPLETED")refuse("Allocation is stale or completed.");
  const changed=await tx.deferredServiceAllocation.update({where:{id:a.id},data:{state:"CANCELED",canceledAt:now,version:{increment:1}}});
  return {allocation:dto(changed,now)};
 });
}
export async function adminPlanningView(){
 const now=new Date();
 const [plans,tickets,allocations]=await Promise.all([
  prisma.deferredServicePlan.findMany({take:100,orderBy:{createdAt:"desc"},include:{allocations:{select:{units:true,completedUnits:true,state:true,holdUntil:true}}}}),
  prisma.supportTicket.findMany({where:{id:{startsWith:"deferred-"},status:{in:["OPEN","IN_PROGRESS"]}},take:100,orderBy:{createdAt:"desc"},select:{id:true,subject:true,messages:true}}),
  prisma.deferredServiceAllocation.findMany({take:100,orderBy:{createdAt:"desc"},include:{plan:{select:{id:true,label:true,kind:true,target:true,state:true,endsAt:true}}}})
 ]);
 return {plans:plans.map(({allocations,...p})=>({...p,remaining:p.capacity-consumedCapacity(allocations,now)})),tickets:tickets.flatMap(t=>{const x=decodeReviewTicket(t);return x?[{id:t.id,...x}]:[]}),allocations:allocations.map(a=>({...dto(a,now),ticketId:a.ticketId,plan:a.plan,reissuable:canReissueReview(a,a.plan,now)}))};
}
export async function customerPlanningView(userId:string){
 const rows=await prisma.deferredServiceAllocation.findMany({where:{userId},take:100,orderBy:{createdAt:"desc"},include:{plan:{select:{label:true,kind:true,target:true,startsAt:true,endsAt:true,state:true}},receipts:{select:{units:true,occurredAt:true,createdAt:true},orderBy:{occurredAt:"asc"}}}});
 return {allocations:rows.map(a=>({...dto(a),plan:a.plan,progress:a.receipts}))};
}

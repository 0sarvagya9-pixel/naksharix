import {SERVICES} from "@/lib/deferred-services/contract";
const object=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==="object"&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==="string"&&v.trim().length>0;
const str=(v:unknown):v is string=>typeof v==="string";
const positive=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>0;
const date=(v:unknown):v is string=>text(v)&&Number.isFinite(Date.parse(v));
const kind=(v:unknown)=>SERVICES.some(s=>s.kind===v);
const unique=(rows:{id:string}[])=>new Set(rows.map(r=>r.id)).size===rows.length;
export type Allocation={id:string;units:number;completedUnits:number;state:string;version:number;holdUntil:string;acceptedAt?:string|null};
export type CustomerAllocation=Allocation&{plan:{label:string;kind:string;target:string;startsAt:string;endsAt:string};progress:{units:number;occurredAt:string}[]};
export type Plan={id:string;label:string;kind:string;target:string;state:string;capacity:number;remaining:number;startsAt:string;endsAt:string;providerRef:string;evidenceRef:string;termsRef:string};
export type Ticket={id:string;kind:string;target:string;units:number;preferredDate:string};
export type AdminAllocation=Allocation&{ticketId:string;plan:{id:string;label:string;kind:string;target:string;state:string;endsAt:string};reissuable:boolean};
export type PlanningView={plans:Plan[];tickets:Ticket[];allocations:AdminAllocation[]};
function allocation(v:unknown):v is Allocation&Record<string,unknown>{return object(v)&&text(v.id)&&positive(v.units)&&Number.isSafeInteger(v.completedUnits)&&Number(v.completedUnits)>=0&&Number(v.completedUnits)<=Number(v.units)&&["HELD","ACCEPTED","PARTIAL","COMPLETED","CANCELED","EXPIRED"].includes(String(v.state))&&positive(v.version)&&date(v.holdUntil);}
function plan(v:unknown):v is Plan&Record<string,unknown>{return object(v)&&text(v.id)&&text(v.label)&&kind(v.kind)&&str(v.target)&&["DRAFT","REVIEWED","CLOSED"].includes(String(v.state))&&positive(v.capacity)&&date(v.startsAt)&&date(v.endsAt)&&Date.parse(v.startsAt)<Date.parse(v.endsAt)&&text(v.providerRef)&&text(v.evidenceRef)&&text(v.termsRef);}
export function readCustomerAllocations(value:unknown):CustomerAllocation[]|null{
 if(!object(value)||!Array.isArray(value.allocations)||!value.allocations.every(v=>allocation(v)&&object(v.plan)&&text(v.plan.label)&&kind(v.plan.kind)&&str(v.plan.target)&&date(v.plan.startsAt)&&date(v.plan.endsAt)&&Array.isArray(v.progress)&&v.progress.every(p=>object(p)&&positive(p.units)&&date(p.occurredAt))))return null;
 return unique(value.allocations)?value.allocations as CustomerAllocation[]:null;
}
export function readPlanningView(value:unknown):PlanningView|null{
 if(!object(value)||!Array.isArray(value.plans)||!Array.isArray(value.tickets)||!Array.isArray(value.allocations))return null;
 if(!value.plans.every(v=>plan(v)&&Number.isSafeInteger(v.remaining)&&Number(v.remaining)>=0&&Number(v.remaining)<=v.capacity))return null;
 if(!value.tickets.every(v=>object(v)&&text(v.id)&&kind(v.kind)&&str(v.target)&&positive(v.units)&&str(v.preferredDate)))return null;
 if(!value.allocations.every(v=>allocation(v)&&text(v.ticketId)&&typeof v.reissuable==="boolean"&&object(v.plan)&&text(v.plan.id)&&text(v.plan.label)&&kind(v.plan.kind)&&str(v.plan.target)&&["DRAFT","REVIEWED","CLOSED"].includes(String(v.plan.state))&&date(v.plan.endsAt)))return null;
 return unique(value.plans)&&unique(value.tickets)&&unique(value.allocations)?value as PlanningView:null;
}
// Contains only the submitted action and its identity/version fields. Added by
// routes after the original locked ledger operation succeeds.
export function planningAcknowledgement(input:Record<string,unknown>){const ack:Record<string,unknown>={action:input.action};for(const key of ["planId","ticketId","allocationId","version","mutationId","operationId"])if(input[key]!==undefined)ack[key]=input[key];return ack;}
export function planningRecorded(value:unknown,input:Record<string,unknown>){
 if(!object(value)||!object(value.acknowledgement))return false;
 const expected=planningAcknowledgement(input),ack=value.acknowledgement;
 if(!Object.entries(expected).every(([k,v])=>ack[k]===v))return false;
 if(["CREATE_PLAN","REVIEW_PLAN","CLOSE_PLAN"].includes(String(input.action))){
  if(!plan(value.plan))return false;
  if(input.action==="CREATE_PLAN")return ["kind","target","label","providerRef","evidenceRef","termsRef","capacity"].every(k=>value.plan&&object(value.plan)&&value.plan[k]===input[k])&&Date.parse(value.plan.startsAt)===Date.parse(String(input.startsAt))&&Date.parse(value.plan.endsAt)===Date.parse(String(input.endsAt));
  return value.plan.id===input.planId&&value.plan.state===(input.action==="REVIEW_PLAN"?"REVIEWED":"CLOSED");
 }
 if(!allocation(value.allocation)||input.allocationId!==undefined&&value.allocation.id!==input.allocationId||input.version!==undefined&&value.allocation.version<Number(input.version))return false;
 if(input.action==="CANCEL")return value.allocation.state==="CANCELED";
 if(input.action==="ACCEPT")return ["ACCEPTED","PARTIAL","COMPLETED"].includes(value.allocation.state);
 if(input.action==="REISSUE")return value.allocation.state==="HELD"&&value.allocation.version>Number(input.version);
 return ["ALLOCATE","RECORD_PROGRESS"].includes(String(input.action));
}
export function requestRecorded(value:unknown,input:Record<string,unknown>){
 return object(value)&&object(value.ticket)&&/^deferred-[a-f0-9]{64}$/.test(String(value.ticket.id))&&text(value.ticket.status)&&date(value.ticket.createdAt)&&value.requestId===input.requestId&&object(value.request)&&["kind","units","preferredDate"].every(k=>object(value.request)&&value.request[k]===input[k])&&value.request.target===String(input.target).trim()&&value.trackingPath==="/support"&&["paymentRequired","orderCreated","bookingCreated","entitlementGranted","capacityReserved","fulfillmentConfirmed"].every(k=>value[k]===false);
}

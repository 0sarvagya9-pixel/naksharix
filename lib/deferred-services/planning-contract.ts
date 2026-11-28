import {SERVICES,prepareServiceRequest,REQUEST_TERMS} from "./contract";
export const PLAN_TERMS="internal-unpaid-allocation-v1";
const STATES=["HELD","ACCEPTED","PARTIAL","COMPLETED","CANCELED"];
export type CapacityRow={units:number;completedUnits:number;state:string;holdUntil:Date};
export function consumedCapacity(rows:CapacityRow[],now:Date){
 return rows.reduce((sum,row)=>{
  if(!Number.isInteger(row.units)||!Number.isInteger(row.completedUnits)||row.units<1||row.completedUnits<0||row.completedUnits>row.units||!STATES.includes(row.state))throw Error("INVALID_CAPACITY_LEDGER");
  return sum+(row.state==="CANCELED"||(row.state==="HELD"&&row.holdUntil<=now)?row.completedUnits:row.units);
 },0);
}
export type AllocationPlanWindow={state:string;endsAt:Date};
export function visibleAllocationState(row:CapacityRow,now:Date,plan?:AllocationPlanWindow){
 return row.state==="HELD"&&(row.holdUntil<=now||(plan&&(plan.state!=="REVIEWED"||plan.endsAt<=now)))?"EXPIRED":row.state;
}
// A request can be reissued only if it has no recorded work. Completion and
// partial fulfilment are immutable at this boundary; use their original records.
export function canReissueReview(row:CapacityRow,plan:AllocationPlanWindow,now:Date){
 return row.completedUnits===0&&(row.state==="CANCELED"||visibleAllocationState(row,now,plan)==="EXPIRED");
}
export function preparePlanTarget(kind:string,target:string){
 const item=SERVICES.find(x=>x.kind===kind);
 if(!item)return null;
 return prepareServiceRequest({kind,units:item.min,target,preferredDate:"",consent:REQUEST_TERMS},"1970-01-01")?target.trim():null;
}
export function decodeReviewTicket(ticket:{id:string;subject:string;messages:unknown}){
 if(!/^deferred-[a-f0-9]{64}$/.test(ticket.id)||!Array.isArray(ticket.messages))return null;
 const first=ticket.messages[0];
 if(!first||typeof first!=="object"||Array.isArray(first)||first.author!=="USER"||typeof first.text!=="string")return null;
 const item=SERVICES.find(x=>ticket.subject==="["+x.id+" REVIEW] "+x.title);
 if(!item)return null;
 const lines=first.text.split("\n");
 if(lines.length!==6||!lines[2].startsWith(item.unit+": ")||!lines[3].startsWith("Requested destination/location: ")||!lines[4].startsWith("Preferred date (not guaranteed): "))return null;
 const units=Number(lines[2].slice(item.unit.length+2)),target=lines[3].slice("Requested destination/location: ".length),date=lines[4].slice("Preferred date (not guaranteed): ".length);
 const value={kind:item.kind,units,target:target==="Not applicable"?"":target,preferredDate:date==="Not specified"?"":date,consent:REQUEST_TERMS};
 const exact=prepareServiceRequest(value,"1970-01-01");
 return exact&&exact.subject===ticket.subject&&exact.description===first.text?value:null;
}
export function validPlanWindow(start:Date,end:Date,now:Date){
 return [start,end,now].every(d=>Number.isFinite(d.getTime()))&&end>now&&end>start&&start.getTime()>=now.getTime()-30*86400000&&end.getTime()-start.getTime()<=370*86400000;
}
export function progressState(total:number,completed:number,delta:number){
 if(![total,completed,delta].every(Number.isInteger)||total<1||completed<0||delta<1||completed+delta>total)return null;
 return {completedUnits:completed+delta,state:completed+delta===total?"COMPLETED":"PARTIAL"};
}

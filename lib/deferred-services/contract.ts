// Request bounds are anti-abuse limits, not provider capacity or approved offers.
export const SERVICES = [
  {id:"R-18",kind:"follow-up",title:"Follow-up consultations",unit:"Sessions",min:2,max:12,target:"none",review:"Provider agreement, session entitlement, availability, expiry and refund terms"},
  {id:"R-20",kind:"group-puja",title:"Group festival Puja",unit:"Participants",min:1,max:20,target:"city",review:"Verified organizer, festival date, actual capacity, individual fulfilment and refund terms"},
  {id:"R-22",kind:"annual-puja",title:"Annual Puja",unit:"Events requested",min:2,max:12,target:"city",review:"Verified partners, event calendar, per-event capacity, entitlement and cancellation"},
  {id:"R-23",kind:"chadhava",title:"Temple Chadhava",unit:"Offerings requested",min:1,max:5,target:"temple",review:"Temple agreement, authorized offering, actual service receipt and refund terms"},
  {id:"R-24",kind:"prasad",title:"Prasad delivery",unit:"Packages requested",min:1,max:10,target:"country",review:"Supplier, food safety, stock, destination eligibility, actual shipping and refund terms"},
  {id:"R-27",kind:"webinar",title:"Webinar",unit:"Seats requested",min:1,max:5,target:"none",review:"Verified host, schedule, actual seat capacity, access delivery and cancellation"},
  {id:"R-29",kind:"printed-kundli",title:"Printed Kundli",unit:"Copies requested",min:1,max:5,target:"country",review:"Print partner, print proof, actual shipping, delivery and refund terms"}
] as const;
export const REQUEST_TERMS = "deferred-service-review-v1";
export type ServiceInput = {kind:string;units:number;target:string;preferredDate:string;consent:string};
export function prepareServiceRequest(input:ServiceInput, today:string) {
  const item=SERVICES.find(s=>s.kind===input.kind);
  if(!item||!Number.isInteger(input.units)||input.units<item.min||input.units>item.max||input.consent!==REQUEST_TERMS)return null;
  const target=input.target.trim();
  if(/[\x00-\x1f\x7f<>]/.test(target)||target.length>100)return null;
  if(item.target==="none"&&target!=="")return null;
  if(item.target==="country"&&!/^[A-Z]{2}$/.test(target))return null;
  if((item.target==="city"||item.target==="temple")&&target.length<2)return null;
  if(input.preferredDate){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate))return null;
    const date=new Date(input.preferredDate+"T00:00:00Z");
    if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==input.preferredDate)return null;
  }
  const subject="["+item.id+" REVIEW] "+item.title;
  const description=[
    "UNPAID REVIEW REQUEST — no quote, payment, booking, seat, entitlement, capacity reservation or confirmed fulfilment.",
    "Request terms: "+REQUEST_TERMS,
    item.unit+": "+input.units,
    "Requested destination/location: "+(target||"Not applicable"),
    "Preferred date (not guaranteed): "+(input.preferredDate||"Not specified"),
    "Required evidence before a commercial offer: "+item.review
  ].join("\n");
  return {item,subject,description,dateAllowed:!input.preferredDate||input.preferredDate>=today};
}

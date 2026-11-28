import assert from "node:assert/strict";
import {SERVICES,REQUEST_TERMS,prepareServiceRequest} from "../lib/deferred-services/contract.ts";
let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;};
const today="2026-11-25";
check(SERVICES.map(s=>s.id).join(",")==="R-18,R-20,R-22,R-23,R-24,R-27,R-29","original ids");
for(const s of SERVICES){
  const base={kind:s.kind,units:s.min,target:s.target==="none"?"":s.target==="country"?"IN":"Delhi",preferredDate:today,consent:REQUEST_TERMS};
  check(prepareServiceRequest(base,today)?.dateAllowed,"valid request "+s.id);
  check(prepareServiceRequest({...base,units:s.max},today),"maximum");
  check(!prepareServiceRequest({...base,units:s.min-1},today),"below minimum");
  check(!prepareServiceRequest({...base,units:s.max+1},today),"above maximum");
  check(!prepareServiceRequest({...base,units:1.5},today),"fractional");
  check(!prepareServiceRequest({...base,consent:""},today),"consent");
  check(!prepareServiceRequest({...base,preferredDate:"2027-02-30"},today),"invalid date");
  check(prepareServiceRequest({...base,preferredDate:"2026-11-24"},today)?.dateAllowed===false,"past date");
  check(prepareServiceRequest({...base,preferredDate:""},today)?.dateAllowed,"optional date");
  check(prepareServiceRequest(base,today)?.description.includes("no quote, payment, booking, seat, entitlement, capacity reservation"),"commercial boundary");
  check(!prepareServiceRequest({...base,target:"<script>"},today),"unsafe target");
  check(!prepareServiceRequest({...base,target:s.target==="none"?"Delhi":""},today),"target required or forbidden");
}
check(!prepareServiceRequest({kind:"unregistered",units:1,target:"",preferredDate:"",consent:REQUEST_TERMS},today),"unknown service");
console.log("DEFERRED_SERVICE_CONTRACT_PASS "+JSON.stringify({services:SERVICES.length,checks}));

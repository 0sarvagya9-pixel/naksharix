// Internal prelaunch sensitivity model. No checkout mutation, provider call or real sales claim.
import {readFileSync,writeFileSync} from "node:fs";
function requireCondition(condition,message){if(!condition)throw Error(message)}

function readCatalogue(catalogue,mapping,paid){
 const block=catalogue.split("export const manualReports: ManualReport[] = [")[1]?.split("\n];")[0];
 requireCondition(block,"REPORT_CATALOGUE_MISSING");
 const slugs=[...block.matchAll(/\breport\("([a-z0-9-]+)"/g)].map(m=>m[1]);
 const mapBlock=mapping.split("const manualToPaidReportId: Record<string, string> = {")[1]?.split("\n};")[0];
 requireCondition(mapBlock,"REPORT_MAPPING_MISSING");
 const pairs=[...mapBlock.matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map(m=>[m[1],m[2]]);
 const ids=new Map(pairs);
 const rows=[...paid.matchAll(/\bid:\s*"([^"]+)"[\s\S]*?\bprice:\s*"INR (\d+)"[\s\S]*?\bamount:\s*(\d+),/g)].map(m=>({id:m[1],display:Number(m[2]),amount:Number(m[3])}));
 const prices=new Map(rows.map(r=>[r.id,r]));
 requireCondition(slugs.length===15&&new Set(slugs).size===15&&pairs.length===15&&ids.size===15&&prices.size===rows.length,"REPORT_CATALOGUE_INCONSISTENT");
 const result=slugs.map(slug=>{const id=ids.get(slug),p=prices.get(id);requireCondition(p&&Number.isSafeInteger(p.amount)&&p.amount>0&&p.amount<=1000000&&p.display===p.amount,"INVALID_REPORT_PRICE_"+slug);return {slug,id,pricePaise:p.amount*100}});
 requireCondition(new Set(result.map(r=>r.id)).size===15,"DUPLICATE_REPORT_PAYMENT_ID");
 return result;
}

function validateScenario(s){
 for(const k of ["gatewayBps","gatewayGstBps","outputGstBps","refundBps","reviewMinutes","reviewHourlyPaise","supportPaise","computeStorageDeliveryPaise","monthlyFixedPaise","targetMarginBps"]){
  requireCondition(Number.isSafeInteger(s[k])&&s[k]>=0&&s[k]<=100000000,"INVALID_SCENARIO_"+k);
 }
 for(const k of ["gatewayBps","gatewayGstBps","outputGstBps","refundBps","targetMarginBps"])requireCondition(s[k]<10000,"INVALID_RATE_"+k);
 requireCondition(typeof s.name==="string"&&s.name.length>0,"INVALID_SCENARIO_NAME");
 requireCondition(s.reviewMinutes<=1440,"INVALID_REVIEW_MINUTES");
}

function contribution(pricePaise,s){
 validateScenario(s);requireCondition(Number.isSafeInteger(pricePaise)&&pricePaise>0&&pricePaise<=100000000,"INVALID_PRICE");
 // Retained gross after expected refunds; GST-inclusive when the scenario
 // explicitly assumes output GST. Conservative: original gateway fee retained,
 // review and other fulfillment costs incurred even on refunded transactions.
 const retained=pricePaise*(1-s.refundBps/10000);
 const net=retained/(1+s.outputGstBps/10000);
 const fee=pricePaise*s.gatewayBps/10000*(1+s.gatewayGstBps/10000);
 const review=s.reviewMinutes*s.reviewHourlyPaise/60;
 const variable=fee+review+s.supportPaise+s.computeStorageDeliveryPaise;
 const margin=net-variable;
 return {pricePaise,retainedPaise:retained,netRevenuePaise:net,estimatedOutputTaxPaise:retained-net,gatewayFeePaise:fee,reviewPaise:review,otherVariablePaise:s.supportPaise+s.computeStorageDeliveryPaise,variablePaise:variable,contributionPaise:margin,contributionMarginBps:net>0?margin/net*10000:null,breakEvenOrders:s.monthlyFixedPaise===0?0:margin>0?Math.ceil(s.monthlyFixedPaise/margin):null};
}

function minimumPrice(s){
 validateScenario(s);
 const retainedPerPaise=(1-s.refundBps/10000)/(1+s.outputGstBps/10000);
 const feePerPaise=s.gatewayBps/10000*(1+s.gatewayGstBps/10000);
 const coefficient=retainedPerPaise*(1-s.targetMarginBps/10000)-feePerPaise;
 const fixed=s.reviewMinutes*s.reviewHourlyPaise/60+s.supportPaise+s.computeStorageDeliveryPaise;
 if(coefficient<=0)return null;
 const value=Math.max(1,Math.ceil(fixed/coefficient-1e-10));
 return value<=100000000?value:null;
}

function buildCommercialModel(rows,scenarios){
 requireCondition(rows.length===15,"EXPECTED_15_REPORTS");
 return rows.flatMap(row=>scenarios.map(s=>{
  const c=contribution(row.pricePaise,s),floor=minimumPrice(s);
  const display=Object.fromEntries(Object.entries(c).map(([k,v])=>[k,v===null?null:k==="breakEvenOrders"?v:Math.round(v*100)/100]));
  return {...row,scenario:s.name,...display,minimumPricePaise:floor,estimatedOnly:true,recommendation:floor===null?"REVIEW_UNVIABLE_ASSUMPTIONS":row.pricePaise>=floor?"HOLD_PRICE_PENDING_QUALITY_APPROVAL":"REVIEW_PRICE_OR_COST_BEFORE_LAUNCH"};
 }));
}

function selfTest(rows,scenarios){
 let checks=0;const check=(ok,msg)=>{requireCondition(ok,msg);checks++};
 const near=(a,b)=>Math.abs(a-b)<1e-7;
 const zero={...scenarios[0],gatewayBps:0,gatewayGstBps:0,refundBps:0,reviewMinutes:0,supportPaise:0,computeStorageDeliveryPaise:0,monthlyFixedPaise:0};
 check(near(contribution(10000,zero).contributionPaise,10000),"ZERO_COST_IDENTITY");
 check(contribution(10000,zero).breakEvenOrders===0,"ZERO_FIXED_BREAK_EVEN");
 const fee={...zero,gatewayBps:200,gatewayGstBps:1800};
 check(near(contribution(10000,fee).gatewayFeePaise,236),"PUBLISHED_FEE_EXAMPLE");
 check(near(contribution(10000,{...fee,gatewayBps:300}).gatewayFeePaise,354),"PUBLISHED_HIGH_FEE_EXAMPLE");
 check(near(contribution(11800,{...zero,outputGstBps:1800}).netRevenuePaise,10000),"INCLUSIVE_TAX_EXAMPLE");
 check(near(contribution(10000,{...fee,refundBps:1000}).netRevenuePaise,9000),"REFUND_EXAMPLE");
 check(contribution(10000,{...zero,supportPaise:20000,monthlyFixedPaise:10000}).breakEvenOrders===null,"NEGATIVE_MARGIN");
 check(minimumPrice({...zero,gatewayBps:5000,targetMarginBps:9000})===null,"IMPOSSIBLE_TARGET");
 for(const bad of [{...zero,refundBps:10000},{...zero,gatewayBps:-1},{...zero,outputGstBps:NaN},{...zero,reviewMinutes:1.5},{...zero,monthlyFixedPaise:Infinity}]){
  let rejected=false;try{contribution(10000,bad)}catch{rejected=true}check(rejected,"REJECT_INVALID_SCENARIO");
 }
 for(const row of rows)for(const s of scenarios){
  const x=contribution(row.pricePaise,s),floor=minimumPrice(s);
  check(near(x.netRevenuePaise+x.estimatedOutputTaxPaise,x.retainedPaise),"REVENUE_RECONCILIATION");
  check(near(x.contributionPaise+x.variablePaise,x.netRevenuePaise),"COST_RECONCILIATION");
  check(x.breakEvenOrders===null||x.breakEvenOrders*x.contributionPaise+1e-7>=s.monthlyFixedPaise,"BREAK_EVEN_SUFFICIENT");
  check(x.breakEvenOrders===null||x.breakEvenOrders===0||(x.breakEvenOrders-1)*x.contributionPaise<s.monthlyFixedPaise,"BREAK_EVEN_MINIMUM");
  check(floor!==null&&contribution(floor,s).contributionMarginBps+1e-7>=s.targetMarginBps,"PRICE_FLOOR_SUFFICIENT");
  check(floor===1||contribution(floor-1,s).contributionMarginBps<s.targetMarginBps+1e-7,"PRICE_FLOOR_MINIMUM");
  check(contribution(row.pricePaise,{...s,reviewMinutes:s.reviewMinutes+1}).contributionPaise<=x.contributionPaise,"LABOR_DOWNSIDE");
  check(contribution(row.pricePaise,{...s,refundBps:s.refundBps+1}).contributionPaise<=x.contributionPaise,"REFUND_DOWNSIDE");
 }
 return checks;
}
const scenarios=[
  {
    "name": "lean_automatic_no_output_gst_assumption",
    "gatewayBps": 200,
    "gatewayGstBps": 1800,
    "outputGstBps": 0,
    "refundBps": 300,
    "reviewMinutes": 0,
    "reviewHourlyPaise": 0,
    "supportPaise": 2500,
    "computeStorageDeliveryPaise": 500,
    "monthlyFixedPaise": 250000,
    "targetMarginBps": 6000
  },
  {
    "name": "reviewed_tax_inclusive_sensitivity",
    "gatewayBps": 200,
    "gatewayGstBps": 1800,
    "outputGstBps": 1800,
    "refundBps": 500,
    "reviewMinutes": 10,
    "reviewHourlyPaise": 60000,
    "supportPaise": 3500,
    "computeStorageDeliveryPaise": 1000,
    "monthlyFixedPaise": 500000,
    "targetMarginBps": 5000
  },
  {
    "name": "stress_tax_inclusive_high_review",
    "gatewayBps": 300,
    "gatewayGstBps": 1800,
    "outputGstBps": 1800,
    "refundBps": 1000,
    "reviewMinutes": 30,
    "reviewHourlyPaise": 100000,
    "supportPaise": 5000,
    "computeStorageDeliveryPaise": 2000,
    "monthlyFixedPaise": 1000000,
    "targetMarginBps": 4000
  }
];
const rows=readCatalogue(readFileSync("lib/manual-catalogue.ts","utf8"),readFileSync("lib/reports/checkout-catalogue.ts","utf8"),readFileSync("lib/paid-reports.ts","utf8"));
const checks=selfTest(rows,scenarios),model=buildCommercialModel(rows,scenarios);
const evidence={mode:"prelaunch_estimates_only",products:rows.length,scenarios,checks,model,actualSalesOrProfitVerified:false,taxTreatmentVerified:false,merchantSpecificFeesVerified:false,livePriceChanged:false};
if(process.env.P0_COMMERCIAL_EVIDENCE_PATH)writeFileSync(process.env.P0_COMMERCIAL_EVIDENCE_PATH,JSON.stringify(evidence,null,2)+"\n");
console.log("P0_COMMERCIAL_SENSITIVITY_PASS "+JSON.stringify({products:rows.length,scenarios:scenarios.length,checks,estimateRows:model.length,actualSalesOrProfitVerified:false,livePriceChanged:false}));

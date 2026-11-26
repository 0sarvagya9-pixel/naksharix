import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
const require=createRequire(import.meta.url),ts=require("typescript"),React=require("react");
const {renderToStaticMarkup}=require("react-dom/server");
const state={locale:"en",user:{id:"synthetic-user",role:"USER"},entitled:true,automatic:false,report:null,payment:null,paymentReads:0};
const box=tag=>function HtmlBox(props){const htmlProps={...props};delete htmlProps.asChild;return React.createElement(tag,htmlProps,props.children);};
const resolve=Module._resolveFilename,load=Module._load;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){
 if(name==="server-only")return {};
 if(name==="react")return React;
 if(name==="next/headers")return {cookies:async()=>({get:()=>({value:state.locale})})};
 if(name==="next/navigation")return {redirect:href=>{throw Error("REDIRECT:"+href);}};
 if(name==="next/link")return {__esModule:true,default:box("a")};
 if(name==="lucide-react")return new Proxy({},{get:()=>()=>null});
 if(name==="@prisma/client")return {ReportPaymentStatus:{PAID:"PAID"}};
 if(name==="@/components/ui/button")return {Button:box("span")};
 if(name==="@/components/ui/card")return {Card:box("section"),CardContent:box("div"),CardHeader:box("header"),CardTitle:box("h2")};
 if(name==="@/components/section")return {Section:box("section")};
 if(name==="@/lib/auth/jwt")return {getCurrentUser:async()=>state.user};
 if(name==="@/lib/db")return {prisma:{reportRequest:{findUnique:async()=>state.report},reportRevision:{findMany:async()=>[]},payment:{findUnique:async()=>{state.paymentReads++;return state.payment;}}}};
 if(name==="@/lib/env")return {env:{AUTO_REPORT_DELIVERY_ENABLED:"true"}};
 if(name==="@/lib/reports/paid-entitlement")return {fixedReportCheckout:()=>true,hasCurrentPaidReportEntitlement:async()=>state.entitled};
 if(name==="@/lib/reports/automatic-report-input")return {decodeAutomaticReportInput:()=>state.automatic?{}:null,needsOriginalGuardianConfirmation:()=>false,autoReportDeliveryMessage:locale=>"Synthetic pending copy "+locale};
 if(name==="@/components/report-request/automatic-report-progress")return {AutomaticReportProgress:()=>null};
 return load.call(this,name,...args);
};
for(const extension of [".ts",".tsx"])require.extensions[extension]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,file);};
globalThis.React=React;
const ReportPage=require("@/app/report-request/success/page").default;
const PaymentPage=require("@/app/payment/success/page").default;
const {reportDeliveryCopy}=require("@/lib/reports/delivery-copy"),{paymentCopy,paymentPurposeLabel}=require("@/lib/payments/customer-copy");
const {getManualReport}=require("@/lib/manual-catalogue"),{safeServerTranslation}=require("@/lib/i18n-server");
const baseReport={id:"synthetic-report",userId:"synthetic-user",reportSlug:"premium-kundli",language:"en",paymentStatus:"PAID",generatedPdfSize:100,generatedPdfBytes:new Uint8Array([1]),generatedPdfStorageKey:null,status:"READY",concern:"synthetic",deliveryStatus:"auto_email_ready",deliveryEmail:"synthetic@example.invalid",emailSentAt:null,adminBypass:false,deliveryError:null};
const basePayment={id:"synthetic-payment",userId:"synthetic-user",status:"PAID",purpose:"KUNDLI_REPORT",amount:"799.00",currency:"INR",providerPaymentId:"pay_synthetic",metadata:{reportId:"kundli-pro"},reportRequest:null};
const reportHtml=async()=>renderToStaticMarkup(await ReportPage({searchParams:Promise.resolve({id:"synthetic-report"})}));
const paymentHtml=async(params={paymentId:basePayment.id,plan:"VIP"})=>renderToStaticMarkup(await PaymentPage({searchParams:Promise.resolve(params)}));
const assertNoReportContinuation=html=>{assert.ok(!html.includes("/report-request/new?"));assert.ok(!html.includes("/report-request/success?"));assert.ok(html.includes('href="/dashboard"'));};
function assertNoInventedRequest(html,locale){
 assert.ok(!html.includes(safeServerTranslation(locale,"premiumSuccessMessage")));
 assert.ok(!html.includes(safeServerTranslation(locale,"vipSuccessMessage")));
}
let cases=0;
for(const locale of ["en","hi","hinglish"]){
 state.locale=locale;state.user={id:"synthetic-user",role:"USER"};state.entitled=true;state.automatic=false;
 const copy=reportDeliveryCopy(locale),payCopy=paymentCopy(locale);
 state.report={...baseReport,deliveryStatus:"email_sent",emailSentAt:new Date("2026-11-26T00:00:00Z")};
 let html=await reportHtml();assert.ok(html.includes(copy.sent));assert.ok(html.includes('href="/api/report-requests/synthetic-report/download"'));cases++;
 state.report={...baseReport};html=await reportHtml();assert.ok(html.includes(copy.ready));assert.ok(html.includes(copy.download));cases++;
 state.entitled=false;html=await reportHtml();assert.ok(html.includes(copy.reconciliation));assert.ok(!html.includes('/api/report-requests/synthetic-report/download'));cases++;
 state.report={...baseReport,paymentStatus:"REFUNDED"};html=await reportHtml();assert.ok(html.includes(copy.refunded));assert.ok(!html.includes('/api/report-requests/synthetic-report/download'));cases++;
 state.report={...baseReport,paymentStatus:"PENDING"};html=await reportHtml();assert.ok(html.includes(copy.manual));assert.ok(!html.includes('/api/report-requests/synthetic-report/download'));cases++;
 state.entitled=true;state.automatic=true;state.report={...baseReport,generatedPdfSize:0,generatedPdfBytes:null,deliveryError:"ARBITRARY_SERVER_TEXT",deliveryStatus:"auto_email_uncertain"};
 html=await reportHtml();assert.ok(html.includes(copy.emailUncertain));assert.ok(!html.includes("ARBITRARY_SERVER_TEXT"));assert.ok(html.includes("Synthetic pending copy "+locale));cases++;
 // A verified payment alone is not a submitted request. Its stored SKU selects
 // the correct form even if the URL claims a different plan.
 state.payment={...basePayment};html=await paymentHtml();
 assert.ok(html.includes(payCopy.paymentRecorded));assert.ok(html.includes(payCopy.reportNext));assert.ok(html.includes(payCopy.submitReport));
 assert.ok(html.includes(getManualReport("premium-kundli").name[locale]));assert.ok(html.includes(paymentPurposeLabel("KUNDLI_REPORT",locale)));
 assert.ok(html.includes('href="/report-request/new?orderId=synthetic-payment&amp;reportSlug=premium-kundli"'));assert.ok(!html.includes("plan=VIP"));assertNoInventedRequest(html,locale);cases++;
 for(const product of [{purpose:"YEARLY_REPORT",reportId:"yearly-ai",amount:"999.00",slug:"yearly-horoscope-report"},{purpose:"MATCH_REPORT",reportId:"marriage-report",amount:"699.00",slug:"couple-kundli"}]){
  state.payment={...basePayment,purpose:product.purpose,amount:product.amount,metadata:{reportId:product.reportId}};html=await paymentHtml();
  assert.ok(html.includes(getManualReport(product.slug).name[locale]));assert.ok(html.includes(`reportSlug=${product.slug}`));assert.ok(!html.includes("reportSlug=premium-kundli"));assertNoInventedRequest(html,locale);cases++;
 }
 state.payment={...basePayment,metadata:{reportId:"kundli-pro",reportRequestId:"linked-request"},reportRequest:{id:"linked-request",userId:"synthetic-user",reportSlug:"premium-kundli"}};
 html=await paymentHtml();assert.ok(html.includes(payCopy.linkedReportNext));assert.ok(html.includes(payCopy.reportStatus));assert.ok(html.includes('href="/report-request/success?id=linked-request"'));assert.ok(!html.includes("/report-request/new?"));assertNoInventedRequest(html,locale);cases++;
 // Other owned purchases get a truthful receipt and account continuation, not
 // a fixed-report form. A spoofed report ID cannot change their purpose.
 state.payment={...basePayment,purpose:"SHOP_ORDER",amount:"123.00"};html=await paymentHtml();
 assert.ok(html.includes(payCopy.paymentRecorded));assert.ok(html.includes(payCopy.purchaseNext));assert.ok(html.includes(paymentPurposeLabel("SHOP_ORDER",locale)));assert.ok(html.includes("INR 123.00"));assertNoReportContinuation(html);assertNoInventedRequest(html,locale);cases++;
 state.payment={...basePayment,purpose:"SUBSCRIPTION",amount:"499.00",metadata:{plan:"PREMIUM"}};html=await paymentHtml();
 assert.ok(html.includes(`Premium · ${paymentPurposeLabel("SUBSCRIPTION",locale)}`));assert.ok(!html.includes("VIP"));assertNoReportContinuation(html);assertNoInventedRequest(html,locale);cases++;
 state.payment={...basePayment,purpose:"SUBSCRIPTION",metadata:{}};html=await paymentHtml();
 assert.ok(html.includes(paymentPurposeLabel("SUBSCRIPTION",locale)));assert.ok(!html.includes("Premium")&&!html.includes("VIP"));assertNoReportContinuation(html);cases++;
 // Admin access is a separate no-charge page and never reads an arbitrary
 // payment ID supplied in its query string.
 state.user={id:"synthetic-user",role:"ADMIN"};state.payment=null;state.paymentReads=0;
 html=await paymentHtml({mode:"admin",plan:"VIP"});assert.ok(html.includes(payCopy.adminTitle));assert.ok(html.includes(payCopy.adminNoPayment));
 assert.ok(!html.includes(payCopy.verifiedTitle));assert.ok(!html.includes(payCopy.verifiedPayment));assert.ok(!html.includes(payCopy.paymentRecorded));assert.equal(state.paymentReads,0);assertNoReportContinuation(html);assertNoInventedRequest(html,locale);cases++;
 state.payment={...basePayment,userId:"another-user",amount:"888888.00"};html=await paymentHtml({mode:"admin",paymentId:"foreign-payment",plan:"VIP"});
 assert.equal(state.paymentReads,0);assert.ok(!html.includes("888888.00"));assertNoReportContinuation(html);cases++;
 state.user={id:"synthetic-user",role:"USER"};await assert.rejects(()=>paymentHtml({mode:"admin"}),/REDIRECT:\/pricing/);cases++;
 for(const payment of [{...basePayment,userId:"another-user"},{...basePayment,status:"REFUNDED"},{...basePayment,status:"PENDING"},{...basePayment,providerPaymentId:null},null]){
  state.payment=payment;await assert.rejects(()=>paymentHtml(),/REDIRECT:\/dashboard/);cases++;
 }
 state.user=null;await assert.rejects(()=>paymentHtml(),/REDIRECT:\/login/);cases++;state.user={id:"synthetic-user",role:"USER"};
 // An unmatched price, saved-chart context, dangling request binding or foreign
 // relation must not be advertised as an eligible new personalized report.
 for(const payment of [
  {...basePayment,metadata:{}},
  {...basePayment,metadata:[]},
  {...basePayment,amount:"1.00"},
  {...basePayment,purpose:"YEARLY_REPORT"},
  {...basePayment,metadata:{reportId:"kundli-pro",savedReportId:"saved-chart"}},
  {...basePayment,metadata:{reportId:"kundli-pro",reportRequestId:"missing-request"}},
  {...basePayment,reportRequest:{id:"foreign-request",userId:"another-user",reportSlug:"premium-kundli"}},
  {...basePayment,reportRequest:{id:"other-product-request",userId:"synthetic-user",reportSlug:"couple-kundli"}}
 ]){
  state.payment=payment;html=await paymentHtml();assert.ok(html.includes(payCopy.paymentRecorded));assert.ok(html.includes(payCopy.purchaseNext));assertNoReportContinuation(html);assertNoInventedRequest(html,locale);cases++;
 }
}
console.log("CUSTOMER_STATUS_PAGES_PASS "+JSON.stringify({locales:3,cases,scope:"actual server page rendering and copy; isolated identity, database and entitlement decisions; no-charge admin, stored purchase SKU/plan, linked-request and generic receipt continuations, private download visibility and ownership redirects; no real PDF/payment/provider acceptance"}));

import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import path from "node:path";
const require=createRequire(import.meta.url),ts=require("typescript");
const {chromium}=require("playwright"),{expect}=require("@playwright/test");
const files=[
 "components/razorpay-checkout-button.tsx","components/payment-history.tsx","components/report-request/automatic-report-progress.tsx",
 "components/ui/site-notification-center.tsx","components/language-provider.tsx","lib/i18n.ts","lib/i18n-safe-overrides.ts","lib/i18n-copy.ts",
 "lib/payments/customer-copy.ts","lib/payments/client-checkout-contract.ts","lib/reports/delivery-copy.ts",
 "lib/ui/notification-copy.ts","lib/ui/site-notification.ts","lib/security/csrf.ts","lib/puja/fee-terms.ts","lib/auth/permissions.ts",
 "lib/reports/checkout-catalogue.ts","lib/paid-reports.ts","lib/manual-catalogue.ts","lib/shop/real-photo-seeds.ts","lib/shop/market-price-seeds.ts"
];
const modules=files.map(file=>{
 const compiled=ts.transpileModule(readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 return JSON.stringify("@/"+file.replace(/\.tsx?$/,""))+":function(module,exports,require){"+compiled+"}";
}).join(",");
const bundle=`(()=>{
const modules={${modules}},cache={};
const box=tag=>props=>React.createElement(tag,props,props.children);
const router={push:to=>window.caseState.pushes.push(to),refresh:()=>window.caseState.refreshes.push({cookie:document.cookie,language:document.documentElement.lang})};
function require(name){
 if(name==='react')return React;
 if(name==='react-dom')return ReactDOM;
 if(name==='next/navigation')return {useRouter:()=>router};
 if(name==='next/link')return {__esModule:true,default:box('a')};
 if(name==='lucide-react')return new Proxy({},{get:()=>()=>null});
 if(name==='@/components/ui/button')return {Button:box('button')};
 if(name==='@/components/ui/card')return {Card:box('section'),CardHeader:box('header'),CardContent:box('div'),CardTitle:box('h2')};
 if(name==='@/lib/analytics/google-client')return {googleAnalyticsSession:()=>undefined};
 if(cache[name])return cache[name].exports;
 if(!modules[name])throw Error('Unconfigured browser dependency '+name);
 const module={exports:{}};cache[name]=module;modules[name](module,module.exports,require);return module.exports;
}
function Subject(){
 const {locale,setLocale}=require('@/components/language-provider').useLanguage();window.changeLocale=setLocale;
 const selected=window.caseState.view;
 const component=selected==='history'?React.createElement(require('@/components/payment-history').PaymentHistory):
 selected==='retry'?React.createElement(require('@/components/report-request/automatic-report-progress').AutomaticReportProgress,{id:'synthetic-report',pending:false,canRetry:true}):
 selected==='notice'?null:React.createElement(require('@/components/razorpay-checkout-button').RazorpayCheckoutButton,{payload:window.caseState.payload,onVerified:async id=>{window.caseState.verified.push(id);if(window.caseState.verifiedError)throw Error('isolated consumer failure');}});
 return React.createElement(React.Fragment,null,React.createElement('span',{'data-locale':true},locale),React.createElement('div',{'data-subject':true},component),React.createElement(require('@/components/ui/site-notification-center').SiteNotificationCenter));
}
let root;
window.mountCase=input=>{
 if(root)root.unmount();
 document.cookie='naksharix-language='+input.locale+'; path=/';document.cookie='naksharix_csrf=synthetic-token; path=/';localStorage.setItem('naksharix-language',input.locale);document.documentElement.lang=input.locale==='hi'?'hi':input.locale==='hinglish'?'hi-Latn':'en';
 window.caseState={...input,requests:[],pushes:[],refreshes:[],verified:[],checkout:null,openCount:0};
 window.fetch=async(url,options={})=>{
  const body=options.body?JSON.parse(options.body):undefined;window.caseState.requests.push({url,body,method:options.method??'GET'});
  const reply=window.caseState.responses[url];if(reply?.networkError)throw Error('isolated transport failure');if(!reply)throw Error('Unconfigured isolated request '+url);
  return new Response(reply.raw===undefined?JSON.stringify(reply.body):reply.raw,{status:reply.status??200,headers:{'Content-Type':'application/json'}});
 };
 window.Razorpay=class{constructor(options){window.caseState.checkout=options;}open(){window.caseState.openCount++;}on(event,fn){window.caseState.gatewayFailure=fn;}};
 root=ReactDOM.createRoot(document.getElementById('root'));
 root.render(React.createElement(require('@/components/language-provider').LanguageProvider,{initialLocale:input.locale},React.createElement(Subject)));
};
window.copyFor=locale=>({payment:require('@/lib/payments/customer-copy').paymentCopy(locale),report:require('@/lib/reports/delivery-copy').reportDeliveryCopy(locale),notice:require('@/lib/ui/notification-copy').notificationCopy(locale)});
window.apiCall=async(url,options)=>{try{await require('@/lib/security/csrf').secureFetch(url,options);}catch{}};
window.defaultNotice=()=>require('@/lib/ui/site-notification').siteNotice.warning('Synthetic body');
window.currentLocale=()=>require('@/lib/i18n-copy').currentClientLocale();
})()`;
const order={data:{keyId:"rzp_test_synthetic",paymentId:"synthetic-payment",order:{id:"order_synthetic",amount:30000,currency:"INR"},item:{name:"Synthetic purchase",amount:300}}};
const payment={id:"synthetic-payment",providerOrderId:"order_synthetic",providerPaymentId:"pay_synthetic",provider:"RAZORPAY",purpose:"AI_CREDITS",amount:"300.00",currency:"INR",status:"PAID"};
const callback={razorpay_order_id:"order_synthetic",razorpay_payment_id:"pay_synthetic",razorpay_signature:"synthetic-not-a-provider-signature"};
const payload={purpose:"AI_CREDITS",intent:"23edb317-aa98-444f-9f22-6e4876d6044c",version:"synthetic",units:10,pricePaise:30000,termsVersion:"ai-credit-response-v1"};
const responses={"/api/auth/me":{body:{data:{user:{id:"synthetic-user",role:"USER"}}}},"/api/payments/razorpay/order":{body:order},"/api/payments/razorpay/verify":{body:{data:{payment}}}};
const browser=await chromium.launch({headless:true,args:["--no-sandbox"],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const page=await browser.newPage();const errors=[];page.on("pageerror",error=>errors.push(error.message));
await page.route("**/*",route=>route.fulfill({status:200,contentType:"text/html",body:'<!doctype html><html><body><div id="root"></div></body></html>'}));
let cases=0;
async function mount(locale,view="checkout",overrides={},extra={}){
 await page.evaluate(input=>window.mountCase(input),{locale,view,payload,responses:{...responses,...overrides},...extra});
 await expect(page.locator("[data-locale]")).toHaveText(locale);await expect(page.locator('[data-site-notifications-ready="true"]')).toHaveCount(1);
}
const subject=page.locator("[data-subject]");
async function start(){await subject.locator("button").first().evaluate(button=>{button.click();button.click();});}
async function confirm(reply=callback){await expect.poll(()=>page.evaluate(()=>window.caseState.openCount)).toBe(1);await page.evaluate(async data=>{await Promise.all([window.caseState.checkout.handler(data),window.caseState.checkout.handler(data)]);},reply);}
async function locked(expected){await expect(subject.locator('[aria-live="polite"]')).toHaveText(expected);await expect(subject.locator("button").first()).toBeDisabled();assert.deepEqual(await page.evaluate(()=>window.caseState.verified),[]);}
try{
 await page.goto("https://customer-ui.test/");
 await page.addScriptTag({path:path.join(path.dirname(require.resolve("react/package.json")),"umd/react.development.js")});
 await page.addScriptTag({path:path.join(path.dirname(require.resolve("react-dom/package.json")),"umd/react-dom.development.js")});
 await page.addScriptTag({content:bundle});
 for(const locale of ["en","hi","hinglish"]){
  const copy=await page.evaluate(l=>window.copyFor(l),locale);
  for(const reply of [{body:null},{body:{data:{}}},{body:{...order,data:{...order.data,order:{...order.data.order,amount:30100}}}},{networkError:true},{status:409,body:{error:"ARBITRARY_SERVER_TEXT"}}]){
   await mount(locale,"checkout",{"/api/payments/razorpay/order":reply});await start();await locked(reply.networkError?copy.payment.networkPending:copy.payment.pending);
   assert.equal(await page.evaluate(()=>window.caseState.requests.filter(r=>r.url==='/api/payments/razorpay/order').length),1);assert.equal(await page.evaluate(()=>window.caseState.openCount),0);cases++;
  }
  for(const value of [null,{data:{}},{data:{payment:{...payment,status:"PENDING"}}},{data:{payment:{...payment,amount:"301.00"}}}]){
   await mount(locale,"checkout",{"/api/payments/razorpay/verify":{body:value}});await start();await confirm();await locked(copy.payment.confirmationPending);cases++;
  }
  await mount(locale);await start();await confirm({...callback,razorpay_order_id:"order_other"});await locked(copy.payment.pending);
  assert.equal(await page.evaluate(()=>window.caseState.requests.filter(r=>r.url==='/api/payments/razorpay/verify').length),0);cases++;
  await mount(locale);await start();await confirm();await expect(subject.locator('[aria-live="polite"]')).toHaveText(copy.payment.verified);
  assert.deepEqual(await page.evaluate(()=>window.caseState.verified),["synthetic-payment"]);assert.equal(await page.evaluate(()=>window.caseState.requests.filter(r=>r.url==='/api/payments/razorpay/verify').length),1);cases++;
  await mount(locale,"checkout",{}, {verifiedError:true});await start();await confirm();await expect(subject.locator('[aria-live="polite"]')).toHaveText(copy.payment.verifiedReview);cases++;

  const rows=[{id:"pending-1",purpose:"KUNDLI_REPORT",status:"PENDING",amount:"699",currency:"INR",metadata:{reportId:"kundli-pro"}},
   {id:"paid-2",purpose:"KUNDLI_REPORT",status:"PAID",amount:"699",currency:"INR",metadata:{reportId:"kundli-pro"}},
   {id:"paid-3",purpose:"KUNDLI_REPORT",status:"PAID",amount:"699",currency:"INR",metadata:{reportId:"kundli-pro"},reportRequest:{id:"request-3"},invoice:{id:"invoice-3"}},
   {id:"refund-4",purpose:"KUNDLI_REPORT",status:"REFUNDED",amount:"699",currency:"INR",metadata:{reportId:"kundli-pro"}}];
  await mount(locale,"history",{"/api/payments/history":{body:{data:{payments:rows}}}});
  await expect(subject.getByRole("heading",{name:copy.payment.history})).toBeVisible();
  await expect(subject.getByRole("link",{name:copy.payment.resume})).toHaveAttribute("href","/reports/premium-kundli");
  await expect(subject.getByRole("link",{name:copy.payment.completeReport})).toHaveAttribute("href","/report-request/new?plan=PREMIUM&reportSlug=premium-kundli&orderId=paid-2");
  await expect(subject.getByRole("link",{name:copy.payment.reportStatus})).toHaveAttribute("href","/report-request/success?id=request-3");
  await expect(subject.getByRole("link",{name:copy.payment.receipt})).toHaveAttribute("href","/api/invoices/invoice-3");cases++;
  await mount(locale,"history",{"/api/payments/history":{status:503,body:{error:"ARBITRARY_SERVER_TEXT"}}});await expect(subject.getByRole("status")).toHaveText(copy.payment.loadFailed);await expect(subject.getByText(copy.payment.empty,{exact:true})).toHaveCount(0);cases++;

  for(const [response,key] of [[{body:{data:{queued:true}}},"queued"],[{body:{data:{}}},"retryUnavailable"],[{status:409,body:{error:"ARBITRARY_SERVER_TEXT"}},"retryNotEligible"],[{status:503,body:{error:"ARBITRARY_SERVER_TEXT"}},"retryPaused"]]){
   await mount(locale,"retry",{"/api/report-requests/synthetic-report/retry":response});await subject.getByRole("button",{name:copy.report.retry}).click();await expect(subject.getByRole("status")).toHaveText(copy.report[key]);
   assert.equal(await page.evaluate(()=>window.caseState.refreshes.length),key==="queued"?1:0);await expect(page.getByText("ARBITRARY_SERVER_TEXT",{exact:false})).toHaveCount(0);cases++;
  }

  await mount(locale,"notice",{"/api/payments/razorpay/verify":{status:422,body:{error:"ARBITRARY_SERVER_TEXT"}}});
  await page.evaluate(()=>window.apiCall('/api/payments/razorpay/verify',{method:'POST'}));await expect(page.getByRole("status")).toContainText(copy.notice.verificationError);
  await expect(page.getByRole("button",{name:copy.notice.dismiss})).toBeVisible();await expect(page.getByText(copy.notice.closes,{exact:true})).toBeVisible();await expect(page.getByText("ARBITRARY_SERVER_TEXT",{exact:false})).toHaveCount(0);cases++;
  await mount(locale,"notice",{"/api/report-requests":{body:{data:{id:"synthetic"}}}});await page.evaluate(()=>window.apiCall('/api/report-requests',{method:'POST',silent:true}));await expect(page.locator('[data-notification-region]')).toHaveCount(0);cases++;
  await mount(locale,"notice");await page.evaluate(()=>window.defaultNotice());await expect(page.getByRole("status")).toContainText(copy.notice.review);cases++;
 }
 await mount("en","checkout",{"/api/payments/razorpay/order":{body:null}});await start();
 assert.equal(await page.evaluate(()=>window.caseState.refreshes.length),0,"hydration must not refresh");
 await page.evaluate(()=>window.changeLocale('hi'));await expect(page.locator('[data-locale]')).toHaveText('hi');
 const hindi=await page.evaluate(()=>window.copyFor('hi'));await expect(subject.locator('[aria-live="polite"]')).toHaveText(hindi.payment.pending);
 let refreshes=await page.evaluate(()=>window.caseState.refreshes);assert.equal(refreshes.length,1);assert.match(refreshes[0].cookie,/naksharix-language=hi(?:;|$)/);assert.equal(refreshes[0].language,'hi');
 await page.evaluate(()=>window.changeLocale('hi'));assert.equal(await page.evaluate(()=>window.caseState.refreshes.length),1);
 await page.evaluate(()=>window.dispatchEvent(new StorageEvent('storage',{key:'naksharix-language',newValue:'hinglish'})));await expect(page.locator('[data-locale]')).toHaveText('hinglish');assert.equal(await page.evaluate(()=>window.caseState.refreshes.length),1);cases++;
 await mount('en');await start();await expect.poll(()=>page.evaluate(()=>window.caseState.openCount)).toBe(1);await page.evaluate(()=>window.changeLocale('hi'));await expect(page.locator('[data-locale]')).toHaveText('hi');await confirm();await expect(page.getByRole('status')).toContainText(hindi.payment.verifiedNotice);cases++;
 await mount('en','notice');assert.equal(await page.evaluate(()=>{document.cookie='naksharix-language=unsupported; path=/';document.documentElement.lang='en';return window.currentLocale();}),'en');
 assert.equal(await page.evaluate(()=>{document.documentElement.lang='hi';return window.currentLocale();}),'hi');cases++;
 assert.deepEqual(errors,[]);
 console.log('CUSTOMER_LOCALIZATION_UI_PASS '+JSON.stringify({locales:3,cases,browser:'Chromium',scope:'actual checkout/history/retry/language/notification components and contract validators; isolated transport, router and gateway; no real payment, email or production acceptance'}));
}finally{await browser.close();}

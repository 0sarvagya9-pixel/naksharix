import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createRequire} from "node:module";
import {execFileSync} from "node:child_process";
import path from "node:path";
const require=createRequire(import.meta.url),ts=require("typescript");
const {chromium}=require("playwright"),{expect}=require("@playwright/test");
const baseline=process.env.CONSULTATION_UI_BASELINE;
if(baseline&&!/^[a-f0-9]{7,40}$/.test(baseline))throw Error("Use an immutable local Git revision");
const files=["components/consultation-request-form.tsx","components/ui/input.tsx","components/ui/label.tsx","components/ui/textarea.tsx","lib/i18n.ts","lib/form-validation.ts","lib/consultations/booking-copy.ts","lib/payments/client-checkout-contract.ts"];
const modules=files.map(file=>{
 const source=baseline&&file===files[0]?execFileSync("git",["show",baseline+":"+file],{encoding:"utf8"}):readFileSync(file,"utf8");
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 return JSON.stringify("@/"+file.replace(/\.tsx?$/,""))+":function(module,exports,require){"+compiled+"}";
}).join(",");
const bundle=`(()=>{
const modules={${modules}},cache={};
const box=tag=>props=>React.createElement(tag,props,props.children);
function require(name){
 if(name==='react')return React;
 if(name==='next/navigation')return {useRouter:()=>({push:to=>window.caseState.pushes.push(to)})};
 if(name==='next/link')return {__esModule:true,default:box('a')};
 if(name==='lucide-react')return {CalendarClock:()=>null};
 if(name==='@/components/ui/button')return {Button:box('button')};
 if(name==='@/components/ui/card')return {Card:box('section'),CardHeader:box('header'),CardContent:box('div'),CardTitle:box('h2')};
 if(name==='@/lib/utils')return {cn:(...items)=>items.filter(Boolean).join(' ')};
 if(name==='@/components/language-provider')return {useLanguage:()=>{const l=require('@/lib/i18n');return {locale:window.caseState.locale,tr:key=>l.t(window.caseState.locale,key),requiredMessage:l.requiredMessages[window.caseState.locale]}}};
 if(name==='@/lib/security/csrf')return {secureFetch:async(url,options)=>{
  window.caseState.requests.push({url,body:JSON.parse(options.body)});
  const reply=window.caseState.responses[url];
  if(reply?.networkError)throw Error('isolated transport failure');
  if(!reply)throw Error('Unconfigured isolated request');
  return new Response(reply.raw===undefined?JSON.stringify(reply.body):reply.raw,{status:reply.status??200,headers:{'Content-Type':'application/json'}});
 }};
 if(cache[name])return cache[name].exports;
 if(!modules[name])throw Error('Unconfigured browser dependency '+name);
 const module={exports:{}};cache[name]=module;modules[name](module,module.exports,require);return module.exports;
}
let root;
window.mountCase=(input)=>{
 if(root)root.unmount();
 window.caseState={...input,requests:[],pushes:[],checkout:null,openCount:0};
 window.Razorpay=class{constructor(options){if(input.throwCheckout)throw Error('isolated checkout unavailable');window.caseState.checkout=options;}open(){window.caseState.openCount++;}};
 root=ReactDOM.createRoot(document.getElementById('root'));
 root.render(React.createElement(require('@/components/consultation-request-form').ConsultationRequestForm,{astrologerId:'synthetic-provider',astrologerName:'Synthetic Practitioner',userEmail:'synthetic@example.invalid',userName:'Synthetic Customer',slots:[{id:'synthetic-slot',dayOfWeek:1,startTime:'10:00',endTime:'10:30',consultationType:'CHAT',isActive:true}],sessionPrice:300}));
};
window.copyFor=locale=>require('@/lib/consultations/booking-copy').consultationBookingCopy[locale];
})()`;
const directory=path.dirname(require.resolve("react/package.json"));
const domDirectory=path.dirname(require.resolve("react-dom/package.json"));
assert.ok(existsSync(path.join(directory,"umd/react.development.js")),"React 18 browser fixture is required");
const browser=await chromium.launch({headless:true,args:["--no-sandbox"],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const page=await browser.newPage();
const pageErrors=[];page.on("pageerror",e=>pageErrors.push(e.message));
await page.route("**/*",route=>route.abort());
const booking={data:{booking:{id:"synthetic-booking",paymentStatus:"PENDING",amount:"300.00"},redirectTo:"/consultation/success/synthetic-booking"}};
const order={data:{keyId:"rzp_test_synthetic",paymentId:"synthetic-payment",order:{id:"order_synthetic",amount:30000,currency:"INR"},item:{name:"Synthetic consultation",amount:300}}};
const payment={id:"synthetic-payment",providerOrderId:"order_synthetic",providerPaymentId:"pay_synthetic",provider:"RAZORPAY",purpose:"CONSULTATION",amount:"300.00",currency:"INR",status:"PAID"};
const callback={razorpay_order_id:"order_synthetic",razorpay_payment_id:"pay_synthetic",razorpay_signature:"synthetic-signature-not-a-provider-receipt"};
const responses={"/api/consultation-bookings":{body:booking},"/api/payments/razorpay/order":{body:order},"/api/payments/razorpay/verify":{body:{data:{payment}}}};
let scenarios=0,labelChecks=0;
async function mount(locale,overrides={},extra={}){await page.evaluate(args=>window.mountCase(args),{locale,responses:{...responses,...overrides},...extra});await expect(page.locator('input[name="customerName"]')).toHaveValue("Synthetic Customer");}
async function submit(){await page.locator('input[name="bookingDate"]').fill("2030-01-07");await page.locator('textarea[name="question"]').fill("Synthetic isolated consultation question.");await page.locator('form').evaluate(form=>{form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));});}
async function verify(reply=callback){await expect.poll(()=>page.evaluate(()=>window.caseState.openCount)).toBe(1);await page.evaluate(async payload=>{await Promise.all([window.caseState.checkout.handler(payload),window.caseState.checkout.handler(payload)]);},reply);}
async function pending(copy){await expect(page.getByRole("status")).toHaveText(copy.paymentPending);await expect(page.locator('form')).toHaveAttribute("aria-busy","false");await expect(page.locator('button[type="submit"]')).toBeDisabled();assert.deepEqual(await page.evaluate(()=>window.caseState.pushes),[]);}
try{
 await page.setContent('<!doctype html><html><body><main id="root"></main></body></html>');
 await page.addScriptTag({path:path.join(directory,"umd/react.development.js")});
 await page.addScriptTag({path:path.join(domDirectory,"umd/react-dom.development.js")});
 await page.addScriptTag({content:bundle});
 for(const locale of ["en","hi","hinglish"]){
  await mount(locale);
  const copy=await page.evaluate(l=>window.copyFor(l),locale);
  const fields=await page.locator('form input,form select,form textarea').evaluateAll(els=>els.map(el=>({name:el.getAttribute('name'),id:el.id,labels:el.labels?.length??0,required:el.required})));
  assert.equal(fields.length,8);assert.ok(fields.every(f=>f.id&&f.labels===1),"Every consultation field must have an associated visible label");assert.equal(new Set(fields.map(f=>f.id)).size,8);assert.equal(fields.filter(f=>f.required).length,4);labelChecks+=fields.length;
  await expect(page.getByText(copy.sessionTotal,{exact:false})).toBeVisible();
  // Force empty-field submission to exercise the component's accessible errors.
  await page.locator('input[name="customerName"]').fill("");
  await page.locator('form').evaluate(form=>form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true})));
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(3);
  assert.ok(await page.locator('[aria-invalid="true"]').evaluateAll(els=>els.every(el=>document.getElementById(el.getAttribute('aria-describedby')||'')?.getAttribute('role')==='alert')));scenarios++;

  for(const body of [null,{data:{}},{data:{...order.data,order:{...order.data.order,amount:30100}}},{data:{...order.data,order:{...order.data.order,currency:"USD"}}}]){
   await mount(locale,{"/api/payments/razorpay/order":{body}});await submit();await pending(copy);
   assert.equal(await page.evaluate(()=>window.caseState.openCount),0);assert.equal(await page.evaluate(()=>window.caseState.requests.filter(r=>r.url==='/api/consultation-bookings').length),1);scenarios++;
  }
  await mount(locale,{}, {throwCheckout:true});await submit();await pending(copy);scenarios++;
  for(const body of [null,{data:{}},{data:{payment:{...payment,status:"PENDING"}}},{data:{payment:{...payment,purpose:"SHOP_ORDER"}}},{data:{payment:{...payment,id:"another-payment"}}}]){
   await mount(locale,{"/api/payments/razorpay/verify":{body}});await submit();await verify();await pending(copy);
   assert.equal(await page.evaluate(()=>window.caseState.requests.filter(r=>r.url==='/api/payments/razorpay/verify').length),1);scenarios++;
  }
  await mount(locale);await submit();await verify({...callback,razorpay_order_id:"order_other"});await pending(copy);
  assert.equal(await page.evaluate(()=>window.caseState.requests.filter(r=>r.url==='/api/payments/razorpay/verify').length),0);scenarios++;
  await mount(locale);await submit();await verify();await expect(page.getByRole('status')).toHaveText(copy.verified);
  assert.deepEqual(await page.evaluate(()=>window.caseState.pushes),["/consultation/success/synthetic-booking"]);scenarios++;
  await mount(locale,{"/api/consultation-bookings":{body:null}});await submit();await expect(page.getByRole('status')).toHaveText(copy.incomplete);await expect(page.locator('a[href="/dashboard/bookings"]')).toBeVisible();
  assert.equal(await page.evaluate(()=>window.caseState.requests.length),1);scenarios++;
  await mount(locale,{"/api/consultation-bookings":{body:{error:"arbitrary provider text"},status:409}});await submit();await expect(page.getByRole('status')).toHaveText(copy.slotChanged);await expect(page.locator('button[type="submit"]')).toBeEnabled();scenarios++;
  await mount(locale,{"/api/consultation-bookings":{networkError:true}});await submit();await expect(page.getByRole('status')).toHaveText(copy.connection);await expect(page.locator('button[type="submit"]')).toBeDisabled();scenarios++;
 }
 assert.deepEqual(pageErrors,[]);
 console.log("CONSULTATION_REQUEST_UI_PASS "+JSON.stringify({locales:3,scenarios,labelChecks,browser:"Chromium",duplicateSubmitDenied:true,duplicateVerificationDenied:true,malformedOrderDenied:true,mismatchedPaymentDenied:true,scope:"actual React component, shared dictionaries and payment validators; isolated router, transport and Razorpay SDK; no real provider, payment or practitioner acceptance"}));
}finally{await browser.close();}

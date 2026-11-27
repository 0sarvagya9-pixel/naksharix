import assert from "node:assert/strict";
import path from "node:path";
import {createRequire} from "node:module";
import {browserModules,sourceLoader} from "./qa-browser-module-loader.mjs";
const require=createRequire(import.meta.url),{chromium}=require("playwright"),{expect}=require("@playwright/test");
const root=process.cwd(),component=path.join(root,"components/digital-package-workspace.tsx"),provider=path.join(root,"components/language-provider.tsx"),copy=path.join(root,"lib/digital-packages/customer-copy.ts"),catalogue=path.join(root,"lib/digital-packages/catalogue.ts");
const baseline=process.env.PACKAGE_UI_BASELINE;if(baseline&&!/^[a-f0-9]{7,40}$/.test(baseline))throw Error("Immutable baseline required");
const external=["react","next/navigation","next/link","@/components/ui/button","@/components/location-autocomplete","@/lib/security/csrf","@/components/razorpay-checkout-button","@/lib/utils"];
const bundle=browserModules([component,provider,copy,catalogue],external,{baseline,baselineFiles:["components/digital-package-workspace.tsx"]});
const script=`(()=>{
function externalRequire(name){
 if(name==='react')return React;
 if(name==='next/navigation')return {useRouter:()=>({refresh(){}})};
 if(name==='next/link')return {__esModule:true,default:props=>React.createElement('a',props)};
 if(name==='@/components/ui/button')return {Button:({asChild,variant,size,children,...props})=>asChild?children:React.createElement('button',props,children)};
 if(name==='@/lib/utils')return {cn:(...parts)=>parts.filter(Boolean).join(' ')};
 if(name==='@/components/location-autocomplete')return {LocationAutocomplete:({label,value,onChange,onResolvedLocation,required})=>React.createElement('label',null,label,React.createElement('input',{required,value,onChange:e=>{onChange(e.target.value);onResolvedLocation({displayName:e.target.value,latitude:28.6,longitude:77.2,timezoneOffset:5.5});}}))};
 if(name==='@/lib/security/csrf')return {secureFetch:(url,options)=>window.fetch(url,options)};
 if(name==='@/components/razorpay-checkout-button')return {RazorpayCheckoutButton:({label,payload})=>React.createElement('button',{'data-checkout':true,onClick:()=>window.caseState.checkouts.push(payload)},label)};
}
${bundle}
let uiRoot;
function ChangeLanguage(){const {setLocale}=actualRequire(${JSON.stringify(provider)}).useLanguage();window.changePackageLocale=setLocale;return null;}
window.packageCopy=locale=>actualRequire(${JSON.stringify(copy)}).packageCustomerCopy(locale);
window.packageTitle=(key,locale)=>actualRequire(${JSON.stringify(copy)}).packageTitle(key,locale);
window.packageDefinitions=actualRequire(${JSON.stringify(catalogue)}).packageDefinitions;
window.mountPackage=input=>{
 if(uiRoot)uiRoot.unmount();document.cookie='naksharix-language='+input.locale+'; path=/';localStorage.setItem('naksharix-language',input.locale);
 window.caseState={...input,requests:[],checkouts:[],getCount:0};window.releasePackage={};
 window.fetch=async(url,options={})=>{
  const state=window.caseState,method=options.method??'GET',body=options.body?JSON.parse(options.body):undefined;state.requests.push({url,method,body,silent:options.silent});
  const response=method==='GET'?(state.getReplies?.[state.getCount++]??state.registry):state.reply;
  if(response?.hold)await new Promise(resolve=>{window.releasePackage[response.hold]=resolve;});
  if(response?.delay)await new Promise(resolve=>setTimeout(resolve,response.delay));
  if(response?.networkError)throw Error('Synthetic transport interruption');
  let reply=response?.body;
  if(response?.ack){const def=window.packageDefinitions.find(x=>x.key===body.productKey);reply={data:{clientIntent:body.clientIntent,order:{id:'synthetic-order',productKey:body.productKey,productVersion:body.version,pricePaise:body.pricePaise,status:'DRAFT',expiresAt:'2030-01-01T00:00:00Z',createdAt:'2026-11-27T00:00:00Z',items:def.kinds.map((kind,position)=>({id:'item-'+position,kind,position,status:'PENDING',attempts:0,pdfSize:null}))}}};if(response.patch)Object.assign(reply.data.order,response.patch);if(response.badIntent)reply.data.clientIntent='wrong-intent';}
  if(response?.registryAfter)state.registry=response.registryAfter;
  return new Response(response?.raw??JSON.stringify(reply),{status:response?.status??200});
 };
 uiRoot=ReactDOM.createRoot(document.getElementById('root'));uiRoot.render(React.createElement(actualRequire(${JSON.stringify(provider)}).LanguageProvider,{initialLocale:input.locale},React.createElement(React.Fragment,null,React.createElement(ChangeLanguage),React.createElement(actualRequire(${JSON.stringify(component)}).DigitalPackageWorkspace))));
};
})()`;
const load=sourceLoader(),definitions=load(catalogue).packageDefinitions;
const offers=definitions.map(d=>({...d,pricePaise:10000}));
const order={id:"synthetic-order",productKey:"astrology-workbook",productVersion:"v1",pricePaise:10000,status:"DRAFT",expiresAt:"2030-01-01T00:00:00Z",createdAt:"2026-11-27T00:00:00Z",items:[{id:"item-0",kind:"study-workbook",position:0,status:"PENDING",attempts:0,pdfSize:null}]};
const registry={body:{data:{available:true,offers,orders:[]}}};
// Exercise the actual failure-release ledger, GET selection/serialization and client reader.
// Only identity, persistence and service readiness are isolated; no provider, database or payment is used.
const retryUser='synthetic-retry-user',lease='synthetic-lease';
let item={...order.items[0],orderId:order.id,status:'GENERATING',attempts:1,leaseToken:lease,leaseUntil:new Date('2030-01-01')},ledgerCases=0;
const snapshot=()=>({...order,status:'PAID',createdAt:new Date(order.createdAt),expiresAt:new Date(order.expiresAt),items:[Object.fromEntries(Object.keys(ledger.packageOrderSelect.items.select).map(key=>[key,item[key]]))]});
const persistence={
 $queryRaw:async()=>[{ready:true}],
 digitalPackageOrder:{findFirst:async({where})=>where.id===order.id&&where.userId===retryUser?{id:order.id}:null,findMany:async({where,select,take})=>{assert.equal(where.userId,retryUser);assert.deepEqual(select,ledger.packageOrderSelect);assert.equal(take,30);return [snapshot()];}},
 digitalPackageItem:{updateMany:async({where,data})=>{if(!Object.entries(where).every(([key,value])=>item[key]===value))return {count:0};item={...item,...data};return {count:1};}}
};persistence.$transaction=async work=>work(persistence);
const actual=sourceLoader({'server-only':{},'@/lib/db':{prisma:persistence},'@/lib/env':{env:{DIGITAL_PACKAGE_SALES_ENABLED:'false'}},'@/lib/auth/jwt':{getCurrentUser:async()=>({id:retryUser})},'@/lib/payments/readiness':{getRazorpayReadiness:()=>({enabled:false})},'@/lib/storage/report-storage':{getReportStorageReadiness:()=>({enabled:false})},'@/lib/astrology/provider':{getActiveAstrologyProviderName:()=> 'own_engine'},'@/lib/calendar/reminder-readiness':{reminderServiceReady:async()=>false},'@/lib/payments/refund-evidence':{cumulativeSignedRefund:async()=>0},'@/lib/security/rate-limit':{sharedRateLimitResponse:async()=>null},'@/lib/api':{ok:data=>Response.json({data}),fail:(error,status)=>Response.json({error},{status}),handleApiError:error=>{throw error;}}});
const ledger=actual('lib/digital-packages/ledger.ts'),accountRoute=actual('app/api/digital-packages/route.ts'),{readPackageAccount}=actual('lib/digital-packages/customer-contract.ts');
async function account(){const response=await accountRoute.GET();assert.equal(response.status,200);return (await response.json()).data;}
assert.equal(readPackageAccount(await account()).orders[0].items[0].status,'GENERATING');ledgerCases++;
await ledger.releasePackageItem('other-user',order.id,item.id,lease);assert.equal(item.status,'GENERATING');ledgerCases++;
await ledger.releasePackageItem(retryUser,order.id,item.id,'other-lease');assert.equal(item.status,'GENERATING');ledgerCases++;
await ledger.releasePackageItem(retryUser,order.id,item.id,lease);assert.equal(item.status,'RETRY');assert.equal(item.leaseToken,null);const released=await account();assert.equal(readPackageAccount(released)?.orders[0].items[0].status,'RETRY','A genuine retry ledger state must remain readable');ledgerCases++;
for(const status of ['','retry','UNKNOWN_STATE']){assert.equal(readPackageAccount({...released,orders:[{...released.orders[0],items:[{...released.orders[0].items[0],status}]}]}),null);ledgerCases++;}
console.log('DIGITAL_PACKAGE_RELEASE_READER_PASS '+JSON.stringify({cases:ledgerCases,scope:'actual releasePackageItem -> GET -> JSON -> account reader; isolated persistence/identity/readiness; wrong owner and stale lease cannot release; unknown statuses rejected'}));

const browser=await chromium.launch({headless:true,args:["--no-sandbox"]}),page=await browser.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));
await page.route("**/*",r=>r.request().url()==="http://localhost:43871/"?r.fulfill({contentType:"text/html",body:'<!doctype html><html><body><div id="root"></div></body></html>'}):r.abort());
let cases=0;
async function mount(locale,extra={}){await page.evaluate(x=>window.mountPackage(x),{locale,registry,...extra});const c=await page.evaluate(l=>window.packageCopy(l),locale);await expect(page.getByRole('heading',{name:c.available,exact:true})).toBeVisible();return c;}
async function choose(c,index=5){await expect(page.getByRole('button',{name:c.prepare,exact:true})).toHaveCount(7);await page.getByRole('button',{name:c.prepare,exact:true}).nth(index).click();await page.getByLabel(c.accept,{exact:false}).check();}
async function twice(){await page.locator('form').evaluate(f=>{f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});}
async function requestCount(method){return page.evaluate(m=>window.caseState.requests.filter(x=>x.method===m).length,method);}
async function writeThenRefresh(c,action){await page.evaluate(({refresh,action})=>{const buttons=[...document.querySelectorAll('button')],refreshButton=buttons.find(b=>b.textContent===refresh);if(action)buttons.find(b=>b.textContent===action).click();else document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));refreshButton.click();},{refresh:c.refresh,action});}
try{
 await page.goto("http://localhost:43871/");await page.addScriptTag({path:path.join(path.dirname(require.resolve('react/package.json')),'umd/react.development.js')});await page.addScriptTag({path:path.join(path.dirname(require.resolve('react-dom/package.json')),'umd/react-dom.development.js')});await page.addScriptTag({content:script});
 if(baseline){await page.evaluate(x=>window.mountPackage(x),{locale:'en',registry,reply:{body:{data:{order:{}}}}});await page.getByRole('button',{name:'Prepare package',exact:true}).nth(5).click();await page.locator('form input[type="checkbox"]').check();await twice();await expect(page.locator('form')).toHaveCount(0);const observed=await page.getByRole('status').innerText();console.log('BASELINE_FALSE_SAVE_OBSERVED '+observed);assert.ok(!observed.includes('Details saved.'),'Malformed HTTP 200 must not claim a recorded draft');}
 for(const locale of ['en','hi','hinglish']){
  let c=await mount(locale);for(const def of definitions){const title=await page.evaluate(({key,locale})=>window.packageTitle(key,locale),{key:def.key,locale});await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();cases++;}
  await choose(c);await expect(page.getByText(c.englishOnly,{exact:true})).toBeVisible();cases++;
  for(const invalid of [{body:{data:{order:{}}}},{ack:true,badIntent:true},{ack:true,patch:{pricePaise:10001}},{ack:true,patch:{id:''}},{ack:true,patch:{productVersion:'v2'}},{ack:true,patch:{items:[]}},{raw:'not-json'},{networkError:true}]){
   c=await mount(locale,{reply:invalid});await choose(c);await twice();await expect(page.getByRole('status')).toHaveText(c.unknown);assert.equal(await requestCount('POST'),1);assert.equal(await page.locator('[data-checkout]').count(),0);await expect(page.getByRole('button',{name:c.retry,exact:true})).toBeVisible();cases++;
  }
  c=await mount(locale,{reply:{ack:true}});await choose(c);await twice();await expect(page.getByRole('status')).toHaveText(c.saved);assert.equal(await requestCount('POST'),1);assert.deepEqual(await page.evaluate(()=>window.caseState.checkouts),[]);cases++;
  c=await mount(locale,{reply:{networkError:true}});await choose(c);await twice();await expect(page.getByRole('status')).toHaveText(c.unknown);const original=await page.evaluate(()=>window.caseState.requests.find(x=>x.method==='POST').body);await page.evaluate(()=>window.caseState.reply={ack:true});await page.getByRole('button',{name:c.retry,exact:true}).click();await expect(page.getByRole('status')).toHaveText(c.saved);assert.deepEqual(await page.evaluate(()=>window.caseState.requests.filter(x=>x.method==='POST').at(-1).body),original);cases++;
  c=await mount(locale,{reply:{status:422,body:{error:'PRIVATE_DEBUG_SECRET'}}});await choose(c);await twice();await expect(page.getByRole('status')).toHaveText(c.rejected);await expect(page.locator('body')).not.toContainText('PRIVATE_DEBUG_SECRET');cases++;
  c=await mount(locale,{registry:{body:{data:{offers:[],orders:[]}}}});await expect(page.getByText(c.unavailable,{exact:true}).first()).toBeVisible();await expect(page.getByText(c.empty,{exact:true})).toHaveCount(0);cases++;
  for(const state of ['DRAFT','PAID']){
   const paid={...order,status:state},r={body:{data:{available:true,offers,orders:[paid]}}};c=await mount(locale,{registry:r,reply:{body:{data:state==='PAID'?{ready:false}:{canceled:false}}}});const name=state==='PAID'?c.generate:c.cancel;await page.getByRole('button',{name,exact:true}).click();await expect(page.getByRole('status')).toHaveText(c.actionUnknown);cases++;
   c=await mount(locale,{registry:r,reply:{body:{data:state==='PAID'?{ready:true}:{canceled:true}}}});await page.getByRole('button',{name,exact:true}).click();await expect(page.getByRole('status')).toHaveText(state==='PAID'?c.generated:c.canceled);cases++;
  }
  c=await mount(locale,{reply:{ack:true}});await choose(c,1);await expect(page.getByLabel(c.language,{exact:true})).toHaveValue(locale);await page.getByLabel(c.language,{exact:true}).selectOption('en');await page.getByLabel(c.name,{exact:true}).fill('Synthetic Person');await page.getByLabel(c.birthDate,{exact:true}).fill('1990-01-01');await page.getByLabel(c.birthTime,{exact:true}).fill('10:30');await page.getByLabel(c.place,{exact:true}).fill('Delhi');await page.getByLabel(c.offset,{exact:true}).fill('5.5');await page.getByLabel(c.romanName,{exact:true}).fill('Synthetic Person');await page.getByLabel(c.permission,{exact:true}).check();await twice();await expect(page.getByRole('status')).toHaveText(c.saved);assert.equal(await page.evaluate(()=>window.caseState.requests.find(x=>x.method==='POST').body.language),'en');cases++;
  const retryOrder={...order,status:'PAID',items:[{...order.items[0],status:'RETRY',attempts:1}]},retryRegistry={body:{data:{available:true,offers,orders:[retryOrder]}}};
  c=await mount(locale,{registry:retryRegistry,reply:{hold:'generate',body:{data:{ready:true}},registryAfter:{body:{data:{available:true,offers,orders:[{...retryOrder,items:[{...retryOrder.items[0],status:'READY',pdfSize:150}]}]}}}}});await expect(page.getByRole('button',{name:c.generate,exact:true})).toBeEnabled();await expect(page.getByText(c.notGenerated,{exact:true})).toBeVisible();cases++;
  await writeThenRefresh(c,c.generate);const readsDuringGeneration=await requestCount('GET');if(readsDuringGeneration!==1)console.log('PACKAGE_GENERATE_REFRESH_REGRESSION '+JSON.stringify({locale,readsDuringGeneration}));assert.equal(readsDuringGeneration,1);await page.evaluate(()=>window.releasePackage.generate());await expect(page.getByRole('status')).toHaveText(c.generated);await expect(page.getByRole('link',{name:c.download,exact:true})).toBeVisible();assert.equal(await requestCount('GET'),2,'Internal post-write reconciliation must still run');assert.equal(await requestCount('POST'),1);cases++;
  c=await mount(locale,{reply:{hold:'draft',ack:true,registryAfter:{body:{data:{available:true,offers,orders:[order]}}}}});await choose(c);await writeThenRefresh(c);assert.equal(await requestCount('GET'),1);await page.evaluate(()=>window.releasePackage.draft());await expect(page.getByRole('status')).toHaveText(c.saved);assert.equal(await requestCount('GET'),2);await expect(page.locator('[data-checkout]')).toHaveCount(1);assert.deepEqual(await page.evaluate(()=>window.caseState.checkouts),[]);cases++;
  const retryLimit={...retryOrder,items:[{...retryOrder.items[0],attempts:5}]};c=await mount(locale,{registry:{body:{data:{available:true,offers,orders:[retryLimit]}}}});await expect(page.getByText(c.needsSupport,{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:c.generate,exact:true})).toBeDisabled();cases++;
 }
 const c=await mount('en',{reply:{networkError:true}});await choose(c);await twice();await expect(page.getByRole('status')).toHaveText(c.unknown);await page.evaluate(()=>window.changePackageLocale('hi'));const hindi=await page.evaluate(()=>window.packageCopy('hi'));await expect(page.getByRole('status')).toHaveText(hindi.unknown);cases++;
 // Out-of-order read responses must not overwrite a later confirmed snapshot.
 const next={body:{data:{available:true,offers:[],orders:[]}}};await mount('en',{getReplies:[{...registry,delay:180},next]});await page.getByRole('button',{name:c.refresh,exact:true}).click();await expect(page.getByText(c.noOffers,{exact:true})).toBeVisible();await page.waitForTimeout(220);await expect(page.getByText(c.noOffers,{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:c.prepare,exact:true})).toHaveCount(0);cases++;
 assert.deepEqual(errors,[]);console.log('DIGITAL_PACKAGE_UI_PASS '+JSON.stringify({cases,locales:3,browser:'Chromium',scope:'actual component, LanguageProvider, installed Zod and package preparation; isolated transport, checkout presentation and location lookup; no real payment'}));
}finally{await browser.close();}

const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');globalThis.React=React;
let locale='en',signedIn=true,saved=true,serverCases=0;
function Box({children,...props}){return React.createElement('section',props,children);}
const server=sourceLoader({'next/headers':{cookies:async()=>({get:()=>({value:locale})})},'next/navigation':{redirect:to=>{throw Error('REDIRECT '+to);}},'@/components/section':{Section:Box},'@/components/digital-package-workspace':{DigitalPackageWorkspace:()=>null},'@/lib/auth/jwt':{getCurrentUser:async()=>signedIn?{id:'synthetic-user'}:null},'@/lib/db':{prisma:{user:{findUnique:async()=>({role:'USER',emailVerified:true})}}},'@/lib/security/rate-limit':{sharedRateLimitResponse:async()=>null},'@/lib/api':{ok:data=>Response.json({data}),fail:(error,status)=>Response.json({error},{status}),validateJson:async(r,schema)=>schema.parse(await r.json()),handleApiError:()=>Response.json({error:'INVALID'},{status:422})},'@/lib/digital-packages/ledger':{preparePackage:async()=>saved?{kind:'saved',order}:{kind:'conflict'},cancelPackageDraft:async()=>true}});
const route=server('app/api/digital-packages/route.ts'),view=server('app/digital-packages/page.tsx');
for(locale of ['en','hi','hinglish']){const c=load(copy).packageCustomerCopy(locale);assert.equal((await view.generateMetadata()).title,c.pageTitle+' | Naksharix');assert.ok(renderToStaticMarkup(await view.default()).includes(c.introduction));serverCases+=2;}
signedIn=false;await assert.rejects(()=>view.default(),/REDIRECT/);assert.equal((await route.POST(new Request('http://fixture',{method:'POST',body:'{}'}))).status,401);serverCases+=2;signedIn=true;
const draft={clientIntent:'00000000-0000-4000-8000-000000000001',productKey:'astrology-workbook',version:'v1',pricePaise:10000,termsVersion:'digital-package-v1',accepted:true,language:'en',subjects:[],names:[],question:''};
const result=await route.POST(new Request('http://fixture',{method:'POST',body:JSON.stringify(draft)}));assert.deepEqual((await result.json()).data,{order,clientIntent:draft.clientIntent});serverCases++;saved=false;assert.equal((await route.POST(new Request('http://fixture',{method:'POST',body:JSON.stringify(draft)}))).status,409);serverCases++;
console.log('DIGITAL_PACKAGE_SERVER_PASS '+JSON.stringify({cases:serverCases,scope:'actual private page and POST handler/schema; isolated identity, ledger and transport'}));

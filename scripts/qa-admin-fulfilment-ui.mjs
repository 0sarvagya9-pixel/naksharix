import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript'),{chromium}=require('playwright'),{expect}=require('@playwright/test');
const baseline=process.env.FULFILMENT_UI_BASELINE;
if(baseline&&!/^[a-f0-9]{7,40}$/.test(baseline))throw Error('Use an immutable baseline');
const changed=['components/admin-shop-orders.tsx','components/admin-puja-bookings.tsx','components/admin-consultations-content.tsx'];
const files=[...changed,'components/ui/input.tsx','components/language-provider.tsx','lib/i18n.ts','lib/i18n-safe-overrides.ts','lib/admin/fulfilment-copy.ts','lib/admin/fulfilment-contract.ts','lib/shop/shipping-rules.ts','lib/puja/partner-shortlist.ts'];
const modules=files.map(file=>{
 const source=baseline&&changed.includes(file)?execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'}):readFileSync(file,'utf8');
 return JSON.stringify('@/'+file.replace(/\.tsx?$/,''))+':function(module,exports,require){'+ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText+'}';
}).join(',');
const order={id:'synthetic-order-1',userId:'synthetic-user',items:[{sku:'synthetic-sku',quantity:1}],customerName:'Synthetic Customer',customerPhone:'0000000000',deliveryCity:'Delhi',deliveryState:'Delhi',deliveryAddress:'Synthetic private address',deliveryCountry:'IN',postalCode:'110001',shippingQuote:null,subtotalPaise:100000,shippingPaise:0,taxPaise:0,totalPaise:100000,status:'CONFIRMED',paymentStatus:'PAID',trackingReference:null,fulfillmentEvidenceUrl:null,adminNote:'',version:3,createdAt:'2026-11-26T00:00:00Z'};
const puja={id:'synthetic-puja-1',userId:'synthetic-user',topicId:'synthetic-puja',quotedPricePaise:110000,preferredDate:'2026-12-10T00:00:00Z',city:'Delhi',devoteeName:'Synthetic Devotee',gotra:null,sankalpNote:'Synthetic private note',customerPhone:'0000000000',status:'CONFIRMED',partnerId:'synthetic-pandit-1',scheduledAt:null,adminNote:'',evidenceUrl:null,version:4,createdAt:'2026-11-26T00:00:00Z'};
const partners=[{id:'synthetic-pandit-1',name:'Synthetic Pandit',region:'Delhi',traditions:['synthetic-puja']},{id:'ineligible',name:'Wrong tradition',region:'Delhi',traditions:['different-puja']}];
const booking={id:'synthetic-consultation-1',updatedAt:'2026-11-26T00:00:00.000Z',mode:'AUDIO',status:'REQUESTED',scheduledAt:'2026-11-26T23:30:00Z',durationMins:30,birthName:'Synthetic',birthDate:'1990-01-01T00:00:00Z',birthTime:'12:00',birthPlace:'Delhi',question:'Synthetic question',paymentStatus:'PAID',amount:1500,metadata:{},user:{name:'Synthetic User',email:'synthetic@example.invalid'},astrologerProfile:{displayName:'Synthetic Professional'}};
const bundle=`(()=>{const modules={${modules}},cache={};
const box=tag=>({variant,size,asChild,...props})=>asChild?props.children:React.createElement(tag,props,props.children);
function require(name){
 if(name==='react')return React;if(name==='next/link')return {__esModule:true,default:box('a')};
 if(name==='next/navigation')return {useRouter:()=>({refresh:()=>{}})};
 if(name==='@/components/section')return {Section:box('section')};if(name==='@/components/ui/button')return {Button:box('button')};
 if(name==='@/components/ui/card')return {Card:box('article'),CardContent:box('div'),CardHeader:box('header'),CardTitle:box('h2')};
 if(name==='@/lib/utils')return {cn:(...parts)=>parts.filter(Boolean).join(' ')};
 if(name==='@/lib/security/csrf')return {secureFetch:(url,options)=>window.fetch(url,options)};
 if(cache[name])return cache[name].exports;if(!modules[name])throw Error('Unconfigured dependency '+name);
 const module={exports:{}};cache[name]=module;modules[name](module,module.exports,require);return module.exports;
}
let root;
window.fulfilmentCopy=locale=>require('@/lib/admin/fulfilment-copy').fulfilmentCopy(locale);
window.mountFulfilment=input=>{
 if(root)root.unmount();document.cookie='naksharix-language='+input.locale+'; path=/';localStorage.setItem('naksharix-language',input.locale);
 window.caseState={...input,requests:[],alerts:[]};window.alert=value=>window.caseState.alerts.push(value);
 window.fetch=async(url,options={})=>{
  const method=options.method??'GET',body=options.body?JSON.parse(options.body):null,state=window.caseState;
  state.requests.push({url,method,body,silent:options.silent});
  if(method==='GET'){const registry=JSON.stringify(state.registry??{data:state.mode==='shop'?{orders:[state.order]}:{bookings:[state.puja],partners:state.partners}});if(state.deferGets)return new Promise(resolve=>(state.pendingGets??=[]).push(body=>resolve(new Response(body??registry,{status:state.getStatus??200}))));return new Response(registry,{status:state.getStatus??200});}
  await new Promise(resolve=>setTimeout(resolve,15));if(state.network)throw Error('RAW_PRIVATE_NETWORK');
  let data;
  if(url.includes('fulfilment-notification'))data={kind:body.kind,id:body.id,version:body.expectedVersion,status:body.kind==='shop'?state.order.status:state.puja.status,notification:{outcome:state.notification??'provider_accepted'}};
  else if(state.mode==='shop'){
   const row={...state.order,...body,version:body.expectedVersion+1,adminNote:body.adminNote.trim()};
   row.shippingPaise=body.shippingPaise??state.order.shippingPaise;row.taxPaise=body.taxPaise??state.order.taxPaise;row.totalPaise=row.shippingPaise!==null&&row.taxPaise!==null?row.subtotalPaise+row.shippingPaise+row.taxPaise:null;
   if(body.manualQuote)row.shippingQuote={kind:'MANUAL_QUOTE',country:row.deliveryCountry,postalCode:row.postalCode,shippingPaise:row.shippingPaise,taxPaise:row.taxPaise,carrier:body.manualQuote.carrier.trim(),dutiesMode:body.manualQuote.dutiesMode,expiresAt:body.manualQuote.expiresAt,rateVersions:[]};
   data={order:row,notification:{outcome:state.notification??'provider_accepted'}};
  }else if(state.mode==='puja')data={booking:{...state.puja,...body,partnerId:body.partnerId||state.puja.partnerId,scheduledAt:body.scheduledAt||state.puja.scheduledAt,adminNote:body.adminNote.trim(),version:body.expectedVersion+1},notification:{outcome:state.notification??'provider_accepted'}};
  else data={booking:{...state.booking,id:body.bookingId,updatedAt:new Date(Date.parse(body.expectedUpdatedAt)+1).toISOString(),status:body.status,paymentStatus:body.paymentStatus,metadata:{meetingLink:body.meetingLink,adminNote:body.adminNote}}};
  const row=data.order??data.booking??data;
  if(state.kind==='wrong-id')row.id='wrong';if(state.kind==='wrong-version')row.version=99;
  if(state.kind==='wrong-status')row.status='CANCELED';if(state.kind==='wrong-note'){if(state.mode==='consultation')row.metadata.adminNote='wrong';else row.adminNote='wrong';}
  if(state.kind==='wrong-price'){if(state.mode==='shop')row.totalPaise=1;else row.quotedPricePaise=1;}
  if(state.kind==='wrong-partner')row.partnerId='wrong';if(state.kind==='wrong-payment')row.paymentStatus='FREE';
  if(state.kind==='wrong-quote')row.shippingQuote.carrier='wrong';if(state.kind==='wrong-outcome')data.notification.outcome='invented';
  if(state.kind==='wrong-timestamp')row.updatedAt=state.booking.updatedAt;if(state.kind==='invalid')data={};
  return new Response(JSON.stringify(state.status&&state.status!==200?{error:'RAW_PRIVATE_ERROR'}:{data}),{status:state.status??200});
 };
 const component=require(input.mode==='shop'?'@/components/admin-shop-orders':input.mode==='puja'?'@/components/admin-puja-bookings':'@/components/admin-consultations-content');
 const content=input.mode==='shop'?React.createElement(component.AdminShopOrders):input.mode==='puja'?React.createElement(component.AdminPujaBookings):React.createElement(component.AdminConsultationsContent,{initialBookings:input.unavailable?[]:[input.booking],initialAvailable:!input.unavailable});
 root=ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(require('@/components/language-provider').LanguageProvider,{initialLocale:input.locale},content));
};})();`;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({timezoneId:'America/Los_Angeles'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.route('**/*',route=>route.request().url()==='https://naksharix-fulfilment.test/'?route.fulfill({contentType:'text/html',body:'<!doctype html><div id="root"></div>'}):route.abort());
let cases=0;
async function mount(mode,locale,extra={}){await page.evaluate(input=>window.mountFulfilment(input),{mode,locale,order,puja,booking,partners,...extra});const c=await page.evaluate(l=>window.fulfilmentCopy(l),locale);await expect(page.getByRole('heading',{level:1})).toHaveText(mode==='shop'?c.shopTitle:mode==='puja'?c.pujaTitle:c.consultationTitle);return c;}
async function mutations(method){return page.evaluate(m=>window.caseState.requests.filter(r=>r.method===m),method);}
async function twiceForm(){await page.locator('form').evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});}
async function manage(mode,c){await page.getByRole('button',{name:mode==='shop'?c.manageOrder:c.managePuja,exact:true}).click();await page.getByLabel(mode==='shop'?c.ownerNotes:c.coordinatorNote,{exact:true}).fill('Genuine evidence must be recorded here.');}
async function alert(c,key='unconfirmed'){await expect(page.getByRole('alert')).toContainText(c[key]);assert.ok(!(await page.locator('body').innerText()).includes('RAW_PRIVATE'));}
async function saved(c,key,email='providerAccepted'){await expect(page.getByRole('status')).toHaveText(c[key]+' '+c[email]);}
try{
 await page.goto('https://naksharix-fulfilment.test/');await page.addScriptTag({path:path.join(path.dirname(require.resolve('react/package.json')),'umd/react.development.js')});await page.addScriptTag({path:path.join(path.dirname(require.resolve('react-dom/package.json')),'umd/react-dom.development.js')});await page.addScriptTag({content:bundle});
 if(baseline){
  await page.evaluate(input=>window.mountFulfilment(input),{mode:'shop',locale:'en',order,puja,booking,partners,kind:'wrong-id'});
  await page.getByRole('button',{name:'Manage order',exact:true}).click();await twiceForm();await expect(page.getByRole('status')).toContainText('Order status saved');assert.equal((await mutations('PATCH')).length,2);console.log('FULFILMENT_BASELINE_MISMATCHED_ORDER_SUCCESS_AND_DUPLICATE_PATCH_REPRODUCED');
 }else for(const locale of ['en','hi','hinglish']){
  for(const mode of ['shop','puja']){
   let c=await mount(mode,locale);await manage(mode,c);await twiceForm();await saved(c,mode==='shop'?'shopSaved':'pujaSaved');const sent=await mutations('PATCH');assert.equal(sent.length,1);assert.equal(sent[0].silent,true);assert.equal(sent[0].body.expectedVersion,mode==='shop'?3:4);cases++;
   for(const kind of ['wrong-id','wrong-version','wrong-status','wrong-note','wrong-price','invalid',...(mode==='puja'?['wrong-partner']:[])]){
    c=await mount(mode,locale,{kind});await manage(mode,c);await twiceForm();await alert(c);await expect(page.getByRole('button',{name:mode==='shop'?c.saveOrder:c.savePuja,exact:true})).toBeDisabled();assert.equal((await mutations('PATCH')).length,1);
    await page.getByRole('button',{name:c.refresh,exact:true}).click();await expect(page.locator('form')).toHaveCount(0);await expect(page.getByRole('button',{name:mode==='shop'?c.manageOrder:c.managePuja,exact:true})).toBeEnabled();cases++;
   }
   for(const status of [401,403,409,422,429,500]){
    c=await mount(mode,locale,{status});await manage(mode,c);await twiceForm();await expect(page.getByRole('alert')).toBeVisible();assert.ok(!(await page.locator('body').innerText()).includes('RAW_PRIVATE'));await expect(page.locator('form')).toHaveCount(1);cases++;
   }
   c=await mount(mode,locale,{network:true});await manage(mode,c);await twiceForm();await alert(c);await expect(page.getByRole('button',{name:c.refresh,exact:true})).toBeEnabled();cases++;
   for(const [notification,key] of [['provider_accepted','providerAccepted'],['unavailable','notificationUnconfirmed'],['failed','notificationUnconfirmed'],['not_needed','notificationNotNeeded']]){
    c=await mount(mode,locale,{notification});await page.getByRole('button',{name:c.retry,exact:true}).evaluate(button=>{button.click();button.click();});await saved(c,'retryRecorded',key);const sends=await mutations('POST');assert.equal(sends.length,1);assert.deepEqual(sends[0].body,{kind:mode,id:mode==='shop'?order.id:puja.id,expectedVersion:mode==='shop'?order.version:puja.version});cases++;
   }
   for(const kind of ['wrong-id','wrong-version','wrong-outcome']){c=await mount(mode,locale,{kind});await page.getByRole('button',{name:c.retry,exact:true}).click();await alert(c);await expect(page.getByRole('button',{name:c.retry,exact:true})).toBeDisabled();cases++;}
   c=await mount(mode,locale);await manage(mode,c);await page.evaluate(()=>{window.caseState.deferGets=true;});await page.getByRole('button',{name:c.refresh,exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.caseState.pendingGets?.length??0)).toBe(1);await twiceForm();await saved(c,mode==='shop'?'shopSaved':'pujaSaved');await page.evaluate(()=>{window.caseState.pendingGets[0]();});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.getByRole('button',{name:mode==='shop'?c.manageOrder:c.managePuja,exact:true}).click();await expect(page.getByLabel(mode==='shop'?c.ownerNotes:c.coordinatorNote,{exact:true})).toHaveValue('Genuine evidence must be recorded here.');cases++;
   c=await mount(mode,locale);await expect(page.getByRole('button',{name:mode==='shop'?c.manageOrder:c.managePuja,exact:true})).toBeEnabled();await page.evaluate(()=>{window.caseState.deferGets=true;});await page.getByRole('button',{name:c.refresh,exact:true}).evaluate(button=>{button.click();button.click();});await expect.poll(()=>page.evaluate(()=>window.caseState.pendingGets?.length??0)).toBe(2);await page.evaluate(mode=>{const state=window.caseState,newest={...(mode==='shop'?state.order:state.puja),adminNote:'Newest recorded note'};state.pendingGets[1](JSON.stringify({data:mode==='shop'?{orders:[newest]}:{bookings:[newest],partners:state.partners}}));},mode);await expect(page.getByRole('button',{name:c.refresh,exact:true})).toBeEnabled();await page.evaluate(()=>window.caseState.pendingGets[0]());await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.getByRole('button',{name:mode==='shop'?c.manageOrder:c.managePuja,exact:true}).click();await expect(page.getByLabel(mode==='shop'?c.ownerNotes:c.coordinatorNote,{exact:true})).toHaveValue('Newest recorded note');cases++;
   c=await mount(mode,locale,{registry:{data:{[mode==='shop'?'orders':'bookings']:null}}});await alert(c,'unavailable');await expect(page.getByText(mode==='shop'?c.noOrders:c.noPujas,{exact:true})).toHaveCount(0);cases++;
  }
  let c=await mount('shop',locale,{order:{...order,deliveryCountry:'US',postalCode:'10001',paymentStatus:'UNPAID',status:'REQUESTED',shippingPaise:null,taxPaise:null,totalPaise:null}});await manage('shop',c);
  await page.getByLabel(c.shipping,{exact:true}).fill('123.45');await page.getByLabel(c.tax,{exact:true}).fill('6.78');await page.getByLabel(c.carrier,{exact:true}).fill('Synthetic Carrier');await page.getByLabel(c.quoteEvidence,{exact:true}).fill('SYNTHETIC-QUOTE-NOT-REAL');await page.getByLabel(c.quoteExpiry,{exact:true}).fill('2026-12-10T16:00');await page.getByLabel(c.quoteConsent,{exact:true}).check();
  await page.getByLabel(c.shipping,{exact:true}).fill('124.45');await expect(page.getByLabel(c.quoteConsent,{exact:true})).not.toBeChecked();await page.getByLabel(c.quoteConsent,{exact:true}).check();await twiceForm();await saved(c,'shopSaved');let sent=(await mutations('PATCH'))[0].body;assert.equal(sent.shippingPaise,12445);assert.equal(sent.taxPaise,678);assert.equal(sent.manualQuote.expiresAt,'2026-12-10T10:30:00.000Z');assert.equal(sent.manualQuote.confirmed,true);cases++;
  c=await mount('shop',locale,{order:{...order,deliveryCountry:'US',postalCode:'10001',paymentStatus:'UNPAID',shippingQuote:{kind:'MANUAL_QUOTE',country:'US',postalCode:'10001',shippingPaise:0,taxPaise:0,carrier:'Previously verified carrier',dutiesMode:'INCLUDED',expiresAt:'2026-12-10T10:30:00.000Z',rateVersions:[]}}});await manage('shop',c);await page.getByRole('button',{name:c.saveOrder,exact:true}).click();await saved(c,'shopSaved');assert.equal((await mutations('PATCH'))[0].body.manualQuote,undefined);cases++;
  c=await mount('puja',locale);await manage('puja',c);await expect(page.getByLabel(c.shortlist,{exact:true}).locator('option')).toHaveCount(2);await page.getByLabel(c.status,{exact:true}).selectOption('SCHEDULED');await page.getByLabel(c.ceremonyTime,{exact:true}).fill('2026-12-10T10:00:00+05:30');await page.getByLabel(c.panditConsent,{exact:true}).check();await page.getByLabel(c.ceremonyTime,{exact:true}).fill('2026-12-10T11:00:00+05:30');await expect(page.getByLabel(c.panditConsent,{exact:true})).not.toBeChecked();await page.getByLabel(c.panditConsent,{exact:true}).check();await twiceForm();await saved(c,'pujaSaved');sent=(await mutations('PATCH'))[0].body;assert.equal(sent.partnerAcceptanceConfirmed,true);assert.equal(sent.scheduledAt,'2026-12-10T11:00:00+05:30');assert.equal(sent.partnerId,puja.partnerId);cases++;
  c=await mount('consultation',locale);await expect(page.locator('body')).toContainText(c.AUDIO);await expect(page.locator('body')).toContainText(locale==='hi'?'27 नव॰ 2026, 5:00 am':'27 Nov 2026, 5:00 am');await page.getByLabel(c.bookingStatus+' — '+booking.id,{exact:true}).selectOption('ACCEPTED');await page.getByLabel(c.meeting+' — '+booking.id,{exact:true}).fill('https://meet.google.com/abc-defg-hij');await page.getByLabel(c.adminNote+' — '+booking.id,{exact:true}).fill('Recorded synthetic note');await page.getByRole('button',{name:c.save,exact:true}).evaluate(button=>{button.click();button.click();});await expect(page.getByRole('status')).toHaveText(c.consultationSaved);assert.equal((await mutations('POST')).length,1);assert.equal((await mutations('POST'))[0].body.expectedUpdatedAt,booking.updatedAt);await expect(page.locator('[data-saved-consultation-status]')).toContainText(c.ACCEPTED);assert.deepEqual(await page.evaluate(()=>window.caseState.alerts),[]);cases++;
  for(const kind of ['wrong-id','wrong-status','wrong-payment','wrong-note','wrong-timestamp','invalid']){c=await mount('consultation',locale,{kind});await page.getByRole('button',{name:c.save,exact:true}).click();await alert(c);await expect(page.getByRole('button',{name:c.save,exact:true})).toBeDisabled();await expect(page.locator('[data-saved-consultation-status]')).toContainText(c.REQUESTED);cases++;}
  c=await mount('consultation',locale,{network:true});await page.getByRole('button',{name:c.save,exact:true}).click();await alert(c);await expect(page.getByRole('button',{name:c.refresh,exact:true})).toBeEnabled();cases++;
  c=await mount('consultation',locale,{unavailable:true});await alert(c,'unavailable');await expect(page.getByText(c.noConsultations,{exact:true})).toHaveCount(0);cases++;
 }
 assert.deepEqual(errors,[]);if(!baseline)console.log('ADMIN_FULFILMENT_UI_PASS '+JSON.stringify({cases,locales:3,browser:'Chromium',deviceZone:'America/Los_Angeles',quoteAndDisplayZone:'Asia/Kolkata',scope:'actual Shop/Puja/consultation admin components, response readers and language provider; isolated network and presentation; no real fulfilment, payment or email'}));
}catch(error){console.log('FULFILMENT_FIXTURE_DEBUG',JSON.stringify(await page.evaluate(()=>({state:window.caseState,body:document.body.innerText}))));throw error;}finally{await browser.close();}

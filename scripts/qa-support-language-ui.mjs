import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript'),{chromium}=require('playwright'),{expect}=require('@playwright/test');
const baseline=process.env.SUPPORT_UI_BASELINE;
if(baseline&&!/^[a-f0-9]{7,40}$/.test(baseline))throw Error('Use an immutable local Git baseline');
const changed=['components/support-tickets-content.tsx','components/admin-support-content.tsx','components/support-conversation.tsx'];
const files=[...changed,'components/ui/input.tsx','components/language-provider.tsx','lib/i18n.ts','lib/i18n-safe-overrides.ts','lib/support/ui-copy.ts','lib/support/client-response.ts'];
const modules=files.map(file=>{
 const source=baseline&&changed.includes(file)?execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'}):readFileSync(file,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 return JSON.stringify('@/'+file.replace(/\.tsx?$/,''))+':function(module,exports,require){'+js+'}';
}).join(',');
const ticket={id:'synthetic-ticket-1',subject:'Synthetic help request',status:'OPEN',priority:'NORMAL',createdAt:'2026-11-25T23:30:00.000Z',messages:[{author:'USER',text:'Please review the synthetic example.',at:'2026-11-25T23:30:00.000Z'}],user:{id:'synthetic-user',name:'Synthetic User',email:'synthetic@example.invalid'}};
const bundle=`(()=>{const modules={${modules}},cache={};
const box=tag=>({variant,size,asChild,...props})=>asChild?props.children:React.createElement(tag,props,props.children);
function require(name){
 if(name==='react')return React;
 if(name==='next/link')return {__esModule:true,default:box('a')};
 if(name==='next/navigation')return {useRouter:()=>({refresh:()=>{}})};
 if(name==='@/components/section')return {Section:box('section')};
 if(name==='@/components/ui/button')return {Button:box('button')};
 if(name==='@/components/ui/card')return {Card:box('article'),CardContent:box('div'),CardHeader:box('header'),CardTitle:box('h2')};
 if(name==='@/lib/utils')return {cn:(...parts)=>parts.filter(Boolean).join(' ')};
 if(name==='@/lib/security/csrf')return {secureFetch:(url,options)=>window.fetch(url,options)};
 if(cache[name])return cache[name].exports;
 if(!modules[name])throw Error('Unconfigured dependency '+name);
 const module={exports:{}};cache[name]=module;modules[name](module,module.exports,require);return module.exports;
}
let root;
function LocaleControl(){const {setLocale}=require('@/components/language-provider').useLanguage();window.changeLocale=setLocale;return null;}
window.copyForCase=locale=>require('@/lib/support/ui-copy').supportCopy(locale);
window.mountSupport=async input=>{
 if(root)root.unmount();document.cookie='naksharix-language='+input.locale+'; path=/';localStorage.setItem('naksharix-language',input.locale);
 window.caseState={...input,requests:[],sent:0};
 window.fetch=async(url,options={})=>{
  const method=options.method??'GET',body=options.body?JSON.parse(options.body):null;
  window.caseState.requests.push({url,method,body,silent:options.silent});
  const state=window.caseState;
  if(method==='GET')return new Response(JSON.stringify(state.registry),{status:state.getStatus??200});
  await new Promise(resolve=>setTimeout(resolve,15));
  if(state.network)throw Error('RAW_PRIVATE_NETWORK');
  let data;
  if(url.endsWith('/reply'))data={ticketId:body.ticketId,recorded:true,duplicate:false,clientMutationId:body.clientMutationId,notification:state.notification??'provider_accepted'};
  else if(method==='PATCH')data={ticket:{id:body.ticketId,status:body.status,priority:body.priority,updatedAt:'2026-11-27T17:00:00Z'}};
  else data={ticket:{...state.ticket,subject:body.subject,messages:[{author:'USER',text:body.message,at:state.ticket.createdAt}]},duplicate:false,clientMutationId:body.clientMutationId};
  if(state.kind==='empty')data.ticket.id='';
  if(state.kind==='wrong-subject')data.ticket.subject='Wrong subject';
  if(state.kind==='wrong-message')data.ticket.messages[0].text='Other text';
  if(state.kind==='wrong-mutation')data.clientMutationId='wrong';
  if(state.kind==='wrong-ticket'){if(data.ticket)data.ticket.id='wrong';else data.ticketId='wrong';}
  if(state.kind==='wrong-status')data.ticket.status='OPEN';
  if(state.kind==='wrong-priority')data.ticket.priority='LOW';
  if(state.kind==='not-recorded')data.recorded=false;
  if(state.kind==='invalid')data={};
  return new Response(JSON.stringify(state.status&&state.status!==200?{error:'RAW_PRIVATE_ERROR'}:{data}),{status:state.status??200});
 };
 const Component=require(input.mode==='admin'?'@/components/admin-support-content':input.mode==='conversation'?'@/components/support-conversation':'@/components/support-tickets-content');
 const content=input.mode==='admin'?React.createElement(Component.AdminSupportContent):input.mode==='conversation'?React.createElement(Component.SupportConversation,{ticketId:input.ticket.id,messages:input.ticket.messages,status:input.ticket.status,admin:input.admin,onSent:async()=>{window.caseState.sent++;if(input.refreshError)throw Error('RAW_PRIVATE_REFRESH');}}):React.createElement(Component.SupportTicketsContent);
 root=ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(require('@/components/language-provider').LanguageProvider,{initialLocale:input.locale},React.createElement(React.Fragment,null,React.createElement(LocaleControl),content)));
};})();`;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.route('**/*',route=>route.request().url()==='https://naksharix-support.test/'?route.fulfill({contentType:'text/html',body:'<!doctype html><div id="root"></div>'}):route.abort());
let cases=0;
async function mount(mode,locale,extra={}){
 await page.evaluate(input=>window.mountSupport(input),{mode,locale,ticket,registry:{data:{tickets:[ticket]}},...extra});
 const copy=await page.evaluate(l=>window.copyForCase(l),locale);
 if(mode!=='conversation')await expect(page.getByRole('heading',{level:1})).toHaveText(mode==='admin'?copy.adminTitle:copy.customerTitle);
 await expect(page.locator('form')).toHaveCount(mode==='customer'?2:1);
 return copy;
}
async function twiceForm(index=0){await page.locator('form').nth(index).evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});}
async function mutations(method='POST'){return page.evaluate(m=>window.caseState.requests.filter(r=>r.method===m),method);}
async function fillCreate(c){await page.getByLabel(c.subject,{exact:true}).fill('Synthetic help request');await page.getByLabel(c.details,{exact:true}).fill('Please review the synthetic example.');}
async function fillReply(c){await page.getByLabel(c.replyLabel,{exact:true}).fill('A synthetic reply for testing.');}
try{
 await page.goto('https://naksharix-support.test/');
 await page.addScriptTag({path:path.join(path.dirname(require.resolve('react/package.json')),'umd/react.development.js')});
 await page.addScriptTag({path:path.join(path.dirname(require.resolve('react-dom/package.json')),'umd/react-dom.development.js')});
 await page.addScriptTag({content:bundle});
 if(baseline){
  await page.evaluate(input=>window.mountSupport(input),{mode:'customer',locale:'en',ticket,registry:{data:{tickets:[ticket]}},kind:'empty'});
  await page.getByLabel('Subject',{exact:true}).fill('Synthetic help request');await page.getByLabel('Details',{exact:true}).fill('Please review the synthetic example.');await twiceForm();
  await expect(page.getByText('Your support request has been recorded.',{exact:true})).toBeVisible();
  console.log('SUPPORT_BEFORE_EMPTY_ID_FALSE_SUCCESS_REPRODUCED');
  await page.evaluate(input=>window.mountSupport(input),{mode:'admin',locale:'en',ticket,registry:{data:{tickets:[ticket]}},kind:'invalid'});
  await expect(page.getByRole('button',{name:'Save',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Save',exact:true}).evaluate(button=>{button.click();button.click();});
  await expect(page.getByText('Support ticket status saved.',{exact:true})).toBeVisible();assert.equal((await mutations('PATCH')).length,2);
  console.log('SUPPORT_BEFORE_MALFORMED_SUCCESS_AND_DUPLICATE_PATCH_REPRODUCED');
 }else for(const locale of ['en','hi','hinglish']){
  let c=await mount('customer',locale);await fillCreate(c);await twiceForm();await expect(page.getByText(c.recorded,{exact:true})).toBeVisible();
  const created=await mutations();assert.equal(created.length,1);assert.equal(created[0].silent,true);assert.equal(created[0].body.subject,ticket.subject);cases++;
  for(const kind of ['empty','wrong-subject','wrong-message','wrong-mutation','invalid']){
   c=await mount('customer',locale,{kind});await fillCreate(c);await twiceForm();await expect(page.getByText(c.unconfirmed,{exact:true})).toBeVisible();await expect(page.getByText(c.recorded,{exact:true})).toHaveCount(0);await expect(page.getByLabel(c.details,{exact:true})).toHaveValue(ticket.messages[0].text);cases++;
  }
  c=await mount('customer',locale,{network:true});await fillCreate(c);await twiceForm();await expect(page.getByText(c.unconfirmed,{exact:true})).toBeVisible();const first=(await mutations())[0].body;
  await page.evaluate(()=>{window.caseState.network=false;});await twiceForm();await expect(page.getByText(c.recorded,{exact:true})).toBeVisible();assert.deepEqual((await mutations())[1].body,first);cases++;
  for(const status of [401,403,409,422,429,500]){
   c=await mount('customer',locale,{status});await fillCreate(c);await twiceForm();await expect(page.getByRole('alert')).toBeVisible();assert.ok(!(await page.locator('body').innerText()).includes('RAW_PRIVATE_ERROR'));await expect(page.getByText(c.recorded,{exact:true})).toHaveCount(0);cases++;
  }
  c=await mount('customer',locale,{network:true});await fillCreate(c);await twiceForm();await expect(page.getByText(c.unconfirmed,{exact:true})).toBeVisible();await page.getByLabel(c.subject,{exact:true}).fill('Another question');await twiceForm();await expect(page.getByText(c.originalRequest,{exact:true})).toBeVisible();assert.equal((await mutations()).length,1);await page.getByRole('button',{name:c.restoreDetails,exact:true}).click();await expect(page.getByLabel(c.subject,{exact:true})).toHaveValue(ticket.subject);cases++;
  for(const admin of [false,true]){
   c=await mount('conversation',locale,{admin});await fillReply(c);await twiceForm();await expect(page.getByText(admin?c.replyProvider:c.replyRecorded,{exact:true})).toBeVisible();assert.equal((await mutations()).length,1);assert.equal((await mutations())[0].body.ticketId,ticket.id);cases++;
   for(const kind of ['wrong-ticket','wrong-mutation','not-recorded','invalid']){c=await mount('conversation',locale,{admin,kind});await fillReply(c);await twiceForm();await expect(page.getByRole('alert')).toHaveText(c.unconfirmed);assert.equal(await page.evaluate(()=>window.caseState.sent),0);cases++;}
   c=await mount('conversation',locale,{admin,network:true});await fillReply(c);await twiceForm();await expect(page.getByRole('alert')).toHaveText(c.unconfirmed);const original=(await mutations())[0].body;await page.evaluate(()=>{window.caseState.network=false;});await twiceForm();await expect(page.getByText(admin?c.replyProvider:c.replyRecorded,{exact:true})).toBeVisible();assert.deepEqual((await mutations())[1].body,original);cases++;
  }
  c=await mount('conversation',locale,{admin:true,notification:'provider_unavailable'});await fillReply(c);await twiceForm();await expect(page.getByText(c.replyPrivate,{exact:true})).toBeVisible();cases++;
  c=await mount('conversation',locale,{refreshError:true});await fillReply(c);await twiceForm();await expect(page.getByText(c.savedRefreshFailed,{exact:true})).toBeVisible();await expect(page.getByText(c.replyRecorded,{exact:true})).toBeVisible();cases++;
  c=await mount('admin',locale);await page.getByLabel(c.status+' — '+ticket.subject,{exact:true}).selectOption('CLOSED');await expect(page.getByLabel(c.replyLabel,{exact:true})).toBeVisible();await expect(page.locator('[data-saved-support-status]')).toContainText(c.OPEN);cases++;
  await page.getByRole('button',{name:c.save,exact:true}).evaluate(button=>{button.click();button.click();});await expect(page.getByText(c.reviewSaved,{exact:true})).toBeVisible();assert.equal((await mutations('PATCH')).length,1);await expect(page.getByLabel(c.replyLabel,{exact:true})).toHaveCount(0);await expect(page.locator('[data-saved-support-status]')).toContainText(c.CLOSED);cases++;
  for(const kind of ['invalid','wrong-ticket','wrong-status','wrong-priority']){
   c=await mount('admin',locale,{kind});await page.getByLabel(c.status+' — '+ticket.subject,{exact:true}).selectOption('CLOSED');await page.getByRole('button',{name:c.save,exact:true}).click();await expect(page.getByRole('alert')).toHaveText(c.unconfirmed);await expect(page.locator('[data-saved-support-status]')).toContainText(c.OPEN);await expect(page.getByLabel(c.replyLabel,{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:c.save,exact:true})).toBeDisabled();
   await page.getByRole('button',{name:c.refresh,exact:true}).click();await expect(page.getByRole('button',{name:c.save,exact:true})).toBeEnabled();await expect(page.getByLabel(c.status+' — '+ticket.subject,{exact:true})).toHaveValue('OPEN');cases++;
  }
  c=await mount('admin',locale,{network:true});await page.getByRole('button',{name:c.save,exact:true}).click();await expect(page.getByRole('alert')).toHaveText(c.unconfirmed);await expect(page.getByRole('button',{name:c.refresh,exact:true})).toBeEnabled();cases++;
  const nextLocale=locale==='hi'?'hinglish':'hi';await page.evaluate(l=>window.changeLocale(l),nextLocale);const translated=await page.evaluate(l=>window.copyForCase(l),nextLocale);await expect(page.getByRole('alert')).toHaveText(translated.unconfirmed);cases++;
  for(const mode of ['admin','customer']){
   await page.evaluate(input=>window.mountSupport(input),{mode,locale,ticket,registry:{data:{tickets:'not-a-list'}}});c=await page.evaluate(l=>window.copyForCase(l),locale);await expect(page.getByRole('alert')).toHaveText(c.unavailable);await expect(page.getByText(mode==='admin'?c.emptyAdmin:c.emptyCustomer,{exact:true})).toHaveCount(0);cases++;
  }
 }
 assert.deepEqual(errors,[]);
 if(!baseline)console.log('SUPPORT_LANGUAGE_UI_PASS '+JSON.stringify({cases,locales:3,browser:'Chromium',actualComponents:true,scope:'actual customer/admin support and conversation components with LanguageProvider; isolated network/presentation; no real ticket, reply or email'}));
}catch(error){console.log("SUPPORT_FIXTURE_DEBUG",JSON.stringify(await page.evaluate(()=>({state:window.caseState,body:document.body.innerText,labels:[...document.querySelectorAll("label")].map(x=>x.innerText)}))));throw error;}finally{await browser.close();}

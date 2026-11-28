import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript'),{chromium}=require('playwright'),{expect}=require('@playwright/test');
const baseline=process.env.AI_CHAT_BASELINE;if(baseline&&!/^[a-f0-9]{7,40}$/.test(baseline))throw Error('Immutable baseline required');
const files=['components/ai-astrologer-chat.tsx','components/ai-credit-controls.tsx','components/razorpay-checkout-button.tsx','components/language-provider.tsx','lib/ai/chat-customer-copy.ts','lib/ai/customer-copy.ts','lib/ai/customer-contract.ts','lib/ai/credit-contract.ts','lib/ai/membership-contract.ts','lib/i18n.ts','lib/i18n-safe-overrides.ts','lib/i18n-copy.ts','lib/payments/customer-copy.ts','lib/payments/client-checkout-contract.ts','lib/ui/notification-copy.ts','lib/ui/site-notification.ts','lib/security/csrf.ts','lib/puja/fee-terms.ts','lib/auth/permissions.ts','lib/reports/checkout-catalogue.ts','lib/paid-reports.ts','lib/manual-catalogue.ts','lib/shop/real-photo-seeds.ts','lib/shop/market-price-seeds.ts'];
const modules=files.map(file=>{let source=baseline&&file==='components/ai-astrologer-chat.tsx'?execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'}):readFileSync(file,'utf8');if(file==='components/ai-astrologer-chat.tsx')source+='\nexport {chatLabels as qaChatLabels};';return JSON.stringify('@/'+file.replace(/\.tsx?$/,''))+':function(module,exports,require){'+ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText+'}';}).join(',');
const bundle=`(()=>{const modules={${modules}},cache={};const box=tag=>({first,variant,size,asChild,...props})=>asChild?props.children:React.createElement(tag,props,props.children);function require(name){if(name==='react')return React;if(name==='next/link')return {__esModule:true,default:box('a')};if(name==='next/navigation')return {useRouter:()=>({refresh(){},push(){}})};if(name==='lucide-react')return new Proxy({},{get:()=>()=>null});if(name==='@/components/ui/button')return {Button:box('button')};if(name==='@/components/ui/card')return {Card:box('section'),CardContent:box('div')};if(name==='@/components/section')return {Section:box('section')};if(name==='@/lib/analytics/google-client')return {googleAnalyticsSession:()=>undefined};if(cache[name])return cache[name].exports;if(!modules[name])throw Error('Unconfigured dependency '+name);const module={exports:{}};cache[name]=module;modules[name](module,module.exports,require);return module.exports;}let root;function Subject(){window.changeLocale=require('@/components/language-provider').useLanguage().setLocale;return React.createElement(require('@/components/ai-astrologer-chat').AiAstrologerChat,{creditFeature:true});}window.mountCase=input=>{if(root)root.unmount();document.cookie='naksharix-language='+input.locale+'; path=/';document.cookie='naksharix_csrf=synthetic-token; path=/';localStorage.setItem('naksharix-language',input.locale);window.caseState={...input,requests:[],pending:[]};window.fetch=async(url,options={})=>{const method=options.method??'GET';window.caseState.requests.push({url,method,body:options.body?JSON.parse(options.body):null,headers:Object.fromEntries(new Headers(options.headers).entries())});let reply=window.caseState.responses[url];if(Array.isArray(reply))reply=reply.shift();if(!reply)throw Error('Unconfigured transport '+url);if(reply.hold)await new Promise(resolve=>window.caseState.pending.push(resolve));if(reply.networkError)throw Error('Synthetic interruption');return new Response(reply.raw??JSON.stringify(reply.body),{status:reply.status??200,headers:{'Content-Type':'application/json'}});};root=ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(require('@/components/language-provider').LanguageProvider,{initialLocale:input.locale},React.createElement(Subject)));};window.copyFor=locale=>({chat:require('@/lib/ai/chat-customer-copy').aiChatCustomerCopy(locale),credits:require('@/lib/ai/customer-copy').aiCustomerCopy(locale),labels:require('@/components/ai-astrologer-chat').qaChatLabels(locale)});window.noticeFor=(status,paid,locale)=>require('@/lib/ai/chat-customer-copy').aiChatNoticeText(require('@/lib/ai/chat-customer-copy').aiChatFailure(status,paid),locale);})()`;
const credit={enabled:true,offer:null,remaining:3,unresolvedPurchase:false,pendingIntent:null,pendingOffer:null};const success={answer:'A complete synthetic answer, for testing only.',creditUsed:0,memory:'Synthetic memory'};
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.route('**/*',route=>route.request().url()==='https://ai-chat.test/'?route.fulfill({contentType:'text/html',body:'<!doctype html><div id="root"></div>'}):route.abort());let cases=0;
async function mount(locale,reply={body:{data:success}}){await page.evaluate(value=>window.mountCase(value),{locale,responses:{'/api/ai/credits':{body:{data:credit}},'/api/ai/chat':reply}});const copy=await page.evaluate(locale=>window.copyFor(locale),locale);await expect(page.getByRole('heading',{name:copy.credits.paidCredits})).toBeVisible();return copy;}
async function prepare(copy,paid=false,question='Synthetic question?'){if(paid)await page.getByLabel(copy.credits.usePaid,{exact:true}).check();if(await page.locator('form input[type=checkbox]').count())await page.locator('form input[type=checkbox]').click();await page.locator('#ai-astrologer-message').fill(question);}
async function submitTwice(){await page.locator('form').evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});}
async function chats(){return page.evaluate(()=>window.caseState.requests.filter(row=>row.url==='/api/ai/chat'));}
try{await page.goto('https://ai-chat.test/');await page.addScriptTag({path:path.join(path.dirname(require.resolve('react/package.json')),'umd/react.development.js')});await page.addScriptTag({path:path.join(require.resolve('react-dom/package.json'),'../umd/react-dom.development.js')});await page.addScriptTag({content:bundle});
 if(baseline){const copy=await mount('en',{status:503,body:{error:'RAW_PRIVATE_ERROR'}});await prepare(copy);await submitTwice();await expect(page.getByRole('alert')).toHaveText('RAW_PRIVATE_ERROR');const receipt={baseline,requests:(await chats()).length,retainedQuestion:await page.locator('#ai-astrologer-message').inputValue(),rawError:await page.getByRole('alert').innerText()};assert.equal(receipt.requests,2);assert.equal(receipt.retainedQuestion,'');console.log('AI_CHAT_BASELINE_DEFECTS_REPRODUCED '+JSON.stringify(receipt));await browser.close();process.exit(0);}
 for(const locale of ['en','hi','hinglish']){
  let copy=await mount(locale);await page.locator('#ai-astrologer-message').fill('Synthetic question?');await submitTwice();await expect(page.getByRole('alert')).toHaveText(copy.chat.consentRequired);assert.equal((await chats()).length,0);cases++;
  for(const paid of [false,true]){
   for(const status of [401,402,403,409,422,429,503,500]){copy=await mount(locale,{status,body:{error:'RAW_PRIVATE_ERROR'}});await prepare(copy,paid);await submitTwice();const expected=await page.evaluate(({status,paid,locale})=>window.noticeFor(status,paid,locale),{status,paid,locale});await expect(page.getByRole('alert')).toHaveText(expected);await expect(page.locator('#ai-astrologer-message')).toHaveValue('Synthetic question?');await expect(page.locator('[data-chat-message]')).toHaveCount(0);await expect(page.getByText('RAW_PRIVATE_ERROR',{exact:false})).toHaveCount(0);assert.equal((await chats()).length,1);assert.equal((await chats())[0].body.billing,paid?'credit':'free');assert.equal((await chats())[0].headers['x-csrf-token'],'synthetic-token');await expect(page.getByLabel(copy.credits.usePaid,{exact:true})).not.toBeChecked();if(paid)assert.equal(await page.evaluate(()=>window.caseState.requests.filter(row=>row.url==='/api/ai/credits').length),2);cases++;}
   for(const data of [null,{}, {...success,answer:' '},{...success,answer:12},{...success,creditUsed:paid?0:1}]){copy=await mount(locale,{body:{data}});await prepare(copy,paid);await submitTwice();await expect(page.getByRole('alert')).toContainText(copy.chat.unconfirmed);await expect(page.locator('#ai-astrologer-message')).toHaveValue('Synthetic question?');await expect(page.locator('[data-chat-message=assistant]')).toHaveCount(0);assert.equal((await chats()).length,1);cases++;}
   for(const reply of [{networkError:true},{raw:'not-json'}]){copy=await mount(locale,reply);await prepare(copy,paid);await submitTwice();await expect(page.getByRole('alert')).toContainText(copy.chat.unconfirmed);await expect(page.locator('#ai-astrologer-message')).toHaveValue('Synthetic question?');cases++;}
   copy=await mount(locale,{body:{data:{...success,creditUsed:paid?1:0}}});await prepare(copy,paid);await submitTwice();await expect(page.locator('[data-chat-message=assistant]')).toContainText(success.answer);await expect(page.locator('[data-chat-message=user]')).toHaveCount(1);await expect(page.locator('#ai-astrologer-message')).toHaveValue('');assert.equal((await chats()).length,1);assert.equal((await chats())[0].body.language,locale);await expect(page.getByLabel(copy.credits.usePaid,{exact:true})).not.toBeChecked();cases++;
  }
  copy=await mount(locale,[{networkError:true},{body:{data:success}}]);await prepare(copy);await submitTwice();await expect(page.getByRole('alert')).toHaveText(copy.chat.unconfirmed);await submitTwice();await expect(page.locator('[data-chat-message=assistant]')).toContainText(success.answer);const sent=await chats();assert.equal(sent.length,2);assert.deepEqual(sent[1].body.messages,[{role:'user',content:'Synthetic question?'}]);cases++;
 }
 let copy=await mount('en',[{body:{data:{...success,answer:'L'.repeat(5000),memory:'M'.repeat(5000)}}},{body:{data:success}}]);await prepare(copy);await submitTwice();await expect(page.locator('[data-chat-message=assistant]')).toContainText('L'.repeat(5000));await page.locator('#ai-astrologer-message').fill('Follow-up?');await submitTwice();await expect.poll(async()=>(await chats()).length).toBe(2);let sent=await chats();assert.equal(sent[1].body.messages[1].content.length,2000);assert.equal(sent[1].body.kundliContext.length,3500);cases++;
 copy=await mount('en',{hold:true,body:{data:success}});await prepare(copy);await submitTwice();await expect.poll(()=>page.evaluate(()=>window.caseState.pending.length)).toBe(1);await expect(page.locator('#ai-astrologer-message')).toBeDisabled();await expect(page.getByRole('button',{name:copy.labels.clear,exact:true})).toBeDisabled();assert.equal((await chats()).length,1);await page.evaluate(()=>window.caseState.pending.shift()());await expect(page.locator('[data-chat-message=assistant]')).toContainText(success.answer);cases++;
 copy=await mount('en',{status:503,body:{error:'RAW_PRIVATE_ERROR'}});await prepare(copy);await submitTwice();await expect(page.getByRole('alert')).toHaveText(copy.chat.unavailable);await page.evaluate(()=>window.changeLocale('hi'));copy=await page.evaluate(()=>window.copyFor('hi'));await expect(page.getByRole('alert')).toHaveText(copy.chat.unavailable);cases++;
 assert.deepEqual(errors,[]);console.log('AI_CHAT_RECOVERY_BROWSER_PASS '+JSON.stringify({cases,locales:3,scope:'actual chat, credit controls, language and CSRF; isolated transport; no model/provider request or real credit use'}));
}finally{await browser.close();}

// Real route, schema, input sanitation, language mapping and provider adapter.
// The model HTTP transport, account, credit ledger and quota stores are isolated.
const {default:Module}=await import('node:module');
const env={AI_ASTROLOGER_ENABLED:'true',GEMINI_API_KEY:'synthetic-key-never-sent',GEMINI_MODEL:'synthetic-test-model'};
let user,creditEnabled,schemaReady,claim,claimError,finishResult,finishError,redis,quota,rateLimited,provider;
let routeCases=0;
const calls=[];
function reset(){
 env.AI_ASTROLOGER_ENABLED='true';env.GEMINI_API_KEY='synthetic-key-never-sent';
 user={id:'synthetic-user'};creditEnabled=true;schemaReady=true;claim={kind:'reserved',id:'synthetic-reservation'};claimError=null;finishResult=true;finishError=null;redis=false;quota=true;rateLimited=false;provider='success';calls.length=0;
}
const resolve=Module._resolveFilename,load=Module._load;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){
 if(name==='server-only')return {};
 if(name==='@/lib/env')return {env};
 if(name==='@/lib/monitoring/logger')return {logger:{info(){},warn(){},error(){}}};
 if(name==='@/lib/auth/jwt')return {getCurrentUser:async()=>{calls.push(['user']);return user;}};
 if(name==='@/lib/ai/credit-ledger')return {
  creditUsageEnabled:()=>creditEnabled,creditSchemaReady:async()=>schemaReady,
  reserveAiCredit:async(...values)=>{calls.push(['reserve',...values]);if(claimError)throw claimError;return claim;},
  finishAiCredit:async(...values)=>{calls.push(['finish',...values]);if(values[2]&&finishError)throw finishError;return values[2]?finishResult:true;}
 };
 if(name==='@/lib/cache/redis-cache')return {sharedRedisConfigured:()=>redis};
 if(name==='@/lib/rate-limit')return {checkRateLimit:async value=>{calls.push(['redis-quota',value.key,value.limit,value.windowSeconds,value.language]);return rateLimited?Response.json({error:'Synthetic limit'},{status:429}):null;},rateLimitMessage:()=> 'Synthetic quota limit'};
 if(name==='@/lib/ai/anonymous-quota')return {claimAnonymousAiQuota:async()=>{calls.push(['db-quota']);return quota;}};
 return load.call(this,name,...args);
};
for(const extension of ['.ts','.tsx'])require.extensions[extension]=function(loaded,file){loaded._compile(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,file);};
globalThis.fetch=async(url,options)=>{
 // Deliberately never delegate to the real network implementation.
 calls.push(['provider',url,JSON.parse(options.body)]);
 if(provider==='network')throw Error('RAW_PRIVATE_NETWORK_ERROR');
 if(provider==='timeout')throw new DOMException('Synthetic timeout','AbortError');
 if(provider==='http')return Response.json({error:{message:'RAW_PRIVATE_PROVIDER_ERROR'}},{status:503});
 if(provider==='blocked')return Response.json({promptFeedback:{blockReason:'SAFETY'}});
 if(provider==='invalid-json')return new Response('not-json');
 return Response.json({candidates:[{content:{parts:[{text:provider==='empty'?'':success.answer}]},finishReason:provider==='incomplete'?'MAX_TOKENS':'STOP'}]});
};
const {POST}=require('@/app/api/ai/chat/route'),{NextRequest}=require('next/server');
const paidBody={messages:[{role:'user',content:'What should I reflect on in my career?'}],billing:'credit',consent:true,creditRequestId:'b7e92f62-28e0-45dc-93a7-f605308e01ef',language:'en'};
const freeBody={messages:paidBody.messages,billing:'free',consent:true,language:'en'};
const request=(body,contentType='application/json')=>new NextRequest('https://synthetic.invalid/api/ai/chat',{method:'POST',headers:{'Content-Type':contentType,cookie:'naksharix-language=en'},body:JSON.stringify(body)});
const selected=kind=>calls.filter(row=>row[0]===kind);
async function blocked(body,status){const response=await POST(request(body));assert.equal(response.status,status);assert.equal(selected('provider').length,0);assert.equal(selected('finish').length,0);routeCases++;return response;}

reset();env.AI_ASTROLOGER_ENABLED='false';await blocked(paidBody,503);assert.equal(calls.length,0);
reset();env.GEMINI_API_KEY='';await blocked(paidBody,503);assert.equal(calls.length,0);
for(const patch of [
 {messages:[]},{messages:Array.from({length:25},()=>paidBody.messages[0])},
 {messages:[{role:'system',content:'Synthetic'}]},{messages:[{role:'user',content:''}]},
 {messages:[{role:'user',content:' '.repeat(10)}]},{messages:[{role:'user',content:'x'.repeat(2001)}]},
 {language:'unsupported'},{billing:'automatic'},{creditRequestId:'not-uuid'},
 {consent:'true'},{kundliContext:'x'.repeat(4001)}
]){reset();await blocked({...paidBody,...patch},422);assert.equal(calls.length,0);}
reset();let response=await POST(request(paidBody,'text/plain'));assert.equal(response.status,422);assert.equal(calls.length,0);routeCases++;
for(const patch of [{consent:false},{consent:undefined},{creditRequestId:undefined}]){reset();await blocked({...paidBody,...patch},422);assert.equal(calls.length,0);}
reset();creditEnabled=false;await blocked(paidBody,503);assert.equal(calls.length,0);
reset();schemaReady=false;await blocked(paidBody,503);assert.equal(calls.length,0);
reset();await blocked({...paidBody,messages:Array.from({length:11},()=>({role:'user',content:'x'.repeat(2000)}))},422);assert.equal(calls.length,0);
reset();user=null;await blocked(paidBody,401);assert.deepEqual(calls,[['user']]);
for(const [kind,status] of [['empty',402],['account',403],['limit',429],['duplicate',409],['busy',409]]){reset();claim={kind};await blocked(paidBody,status);assert.deepEqual(selected('reserve'),[['reserve','synthetic-user',paidBody.creditRequestId]]);assert.equal(selected('db-quota').length+selected('redis-quota').length,0);}
reset();claimError=Error('RAW_PRIVATE_LEDGER_ERROR');response=await blocked(paidBody,500);assert.ok(!JSON.stringify(await response.json()).includes('RAW_PRIVATE'));

for(const language of ['en','hi','hinglish'])for(const billing of ['free','credit']){
 reset();response=await POST(request({...paidBody,billing,language}));assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');
 const body=(await response.json()).data;assert.equal(body.answer,success.answer);assert.equal(body.creditUsed,billing==='credit'?1:0);assert.equal(body.parsed.topic,'career');
 assert.equal(selected('provider').length,1);assert.ok(selected('provider')[0][1].startsWith('https://generativelanguage.googleapis.com/'));
 const prompt=JSON.stringify(selected('provider')[0][2]);assert.ok(prompt.includes(language==='en'?'English':language==='hi'?'Hindi':'Hinglish'));
 if(billing==='credit'){assert.deepEqual(selected('finish'),[['finish','synthetic-user','synthetic-reservation',true]]);assert.equal(selected('db-quota').length+selected('redis-quota').length,0);}
 else{assert.equal(selected('reserve').length+selected('finish').length,0);assert.deepEqual(selected('db-quota'),[['db-quota']]);}
 routeCases++;
}
for(const failure of ['http','network','timeout','blocked','empty','incomplete','invalid-json'])for(const billing of ['free','credit']){
 reset();provider=failure;response=await POST(request({...paidBody,billing}));assert.equal(response.status,503);assert.equal(selected('provider').length,1);assert.ok(!JSON.stringify(await response.json()).includes('RAW_PRIVATE'));
 assert.deepEqual(selected('finish'),billing==='credit'?[['finish','synthetic-user','synthetic-reservation',false]]:[]);routeCases++;
}
reset();finishResult=false;response=await POST(request(paidBody));assert.equal(response.status,409);assert.equal(selected('provider').length,1);assert.deepEqual(selected('finish'),[['finish','synthetic-user','synthetic-reservation',true],['finish','synthetic-user','synthetic-reservation',false]]);routeCases++;
reset();finishError=Error('RAW_PRIVATE_FINISH_ERROR');response=await POST(request(paidBody));assert.equal(response.status,500);assert.ok(!JSON.stringify(await response.json()).includes('RAW_PRIVATE'));assert.deepEqual(selected('finish'),[['finish','synthetic-user','synthetic-reservation',true],['finish','synthetic-user','synthetic-reservation',false]]);routeCases++;
reset();quota=false;await blocked(freeBody,429);assert.deepEqual(calls,[['db-quota']]);
reset();redis=true;rateLimited=true;await blocked(freeBody,429);assert.deepEqual(calls,[['redis-quota','ai-chat',20,86400,'en']]);
reset();redis=true;response=await POST(request(freeBody));assert.equal(response.status,200);assert.deepEqual(selected('redis-quota'),[['redis-quota','ai-chat',20,86400,'en']]);assert.equal(selected('db-quota').length,0);assert.equal((await response.json()).data.creditUsed,0);routeCases++;
console.log('AI_CHAT_RECOVERY_ROUTE_PASS '+JSON.stringify({routeCases,scope:'actual API/schema/sanitizer/language/parser/provider adapter; isolated identity/ledger/quota and intercepted model HTTP; no actual network, model inference or credit use'}));

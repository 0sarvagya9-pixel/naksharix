import assert from 'node:assert/strict';
import {componentHarness,expect} from './qa-runtime/component-harness.mjs';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import path from 'node:path';
const baseline=process.env.COURSE_UI_BASELINE;
const h=await componentHarness({files:['components/paid-course-workspace.tsx','app/learn/paid-course/page.tsx','lib/learning/course-client-contract.ts','lib/learning/course-customer-copy.ts'],baseline,baselineFiles:['components/paid-course-workspace.tsx','app/learn/paid-course/page.tsx']});
const {page}=h;
const orderId='synthetic-course-order',moduleId='civil-time';
const lesson={id:moduleId,title:'Civil time',objective:'Confirm civil time.',caseStudy:'A fictional example.',chapter:['An unchanged authored English chapter.'],exercise:'Compare offsets.',questions:[{prompt:'First example?',choices:['Choice A','Choice B','Choice C']},{prompt:'Second example?',choices:['Choice D','Choice E','Choice F']}]};
const data={orderId,modules:[{id:moduleId,title:'Civil time',completed:false},{id:'panchang',title:'Panchang',completed:false}],lesson};
const feedback={orderId,moduleId,passed:true,feedback:[{correct:true,explanation:'First explanation.'},{correct:true,explanation:'Second explanation.'}]};
const response=body=>({body:{data:body}});let browserCases=0;
async function mount(locale,options={}){await h.mount({locale,entry:'@/components/paid-course-workspace',component:'PaidCourseWorkspace',props:{orderId},responses:{GET:[response(data)],POST:[response(feedback)]},...options});return h.copy('@/lib/learning/course-customer-copy','courseCustomerCopy',locale);}
async function answer(){await page.getByRole('radio',{name:'Choice B',exact:true}).check();await page.getByRole('radio',{name:'Choice D',exact:true}).check();}
async function twice(){await page.locator('form').evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});}
try{
 if(baseline){await mount('en',{responses:{GET:[response(data)],POST:[response({...feedback,orderId:'other-order'})]}});await answer();await twice();await expect(page.getByText('Module check passed and progress saved.',{exact:true})).toBeVisible();console.log('COURSE_BASELINE_FALSE_SAVE_REPRODUCED',JSON.stringify({baseline,mismatchedOrderMarkedPassed:true,requests:(await h.requests('POST')).length}));}
 else{
  for(const locale of ['en','hi','hinglish']){
   let c=await mount(locale);await expect(page.getByRole('heading',{name:c.modules,exact:true})).toBeVisible();await expect(page.getByRole('progressbar')).toHaveAttribute('value','0');await expect(page.getByRole('button',{name:c.assess,exact:true})).toBeDisabled();browserCases++;
   await page.getByRole('radio',{name:'Choice D',exact:true}).check();await twice();assert.equal((await h.requests('POST')).length,0);browserCases++;
   await answer();await twice();await expect(page.getByText(c.saved,{exact:true})).toBeVisible();await expect(page.getByRole('progressbar')).toHaveAttribute('value','1');assert.equal((await h.requests('POST')).length,1);assert.deepEqual((await h.requests('POST'))[0].body,{orderId,moduleId,answers:[1,0]});assert.equal((await h.requests('POST'))[0].silent,true);browserCases++;
   for(const body of [null,{}, {...feedback,orderId:'other-order'}, {...feedback,moduleId:'panchang'}, {...feedback,passed:'true'}, {...feedback,feedback:[feedback.feedback[0]]}, {...feedback,feedback:[{correct:false,explanation:'Wrong'},feedback.feedback[1]]}, {...feedback,feedback:[{correct:true,explanation:''},feedback.feedback[1]]}]){
    c=await mount(locale,{responses:{GET:[response(data)],POST:[response(body)]}});await answer();await twice();await expect(page.getByRole('alert')).toHaveText(c.unconfirmed);await expect(page.getByRole('progressbar')).toHaveAttribute('value','0');await expect(page.getByRole('radio',{name:'Choice B',exact:true})).toBeChecked();await twice();assert.equal((await h.requests('POST')).length,1);browserCases++;
   }
   c=await mount(locale,{responses:{GET:[response(data)],POST:[{networkError:true}]}});await answer();await twice();await expect(page.getByRole('alert')).toHaveText(c.unconfirmed);await page.getByRole('button',{name:c.retry,exact:true}).click();await expect(page.getByRole('radio',{name:'Choice B',exact:true})).toBeEnabled();browserCases++;
   c=await mount(locale,{responses:{GET:[response(data)],POST:[response({...feedback,passed:false,feedback:[{correct:false,explanation:'Read the first example'},feedback.feedback[1]]})]}});await answer();await twice();await expect(page.getByText(c.review,{exact:true})).toBeVisible();await expect(page.getByRole('progressbar')).toHaveAttribute('value','0');browserCases++;
   for(const body of [null,{...data,orderId:'other'},{...data,lesson:{...lesson,id:'unlisted'}},{...data,modules:[data.modules[0],data.modules[0]]},{...data,lesson:{...lesson,questions:[]}}]){c=await mount(locale,{responses:{GET:[response(body)]}});await expect(page.getByRole('alert')).toHaveText(c.unavailable);await expect(page.locator('form')).toHaveCount(0);browserCases++;}
   for(const status of [401,403,429,500]){c=await mount(locale,{responses:{GET:[{status,body:{error:'RAW_PRIVATE_FAILURE'}}]}});await expect(page.getByRole('alert')).toHaveText(status===401||status===403?c.unauthorized:status===429?c.limited:c.unavailable);assert.ok(!(await page.locator('body').innerText()).includes('RAW_PRIVATE_FAILURE'));browserCases++;}
   c=await mount(locale);await expect(page.getByRole('heading',{name:c.modules})).toBeVisible();await page.getByRole('button',{name:'Panchang',exact:true}).click();await expect(page.getByRole('alert')).toHaveText(c.unavailable);browserCases++;
   await h.mount({locale,entry:'@/app/learn/paid-course/page',page:true,searchParams:{orderId},responses:{GET:[response(data)]}});await expect(page.getByRole('heading',{level:1})).toHaveText(c.title);await expect(page.getByText(c.intro,{exact:true})).toBeVisible();assert.deepEqual(await page.evaluate(()=>window.currentMetadata()),{title:c.title+' | Naksharix',robots:{index:false,follow:false}});await expect(page.locator('article h2[lang="en"]')).toHaveText(lesson.title);browserCases++;
   await h.mount({locale,entry:'@/app/learn/paid-course/page',page:true,searchParams:{orderId:'../private'},responses:{}});await expect(page.getByRole('link',{name:c.select,exact:true})).toHaveAttribute('href','/digital-packages');assert.equal((await h.requests('GET')).length,0);browserCases++;
   await assert.rejects(()=>h.mount({locale,entry:'@/app/learn/paid-course/page',page:true,signedIn:false,searchParams:{orderId},responses:{}}),/REDIRECT \/login\?redirectTo=/);browserCases++;
  }
  assert.deepEqual(h.errors,[]);console.log('PAID_COURSE_UI_PASS',JSON.stringify({browserCases,locales:3,scope:'actual components, LanguageProvider and private server page; transport isolated; authored lessons remain English'}));
 }
}finally{await h.close();}
if(!baseline){
 const require=createRequire(import.meta.url),ts=require('typescript'),cache=new Map();
 const state={entitled:true,upserts:0,locks:0};
 const tx={digitalPackageOrder:{findFirst:async()=>({id:orderId,payment:{id:'synthetic-payment'}})},learningProgress:{upsert:async()=>{state.upserts++;},findMany:async()=>[]}};
 const overrides={'server-only':{},'@/lib/db':{prisma:{$transaction:async fn=>fn(tx)}},'@/lib/digital-packages/ledger':{lockPackage:async()=>{state.locks++;},hasUnrefundedPackageEntitlement:async()=>state.entitled}};
 function load(file){if(cache.has(file))return cache.get(file).exports;const loaded={exports:{}};cache.set(file,loaded);const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(name=>{if(Object.hasOwn(overrides,name))return overrides[name];if(name.startsWith('@/'))return load(path.resolve(name.slice(2)+'.ts'));return require(name);},loaded,loaded.exports);return loaded.exports;}
 const service=load(path.resolve('lib/learning/paid-course.ts')),contract=load(path.resolve('lib/learning/paid-course-contract.ts'));let serviceCases=0;
 for(const mod of contract.courseModules){const outcome=await service.assessPaidCourse('synthetic-user',orderId,mod.id,mod.questions.map(q=>q.correct));assert.equal(outcome.orderId,orderId);assert.equal(outcome.moduleId,mod.id);assert.equal(outcome.passed,true);serviceCases++;}
 assert.equal(state.upserts,7);const before=state.upserts;const failed=await service.assessPaidCourse('synthetic-user',orderId,moduleId,[0,1]);assert.equal(failed.passed,false);assert.equal(state.upserts,before);serviceCases++;
 state.entitled=false;assert.equal(await service.assessPaidCourse('synthetic-user',orderId,moduleId,[1,0]),null);assert.equal(state.upserts,before);serviceCases++;
 assert.equal(await service.assessPaidCourse('synthetic-user',orderId,'missing',[1,0]),null);serviceCases++;
 console.log('PAID_COURSE_SERVICE_PASS',JSON.stringify({serviceCases,scope:'actual locked assessment service and all seven server answer keys; synthetic transaction and entitlement transport, no production database'}));
}

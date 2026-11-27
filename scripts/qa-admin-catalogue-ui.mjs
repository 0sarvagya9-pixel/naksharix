import assert from 'node:assert/strict';
import path from 'node:path';
import {createRequire} from 'node:module';
import {browserModules,sourceLoader} from './qa-browser-module-loader.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),{expect}=require('@playwright/test');
const files=['components/admin-puja-offerings.tsx','components/admin-puja-partners.tsx','components/admin-manual-report-prices.tsx','components/language-provider.tsx','lib/admin/catalogue-copy.ts','lib/puja/service-catalogue.ts'].map(f=>path.resolve(f));
const [offerFile,partnerFile,manualFile,provider,copyFile,topicFile]=files;
const baseline=process.env.ADMIN_CATALOGUE_BASELINE;if(baseline&&!/^[a-f0-9]{7,40}$/.test(baseline))throw Error('Immutable baseline required');
const bundle=browserModules(files,['react','next/navigation','@/lib/security/csrf','@/components/ui/button','@/components/ui/input','@/components/puja/resilient-editorial-image','@/lib/utils'],{baseline,baselineFiles:['components/admin-puja-offerings.tsx','components/admin-puja-partners.tsx']});
const script=`(()=>{
const box=tag=>function Box({children,variant,size,asChild,...props}){return asChild?children:React.createElement(tag,props,children);};
function externalRequire(name){
 if(name==='react')return React;
 if(name==='next/navigation')return {usePathname:()=>'/admin/fixture',useRouter:()=>({refresh(){}})};
 if(name==='@/lib/security/csrf')return {secureFetch:(url,opts)=>fetch(url,opts)};
 if(name==='@/components/ui/button')return {Button:box('button')};
 if(name==='@/components/ui/input')return {Input:box('input')};
 if(name==='@/components/puja/resilient-editorial-image')return {ResilientEditorialImage:()=>null};
 if(name==='@/lib/utils')return {cn:(...v)=>v.filter(Boolean).join(' ')};
}
${bundle}
let root;window.releaseReads={};window.addEventListener('naksharix:site-notification',e=>window.caseState?.notices.push(e.detail));
function LocaleControl(){const {setLocale}=actualRequire(${JSON.stringify(provider)}).useLanguage();window.changeCatalogueLocale=setLocale;return null;}
window.catalogueCopy=locale=>actualRequire(${JSON.stringify(copyFile)}).adminCatalogueCopy(locale);
window.catalogueTopics=actualRequire(${JSON.stringify(topicFile)}).allPujaTopics;
window.mountCatalogue=input=>{
 if(root)root.unmount();document.cookie='naksharix-language='+input.locale+'; path=/';localStorage.setItem('naksharix-language',input.locale);
 const state=window.caseState={...input,requests:[],notices:[],getIndex:0};
 window.fetch=async(url,options={})=>{
  const method=options.method??'GET',body=options.body?JSON.parse(options.body):null;state.requests.push({url,method,body,silent:options.silent});
  const reply=method==='GET'?(state.reads?.[state.getIndex++]??state.registry):state.reply;
  if(reply.hold)await new Promise(resolve=>{window.releaseReads[reply.hold]=resolve;});
  if(reply.networkError)throw Error('Isolated interruption');
  let result=reply.body;
  if(reply.echo){result=method==='PUT'?{data:{offering:{...body,...reply.patch}}}:method==='POST'?{data:{partner:{...body,evidenceUrl:body.evidenceUrl??null,id:'recorded-partner',reviewStatus:'PENDING',...reply.patch}}}:{data:{recorded:true,partnerId:body.partnerId,reviewStatus:body.decision,...reply.patch}};}
  if(reply.registryAfter)state.registry=reply.registryAfter;
  return new Response(reply.raw??JSON.stringify(result),{status:reply.status??200});
 };
 const selected=input.kind==='offers'?[${JSON.stringify(offerFile)},'AdminPujaOfferEditor']:input.kind==='partners'?[${JSON.stringify(partnerFile)},'AdminPujaPartners']:[${JSON.stringify(manualFile)},'AdminManualReportPrices'];
 root=ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(actualRequire(${JSON.stringify(provider)}).LanguageProvider,{initialLocale:input.locale},React.createElement(React.Fragment,null,React.createElement(LocaleControl),React.createElement(actualRequire(selected[0])[selected[1]]))));
};
})()`;
const load=sourceLoader(),topics=load(topicFile).allPujaTopics,topic=topics[0];
const row={topicId:topic.id,pricePaise:125050,durationMinutes:60,available:false,note:'Existing approved note'};
const partner={id:'recorded-partner',name:'Synthetic Pandit',region:'Test region',traditions:[topic.id],reviewStatus:'PENDING',evidenceUrl:'https://example.org/evidence'};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>r.request().url()==='http://localhost:43872/'?r.fulfill({contentType:'text/html',body:'<!doctype html><html><body><div id="root"></div></body></html>'}):r.abort());
let uiCases=0;
async function mount(kind,locale,extra={}){await page.evaluate(x=>window.mountCatalogue(x),{kind,locale,registry:{body:{data:kind==='partners'?{partners:[partner]}:{offerings:[]}}},reply:{echo:true},...extra});const c=await page.evaluate(l=>window.catalogueCopy(l),locale);await expect(page.getByRole('button',{name:c.refresh,exact:true})).toBeVisible();await expect(page.getByText(c.loading,{exact:true})).toHaveCount(0);return c;}
async function twice(){await page.locator('form').evaluate(f=>{f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});}
async function requests(method){return page.evaluate(m=>window.caseState.requests.filter(r=>r.method===m),method);}
async function openOffer(c){await page.getByRole('button',{name:c.setRate,exact:true}).first().click();}
async function fillPartner(c){await page.getByLabel(c.name,{exact:true}).fill(' Synthetic Pandit ');await page.getByLabel(c.region,{exact:true}).fill(' Test region ');await page.getByLabel(c.traditions,{exact:true}).fill(topic.id+', '+topic.id);await page.getByLabel(c.evidence,{exact:true}).fill(partner.evidenceUrl);}
try{
 await page.goto('http://localhost:43872/');await page.addScriptTag({path:path.join(path.dirname(require.resolve('react/package.json')),'umd/react.development.js')});await page.addScriptTag({path:path.join(path.dirname(require.resolve('react-dom/package.json')),'umd/react-dom.development.js')});await page.addScriptTag({content:script});
 if(baseline){await page.evaluate(x=>window.mountCatalogue(x),{kind:'partners',locale:'en',registry:{body:{data:{partners:[partner]}}},reply:{body:{data:{recorded:true,partnerId:'another-partner',reviewStatus:'REJECTED'}}}});await page.getByLabel(/Private review/i).fill('Synthetic independent review');await page.getByRole('button',{name:'VERIFIED',exact:true}).evaluate(b=>{b.click();b.click();});await expect(page.getByRole('status')).toBeVisible();const observed=await page.getByRole('status').innerText(),count=(await requests('PATCH')).length;console.log('BASELINE_ADMIN_REVIEW_OBSERVED '+JSON.stringify({observed,requests:count}));assert.ok(!/recorded|saved/i.test(observed)&&count===1,'Wrong review identity and duplicate requests must not be accepted');}
 for(const locale of ['en','hi','hinglish']){
  let c=await mount('manual',locale);await expect(page.getByRole('heading',{name:c.manualTitle,exact:true})).toBeVisible();await expect(page.getByText(c.noManual,{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:c.setRate,exact:true})).toHaveCount(0);uiCases++;
  c=await mount('manual',locale,{registry:{body:{data:{offerings:null}}}});await expect(page.getByRole('alert')).toHaveText(c.loadFailed);uiCases++;
  c=await mount('offers',locale);await openOffer(c);await expect(page.getByLabel(c.fee,{exact:true})).toHaveValue('1100.00');await expect(page.getByLabel(c.publishOffer,{exact:true})).not.toBeChecked();await expect(page.getByText(c.feeTerms,{exact:true})).toBeVisible();uiCases++;
  c=await mount('offers',locale);await openOffer(c);await page.getByLabel(c.fee,{exact:true}).fill('');await page.getByLabel(c.publishOffer,{exact:true}).check();await twice();await expect(page.getByRole('alert')).toHaveText(c.priceRequired);assert.equal((await requests('PUT')).length,0);assert.equal(await page.evaluate(()=>window.caseState.notices.at(-1).message),c.priceRequired);uiCases++;
  c=await mount('offers',locale,{registry:{body:{data:{offerings:[row]}}}});await openOffer(c);await expect(page.getByLabel(c.fee,{exact:true})).toHaveValue('1250.50');await expect(page.getByLabel(c.serviceNote,{exact:true})).toHaveValue(row.note);uiCases++;
  for(const reply of [{body:{data:{offering:{}}}},{echo:true,patch:{topicId:'other'}},{echo:true,patch:{pricePaise:110001}},{echo:true,patch:{available:true}},{echo:true,patch:{note:'not submitted'}},{raw:'invalid json'},{networkError:true},{status:422,body:{error:'PRIVATE_DEBUG_SECRET'}}]){
   c=await mount('offers',locale,{reply});await openOffer(c);await twice();await expect(page.getByRole('alert')).toHaveText(c.unknown);assert.equal((await requests('PUT')).length,1);await expect(page.getByRole('button',{name:c.saveOffer,exact:true})).toBeDisabled();await expect(page.getByLabel(c.fee,{exact:true})).toHaveValue('1100.00');await expect(page.locator('body')).not.toContainText('PRIVATE_DEBUG_SECRET');uiCases++;
  }
  c=await mount('offers',locale);await openOffer(c);await page.getByLabel(c.serviceNote,{exact:true}).fill('  Approved synthetic note  ');await twice();await expect(page.getByRole('status')).toHaveText(c.rateSaved);assert.equal((await requests('PUT')).length,1);assert.equal((await requests('PUT'))[0].body.note,'Approved synthetic note');uiCases++;
  c=await mount('offers',locale,{registry:{body:{data:{offerings:[{...row,pricePaise:'invalid'}]}}}});await expect(page.getByRole('alert')).toHaveText(c.loadFailed);await expect(page.getByRole('button',{name:c.setRate,exact:true}).first()).toBeDisabled();uiCases++;
  c=await mount('partners',locale);await expect(page.getByRole('heading',{name:c.register,exact:true})).toBeVisible();await expect(page.getByText(c.capability,{exact:true})).toBeVisible();await expect(page.getByRole('link',{name:c.viewEvidence,exact:true})).toHaveAttribute('href',partner.evidenceUrl);uiCases++;
  for(const reply of [{body:{data:{partner:{id:'x'}}}},{echo:true,patch:{reviewStatus:'VERIFIED'}},{echo:true,patch:{name:'Other name'}},{echo:true,patch:{traditions:[]}},{echo:true,patch:{evidenceUrl:null}},{raw:'invalid json'},{networkError:true}]){
   c=await mount('partners',locale,{reply});await fillPartner(c);await twice();await expect(page.getByRole('status')).toHaveText(c.unknown);assert.equal((await requests('POST')).length,1);await expect(page.getByRole('button',{name:c.create,exact:true})).toBeDisabled();await expect(page.getByLabel(c.name,{exact:true})).toHaveValue(' Synthetic Pandit ');uiCases++;
  }
  c=await mount('partners',locale);await fillPartner(c);await twice();await expect(page.getByRole('status').filter({hasText:c.partnerSaved})).toHaveText(c.partnerSaved);assert.equal((await requests('POST')).length,1);assert.deepEqual((await requests('POST'))[0].body.traditions,[topic.id]);await expect(page.getByLabel(c.name,{exact:true})).toHaveValue('');uiCases++;
  for(const reply of [{body:{data:{recorded:false}}},{echo:true,patch:{partnerId:'wrong'}},{echo:true,patch:{reviewStatus:'REJECTED'}},{raw:'invalid'},{networkError:true}]){
   c=await mount('partners',locale,{reply});await page.getByLabel(c.reviewNote,{exact:true}).fill('Synthetic reviewed evidence');await page.getByRole('button',{name:c.VERIFIED,exact:true}).evaluate(b=>{b.click();b.click();});await expect(page.getByRole('status')).toHaveText(c.unknown);assert.equal((await requests('PATCH')).length,1);await expect(page.getByRole('button',{name:c.VERIFIED,exact:true})).toBeDisabled();uiCases++;
  }
  c=await mount('partners',locale);await page.getByLabel(c.reviewNote,{exact:true}).fill('Synthetic reviewed evidence');await page.getByRole('button',{name:c.VERIFIED,exact:true}).click();await expect(page.getByRole('status').filter({hasText:c.reviewSaved})).toHaveText(c.reviewSaved);uiCases++;
  c=await mount('partners',locale,{registry:{body:{data:{partners:null}}}});await expect(page.getByRole('status')).toHaveText(c.loadFailed);await expect(page.getByText(c.noPartners,{exact:true})).toHaveCount(0);uiCases++;
  c=await mount('partners',locale,{registry:{body:{data:{partners:[{...partner,evidenceUrl:'javascript:alert(1)'}]}}}});await expect(page.getByRole('link',{name:c.viewEvidence,exact:true})).toHaveCount(0);await expect(page.getByText(c.noEvidence,{exact:true})).toBeVisible();uiCases++;
 }
 let c=await mount('offers','en',{reads:[{body:{data:{offerings:[row]}}},{hold:'old-price',body:{data:{offerings:[row]}}}]});await page.getByRole('button',{name:c.refresh,exact:true}).click();await openOffer(c);await page.getByLabel(c.fee,{exact:true}).fill('1300.25');await twice();await expect(page.getByRole('status')).toHaveText(c.rateSaved);await page.evaluate(()=>window.releaseReads['old-price']());await page.waitForTimeout(60);await openOffer(c);await expect(page.getByLabel(c.fee,{exact:true})).toHaveValue('1300.25');uiCases++;
 c=await mount('partners','en',{reply:{body:{data:{recorded:false}}}});await page.getByLabel(c.reviewNote,{exact:true}).fill('Synthetic evidence review');await page.getByRole('button',{name:c.VERIFIED,exact:true}).click();await expect(page.getByRole('status')).toHaveText(c.unknown);await page.evaluate(()=>window.changeCatalogueLocale('hi'));const hi=await page.evaluate(()=>window.catalogueCopy('hi'));await expect(page.getByRole('status')).toHaveText(hi.unknown);await page.getByRole('button',{name:hi.refresh,exact:true}).click();await expect(page.getByRole('button',{name:hi.VERIFIED,exact:true})).toBeEnabled();uiCases++;
 assert.deepEqual(errors,[]);console.log('ADMIN_CATALOGUE_UI_PASS '+JSON.stringify({cases:uiCases,locales:3,manualEditableRows:0,scope:'actual components, catalogue and language provider; isolated transport and presentation; no real approvals or prices'}));
}finally{await browser.close();}

const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');globalThis.React=React;
let authorized=true,locale='en',record={...partner},audits=[],writes=0,serverCases=0;
function Box({children,...props}){return React.createElement('section',props,children);}
const client={pujaPartner:{findMany:async()=>[record],create:async({data})=>{writes++;return {id:partner.id,...data};},findUnique:async()=>record,update:async({data})=>{writes++;record={...record,...data};return record;}},pujaOffering:{findMany:async()=>[row],upsert:async({create})=>{writes++;return create;}},manualReportOffering:{findMany:async()=>[]},adminActionLog:{create:async({data})=>{audits.push(data);return data;}}};client.$transaction=async(fn)=>fn(client);
const server=sourceLoader({'@/lib/db':{prisma:client},'@/lib/auth/roles':{getAdminApiUser:async()=>authorized?{id:'synthetic-admin'}:null,requireAdminRole:async()=>{if(!authorized)throw Error('FORBIDDEN');return {id:'synthetic-admin'};}},'@/lib/api':{ok:(data,init)=>Response.json({data},init),fail:(error,status)=>Response.json({error},{status}),validateJson:async(r,schema)=>schema.parse(await r.json()),handleApiError:()=>Response.json({error:'INVALID'},{status:422})},'next/headers':{cookies:async()=>({get:()=>({value:locale})})},'next/link':{__esModule:true,default:Box},'@/components/section':{Section:Box},'@/components/admin-manual-report-prices':{AdminManualReportPrices:()=>null},'@/components/admin-puja-offerings':{AdminPujaOfferEditor:()=>null},'@/components/admin-puja-partners':{AdminPujaPartners:()=>null},'@/lib/seo':{seo:input=>input}});
for(const f of ['app/admin/manual-report-prices/page.tsx','app/admin/puja-offerings/page.tsx','app/admin/puja-partners/page.tsx']){
 const view=server(f);for(locale of ['en','hi','hinglish']){assert.deepEqual((await view.generateMetadata()).robots,{index:false,follow:false});renderToStaticMarkup(await view.default());serverCases++;}authorized=false;await assert.rejects(()=>view.default(),/FORBIDDEN/);serverCases++;authorized=true;
}
const partners=server('app/api/admin/puja-partners/route.ts'),offersRoute=server('app/api/admin/puja-offerings/route.ts'),manualRoute=server('app/api/admin/manual-report-offerings/route.ts');
const request=body=>new Request('http://fixture',{method:'POST',body:JSON.stringify(body)});
authorized=false;for(const call of [()=>partners.POST(request({})),()=>partners.PATCH(request({})),()=>offersRoute.PUT(request({})),()=>manualRoute.PUT(request({}))]){assert.ok([403,404].includes((await call()).status));serverCases++;}assert.equal(writes,0);authorized=true;
const create={name:partner.name,region:partner.region,traditions:[topic.id,topic.id],evidenceUrl:partner.evidenceUrl};let response=await partners.POST(request(create));assert.equal(response.status,201);assert.deepEqual((await response.json()).data.partner,{...partner,traditions:[topic.id]});serverCases++;
assert.equal((await partners.POST(request({...create,evidenceUrl:'http://example.org'}))).status,422);serverCases++;
const review={partnerId:partner.id,decision:'VERIFIED',note:'Synthetic verified evidence'};record={...partner,evidenceUrl:null};assert.equal((await partners.PATCH(request(review))).status,422);serverCases++;
record={...partner,traditions:['unsupported-rite']};assert.equal((await partners.PATCH(request(review))).status,422);serverCases++;
record={...partner};response=await partners.PATCH(request(review));assert.deepEqual((await response.json()).data,{recorded:true,partnerId:partner.id,reviewStatus:'VERIFIED'});assert.equal(audits.at(-1).targetId,partner.id);serverCases++;
response=await offersRoute.PUT(request(row));assert.equal(response.status,200);assert.equal((await response.json()).data.offering.pricePaise,125050);assert.equal(audits.at(-1).targetId,topic.id);serverCases++;
for(const invalid of [{...row,topicId:'invented-topic'},{...row,available:true,pricePaise:null},{...row,pricePaise:0},{...row,durationMinutes:1}]){assert.equal((await offersRoute.PUT(request(invalid))).status,422);serverCases++;}
const manuals=load('lib/manual-catalogue.ts').manualReports;for(const report of manuals){assert.equal((await manualRoute.PUT(request({reportSlug:report.slug,pricePaise:100,available:true,deliveryDays:1,note:''}))).status,422);serverCases++;}
const contracts=load('lib/admin/catalogue-client-contract.ts'),valid={reportSlug:manuals[0].slug,pricePaise:100,available:true,deliveryDays:1,note:'Exact note'};
assert.equal(contracts.matchingManualRate(valid,valid),true);serverCases++;for(const patch of [{reportSlug:'other'},{pricePaise:101},{deliveryDays:2},{available:false},{note:'changed'}]){assert.equal(contracts.matchingManualRate({...valid,...patch},valid),false);serverCases++;}
console.log('ADMIN_CATALOGUE_SERVER_PASS '+JSON.stringify({cases:serverCases,scope:'actual pages, handlers, schema and acknowledgement parser; isolated DB/identity; 15 real gateway report repricing rejections, zero fabricated manual SKUs'}));

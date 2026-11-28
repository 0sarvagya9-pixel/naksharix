import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import {execFileSync} from "node:child_process";
import path from "node:path";

const require=createRequire(import.meta.url),ts=require("typescript");
const {chromium}=require("playwright"),{expect}=require("@playwright/test");
const baseline=process.env.BUSINESS_UI_BASELINE;
if(baseline&&!/^[a-f0-9]{7,40}$/.test(baseline))throw Error("Use an immutable local Git revision");
const changed=["components/business-workspace.tsx","components/admin-business-integrations.tsx","components/admin-portal-sidebar.tsx","app/business-workspace/page.tsx","app/admin/business-integrations/page.tsx"];
const files=[...changed,"components/ui/input.tsx","components/language-provider.tsx","lib/i18n.ts","lib/i18n-safe-overrides.ts","lib/business-integrations/contract.ts","lib/business-integrations/workspace-copy.ts"];
const modules=files.map(file=>{
 const source=baseline&&changed.includes(file)?execFileSync("git",["show",baseline+":"+file],{encoding:"utf8"}):readFileSync(file,"utf8");
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 return JSON.stringify("@/"+file.replace(/\.tsx?$/,""))+":function(module,exports,require){"+js+"}";
}).join(",");
const bundle=`(()=>{
const modules={${modules}},cache={};
const box=tag=>({variant,size,...props})=>React.createElement(tag,props,props.children);
function require(name){
 if(name==='react')return React;
 if(name==='next/navigation')return {usePathname:()=>'/admin/business-integrations',useRouter:()=>({refresh:()=>{window.caseState.routerRefresh++;}}),redirect:to=>{throw Error('REDIRECT:'+to);}};
 if(name==='next/headers')return {cookies:async()=>({get:key=>({value:document.cookie.match(new RegExp('(?:^|;\\s*)'+key+'=([^;]+)'))?.[1]})})};
 if(name==='next/link')return {__esModule:true,default:box('a')};
 if(name==='lucide-react')return new Proxy({}, {get:()=>()=>null});
 if(name==='@/components/ui/button')return {Button:box('button')};
 if(name==='@/components/section')return {Section:box('section')};
 if(name==='@/lib/utils')return {cn:(...parts)=>parts.filter(Boolean).join(' ')};
 if(name==='@/lib/auth/jwt')return {getCurrentUser:async()=>({id:'synthetic-user'})};
 if(name==='@/lib/auth/roles')return {requireAdminRole:async()=>{window.caseState.adminChecks++;return {id:'synthetic-admin'};}};
 if(name==='@/lib/security/csrf')return {secureFetch:(url,options)=>window.fetch(url,options)};
 if(cache[name])return cache[name].exports;
 if(!modules[name])throw Error('Unconfigured browser dependency '+name);
 const module={exports:{}};cache[name]=module;modules[name](module,module.exports,require);return module.exports;
}
let root;
function LocaleControl(){const {setLocale}=require('@/components/language-provider').useLanguage();window.changeBusinessLocale=setLocale;return null;}
window.mountBusinessCase=async input=>{
 if(root)root.unmount();
 document.cookie='naksharix-language='+input.locale+'; path=/';localStorage.setItem('naksharix-language',input.locale);
 window.caseState={...input,requests:[],prompts:[],copied:null,routerRefresh:0,adminChecks:0};
 window.confirm=message=>{window.caseState.prompts.push(message);return input.confirm!==false;};
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.caseState.copied=text;}}});
 window.fetch=async(url,options={})=>{
  const method=options.method??'GET';window.caseState.requests.push({url,method,body:options.body?JSON.parse(options.body):null,silent:options.silent});
  const reply=method==='GET'?window.caseState.registry:window.caseState.replies[method];
  if(!reply)throw Error('Unconfigured isolated transport');
  if(reply.networkError)throw Error('Synthetic network failure');
  if(reply.registryAfter)window.caseState.registry=reply.registryAfter;
  return new Response(JSON.stringify(reply.body),{status:reply.status??200,headers:{'Content-Type':'application/json'}});
 };
 const page=require(input.mode==='admin'?'@/app/admin/business-integrations/page':'@/app/business-workspace/page');
 window.metadataForCase=async()=>page.generateMetadata?await page.generateMetadata():page.metadata;
 const content=await page.default();
 root=ReactDOM.createRoot(document.getElementById('root'));
 root.render(React.createElement(require('@/components/language-provider').LanguageProvider,{initialLocale:input.locale},React.createElement(React.Fragment,null,React.createElement(LocaleControl),input.mode==='admin'?React.createElement(require('@/components/admin-portal-sidebar').AdminPortalSidebar):null,content)));
};
window.workspaceCopy=locale=>require('@/lib/business-integrations/workspace-copy').businessWorkspaceCopy[locale];
window.workspaceLabels=locale=>require('@/lib/business-integrations/workspace-copy').businessFieldLabels[locale];
window.workspaceScopes=locale=>require('@/lib/business-integrations/workspace-copy').businessScopeLabels[locale];
})()`;

const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const page=await browser.newPage(),errors=[];
page.on("pageerror",error=>errors.push(error.message));
await page.route("**/*",route=>route.request().url()==="http://naksharix-fixture.test/"?route.fulfill({contentType:"text/html",body:'<!doctype html><html><body><main id="root"></main></body></html>'}):route.abort());
const expiry=new Date(Date.now()+45*86400000).toISOString();
const key={id:"a".repeat(32),label:"Synthetic key",scopes:["panchang"],expiresAt:expiry,revokedAt:null};
const tenant={id:"synthetic-tenant",displayName:"Synthetic Partner",brandName:"Synthetic Brand",status:"ACTIVE",contractReference:"SYNTHETIC-ONLY-001",contractExpiresAt:expiry,monthlyUnitLimit:1000,unitPricePaise:125,scopes:["chart","panchang","matching","panchang-widget","chart-pdf"],keys:[key],usage:[{period:"2026-11",attemptedUnits:10,completedUnits:8,failedUnits:2,unitPricePaise:125}]};
const secret="nxk_"+key.id+"_"+"b".repeat(43);
const registry={body:{data:{enabled:true,tenants:[tenant]}}};
let scenarios=0;
async function mount(mode,locale,extra={}){
 await page.evaluate(input=>window.mountBusinessCase(input),{mode,locale,registry,replies:{},...extra});
 const c=await page.evaluate(l=>window.workspaceCopy(l),locale);
 await expect(page.getByRole("heading",{level:1})).toHaveText(mode==="admin"?c.adminTitle:c.pageTitle);
 return c;
}
async function currentNotice(text){await expect(page.locator('[role="status"][aria-live="polite"]')).toHaveText(text);}
async function prepareKey(c){await page.getByRole("button",{name:c.manageKey,exact:true}).click();await page.getByLabel(c.keyLabel,{exact:true}).fill("Synthetic key");await page.locator('form input[type="checkbox"]').nth(1).check();}
async function submitTwice(){await page.locator("form").evaluate(form=>{form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));});}
async function mutation(method){return page.evaluate(m=>window.caseState.requests.filter(r=>r.method===m),method);}
async function prepareAdmin(c,locale,confirm=true){
 const labels=await page.evaluate(l=>window.workspaceLabels(l),locale);
 const fields={ownerEmail:"synthetic@example.invalid",displayName:tenant.displayName,brandName:tenant.brandName,contractReference:tenant.contractReference,contractExpiresAt:expiry.slice(0,10),monthlyUnitLimit:"1000",unitPricePaise:"125"};
 for(const [field,value] of Object.entries(fields))await page.getByLabel(labels[field],{exact:true}).fill(value);
 await page.locator('fieldset input[type="checkbox"]').nth(1).check();
 if(confirm)await page.getByLabel(c.ownerConfirmation,{exact:true}).check();
 return {...fields,monthlyUnitLimit:1000,unitPricePaise:125,scopes:["panchang"],ownerConfirmed:true};
}
try{
 await page.goto("http://naksharix-fixture.test/");
 await page.addScriptTag({path:path.join(path.dirname(require.resolve("react/package.json")),"umd/react.development.js")});
 await page.addScriptTag({path:path.join(path.dirname(require.resolve("react-dom/package.json")),"umd/react-dom.development.js")});
 await page.addScriptTag({content:bundle});
 for(const locale of ["hi","en","hinglish"]){
  let c=await mount("workspace",locale);
  await expect(page.getByText(c.statementDisclosure,{exact:false})).toBeVisible();
  await expect(page.getByRole("columnheader",{name:c.estimatedCharge})).toBeVisible();
  assert.equal((await page.evaluate(()=>window.metadataForCase())).title,c.pageTitle+" | Naksharix");scenarios++;

  c=await mount("workspace",locale,{registry:{body:{data:{enabled:false,tenants:[tenant]}}}});
  await expect(page.getByRole("button",{name:c.manageKey,exact:true})).toHaveCount(0);
  await expect(page.getByRole("button",{name:c.revoke,exact:true})).toBeVisible();scenarios++;
  c=await mount("workspace",locale,{registry:{body:{data:{enabled:true,tenants:[]}}}});await expect(page.getByText(c.emptyContracts)).toBeVisible();scenarios++;
  c=await mount("workspace",locale,{registry:{body:{error:"RAW_PRIVATE_ERROR"},status:403}});await currentNotice(c.forbidden);assert.ok(!(await page.locator("body").innerText()).includes("RAW_PRIVATE_ERROR"));scenarios++;
  c=await mount("workspace",locale,{registry:{body:null}});await currentNotice(c.workspaceUnavailable);scenarios++;

  c=await mount("workspace",locale,{replies:{POST:{body:{data:{key:secret,record:key}}}}});await prepareKey(c);await submitTwice();await currentNotice(c.keyIssued);
  const issue=await mutation("POST");assert.equal(issue.length,1);assert.deepEqual(issue[0].body,{tenantId:tenant.id,label:"Synthetic key",scopes:["panchang"]});assert.equal(issue[0].silent,true);
  await expect(page.getByText(secret,{exact:true})).toBeVisible();
  const changedLocale=locale==="hi"?"hinglish":"hi";await page.evaluate(l=>window.changeBusinessLocale(l),changedLocale);const changed=await page.evaluate(l=>window.workspaceCopy(l),changedLocale);
  await currentNotice(changed.keyIssued);await expect(page.getByRole("heading",{level:1})).toHaveText(changed.pageTitle);
  assert.equal((await page.evaluate(()=>window.metadataForCase())).title,changed.pageTitle+" | Naksharix");
  await page.getByRole("button",{name:changed.copyKey,exact:true}).click();await currentNotice(changed.copied);assert.equal(await page.evaluate(()=>window.caseState.copied),secret);
  await page.getByRole("button",{name:changed.hideKey,exact:true}).click();await expect(page.getByText(secret,{exact:true})).toHaveCount(0);scenarios++;

  for(const body of [null,{data:{key:secret,record:{...key,scopes:["chart"]}}}]){
   c=await mount("workspace",locale,{replies:{POST:{body}}});await prepareKey(c);await submitTwice();await currentNotice(c.keyUnconfirmed);await expect(page.getByText(secret,{exact:true})).toHaveCount(0);scenarios++;
  }
  c=await mount("workspace",locale,{replies:{POST:{status:403,body:{error:"Contract, scopes or active key limit prevents issuance."}}}});await prepareKey(c);await submitTwice();await currentNotice(c.keyBlocked);scenarios++;
  c=await mount("workspace",locale,{replies:{POST:{status:429,body:{error:"RAW_PRIVATE_ERROR"}}}});await prepareKey(c);await submitTwice();await currentNotice(c.rateLimited);scenarios++;

  c=await mount("workspace",locale,{replies:{DELETE:{body:{data:{revoked:true}},registryAfter:{body:{data:{enabled:true,tenants:[{...tenant,keys:[{...key,revokedAt:expiry}]}]}}}}}});
  await page.getByRole("button",{name:c.revoke,exact:true}).click();await currentNotice(c.keyRevoked);assert.deepEqual((await mutation("DELETE"))[0].body,{tenantId:tenant.id,keyId:key.id});assert.deepEqual(await page.evaluate(()=>window.caseState.prompts),[c.revokeKeyPrompt]);await expect(page.getByRole("button",{name:c.revoke,exact:true})).toHaveCount(0);scenarios++;
  c=await mount("workspace",locale,{replies:{DELETE:{body:{data:{}}}}});await page.getByRole("button",{name:c.revoke,exact:true}).click();await currentNotice(c.revokeUnconfirmed);scenarios++;
  c=await mount("workspace",locale,{confirm:false});await page.getByRole("button",{name:c.revoke,exact:true}).click();assert.equal((await mutation("DELETE")).length,0);scenarios++;

  c=await mount("admin",locale);
  const labels=await page.evaluate(l=>window.workspaceLabels(l),locale);
  for(const label of Object.values(labels))await expect(page.getByLabel(label,{exact:true})).toBeVisible();
  assert.equal((await page.evaluate(()=>window.metadataForCase())).title,c.adminTitle+" | Naksharix");assert.equal(await page.evaluate(()=>window.caseState.adminChecks),1);
  await expect(page.getByRole("complementary",{name:c.sidebar})).toBeVisible();await expect(page.getByRole("button",{name:c.approveAccess,exact:true})).toBeDisabled();
  await prepareAdmin(c,locale,false);await submitTwice();assert.equal((await mutation("POST")).length,0);scenarios++;

  c=await mount("admin",locale,{replies:{POST:{body:{data:{tenant:{...tenant,scopes:["panchang"]}}}}}});const expected=await prepareAdmin(c,locale);await submitTwice();await currentNotice(c.accessSaved);
  const approval=await mutation("POST");assert.equal(approval.length,1);assert.deepEqual(approval[0].body,expected);assert.equal(approval[0].silent,true);await expect(page.getByLabel(c.ownerConfirmation,{exact:true})).not.toBeChecked();scenarios++;
  for(const body of [null,{data:{tenant:{...tenant,scopes:["panchang"],monthlyUnitLimit:999}}}]){
   c=await mount("admin",locale,{replies:{POST:{body}}});await prepareAdmin(c,locale);await submitTwice();await currentNotice(c.actionUnconfirmed);await expect(page.getByLabel(c.ownerConfirmation,{exact:true})).toBeChecked();scenarios++;
  }
  c=await mount("admin",locale,{replies:{POST:{status:403,body:{error:"RAW_PRIVATE_ERROR"}}}});await prepareAdmin(c,locale);await submitTwice();await currentNotice(c.forbidden);assert.ok(!(await page.locator("body").innerText()).includes("RAW_PRIVATE_ERROR"));scenarios++;
  c=await mount("admin",locale,{replies:{POST:{status:422,body:{error:"Check verified account, distinct contract reference and expiry within one year."}}}});await prepareAdmin(c,locale);await submitTwice();await currentNotice(c.contractCheck);scenarios++;
  c=await mount("admin",locale,{registry:{body:{data:{enabled:false,tenants:[tenant]}}}});await expect(page.getByText(c.contractsDisabled)).toBeVisible();await expect(page.locator("form")).toHaveCount(0);await expect(page.getByRole("button",{name:c.revokeAccess,exact:true})).toBeVisible();scenarios++;
  c=await mount("admin",locale,{replies:{DELETE:{body:{data:{revoked:true}},registryAfter:{body:{data:{enabled:true,tenants:[{...tenant,status:"REVOKED"}]}}}}}});
  await page.getByRole("button",{name:c.revokeAccess,exact:true}).click();await currentNotice(c.tenantRevoked);assert.deepEqual((await mutation("DELETE"))[0].body,{tenantId:tenant.id,confirmed:true});assert.deepEqual(await page.evaluate(()=>window.caseState.prompts),[c.revokeTenantPrompt]);await expect(page.getByRole("button",{name:c.revokeAccess,exact:true})).toHaveCount(0);scenarios++;
  c=await mount("admin",locale,{replies:{DELETE:{body:{data:{}}}}});await page.getByRole("button",{name:c.revokeAccess,exact:true}).click();await currentNotice(c.revokeUnconfirmed);scenarios++;
 }
 assert.deepEqual(errors,[]);
 console.log("BUSINESS_WORKSPACE_UI_PASS "+JSON.stringify({locales:3,scenarios,actualLanguageProvider:true,metadataAndLiveLocale:true,approvalAndScopePayloadsPreserved:true,malformedAcknowledgementsRejected:true,scope:"actual client components, server page wrappers and locale provider; isolated authorization, transport and clipboard; no real contract, tenant, key, invoice or payment"}));
}finally{await browser.close();}

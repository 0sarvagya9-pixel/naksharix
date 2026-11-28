import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript');
const {chromium}=require('playwright'),{expect}=require('@playwright/test');
export {expect};
export async function componentHarness({files,baseline,baselineFiles=[]}){
 if(baseline)assert.match(baseline,/^[a-f0-9]{7,40}$/);
 const modules=new Map();
 const stubNames=new Set(['@/lib/utils','@/components/ui/button','@/components/ui/card','@/components/section','@/lib/auth/jwt','@/lib/auth/roles','@/lib/security/csrf','@/components/razorpay-checkout-button','@/lib/db','@/lib/seo']);
 function add(file){const name='@/'+file.replace(/\.tsx?$/,'');if(modules.has(name)||stubNames.has(name))return;
  const source=baseline&&baselineFiles.includes(file)?execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'}):readFileSync(file,'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const js=compiled.replace(/require\(["'](\.[^"']+)["']\)/g,(_,dep)=>'require('+JSON.stringify('@/'.concat(path.posix.normalize(path.posix.join(path.posix.dirname(file),dep)).replace(/\.tsx?$/,'')))+')');
  modules.set(name,js);
  for(const [,dep] of js.matchAll(/require\(["'](@\/[^"']+)["']\)/g)){if(stubNames.has(dep))continue;const base=dep.slice(2),target=['.ts','.tsx','/index.ts','/index.tsx'].map(ext=>base+ext).find(existsSync);if(!target)throw Error('Unconfigured dependency '+dep);add(target);}
 }
 files.forEach(add);add('components/language-provider.tsx');
 const bundle=`(()=>{const modules={${[...modules].map(([name,js])=>JSON.stringify(name)+':function(module,exports,require){'+js+'}').join(',')}},cache={};
 const box=tag=>function Box({children,asChild,variant,size,...props}){return asChild?children:React.createElement(tag,props,children);};
 function require(name){
  if(name==='react')return React;
  if(name==='next/navigation')return {usePathname:()=>'/fixture',useRouter:()=>({refresh(){window.caseState.refreshes++;}}),redirect:to=>{throw Error('REDIRECT '+to);}};
  if(name==='next/headers')return {cookies:async()=>({get:()=>({value:window.caseState.locale})})};
  if(name==='next/link')return {__esModule:true,default:box('a')};
  if(name==='server-only')return {};
  if(name==='lucide-react')return new Proxy({}, {get:()=>()=>null});
  if(name==='@/components/ui/button')return {Button:box('button')};
  if(name==='@/components/ui/card')return {Card:box('section'),CardContent:box('div'),CardHeader:box('header'),CardTitle:box('h2')};
  if(name==='@/components/section')return {Section:box('section')};
  if(name==='@/lib/utils')return {cn:(...parts)=>parts.filter(Boolean).join(' ')};
  if(name==='@/lib/seo')return {seo:input=>({title:input.title,description:input.description,robots:{index:false,follow:false}})};
  if(name==='@/lib/auth/jwt')return {getCurrentUser:async()=>window.caseState.signedIn===false?null:{id:'synthetic-user'}};
  if(name==='@/lib/auth/roles')return {requireAdminRole:async()=>{window.caseState.roleCalls.push('admin');if(window.caseState.authorized===false)throw Error('FORBIDDEN');return {id:'synthetic-admin'};},requireRole:async roles=>{window.caseState.roleCalls.push(roles);if(window.caseState.authorized===false)throw Error('FORBIDDEN');return {id:'synthetic-practitioner'};}};
  if(name==='@/lib/security/csrf')return {secureFetch:(url,options)=>window.fetch(url,options)};
  if(name==='@/components/razorpay-checkout-button')return {RazorpayCheckoutButton:props=>{window.caseState.checkoutPayload=props.payload;return React.createElement('button',{'data-checkout':'true'},props.label);}};
  if(name==='@/lib/db')return {prisma:{blogPost:{findMany:async()=>(window.caseState.posts??[]).map(v=>({...v,createdAt:new Date(v.createdAt)}))},astrologerProfile:{findMany:async()=>(window.caseState.profiles??[]).map(v=>({...v,createdAt:new Date(v.createdAt)}))}}};
  if(cache[name])return cache[name].exports;if(!modules[name])throw Error('Unconfigured dependency '+name);const loaded={exports:{}};cache[name]=loaded;modules[name](loaded,loaded.exports,require);return loaded.exports;
 }
 window.testRequire=require;let root;window.held={};
 function LocaleControl(){const {setLocale}=require('@/components/language-provider').useLanguage();window.changeLocale=setLocale;return null;}
 window.mountCase=async input=>{
  if(root)root.unmount();document.cookie='naksharix-language='+input.locale+'; path=/';localStorage.setItem('naksharix-language',input.locale);
  const state=window.caseState={...input,requests:[],indices:{},refreshes:0,roleCalls:[],prompts:[]};
  window.confirm=text=>{state.prompts.push(text);return input.confirm!==false;};
  window.fetch=async(url,options={})=>{const method=options.method??'GET',key=method+' '+String(url).split('?')[0];state.requests.push({url,method,body:options.body?JSON.parse(options.body):null,silent:options.silent});const list=state.responses[key]??state.responses[method];if(!list)throw Error('Unconfigured fixture '+key);const index=state.indices[key]??0;state.indices[key]=index+1;const reply=list[Math.min(index,list.length-1)];if(reply.hold)await new Promise(resolve=>{window.held[reply.hold]=resolve;});if(reply.networkError)throw Error('Synthetic network error');return new Response(reply.raw??JSON.stringify(reply.body),{status:reply.status??200,headers:{'Content-Type':'application/json'}});};
  const mod=require(input.entry);window.currentMetadata=async()=>mod.generateMetadata?await mod.generateMetadata():mod.metadata;
  const content=input.page?await mod.default({searchParams:Promise.resolve(input.searchParams??{})}):React.createElement(mod[input.component],input.props??{});
  root=ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(require('@/components/language-provider').LanguageProvider,{initialLocale:input.locale},React.createElement(React.Fragment,null,React.createElement(LocaleControl),content)));
 };
 })()`;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>route.request().url()==='http://localhost/'?route.fulfill({contentType:'text/html',body:'<!doctype html><html><body><main id="root"></main></body></html>'}):route.abort());
 await page.goto('http://localhost/');
 await page.addScriptTag({path:path.join(path.dirname(require.resolve('react/package.json')),'umd/react.development.js')});
 await page.addScriptTag({path:path.join(path.dirname(require.resolve('react-dom/package.json')),'umd/react-dom.development.js')});
 await page.addScriptTag({content:bundle});
 return {page,errors,close:()=>browser.close(),mount:input=>page.evaluate(v=>window.mountCase(v),input),copy:(name,exportName,locale)=>page.evaluate(v=>window.testRequire(v.name)[v.exportName](v.locale),{name,exportName,locale}),requests:method=>page.evaluate(m=>window.caseState.requests.filter(r=>r.method===m),method)};
}

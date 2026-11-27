import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');globalThis.React=React;
const root=process.cwd(),cache=new Map();let authorized=true,admin=true,locale='en',created=0,notified=0,appended=[],reviewed=0,mail=[],recipient='synthetic@example.invalid',provider='accepted';
const storage=new Map(),user={id:'synthetic-user',role:'SUPER_ADMIN'},now=new Date('2026-11-27T17:00:00Z');
const ok=(data,init)=>Response.json({data},init),fail=(error,status)=>Response.json({error},{status});
const prisma={supportTicket:{
 findMany:async()=>[...storage.values()],findUnique:async args=>args.select?.user?{user:{email:recipient,locale}}:storage.get(args.where.id)??null,
 findUniqueOrThrow:async args=>storage.get(args.where.id),
 createMany:async({data})=>{const item=data[0];if(storage.has(item.id))return {count:0};storage.set(item.id,{...item,createdAt:now,updatedAt:now});created++;return {count:1};},
 create:async({data})=>{const record={...data,id:'synthetic-legacy',createdAt:now,updatedAt:now};storage.set(record.id,record);created++;return record;},
 update:async({where,data})=>{const item={...storage.get(where.id),...data,updatedAt:now};storage.set(where.id,item);return item;}
}};
const overrides={
 'server-only':{},'next/headers':{cookies:async()=>({get:()=>({value:locale})})},'next/navigation':{redirect:to=>{throw Error('REDIRECT '+to);}},
 '@/lib/db':{prisma},'@/lib/auth/jwt':{getCurrentUser:async()=>authorized?user:null},'@/lib/auth/roles':{getAdminApiUser:async()=>admin?user:null,requireAdminRole:async()=>{if(!admin)throw Error('FORBIDDEN');return user;}},
 '@/lib/api':{ok,fail,validateJson:async(request,schema)=>schema.parse(await request.json()),handleApiError:()=>fail('Invalid request',422)},
 '@/lib/rate-limit':{rateLimit:async()=>({allowed:true})},'@/lib/reports/report-audit':{writeAuditLog:async()=>{reviewed++;}},
 '@/lib/support/append-message':{appendSupportMessage:async input=>{appended.push(input);return {kind:'ok',duplicate:input.message==='Duplicate reply'};}},
 '@/lib/env':{env:{ADMIN_EMAIL:'owner@example.invalid',NEXT_PUBLIC_APP_URL:'https://www.naksharix.com'}},
 '@/lib/email/email-service':{sendEmail:async input=>{if(provider==='throw')throw Error('Isolated provider');mail.push(input);return provider==='accepted'?{sent:true}:{sent:false,missing:['fixture']};}},
 '@/lib/monitoring/logger':{logger:{info(){},warn(){}}},
 '@/lib/seo':{seo:input=>input},
 '@/components/support-tickets-content':{SupportTicketsContent:props=>React.createElement('div',{'data-subject':props.initialSubject})},
 '@/components/admin-support-content':{AdminSupportContent:()=>React.createElement('div',null,'synthetic-admin-shell')}
};
function resolve(name,file){const base=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(file),name);const found=['','.ts','.tsx','.js'].map(ext=>base+ext).find(existsSync);if(!found)throw Error('Cannot resolve '+name);return found;}
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 const loaded={exports:{}};cache.set(file,loaded);
 const local=name=>Object.hasOwn(overrides,name)?overrides[name]:name.startsWith('@/')||name.startsWith('.')?load(resolve(name,file)):require(name);
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(local,loaded,loaded.exports);return loaded.exports;
}
const moduleFor=file=>load(path.join(root,file)),request=(body,method='POST')=>new Request('https://naksharix-fixture.invalid/api',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const actualMail=moduleFor('lib/notifications/support-updates.ts');
overrides['@/lib/notifications/support-updates']={notifySupportTeamOfNewTicket:async()=>{notified++;return 'provider_accepted';},notifyCustomerOfSupportReply:async()=>{notified++;return 'provider_accepted';}};
const create=moduleFor('app/api/support/tickets/route.ts'),reply=moduleFor('app/api/support/tickets/reply/route.ts'),staff=moduleFor('app/api/admin/support/reply/route.ts'),review=moduleFor('app/api/admin/support/route.ts');
const contract=moduleFor('lib/support/client-response.ts');
let routeCases=0,pageCases=0,emailCases=0;
const intent={id:'c0ff2339-cda3-4fb9-98b7-a5834ea8a001',subject:'Synthetic help request',message:'Private text that must remain private.'};
let response=await create.POST(request({subject:intent.subject,message:intent.message,clientMutationId:intent.id}));assert.equal(response.status,201);let body=await response.json();const ticket=contract.createdSupportTicket(body,intent);assert.ok(ticket);assert.equal(created,1);assert.equal(notified,1);routeCases++;
response=await create.POST(request({subject:intent.subject,message:intent.message,clientMutationId:intent.id}));body=await response.json();assert.equal(body.data.duplicate,true);assert.equal(created,1);assert.equal(notified,1);assert.ok(contract.createdSupportTicket(body,intent));routeCases++;
response=await create.POST(request({subject:'Changed subject',message:intent.message,clientMutationId:intent.id}));assert.equal(response.status,409);assert.equal(created,1);routeCases++;
for(const invalid of [{...intent,clientMutationId:'invalid'}, {subject:'a',message:'too short',clientMutationId:intent.id}]){response=await create.POST(request(invalid));assert.equal(response.status,422);routeCases++;}
authorized=false;assert.equal((await create.GET()).status,401);assert.equal((await create.POST(request({subject:intent.subject,message:intent.message}))).status,401);authorized=true;routeCases++;
for(const handler of [reply,staff]){
 const payload={ticketId:ticket.id,message:'A synthetic reply',clientMutationId:'c0ff2339-cda3-4fb9-98b7-a5834ea8a002'};
 response=await handler.POST(request(payload));body=await response.json();assert.equal(response.status,200);assert.equal(contract.supportReplyRecorded(body,{id:payload.clientMutationId,ticketId:ticket.id}),true);assert.equal(appended.at(-1).ticketId,ticket.id);routeCases++;
 const before=notified;response=await handler.POST(request({...payload,message:'Duplicate reply'}));body=await response.json();assert.equal(body.data.duplicate,true);assert.equal(notified,before);routeCases++;
 response=await handler.POST(request({...payload,clientMutationId:'invalid'}));assert.equal(response.status,422);routeCases++;
}
const expected={id:ticket.id,status:'CLOSED',priority:'HIGH'};response=await review.PATCH(request({ticketId:expected.id,status:expected.status,priority:expected.priority},'PATCH'));body=await response.json();assert.equal(response.status,200);assert.equal(contract.supportReviewRecorded(body,expected),true);assert.equal(reviewed,2);routeCases++;
admin=false;response=await review.PATCH(request({ticketId:expected.id,status:'OPEN',priority:'NORMAL'},'PATCH'));assert.equal(response.status,404);response=await staff.POST(request({ticketId:ticket.id,message:'A reply',clientMutationId:'c0ff2339-cda3-4fb9-98b7-a5834ea8a003'}));assert.equal(response.status,404);admin=true;routeCases++;
for(const malformed of [{data:{ticket:{...ticket,id:''}}},{data:{ticket:{...ticket,subject:'Wrong'}}}]){assert.equal(contract.createdSupportTicket(malformed,intent),null);routeCases++;}
const customerPage=moduleFor('app/support/page.tsx'),adminPage=moduleFor('app/admin/support/page.tsx'),dictionary=moduleFor('lib/support/ui-copy.ts');
for(locale of ['en','hi','hinglish']){
 const copy=dictionary.supportCopy(locale),metadata=await customerPage.generateMetadata();assert.deepEqual(metadata.robots,{index:false,follow:false});assert.equal(metadata.title,copy.customerTitle+' - Naksharix');assert.ok(renderToStaticMarkup(await customerPage.default({searchParams:Promise.resolve({topic:'partnership'})})).includes(copy.partnership));pageCases++;
 assert.equal((await adminPage.generateMetadata()).title,copy.adminTitle+' - Naksharix Admin');await adminPage.default();pageCases++;
}
authorized=false;await assert.rejects(()=>customerPage.default({searchParams:Promise.resolve({topic:'partnership'})}),/REDIRECT \/login\?redirectTo=%2Fsupport%3Ftopic%3Dpartnership/);authorized=true;pageCases++;
admin=false;await assert.rejects(()=>adminPage.default(),/FORBIDDEN/);admin=true;pageCases++;
for(locale of ['en','hi','hinglish','unknown']){
 mail=[];provider='accepted';assert.equal(await actualMail.notifyCustomerOfSupportReply('synthetic-private-ticket','synthetic-mutation'),'provider_accepted');assert.equal(mail.length,1);const email=mail[0];assert.equal(email.to,'synthetic@example.invalid');assert.ok(email.text.includes('https://www.naksharix.com/support'));assert.equal(email.idempotencyKey,'naksharix/support-reply/synthetic-private-ticket/synthetic-mutation');assert.ok(!email.text.includes(intent.message));assert.equal(email.html,undefined);assert.ok(locale==='hi'?email.subject.includes('नया उत्तर'):locale==='hinglish'?email.subject.includes('naya reply'):email.subject.includes('New response'));emailCases++;
 provider='disabled';assert.equal(await actualMail.notifyCustomerOfSupportReply('synthetic-private-ticket','synthetic-mutation'),'provider_unavailable');emailCases++;
}
recipient=null;mail=[];assert.equal(await actualMail.notifyCustomerOfSupportReply('ticket','mutation'),'recipient_missing');assert.equal(mail.length,0);emailCases++;
recipient='synthetic@example.invalid';provider='throw';assert.equal(await actualMail.notifyCustomerOfSupportReply('ticket','mutation'),'provider_unavailable');emailCases++;
provider='accepted';mail=[];assert.equal(await actualMail.notifySupportTeamOfNewTicket('synthetic-ticket'),'provider_accepted');assert.equal(mail[0].to,'owner@example.invalid');assert.ok(mail[0].subject.includes('New customer ticket'));assert.equal(mail[0].idempotencyKey,'naksharix/support-new/synthetic-ticket');emailCases++;
console.log('SUPPORT_ROUTE_EMAIL_ACCEPTANCE_PASS '+JSON.stringify({routeCases,pageCases,emailCases,total:routeCases+pageCases+emailCases,scope:'actual HTTP handlers, Zod schemas, saved-language email service and private page wrappers; isolated persistence, transport and identity; no genuine message sent'}));

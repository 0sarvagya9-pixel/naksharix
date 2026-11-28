import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript'),{default:Module}=await import('node:module'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');globalThis.React=React;
const publicKey=Buffer.from([4,...Array.from({length:64},(_,i)=>i+1)]).toString('base64url'),calls=[];
let state,locale='en',cases=0,ssrCases=0;
const filterUndefined=value=>Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined));
const baseSlot={id:'slot-id',astrologerProfileId:'profile-id',dayOfWeek:1,startTime:'10:00',endTime:'18:00',isActive:true,isHoliday:false,consultationType:'CHAT',status:'ONLINE'};
function reset(){calls.length=0;state={user:{id:'provider-user',name:'Synthetic Provider',role:'ASTROLOGER',effectiveRole:'ASTROLOGER'},profile:{id:'profile-id',userId:'provider-user',displayName:'Synthetic Provider',bio:'Synthetic professional biography.',experienceYears:3,consultationPrice:'10',languages:['Hindi'],skills:['Vedic Astrology'],availabilityStatus:'OFFLINE',availableForChat:false,availableForCall:false,availableForVideo:false,status:'PENDING_REVIEW',approvedAt:null,slots:[baseSlot]},booking:{id:'booking-id',astrologerProfileId:'profile-id',userId:'customer-id',status:'REQUESTED',paymentStatus:'PAID',durationMins:30,scheduledAt:new Date('2090-01-01T04:30:00Z'),updatedAt:new Date('2026-11-27T12:00:00Z')},slot:{...baseSlot},duplicate:false,deleteCount:1,changedCount:1,bookingConflict:false,noteEligible:true,pairApproved:true,config:true,schema:true,verified:true,limited:false,count:1,existing:null};}
const prisma={
 $transaction:async action=>action(prisma),$queryRaw:async()=>[],
 astrologerProfile:{findUnique:async input=>{calls.push(['profile-read',input]);return state.profile;},upsert:async input=>{calls.push(['profile-write',input]);return {id:'profile-id',userId:input.where.userId,...input.update};},update:async input=>{calls.push(['profile-update',input]);return state.profile;}},
 consultantProfile:{findUnique:async()=>null,upsert:async input=>{calls.push(['consultant-write',input]);return {id:'profile-id',userId:input.where.userId,...input.update};}},
 astrologerNote:{create:async input=>{calls.push(['note-write',input]);return {id:'note-id',...input.data};}},
 consultationBooking:{findFirst:async input=>{calls.push(['eligible-booking-read',input]);return state.noteEligible?{id:'booking-id'}:null;},findUnique:async input=>{calls.push(['booking-read',input]);return state.booking;},findUniqueOrThrow:async()=>state.booking,updateMany:async input=>{calls.push(['booking-write',input]);if(state.changedCount===1)state.booking={...state.booking,...filterUndefined(input.data)};return {count:state.changedCount};}},
 availabilitySlot:{findFirst:async input=>{calls.push(['slot-read',input]);if(typeof input.where.id==='string')return input.where.id===state.slot?.id?state.slot:null;return state.duplicate?state.slot:null;},create:async input=>{calls.push(['slot-create',input]);return {id:'slot-id',...input.data};},update:async input=>{calls.push(['slot-update',input]);return {...state.slot,...filterUndefined(input.data)};},deleteMany:async input=>{calls.push(['slot-delete',input]);return {count:state.deleteCount};}},
 user:{findUnique:async input=>{calls.push(['verified-user-read',input]);return state.verified?{emailVerified:new Date(),emailVerifiedAt:null}:{emailVerified:null,emailVerifiedAt:null};}},
 webPushSubscription:{count:async input=>{calls.push(['push-count',input]);return state.count;},findUnique:async()=>state.existing,create:async input=>{calls.push(['push-create',input]);state.count++;return {id:'device-id',...input.data};},update:async input=>{calls.push(['push-update',input]);return input.data;},deleteMany:async input=>{calls.push(['push-delete',input]);state.count=input.where.endpointDigest?Math.max(0,state.count-1):0;return {count:1};}}
};
const box=tag=>function Element({children,asChild,...props}){for(const key of ['variant','size','first'])delete props[key];return asChild?children:React.createElement(tag,props,children);};
const resolve=Module._resolveFilename,load=Module._load;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){
 if(name==='server-only')return {};
 if(name==='@/auth')return {signOut:async options=>{assert.equal(options?.redirect,false);calls.push(['authjs-signout']);}};
 if(name==='@/lib/db')return {prisma};
 if(name==='@/lib/monitoring/logger')return {logger:{error(){},warn(){},info(){}}};
 if(name==='@/lib/auth/jwt')return {getCurrentUser:async()=>state.user,authCookieName:'synthetic-auth-cookie',clearAuthCookie:async()=>calls.push(['clear-auth-cookie'])};
 if(name==='@/lib/auth/roles')return {requireAstroRole:async()=>{if(!state.user||!['ASTROLOGER','CONSULTANT'].includes(state.user.effectiveRole))throw Error('ROLE_DENIED');return state.user;}};
 if(name==='@/lib/auth/session')return {revokeSession:async token=>calls.push(['revoke-session',token])};
 if(name==='@/lib/mobile/account-link')return {approveMobilePair:async(...args)=>{calls.push(['approve-pair',...args]);return state.pairApproved;}};
 if(name==='@/lib/security/rate-limit')return {sharedRateLimitResponse:async()=>state.limited?Response.json({error:'Limited'},{status:429}):null};
 if(name==='@/lib/rate-limit')return {rateLimit:async()=>({allowed:!state.limited})};
 if(name==='@/lib/notifications/web-push')return {pushSchemaReady:async()=>state.schema};
 if(name==='@/lib/notifications/web-push-transport')return {pushConfiguration:()=>state.config?{publicKey,keyFingerprint:'synthetic-fingerprint'}:null,pushDigest:()=> 'synthetic-endpoint-digest',sealEndpoint:(_config,endpoint,userId)=>{calls.push(['seal-endpoint',endpoint,userId]);return 'synthetic-ciphertext';}};
 if(name==='@/lib/consultations/booking-conflicts')return {lockConsultationCalendar:async(_tx,id)=>calls.push(['calendar-lock',id]),hasConsultationConflict:async()=>state.bookingConflict};
 if(name==='next/headers')return {cookies:async()=>({get:name=>({value:name==='naksharix-language'?locale:'synthetic-session-token'})})};
 if(name==='next/navigation')return {redirect:href=>{throw Error('REDIRECT:'+href);},useRouter:()=>({push(){},refresh(){}})};
 if(name==='next/link')return {__esModule:true,default:box('a')};
 if(name==='@/lib/seo')return {seo:input=>({title:input.title,description:input.description})};
 if(name==='@/components/section')return {Section:box('section')};
 if(name==='@/components/ui/button')return {Button:box('button')};
 if(name==='@/components/ui/input')return {Input:box('input')};
 if(name==='@/components/ui/textarea')return {Textarea:box('textarea')};
 if(name==='@/components/ui/label')return {Label:box('label')};
 if(name==='@/components/ui/card')return {Card:box('section'),CardContent:box('div'),CardHeader:box('header'),CardTitle:box('h1')};
 return load.call(this,name,...args);
};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=function(loaded,file){loaded._compile(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,file);};
globalThis.fetch=async()=>{throw Error('No real network permitted');};
const {NextRequest}=require('next/server'),routes=Object.fromEntries(['astrologer/profile','astrologer/credentials','astrologer/notes','astrologer/availability','astrologer/bookings/action','notifications/subscribe','mobile/auth/approve','auth/logout'].map(name=>[name,require('@/app/api/'+name+'/route')]));
const request=(route,body,method='POST',origin='https://synthetic.invalid')=>new NextRequest('https://synthetic.invalid/api/'+route,{method,headers:{'Content-Type':'application/json',origin},body:JSON.stringify(body)});
const selected=kind=>calls.filter(row=>row[0]===kind);
async function invoke(route,body,expected,method='POST',origin){const response=await routes[route][method](request(route,body,method,origin));assert.equal(response.status,expected,route+' '+method);cases++;return response;}
const form={displayName:'Synthetic Provider',photoUrl:'',bio:'Synthetic professional biography.',introLine:'',experienceYears:'3',specialization:'Vedic Astrology',languages:'Hindi, English',consultationPrice:'10',pricePerSession:undefined,skills:'Vedic Astrology',city:'',country:'',availabilityStatus:'OFFLINE',availableForChat:false,availableForCall:false,availableForVideo:false};
const {profileMatches,noteMatches,readProviderSlot}=require('@/lib/astrologers/client-contract');
for(const role of ['ASTROLOGER','CONSULTANT'])for(const enabled of [false,true]){reset();state.user.role=role;state.user.effectiveRole=role;const payload={...form,availableForChat:enabled,availableForCall:enabled,availableForVideo:enabled};const response=await invoke('astrologer/profile',payload,200);const profile=(await response.json()).data.profile;assert.ok(profileMatches(profile,payload,'provider-user','profile-id'),JSON.stringify({profile,payload}));assert.equal(profile.status,'PENDING_REVIEW');assert.equal(profile.approvedAt,null);assert.equal(profile.availableForChat,enabled);assert.equal(selected(role==='CONSULTANT'?'consultant-write':'profile-write').length,1);}
for(const bad of [null,{id:'user',role:'USER',effectiveRole:'USER'}]){reset();state.user=bad;await invoke('astrologer/profile',form,403);assert.equal(selected('profile-write').length+selected('consultant-write').length,0);}
for(const patch of [{displayName:''},{bio:'short'},{consultationPrice:-1},{experienceYears:81},{availabilityStatus:'APPROVED'}]){reset();await invoke('astrologer/profile',{...form,...patch},422);assert.equal(selected('profile-write').length,0);}
let response;const baselineSha=process.env.PROVIDER_ACCOUNT_BASELINE;
if(baselineSha){if(!/^[a-f0-9]{7,40}$/.test(baselineSha))throw Error('Immutable baseline required');
const baselineModule=new Module(path.resolve('profile-baseline.cjs'));baselineModule.paths=Module._nodeModulePaths(process.cwd());baselineModule._compile(ts.transpileModule(execFileSync('git',['show',baselineSha+':app/api/astrologer/profile/route.ts'],{encoding:'utf8'}),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,path.resolve('app/api/astrologer/profile/route.ts'));
reset();response=await baselineModule.exports.POST(request('astrologer/profile',{...form,pricePerSession:'',availableForChat:'false',availableForCall:'false',availableForVideo:'false'}));assert.equal(response.status,200);{const baselineProfile=(await response.json()).data.profile;assert.equal(baselineProfile.availableForChat,true);assert.equal(baselineProfile.pricePerSession,0);console.log('PROFILE_COERCION_BASELINE_ROUTE_OBSERVED '+JSON.stringify({baseline:baselineSha,stringFalseStoredAs:true,blankSessionPriceStoredAs:0}));}
}

for(const field of ['availableForChat','availableForCall','availableForVideo'])for(const value of ['false','true',0,1]){reset();await invoke('astrologer/profile',{...form,[field]:value},422);assert.equal(selected('profile-write').length,0);}
reset();response=await invoke('astrologer/profile',{...form,pricePerSession:''},200);assert.equal((await response.json()).data.profile.pricePerSession,null);

const evidence={credentialName:'Synthetic qualification',issuer:'Synthetic issuer',issuedYear:2025,referenceUrl:'https://issuer.example/credential'};
reset();response=await invoke('astrologer/credentials',evidence,200);assert.deepEqual((await response.json()).data,{submitted:true,reviewStatus:'PENDING'});assert.equal(selected('profile-update')[0][1].data.certificates.reviewStatus,'PENDING');assert.equal(selected('profile-update')[0][1].data.certificates.reviewedBy,null);
for(const referenceUrl of ['http://issuer.example/credential','https://user:pass@issuer.example/credential','https://issuer.example:123/credential','https://localhost/credential','https://127.0.0.1/credential','https://issuer.local/credential','https://issuer.example/credential#private']){reset();await invoke('astrologer/credentials',{...evidence,referenceUrl},422);assert.equal(selected('profile-update').length,0);}
for(const patch of [{issuedYear:2027},{reviewStatus:'DOCUMENTS_REVIEWED'},{credentialName:'x'}]){reset();await invoke('astrologer/credentials',{...evidence,...patch},422);assert.equal(selected('profile-update').length,0);}
reset();state.limited=true;await invoke('astrologer/credentials',evidence,429);assert.equal(selected('profile-update').length,0);
reset();state.profile=null;await invoke('astrologer/credentials',evidence,404);
reset();state.user.role='CONSULTANT';await invoke('astrologer/credentials',evidence,403);
reset();state.user=null;assert.equal((await routes['astrologer/credentials'].GET()).status,401);cases++;
const note={userId:'customer-id',title:'Synthetic private note',body:'Synthetic private observation.',private:true};
reset();response=await invoke('astrologer/notes',note,201);assert.ok(noteMatches((await response.json()).data.note,note));assert.deepEqual(selected('eligible-booking-read')[0][1].where,{astrologerProfileId:'profile-id',userId:'customer-id',status:{in:['ACCEPTED','CONFIRMED','COMPLETED']},paymentStatus:{in:['PAID','FREE','ADMIN_BYPASS']}});
for(const [patch,status] of [[{private:false},422],[{title:'x'},422],[{body:'x'},422]]){reset();await invoke('astrologer/notes',{...note,...patch},status);assert.equal(selected('note-write').length,0);}
reset();state.noteEligible=false;await invoke('astrologer/notes',note,404);assert.equal(selected('note-write').length,0);
reset();state.user.role='USER';await invoke('astrologer/notes',note,403);assert.equal(selected('note-write').length,0);
reset();state.profile=null;await invoke('astrologer/notes',note,404);
const createSlot={dayOfWeek:1,startTime:'10:00',endTime:'18:00',isActive:true,isHoliday:false,consultationType:'CHAT',status:'ONLINE'};
reset();response=await invoke('astrologer/availability',createSlot,201);assert.ok(readProviderSlot((await response.json()).data.slot));assert.deepEqual(selected('calendar-lock'),[['calendar-lock','profile-id']]);
for(const patch of [{endTime:'10:15'},{startTime:'25:00'},{dayOfWeek:7},{consultationType:'AUTOMATIC'},{extra:true}]){reset();await invoke('astrologer/availability',{...createSlot,...patch},422);assert.equal(selected('slot-create').length,0);}
reset();state.duplicate=true;await invoke('astrologer/availability',createSlot,409);assert.equal(selected('slot-create').length,0);
reset();state.profile=null;await invoke('astrologer/availability',createSlot,422);
reset();state.user.effectiveRole='USER';await invoke('astrologer/availability',createSlot,403);
reset();response=await invoke('astrologer/availability',{slotId:'slot-id',isActive:false},200,'PATCH');assert.equal((await response.json()).data.slot.isActive,false);assert.equal(selected('slot-read')[0][1].where.astrologerProfileId,'profile-id');
reset();await invoke('astrologer/availability',{slotId:'foreign-slot',isActive:false},404,'PATCH');assert.equal(selected('slot-update').length,0);
reset();state.slot.isActive=false;state.duplicate=true;await invoke('astrologer/availability',{slotId:'slot-id',isActive:true},409,'PATCH');assert.equal(selected('slot-update').length,0);
reset();response=await invoke('astrologer/availability',{slotId:'slot-id'},200,'DELETE');assert.deepEqual((await response.json()).data,{success:true});assert.deepEqual(selected('slot-delete')[0][1].where,{id:'slot-id',astrologerProfileId:'profile-id'});
reset();state.deleteCount=0;await invoke('astrologer/availability',{slotId:'foreign-slot'},404,'DELETE');
const action={bookingId:'booking-id',action:'ACCEPT'};
for(const verb of ['ACCEPT','REJECT','COMPLETE','RESCHEDULE']){reset();if(['COMPLETE','RESCHEDULE'].includes(verb))state.booking.status='ACCEPTED';const payload={...action,action:verb,...(verb==='RESCHEDULE'?{scheduledAt:'2090-01-02T04:30:00.000Z'}:{})};response=await invoke('astrologer/bookings/action',payload,200);const booking=(await response.json()).data.booking;assert.equal(booking.id,'booking-id');assert.equal(booking.status,{ACCEPT:'ACCEPTED',REJECT:'REJECTED',COMPLETE:'COMPLETED',RESCHEDULE:'ACCEPTED'}[verb]);const write=selected('booking-write')[0][1];assert.equal(write.where.paymentStatus,'PAID');assert.ok(write.where.updatedAt instanceof Date);assert.equal(selected('calendar-lock').length,1);}
reset();state.booking.status='ACCEPTED';response=await invoke('astrologer/bookings/action',action,200);assert.equal((await response.json()).data.unchanged,true);assert.equal(selected('booking-write').length,0);
for(const [setup,payload,status] of [[()=>{state.user.role='USER';},action,403],[()=>{state.profile=null;},action,404],[()=>{state.booking.astrologerProfileId='foreign-profile';},action,403],[()=>{state.booking.paymentStatus='PENDING';},action,409],[()=>{state.booking.status='COMPLETED';},action,422],[()=>{}, {...action,action:'RESCHEDULE'},422],[()=>{}, {...action,action:'RESCHEDULE',scheduledAt:'2020-01-01T10:00:00Z'},422],[()=>{state.bookingConflict=true;},{...action,action:'RESCHEDULE',scheduledAt:'2090-01-02T04:30:00Z'},409],[()=>{state.changedCount=0;},action,409]]){reset();setup();await invoke('astrologer/bookings/action',payload,status);if(state.changedCount!==0)assert.equal(selected('booking-write').length,0);}
const pair={ticket:'A'.repeat(43)};
reset();response=await invoke('mobile/auth/approve',pair,200);assert.deepEqual((await response.json()).data,{approved:true});assert.deepEqual(selected('approve-pair'),[['approve-pair',pair.ticket,'provider-user']]);
reset();await invoke('mobile/auth/approve',pair,403,'POST','https://foreign.invalid');assert.equal(selected('approve-pair').length,0);
reset();state.user=null;await invoke('mobile/auth/approve',pair,401);assert.equal(selected('approve-pair').length,0);
for(const patch of [{ticket:'bad'},{extra:true}]){reset();await invoke('mobile/auth/approve',{...pair,...patch},422);assert.equal(selected('approve-pair').length,0);}
reset();state.pairApproved=false;await invoke('mobile/auth/approve',pair,410);
const push={endpoint:'https://fcm.googleapis.com/fcm/send/synthetic-device',consent:true,consentVersion:'account-update-push-v1',publicKey},pushContract=require('@/lib/notifications/push-client-contract');
for(const setup of [()=>{},()=>{state.config=false;},()=>{state.schema=false;}]){reset();setup();response=await routes['notifications/subscribe'].GET();assert.equal(response.status,200);assert.ok(pushContract.readPushReadiness((await response.json()).data));cases++;}
reset();state.user=null;assert.equal((await routes['notifications/subscribe'].GET()).status,401);cases++;
reset();response=await invoke('notifications/subscribe',push,200);assert.deepEqual((await response.json()).data,{registered:true,deliveryVerified:false});assert.equal(selected('push-create')[0][1].data.userId,'provider-user');assert.equal(selected('push-create')[0][1].data.consentVersion,push.consentVersion);
for(const [setup,payload,status] of [[()=>{state.user=null;},push,401],[()=>{state.config=false;},push,503],[()=>{state.schema=false;},push,503],[()=>{state.verified=false;},push,403],[()=>{state.limited=true;},push,429],[()=>{state.count=5;},push,409],[()=>{state.existing={id:'device-id',userId:'foreign-user'};},push,409],[()=>{},{...push,consent:false},422],[()=>{},{...push,consentVersion:'wrong'},422],[()=>{},{...push,publicKey:'wrong'},422],[()=>{},{...push,endpoint:'https://evil.invalid/device'},422],[()=>{},{...push,extra:true},422]]){reset();setup();await invoke('notifications/subscribe',payload,status);assert.equal(selected('push-create').length+selected('push-update').length,0);}
reset();state.existing={id:'device-id',userId:'provider-user'};await invoke('notifications/subscribe',push,200);assert.equal(selected('push-update').length,1);assert.equal(selected('push-create').length,0);
reset();response=await invoke('notifications/subscribe',{all:true},200,'DELETE');assert.ok(pushContract.revokedPushReceipt((await response.json()).data,true));assert.deepEqual(selected('push-delete')[0][1].where,{userId:'provider-user'});
reset();response=await invoke('notifications/subscribe',{endpoint:push.endpoint},200,'DELETE');assert.ok(pushContract.revokedPushReceipt((await response.json()).data));assert.deepEqual(selected('push-delete')[0][1].where,{userId:'provider-user',endpointDigest:'synthetic-endpoint-digest'});
for(const [setup,payload,status] of [[()=>{state.user=null;},{all:true},401],[()=>{state.schema=false;},{all:true},503],[()=>{state.config=false;},{endpoint:push.endpoint},409],[()=>{},{endpoint:'https://evil.invalid/device'},422],[()=>{},{all:true,extra:true},422]]){reset();setup();await invoke('notifications/subscribe',payload,status,'DELETE');assert.equal(selected('push-delete').length,0);}
reset();response=await routes['auth/logout'].POST();assert.equal(response.status,200);assert.deepEqual((await response.json()).data,{loggedOut:true});assert.deepEqual(calls,[['revoke-session','synthetic-session-token'],['clear-auth-cookie'],['authjs-signout']]);cases++;
console.log('PROVIDER_ACCOUNT_ROUTES_PASS '+JSON.stringify({cases,routes:8,scope:'actual handlers/API/Zod/sanitizer/policies; isolated accounts, persistence, rate limits, signing and session operations; no network, DB, approval or real subscription'}));
const {LanguageProvider}=require('@/components/language-provider'),{workspaceCopy}=require('@/lib/astrologers/workspace-copy'),{deviceCopy}=require('@/lib/account/device-copy');
const pages={profile:require('@/app/astrologer/profile/page'),availability:require('@/app/astrologer/availability/page'),mobile:require('@/app/mobile/link/page')};
for(const code of ['en','hi','hinglish'])for(const [name,component] of Object.entries(pages)){
 reset();locale=code;const copy=name==='mobile'?deviceCopy(code):workspaceCopy(code),metadata=await component.generateMetadata();assert.ok(String(metadata.title).includes(copy[name==='mobile'?'mobileTitle':name+'Title']));assert.deepEqual(metadata.robots,{index:false,follow:false});if(name==='mobile')assert.equal(metadata.referrer,'no-referrer');ssrCases++;
 const tree=await component.default({searchParams:Promise.resolve(pair)}),html=renderToStaticMarkup(React.createElement(LanguageProvider,{initialLocale:code},tree));assert.ok(html.includes(copy[name==='mobile'?'mobileTitle':name+'Title']));ssrCases++;
}
for(const code of ['en','hi','hinglish']){reset();locale=code;const tree=await pages.mobile.default({searchParams:Promise.resolve({ticket:'bad'})});assert.ok(renderToStaticMarkup(tree).includes(deviceCopy(code).mobileInvalid));ssrCases++;}
reset();state.user=null;await assert.rejects(()=>pages.mobile.default({searchParams:Promise.resolve(pair)}),/REDIRECT:\/login\?redirectTo=/);ssrCases++;
for(const page of [pages.profile,pages.availability]){reset();state.user.effectiveRole='USER';await assert.rejects(()=>page.default(),/ROLE_DENIED/);ssrCases++;}
console.log('PROVIDER_ACCOUNT_PRIVATE_PAGES_PASS '+JSON.stringify({ssrCases,locales:3,pages:3,scope:'actual pages and components with private role boundary; isolated identity/records/Next wrappers'}));

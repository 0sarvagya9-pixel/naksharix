import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
const base=new URL(process.env.AUTH_E2E_BASE_URL||'http://127.0.0.1:3000');
const dburl=new URL(process.env.DATABASE_URL||'postgresql://invalid/invalid');
if(process.env.CI!=='true'||base.protocol!=='http:'||!['localhost','127.0.0.1'].includes(base.hostname)||!['localhost','127.0.0.1'].includes(dburl.hostname)||dburl.pathname!=='/naksharix')throw Error('LOCAL_SYNTHETIC_ANALYTICS_ONLY');
const db=new PrismaClient();let passed=0;
const init=await fetch(new URL('/api/csrf',base));const csrf=(await init.json()).data.csrfToken;const cookie=(init.headers.get('set-cookie')||'').split(';')[0];
async function send(body,headers={}){return fetch(new URL('/api/analytics/aggregate',base),{method:'POST',headers:{'Content-Type':'application/json','x-csrf-token':csrf,cookie,origin:base.origin,'x-forwarded-for':'203.0.113.179',...headers},body:JSON.stringify(body)});}
const count=async()=>{const rows=await db.auditLog.findMany({where:{action:'analytics.aggregate',targetId:'/faq'},select:{metadata:true}});return rows.reduce((n,r)=>n+Number(r.metadata?.count||0),0);};
try{
 const before=await count();
 const event={consent:true,event:'page_view',path:'/faq'};
 assert.equal((await send(event)).status,204);assert.equal(await count(),before+1);passed++;
 assert.equal((await send({...event,consent:false})).status,422);passed++;
 assert.equal((await send({...event,email:'private@example.test'})).status,422);passed++;
 for(const path of ['/admin','/astrologer/dashboard','/reports?dob=2000-01-01']){assert.equal((await send({...event,path})).status,422);passed++;}
 assert.equal((await send(event,{dnt:'1'})).status,204);assert.equal(await count(),before+1);passed++;
 assert.equal((await send(event,{'sec-gpc':'1'})).status,204);assert.equal(await count(),before+1);passed++;
 assert.equal((await send(event,{origin:'https://untrusted.example'})).status,403);passed++;
 const admin=await fetch(new URL('/api/admin/analytics',base));assert.equal(admin.status,403);passed++;
 console.log('AGGREGATE_ANALYTICS_HTTP='+passed+'/'+passed+'_PASS;IDENTITY=NOT_STORED;CONSENT=ENFORCED');
}finally{await db.auditLog.deleteMany({where:{action:'analytics.aggregate',targetId:'/faq'}});await db.$disconnect();}

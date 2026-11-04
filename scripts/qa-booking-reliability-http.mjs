import assert from 'node:assert/strict';
import { randomUUID, createHmac } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const base = new URL(process.env.AUTH_E2E_BASE_URL || 'http://127.0.0.1:3000');
const database = new URL(process.env.DATABASE_URL || 'postgresql://invalid/invalid');
if (process.env.CI !== 'true' || base.protocol !== 'http:' || !['localhost','127.0.0.1'].includes(base.hostname) ||
    !['localhost','127.0.0.1'].includes(database.hostname) || database.pathname !== '/naksharix' || !process.env.JWT_SECRET)
  throw new Error('BOOKING_HTTP_DISPOSABLE_LOCALHOST_ONLY');
const db=new PrismaClient(); const ids=[]; const suffix=randomUUID();
const password='OnlyCI!'+suffix; const fixtureIp='203.0.113.177';
let csrf='', csrfCookie='', failures=0, passed=0;
async function req(path,init={}) { return fetch(new URL(path,base), {redirect:'manual',signal:AbortSignal.timeout(20000),...init}); }
async function post(path,body,session='') { return req(path,{method:'POST',headers:{'content-type':'application/json','x-csrf-token':csrf,'x-forwarded-for':fixtureIp,cookie:[csrfCookie,session].filter(Boolean).join('; ')},body:JSON.stringify(body)}); }
async function check(name,fn) { try {await fn();passed++;console.log('BOOKING_HTTP_PASS '+name);} catch(e) {failures++;console.error('BOOKING_HTTP_FAIL '+name+': '+e.message);} }
try {
  const init=await req('/api/csrf'); csrf=(await init.json()).data.csrfToken;
  csrfCookie=(init.headers.get('set-cookie')||'').split(';')[0];
  const hash=await bcrypt.hash(password,10);
  async function account(role) {
    const user=await db.user.create({data:{email:role.toLowerCase()+'-'+suffix+'@example.test',name:'QA '+role,role,passwordHash:hash,emailVerified:new Date(),emailVerifiedAt:new Date()}});
    ids.push(user.id);
    const login=await post('/api/auth/login',{email:user.email,password,roleIntent:role,loginMode:role});
    assert.equal(login.status,200,'Isolated fixture login failed');
    return {user,cookie:(login.headers.get('set-cookie')||'').split(';')[0]};
  }
  const owner=await account('ASTROLOGER'),customer=await account('USER');
  const profile=await db.astrologerProfile.create({data:{userId:owner.user.id,displayName:'QA Booking Reliability',status:'APPROVED',consultationPrice:10}});
  const origin=new Date(Date.now()+60*86400000); origin.setUTCHours(4,30,0,0);
  async function booking(offset=0,extra={}) {
    return db.consultationBooking.create({data:{userId:customer.user.id,astrologerProfileId:profile.id,mode:'CHAT',status:'ACCEPTED',paymentStatus:'PAID',amount:300,durationMins:30,scheduledAt:new Date(origin.getTime()+offset*60000),question:'Isolated engineering acceptance fixture.',...extra}});
  }
  const reserved=await booking(0), movable=await booking(120), closed=await booking(240,{status:'COMPLETED'});
  const action=(id,kind,date,session=owner.cookie)=>post('/api/astrologer/bookings/action',{bookingId:id,action:kind,...(date?{scheduledAt:date}:{})},session);
  await check('regular member cannot change a professional booking',async()=>assert.equal((await action(movable.id,'COMPLETE',null,customer.cookie)).status,403));
  await check('past reschedule and missing date rejected',async()=>{
    assert.equal((await action(movable.id,'RESCHEDULE',new Date(Date.now()-60000).toISOString())).status,422);
    assert.equal((await action(movable.id,'RESCHEDULE')).status,422);
    assert.equal((await action(movable.id,'RESCHEDULE','2027-01-05T11:30')).status,422);
  });
  await check('overlapping different-start intervals rejected',async()=>{
    assert.equal((await action(movable.id,'RESCHEDULE',new Date(origin.getTime()+15*60000).toISOString())).status,409);
    assert.equal((await db.consultationBooking.findUniqueOrThrow({where:{id:movable.id}})).scheduledAt.getTime(),movable.scheduledAt.getTime());
  });
  await check('adjacent slot succeeds and uses exact UTC instant',async()=>{
    const target=new Date(origin.getTime()+30*60000).toISOString();
    const result=await action(movable.id,'RESCHEDULE',target); assert.equal(result.status,200);
    assert.equal((await result.json()).data.booking.scheduledAt,target);
  });
  await check('completed reservation cannot be reopened or rejected',async()=>{
    assert.equal((await action(closed.id,'ACCEPT')).status,422);
    assert.equal((await action(closed.id,'REJECT')).status,422);
  });
  await check('retry of a successful action is idempotent',async()=>{
    const result=await action(reserved.id,'ACCEPT'); assert.equal(result.status,200); assert.equal((await result.json()).data.unchanged,true);
  });
  await check('rejection preserves prior private metadata',async()=>{
    const item=await booking(300,{metadata:{meetingLink:'https://meet.jit.si/isolated-qa-room',retained:true}});
    assert.equal((await action(item.id,'REJECT')).status,200);
    const row=await db.consultationBooking.findUniqueOrThrow({where:{id:item.id}});
    assert.equal(row.metadata.retained,true);assert.equal(row.metadata.meetingLink,'https://meet.jit.si/isolated-qa-room');
  });
  await check('concurrent reschedules reserve target only once',async()=>{
    const a=await booking(400),b=await booking(500);const target=new Date(origin.getTime()+600*60000).toISOString();
    const res=await Promise.all([action(a.id,'RESCHEDULE',target),action(b.id,'RESCHEDULE',target)]);
    assert.deepEqual(res.map(r=>r.status).sort(),[200,409]);
    assert.equal(await db.consultationBooking.count({where:{astrologerProfileId:profile.id,scheduledAt:new Date(target)}}),1);
  });
  await check('new customer booking cannot overlap a rescheduled reservation',async()=>{
    const slot=await db.availabilitySlot.create({data:{astrologerProfileId:profile.id,dayOfWeek:origin.getUTCDay(),startTime:'10:15',endTime:'10:45',isActive:true,isHoliday:false,consultationType:'CHAT'}});
    const result=await post('/api/consultation-bookings',{astrologerProfileId:profile.id,slotId:slot.id,bookingDate:origin.toISOString().slice(0,10),customerName:'QA USER',customerEmail:customer.user.email,question:'Only a disposable concurrency check.'},customer.cookie);
    assert.equal(result.status,409);
  });
} finally {
  const digest=createHmac('sha256',process.env.JWT_SECRET).update('auth-quota-v1:login-ip:'+fixtureIp).digest('hex');
  await db.auditLog.deleteMany({where:{action:'auth.rate.attempt',targetType:'login-ip',targetId:digest}}).catch(()=>{});
  for(const id of ids)await db.user.delete({where:{id}}).catch(()=>{});
  await db.$disconnect();
}
console.log('BOOKING_RELIABILITY_HTTP='+passed+'/'+(passed+failures)+'_PASS;FAILED='+failures);
if(failures)process.exit(1);

import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
const db=new PrismaClient();
const base=process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3000';
const database=new URL(process.env.DATABASE_URL||'postgresql://invalid/invalid');
const safe=process.env.CI==='true' && new URL(base).protocol==='http:' && ['localhost','127.0.0.1'].includes(new URL(base).hostname) &&
  ['localhost','127.0.0.1','postgres'].includes(database.hostname) && ['/naksharix','/naksharix_browser'].includes(database.pathname);
test.describe('real authenticated professional controls',()=>{
  test.skip(!safe,'Disposable CI database and loopback browser server are mandatory.');
  test.afterAll(async()=>{await db.$disconnect();});
  test('network failures recover and success refreshes real persisted booking state',async({page,context},info)=>{
    const ids:string[]=[];const nonce=randomUUID();const password='OnlyCI!'+nonce;
    try {
      const owner=await db.user.create({data:{email:'astro-'+nonce+'@example.test',name:'QA Astrologer',role:'ASTROLOGER',emailVerified:new Date(),emailVerifiedAt:new Date(),passwordHash:await bcrypt.hash(password,10)}});ids.push(owner.id);
      const client=await db.user.create({data:{email:'client-'+nonce+'@example.test',name:'QA Client',role:'USER',emailVerified:new Date()}});ids.push(client.id);
      const profile=await db.astrologerProfile.create({data:{userId:owner.id,displayName:'QA Astrologer',status:'APPROVED'}});
      const booking=await db.consultationBooking.create({data:{userId:client.id,astrologerProfileId:profile.id,mode:'CHAT',status:'ACCEPTED',paymentStatus:'PAID',amount:300,scheduledAt:new Date(Date.now()+30*86400000),durationMins:30,question:'Isolated browser acceptance only.'}});
      const csrfResponse=await context.request.get(base+'/api/csrf');const csrf=(await csrfResponse.json()).data.csrfToken;
      const csrfCookie=csrfResponse.headers()['set-cookie']?.split(';')[0];expect(csrfCookie).toBeTruthy();
      const csrfSplit=csrfCookie!.indexOf('=');
      await context.addCookies([{name:csrfCookie!.slice(0,csrfSplit),value:csrfCookie!.slice(csrfSplit+1),url:base,httpOnly:false,sameSite:'Strict',secure:false}]);
      const login=await context.request.post(base+'/api/auth/login',{headers:{'x-csrf-token':csrf,cookie:csrfCookie!,'x-forwarded-for':'198.51.100.'+(40+info.workerIndex)},data:{email:owner.email,password,roleIntent:'ASTROLOGER',loginMode:'ASTROLOGER'}});
      expect(login.status()).toBe(200);
      // Actual server-issued cookies only; secure=false is restricted to the guarded local HTTP fixture.
      const session=login.headers()['set-cookie']?.split(';')[0];expect(session).toBeTruthy();
      const split=session!.indexOf('=');await context.addCookies([{name:session!.slice(0,split),value:session!.slice(split+1),url:base,httpOnly:true,sameSite:'Strict',secure:false}]);
      await page.goto('/astrologer/bookings/upcoming',{waitUntil:'domcontentloaded'});
      const controls=page.locator('[data-booking-actions="'+booking.id+'"]');await expect(controls).toBeVisible();
      const complete=controls.getByRole('button',{name:'Complete',exact:true});await expect(complete).toBeEnabled();
      await expect(controls.getByRole('button',{name:'Accept',exact:true})).toHaveCount(0);
      const contrast=await complete.evaluate(el=>({color:getComputedStyle(el).color,height:el.getBoundingClientRect().height}));
      expect(contrast.color).toBe('rgb(245, 248, 252)');expect(contrast.height).toBeGreaterThanOrEqual(44);
      await page.route('**/api/astrologer/bookings/action',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Controlled service failure'})}));
      await complete.click();await expect(controls.getByRole('alert')).toHaveText('Controlled service failure');await expect(complete).toBeEnabled();
      await page.unroute('**/api/astrologer/bookings/action');
      await page.route('**/api/astrologer/bookings/action',route=>route.fulfill({status:200,contentType:'application/json',body:'not-json'}));
      await complete.click();await expect(controls.getByRole('alert')).toContainText('could not be confirmed');await expect(complete).toBeEnabled();
      expect((await db.consultationBooking.findUniqueOrThrow({where:{id:booking.id}})).status).toBe('ACCEPTED');
      await page.unroute('**/api/astrologer/bookings/action');
      await complete.click();await expect(controls).toHaveCount(0);
      expect((await db.consultationBooking.findUniqueOrThrow({where:{id:booking.id}})).status).toBe('COMPLETED');
      await page.goto('/astrologer/dashboard');await expect(page.getByRole('heading',{name:/Welcome, QA Astrologer/i})).toBeVisible();
      const dimensions=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
      expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport+2);
      await info.attach('authenticated-portal.png',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
    }finally {for(const id of ids)await db.user.delete({where:{id}}).catch(()=>{});}
  });
});

import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { createServer } from "node:https";
import { request as forwardRequest } from "node:http";
import { brotliDecompressSync, gunzipSync, inflateSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import bcrypt from "bcryptjs";
const db=new PrismaClient();
const base=process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3000';
const database=new URL(process.env.DATABASE_URL||'postgresql://invalid/invalid');
const safe=process.env.CI==='true' && new URL(base).protocol==='http:' && ['localhost','127.0.0.1'].includes(new URL(base).hostname) &&
  ['localhost','127.0.0.1','postgres'].includes(database.hostname) && ['/naksharix','/naksharix_browser'].includes(database.pathname);
type MutationEvidence={path:string;httpStatus:number;bookingId:string|null;bookingStatus:string|null;loggedOut:boolean};
test.describe('real authenticated professional controls',()=>{
  test.skip(!safe,'Disposable CI database and loopback browser server are mandatory.');
  test.use({ignoreHTTPSErrors:true}); // Applies only to the generated loopback test certificate.
  test.afterAll(async()=>{await db.$disconnect();});
  test('network failures recover and success refreshes real persisted booking state',async({page,context},info)=>{
    const ids:string[]=[];const nonce=randomUUID();const password='OnlyCI!'+nonce;
    const directory=mkdtempSync(join(tmpdir(),'naksharix-test-tls-'));
    const key=join(directory,'key.pem'),cert=join(directory,'cert.pem');
    execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',cert,'-days','1','-subj','/CN=localhost','-addext','subjectAltName=IP:127.0.0.1,DNS:localhost'],{stdio:'ignore',timeout:10000});
    const target=new URL(base);
    const observed:MutationEvidence[]=[];
    const proxy=createServer({key:readFileSync(key),cert:readFileSync(cert)},(incoming,outgoing)=>{
      const upstream=forwardRequest({hostname:target.hostname,port:target.port||3000,path:incoming.url,method:incoming.method,
        headers:{...incoming.headers,'x-forwarded-proto':'https','x-forwarded-host':incoming.headers.host||''}},response=>{
        const path=(incoming.url||'').split('?')[0];
        if(incoming.method==='POST' && ['/api/astrologer/bookings/action','/api/auth/logout'].includes(path)) {
          // Observe the genuine server response while passing exactly the same
          // bytes/headers to the browser. Chromium releases old-document bodies
          // after reload; reading response.json() later is not a reliable oracle.
          // This does not mock, replay, delay, or replace the successful mutation.
          const chunks:Buffer[]=[];let length=0;
          response.on('data',(chunk:Buffer)=>{length+=chunk.length;if(length<=65536)chunks.push(Buffer.from(chunk));});
          response.on('end',()=>{
            const evidence:MutationEvidence={path,httpStatus:response.statusCode||502,bookingId:null,bookingStatus:null,loggedOut:false};
            try {
              if(length>65536)throw new Error('Evidence exceeded bound');
              const raw=Buffer.concat(chunks),encoding=response.headers['content-encoding'];
              const decoded=encoding==='gzip'?gunzipSync(raw):encoding==='br'?brotliDecompressSync(raw):encoding==='deflate'?inflateSync(raw):raw;
              const body=JSON.parse(decoded.toString());
              evidence.bookingId=typeof body.data?.booking?.id==='string'?body.data.booking.id:null;
              evidence.bookingStatus=typeof body.data?.booking?.status==='string'?body.data.booking.status:null;
              evidence.loggedOut=body.data?.loggedOut===true;
            } catch { /* Missing evidence fails the assertions below. */ }
            observed.push(evidence);
          });
        }
        outgoing.writeHead(response.statusCode||502,response.headers);response.pipe(outgoing);
      });
      upstream.on('error',()=>{if(!outgoing.headersSent)outgoing.writeHead(502);outgoing.end();});
      incoming.pipe(upstream);
    });
    await new Promise<void>(resolve=>proxy.listen(0,'127.0.0.1',resolve));
    const address=proxy.address();if(!address||typeof address==='string')throw new Error('HTTPS fixture did not bind');
    const secureBase='https://127.0.0.1:'+address.port;
    try {
      const owner=await db.user.create({data:{email:'astro-'+nonce+'@example.test',name:'QA Astrologer',role:'ASTROLOGER',emailVerified:new Date(),emailVerifiedAt:new Date(),passwordHash:await bcrypt.hash(password,10)}});ids.push(owner.id);
      const client=await db.user.create({data:{email:'client-'+nonce+'@example.test',name:'QA Client',role:'USER',emailVerified:new Date()}});ids.push(client.id);
      const profile=await db.astrologerProfile.create({data:{userId:owner.id,displayName:'QA Astrologer',status:'APPROVED'}});
      const booking=await db.consultationBooking.create({data:{userId:client.id,astrologerProfileId:profile.id,mode:'CHAT',status:'ACCEPTED',paymentStatus:'PAID',amount:300,scheduledAt:new Date(Date.now()+30*86400000),durationMins:30,question:'Isolated browser acceptance only.'}});
      const csrfResponse=await context.request.get(secureBase+'/api/csrf');const csrf=(await csrfResponse.json()).data.csrfToken;
      const login=await context.request.post(secureBase+'/api/auth/login',{headers:{'x-csrf-token':csrf,'x-forwarded-for':'198.51.100.'+(40+info.workerIndex)},data:{email:owner.email,password,roleIntent:'ASTROLOGER',loginMode:'ASTROLOGER'}});
      expect(login.status()).toBe(200);
      // Actual server-issued secure cookies. No token signing, cookie rewriting or production-security override.
      const session=(await context.cookies(secureBase)).find(cookie=>cookie.name==='__Host-naksharix_session');
      expect(session?.secure).toBe(true);expect(session?.httpOnly).toBe(true);
      await page.goto(secureBase+'/astrologer/bookings/upcoming',{waitUntil:'domcontentloaded'});
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
      await page.unroute('**/api/astrologer/bookings/action');
      await page.route('**/api/astrologer/bookings/action',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{booking:{id:'different-booking',status:'COMPLETED'}}})}));
      await complete.click();await expect(controls.getByRole('alert')).toContainText('could not be confirmed');await expect(complete).toBeEnabled();
      expect((await db.consultationBooking.findUniqueOrThrow({where:{id:booking.id}})).status).toBe('ACCEPTED');
      await page.unroute('**/api/astrologer/bookings/action');
      let realMutations=0;
      page.on('request',request=>{if(new URL(request.url()).pathname==='/api/astrologer/bookings/action' && request.method()==='POST')realMutations++;});
      const [completion, refreshedPage]=await Promise.all([
        page.waitForResponse(response=>new URL(response.url()).pathname==='/api/astrologer/bookings/action' && response.request().method()==='POST',{timeout:22000}),
        page.waitForResponse(response=>new URL(response.url()).pathname==='/astrologer/bookings/upcoming' && response.request().isNavigationRequest(),{timeout:22000}),
        complete.click()
      ]);
      const actualCompletion=observed.filter(item=>item.path==='/api/astrologer/bookings/action');
      expect(actualCompletion).toHaveLength(1);
      const evidence={httpStatus:completion.status(),returnedStatus:actualCompletion[0]?.bookingStatus??null,refreshStatus:refreshedPage.status()};
      await info.attach('booking-completion-response.json',{body:Buffer.from(JSON.stringify(evidence)),contentType:'application/json'});
      expect(completion.status(),JSON.stringify(evidence)).toBe(200);
      expect(actualCompletion[0].httpStatus).toBe(200);
      expect(actualCompletion[0].bookingId).toBe(booking.id);
      expect(actualCompletion[0].bookingStatus).toBe('COMPLETED');
      expect((await db.consultationBooking.findUniqueOrThrow({where:{id:booking.id}})).status).toBe('COMPLETED');
      expect(refreshedPage.status()).toBe(200);
      await expect(controls).toHaveCount(0);
      await expect(page.getByText('No upcoming bookings yet.',{exact:true})).toBeVisible();
      expect(realMutations).toBe(1);
      await page.goto(secureBase+'/astrologer/dashboard');await expect(page.getByRole('heading',{name:/Welcome, QA Astrologer/i})).toBeVisible();
      const dimensions=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
      expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport+2);
      await info.attach('authenticated-portal.png',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
      // Sidebar logout must execute the real CSRF-protected POST, not a GET link.
      const opener=page.getByRole('button',{name:'Open astrologer navigation',exact:true});
      if(await opener.isVisible())await opener.click();
      const logout=page.getByRole('complementary',{name:'Astrologer portal sidebar'}).getByRole('button',{name:'Logout',exact:true});
      const [signOut]=await Promise.all([
        page.waitForResponse(response=>new URL(response.url()).pathname==='/api/auth/logout' && response.request().method()==='POST',{timeout:22000}),
        logout.click()
      ]);
      expect(signOut.status()).toBe(200);
      await page.waitForURL(url=>url.pathname==='/login');
      const actualLogout=observed.filter(item=>item.path==='/api/auth/logout');
      expect(actualLogout).toHaveLength(1);
      expect(actualLogout[0].httpStatus).toBe(200);
      expect(actualLogout[0].loggedOut).toBe(true);
      expect((await context.cookies(secureBase)).some(cookie=>cookie.name==='__Host-naksharix_session')).toBe(false);
      await page.goto(secureBase+'/astrologer/dashboard');
      await expect(page).toHaveURL(/\/login(?:\?|$)/);
    }finally {
      for(const id of ids)await db.user.delete({where:{id}}).catch(()=>{});
      proxy.closeAllConnections();await new Promise<void>(resolve=>proxy.close(()=>resolve()));rmSync(directory,{recursive:true,force:true});
    }
  });
});

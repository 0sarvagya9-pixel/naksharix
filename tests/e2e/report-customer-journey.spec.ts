import {test,expect} from "@playwright/test";
import {PrismaClient} from "@prisma/client";
import {createHmac,randomUUID} from "node:crypto";
import {createServer} from "node:https";
import {request as forwardRequest} from "node:http";
import {execFileSync} from "node:child_process";
import {mkdtempSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
const base=new URL(process.env.PLAYWRIGHT_BASE_URL||"http://127.0.0.1:3000"),targetDb=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
const safe=process.env.CI==="true"&&process.env.EMAIL_PROVIDER==="disabled"&&!!process.env.JWT_SECRET&&base.protocol==="http:"&&["localhost","127.0.0.1"].includes(base.hostname)&&["localhost","127.0.0.1","postgres"].includes(targetDb.hostname)&&["/naksharix","/naksharix_browser"].includes(targetDb.pathname)&&!process.env.VERCEL_ENV;
test.describe("Original report customer journey (A09/A16/A42/A45)",()=>{
 test.skip(!safe,"Disposable database, disabled email and loopback server mandatory.");
 test.use({ignoreHTTPSErrors:true});
 test("catalogue to signup, real OTP session and selected report preflight without merchant requests",async({page,context},info)=>{
  test.setTimeout(120000);
  const prisma=new PrismaClient(),nonce=randomUUID(),email="report-journey-"+nonce+"@example.test",password="OnlyCI!"+nonce;
  const directory=mkdtempSync(join(tmpdir(),"nx-report-https-")),key=join(directory,"key.pem"),cert=join(directory,"cert.pem");
  execFileSync("openssl",["req","-x509","-newkey","rsa:2048","-nodes","-keyout",key,"-out",cert,"-days","1","-subj","/CN=localhost","-addext","subjectAltName=IP:127.0.0.1,DNS:localhost"],{stdio:"ignore",timeout:10000});
  const blocked:string[]=[],requests:string[]=[],fixtureIp="198.51.100."+String(80+info.workerIndex%100);
  const proxy=createServer({key:readFileSync(key),cert:readFileSync(cert)},(incoming,outgoing)=>{
   const path=(incoming.url||"").split("?")[0];
   if(incoming.method==="POST"&&path.startsWith("/api/payments/")){blocked.push(path);outgoing.writeHead(403);outgoing.end();return;}
   if(incoming.method==="POST")requests.push(path);
   const req=forwardRequest({hostname:base.hostname,port:base.port||3000,path:incoming.url,method:incoming.method,headers:{...incoming.headers,"x-forwarded-proto":"https","x-forwarded-host":incoming.headers.host||"","x-forwarded-for":fixtureIp}},res=>{outgoing.writeHead(res.statusCode||502,res.headers);res.pipe(outgoing)});
   req.on("error",()=>{if(!outgoing.headersSent)outgoing.writeHead(502);outgoing.end()});incoming.pipe(req);
  });
  await new Promise<void>(resolve=>proxy.listen(0,"127.0.0.1",resolve));const address=proxy.address();if(!address||typeof address==="string")throw Error("HTTPS fixture not bound");
  const origin="https://127.0.0.1:"+address.port;
  try{
   await context.addCookies([{name:"naksharix-language",value:"en",url:origin}]);
   await page.route("**/*",route=>{const url=new URL(route.request().url());return url.origin===origin||url.protocol==="data:"?route.continue():route.abort()});
   await page.goto(origin+"/reports");
   const compare=page.locator("#compare-reports");await compare.locator("summary").click();
   await compare.locator("article").filter({has:page.locator('a[href="/reports/premium-kundli"]')}).getByRole("link",{name:"View details"}).click();
   await expect(page).toHaveURL(/\/reports\/premium-kundli$/);
   await page.getByRole("button",{name:/Validate details.*INR 799/i}).first().click();
   await expect(page).toHaveURL(/\/login\?/);
   const resume=new URL(page.url()).searchParams.get("redirectTo");expect(resume).toBe("/report-request/new?reportSlug=premium-kundli&prepare=1");
   await page.getByRole("link",{name:"Create an account"}).click();
   await expect(page).toHaveURL(/\/signup\?/);expect(new URL(page.url()).searchParams.get("redirectTo")).toBe(resume);
   await expect(page.locator("html")).toHaveCSS("scroll-behavior","auto");
   await page.locator("#name").fill("Synthetic Report Customer");await page.locator("#email").fill(email);await page.locator("#password").fill(password);
   await page.locator("form").getByRole("button",{name:/create|sign up|register/i}).click();
   await expect(page).toHaveURL(/\/verify-email$/);await expect(page.locator("#verification-email")).toHaveValue(email);
   const account=await prisma.user.findUniqueOrThrow({where:{email}});expect(account.emailVerified).toBeNull();
   const otp=await prisma.otpToken.findFirstOrThrow({where:{userId:account.id,purpose:"EMAIL_VERIFY",consumedAt:null}});
   const code="472913",codeHash=createHmac("sha256",process.env.JWT_SECRET!).update("EMAIL_VERIFY:"+email+":"+code).digest("hex");
   await prisma.otpToken.update({where:{id:otp.id},data:{codeHash}});
   await page.locator("#verification-code").fill(code);await page.locator("form button[type=submit]").click();
   await expect(page).toHaveURL(/\/report-request\/new\?/);
   expect(new URL(page.url()).searchParams.get("reportSlug")).toBe("premium-kundli");expect(new URL(page.url()).searchParams.get("prepare")).toBe("1");
   expect((await prisma.otpToken.findUniqueOrThrow({where:{id:otp.id}})).consumedAt).not.toBeNull();
   expect((await prisma.user.findUniqueOrThrow({where:{id:account.id}})).emailVerified).not.toBeNull();
   const session=(await context.cookies(origin)).find(c=>c.name==="__Host-naksharix_session");expect(session?.secure).toBe(true);expect(session?.httpOnly).toBe(true);
   await expect(page.getByRole("heading",{level:1})).toHaveCount(1);
   await expect(page.getByText("Premium Personalized Kundli Report · INR 799",{exact:true})).toBeVisible();
   await page.locator('[data-field="fullName"]').fill("Synthetic Birth Person");
   await page.locator('[data-field="dateOfBirth"]').fill("1990-01-15");
   const certainty=page.getByLabel("Birth time accuracy");
   for(const value of ["unknown","approximate"]){await certainty.selectOption(value);await expect(page.getByRole("button",{name:"Validate details and continue"})).toBeDisabled();}
   await certainty.selectOption("known");await page.locator('[data-field="timeOfBirth"]').fill("10:30");
   await page.locator('[data-field="birthPlace"]').fill("Delhi");await page.getByRole("option",{name:/Delhi, India/}).first().click();
   await expect(page.locator("#report-birth-offset")).toHaveValue("5.5");
   await page.getByRole("checkbox",{name:/I confirm these birth details/}).check();
   const submit=page.getByRole("button",{name:"Validate details and continue"});
   const form=page.locator("form").filter({has:submit});
   await expect(page.locator("html")).toHaveCSS("scroll-behavior","auto");
   // A question is optional. Edit the confirmed details before the checkout
   // control is invoked, then verify the original inputs were preserved.
   const [withoutQuestion]=await Promise.all([page.waitForResponse(r=>new URL(r.url()).pathname==="/api/report-requests/preflight"),submit.click()]);
   expect(withoutQuestion.status()).toBe(200);
   expect(withoutQuestion.request().postDataJSON().concern).toBe("");
   await page.getByRole("button",{name:"Edit details"}).click();
   await page.locator('[data-field="concern"]').fill("Synthetic private career reflection for QA only.");
   await expect(page.locator('[data-field="fullName"]')).toHaveValue("Synthetic Birth Person");
   await expect(page.locator('[data-field="concern"]')).toHaveValue("Synthetic private career reflection for QA only.");
   await expect(page.getByRole("checkbox",{name:/I confirm these birth details/})).toBeChecked();
   // Preserve the real user click and server acceptance. Diagnose native browser
   // validity separately instead of waiting two minutes for a missing POST.
   await expect(page.locator('[data-field="dateOfBirth"]')).toHaveValue("1990-01-15");
   await expect(page.locator('[data-field="timeOfBirth"]')).toHaveValue(/^10:30(?::00(?:\.0+)?)?$/);
   const nativeInvalid=await form.evaluate(node=>Array.from(node.querySelectorAll<HTMLInputElement>("input:invalid, textarea:invalid, select:invalid")).map(el=>({field:el.dataset.field||el.name||el.type,valueMissing:el.validity.valueMissing,badInput:el.validity.badInput,stepMismatch:el.validity.stepMismatch})));
   expect(nativeInvalid,"Native form constraints must allow valid synthetic inputs").toEqual([]);
   const previousPreflights=requests.filter(path=>path==="/api/report-requests/preflight").length;
   const [preflight]=await Promise.all([
    page.waitForResponse(res=>new URL(res.url()).pathname==="/api/report-requests/preflight"&&res.request().method()==="POST",{timeout:15000}),
    submit.click()
   ]).catch(async error=>{
    const messages=await form.locator('[role="alert"],[aria-live="polite"]').allTextContents().catch(()=>[]);
    const invalidFields=await form.locator('[aria-invalid="true"]').evaluateAll(els=>els.map(el=>el.getAttribute("data-field")||el.getAttribute("name")||el.tagName)).catch(()=>[]);
    const attemptPosts=requests.filter(path=>path==="/api/report-requests/preflight").length-previousPreflights;
    console.error("REPORT_PREFLIGHT_NO_RESPONSE "+JSON.stringify({project:info.project.name,attemptPosts,invalidFields,messages:messages.map(m=>m.slice(0,240))}));
    throw error;
   });
   expect(preflight.status()).toBe(200);
   const submitted=preflight.request().postDataJSON();expect(submitted.birth.dateOfBirth).toBe("1990-01-15");expect(submitted.birth.timeOfBirth).toBe("10:30");
   expect(submitted.birth.name).toBe("Synthetic Birth Person");expect(submitted.concern).toBe("Synthetic private career reflection for QA only.");expect(submitted.birth.timezone).toBe(5.5);expect(submitted.automaticDetails.confirmed).toBe(true);
   const result=await preflight.json();expect(result.data.reportId).toBe("kundli-pro");expect(result.data.price).toBe("INR 799");expect(result.data.expiresInSeconds).toBe(1200);
   const claim=JSON.parse(Buffer.from(result.data.token.split(".")[0],"base64url").toString("utf8"));
   expect(Object.keys(claim).sort()).toEqual(["amountPaise","exp","inputDigest","purpose","reportId","userId","v"]);expect(claim.userId).toBe(account.id);expect(claim.amountPaise).toBe(79900);
   await expect(page.getByRole("heading",{name:"Details validated - review payment"})).toBeVisible();
   await expect(page.getByRole("button",{name:"Pay INR 799"})).toBeVisible();
   expect(await prisma.payment.count({where:{userId:account.id}})).toBe(0);expect(await prisma.reportRequest.count({where:{userId:account.id}})).toBe(0);
   expect(blocked).toEqual([]);expect(requests).toContain("/api/auth/signup");expect(requests).toContain("/api/auth/otp/verify");expect(requests).toContain("/api/report-requests/preflight");
   // Verify independent server-cookie and hydrated UI language on the same
   // authenticated pre-payment flow. Never create an order or payment.
   const localeCases=[
    {locale:"hi",offset:"जन्म के समय UTC से अंतर (घंटों में)",submit:"विवरण सत्यापित करें और आगे बढ़ें",consent:"मैं पुष्टि करता/करती हूँ कि जन्म विवरण"},
    {locale:"hinglish",offset:"Janm ke samay UTC offset (ghanton mein)",submit:"Details validate karein aur aage badhein",consent:"Main confirm karta/karti hoon ki birth details"}
   ];
   for(const c of localeCases){
    await context.addCookies([{name:"naksharix-language",value:c.locale,url:origin}]);
    await page.goto(origin+"/report-request/new?reportSlug=premium-kundli&prepare=1");
    await expect(page.getByLabel(c.offset,{exact:true})).toBeVisible();
    await expect(page.getByRole("button",{name:c.submit,exact:true})).toBeVisible();
    await expect(page.getByRole("checkbox",{name:c.consent,exact:false})).toBeVisible();
    await expect(page.locator('select[name="reportLanguage"]')).toHaveValue(c.locale);
   }
   await context.addCookies([{name:"naksharix-language",value:"en",url:origin}]);
   for(const slug of ["numerology-lo-shu-report","name-correction-report"]){
    await page.goto(origin+"/report-request/new?reportSlug="+slug+"&prepare=1");
    for(const field of ["reportBirthTime","reportGender","reportPhone","reportBirthOffset"])await expect(page.locator('[name="'+field+'"]')).toHaveCount(0);
    await expect(page.locator('[data-field="birthPlace"]')).toHaveCount(0);
    await page.locator('[name="reportFullName"]').fill("आशा");
    await page.locator('[name="reportBirthDate"]').fill("1990-01-15");
    await page.locator('[name="reportRomanName"]').fill("Asha");
    if(slug==="name-correction-report")await page.locator('[name="reportCandidateNames"]').fill("Aasha");
    await page.locator('[name="reportConfirmed"]').check();
    const [result]=await Promise.all([page.waitForResponse(r=>new URL(r.url()).pathname==="/api/report-requests/preflight"),page.getByRole("button",{name:"Validate details and continue"}).click()]);
    expect(result.status()).toBe(200);expect(result.request().postDataJSON().birth).toEqual({name:"आशा",dateOfBirth:"1990-01-15"});
    await expect(page.getByRole("button",{name:"Pay INR 399"})).toBeVisible();
   }
   await page.goto(origin+"/report-request/new?reportSlug=fortune-report&prepare=1");
   await expect(page.getByLabel("Full name in Roman letters (for name numerology)")).toHaveAttribute("required","");
   expect(requests.filter(p=>p==="/api/report-requests/preflight")).toHaveLength(4);
   expect(blocked).toEqual([]);
   expect(await prisma.payment.count({where:{userId:account.id}})).toBe(0);
   expect(await prisma.reportRequest.count({where:{userId:account.id}})).toBe(0);
   console.log("REPORT_REQUEST_UI_LOCALE_JOURNEY_PASS "+JSON.stringify({project:info.project.name,locales:["en","hi","hinglish"],merchantRequests:0}));
   console.log("REPORT_CUSTOMER_JOURNEY_PASS "+JSON.stringify({project:info.project.name,realSignup:true,realOtpSession:true,preflightReport:"premium-kundli",pricePaise:79900,merchantRequests:0,paymentRows:0,reportRows:0,syntheticOtpHashOnly:true}));
  }finally{await prisma.user.deleteMany({where:{email}}).catch(()=>{});await prisma.$disconnect();await new Promise<void>(resolve=>proxy.close(()=>resolve()));rmSync(directory,{recursive:true,force:true});}
 });
});

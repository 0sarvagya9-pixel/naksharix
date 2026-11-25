import {expect,test} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Acceptance is scoped to the original six customer-facing requirements,
// not a claim of real mailbox delivery, OAuth or live payments.
test.beforeEach(async({page})=>{
 await page.context().addCookies([{name:"naksharix-language",value:"en",url:"http://127.0.0.1:3000"}]);
});
test("A08 password visibility and autocomplete preserve input on all credential forms",async({page})=>{
 for(const path of ["/login","/signup","/auth/login","/auth/signup","/auth/astrologer-login"]){
  await page.goto(path,{waitUntil:"domcontentloaded"});
  const input=page.locator("#password"),toggle=page.locator('button[aria-controls="password"]');
  await expect(input).toHaveAttribute("type","password");
  await expect(input).toHaveAttribute("autocomplete",path.includes("signup")?"new-password":"current-password");
  await input.fill("Synthetic-QA-only-2026!");
  await toggle.click();await expect(toggle).toHaveAttribute("aria-pressed","true");await expect(input).toHaveAttribute("type","text");await expect(input).toHaveValue("Synthetic-QA-only-2026!");
  await toggle.click();await expect(toggle).toHaveAttribute("aria-pressed","false");await expect(input).toHaveAttribute("type","password");await expect(input).toHaveValue("Synthetic-QA-only-2026!");
 }
 await page.goto("/reset-password#token="+"a".repeat(43),{waitUntil:"domcontentloaded"});
 const a=page.locator("#new-password"),b=page.locator("#confirm-password"),toggle=page.locator('button[aria-controls="new-password confirm-password"]');
 for(const x of [a,b]){await expect(x).toHaveAttribute("autocomplete","new-password");await expect(x).toHaveAttribute("type","password");await x.fill("Synthetic-reset-QA!");}
 await toggle.click();for(const x of [a,b]){await expect(x).toHaveAttribute("type","text");await expect(x).toHaveValue("Synthetic-reset-QA!");}
 await toggle.click();for(const x of [a,b])await expect(x).toHaveAttribute("type","password");
});
test("A11 explicit professional signup overrides saved user intent and selects the submitted role",async({page})=>{
 await page.goto("/signup?role=user");await expect(page.locator('input[name="role"]')).toHaveValue("USER");
 await page.goto("/signup?role=professional");
 await expect(page.locator("#professionalRole")).toBeVisible();
 await expect(page.locator('input[name="role"]')).toHaveValue("ASTROLOGER");
 await page.locator("#professionalRole").selectOption("CONSULTANT");
 await expect(page.locator('input[name="role"]')).toHaveValue("CONSULTANT");
 await expect(page.getByText("Your profile will be created with pending admin approval by default.")).toBeVisible();
 await page.goto("/auth/signup?role=professional");
 await expect(page.locator('input[name="role"]')).toHaveValue("ASTROLOGER");
 await page.goto("/signup?role=user");await expect(page.locator("#professionalRole")).toHaveCount(0);await expect(page.locator('input[name="role"]')).toHaveValue("USER");
});
test("A13 every authentication entry has one accessible H1 and labelled credential fields",async({page})=>{
 test.setTimeout(120000);
 for(const route of ["/login","/signup","/auth/login","/auth/signup","/auth/astrologer-login","/forgot-password","/reset-password","/verify-email"]){
  await page.goto(route,{waitUntil:"domcontentloaded"});
  const h=page.getByRole("heading",{level:1});await expect(h).toHaveCount(1);await expect(h).toBeVisible();
  await expect(h).not.toHaveText("");
  const fields=await page.locator("main input:not([type=hidden])").evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length>0).map(n=>({id:n.id,labels:(n as HTMLInputElement).labels?.length||0,aria:n.getAttribute("aria-label")||n.getAttribute("aria-labelledby")})));
  expect(fields.every(f=>f.labels>0||f.aria),route+" labelled fields").toBe(true);
  const result=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  expect.soft(result.violations.filter(v=>v.impact==="serious"||v.impact==="critical").map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,reason:n.failureSummary}))})),route+" accessible semantics").toEqual([]);
 }
});
test("A17 and A18 report comparison uses the renderer-backed benefits and exact catalogue prices",async({page})=>{
 await page.goto("/reports",{waitUntil:"domcontentloaded"});
 const details=page.locator("#compare-reports");await details.locator("summary").click();
 const box=details.locator('section[aria-labelledby="compare-reports-heading"]');
 await expect(box.getByRole("status")).toHaveText("3/3");await expect(box.locator("article")).toHaveCount(3);
 const expected=[["premium-kundli","INR 799","Planet positions, twelve houses and Navamsa"],["couple-kundli","INR 699","Ashtakoot / 36-point Guna Milan"],["numerology-lo-shu-report","INR 399",null]];
 for(const [slug,price,feature] of expected){
  const card=box.locator("article").filter({has:page.locator('a[href="/reports/'+slug+'"]')});
  await expect(card.getByText(price!,{exact:true})).toBeVisible();
  if(feature)await expect(card.getByText(feature,{exact:true})).toBeVisible();
 }
 const career=box.getByRole("checkbox",{name:"Career Report",exact:true});
 await expect(career).toBeDisabled();
 await box.getByRole("checkbox",{name:"Premium Personalized Kundli Report",exact:true}).uncheck();
 await expect(box.getByRole("status")).toHaveText("2/3");await expect(career).toBeEnabled();await career.check();
 await expect(box.getByRole("status")).toHaveText("3/3");await expect(box.locator("article")).toHaveCount(3);
 const card=box.locator("article").filter({has:page.locator('a[href="/reports/career-report"]')});
 await expect(card.getByText("INR 599",{exact:true})).toBeVisible();
 await expect(card.getByText("Career, skill and work houses",{exact:true})).toBeVisible();
 for(let i=0;i<3;i++)await box.getByRole("checkbox",{checked:true}).first().uncheck();
 await expect(box.getByRole("status")).toHaveText("0/3");await expect(box.locator("article")).toHaveCount(0);
 await expect(box.getByText("Select a report to start comparing.")).toBeVisible();
 await career.check();await expect(box.getByRole("status")).toHaveText("1/3");
 await box.getByRole("link",{name:"View details"}).click();await expect(page).toHaveURL(/\/reports\/career-report$/);
});


test("A18 keyboard-only comparison respects the three-item cap, preserves focus and navigates at mobile width",async({page,browserName},info)=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/reports",{waitUntil:"domcontentloaded"});
 const details=page.locator("#compare-reports"),summary=details.locator("summary");
 await summary.focus();await expect(summary).toBeFocused();await page.keyboard.press("Enter");
 await expect(details).toHaveAttribute("open","");
 const box=details.locator('section[aria-labelledby="compare-reports-heading"]');
 const premium=box.getByRole("checkbox",{name:"Premium Personalized Kundli Report",exact:true});
 const career=box.getByRole("checkbox",{name:"Career Report",exact:true});
 await expect(career).toBeDisabled();
 if(browserName!=="webkit"){await page.keyboard.press("Tab");await expect(premium).toBeFocused();}
 else await premium.focus(); // WebKit platform Tab preferences differ; exercise native keyboard activation.
 await page.keyboard.press("Space");await expect(premium).not.toBeChecked();await expect(premium).toBeFocused();
 await expect(box.getByRole("status")).toHaveText("2/3");await expect(career).toBeEnabled();
 await career.focus();await page.keyboard.press("Space");await expect(career).toBeChecked();await expect(career).toBeFocused();
 await expect(box.getByRole("status")).toHaveText("3/3");await expect(box.locator("article")).toHaveCount(3);
 const card=box.locator("article").filter({has:page.locator('a[href="/reports/career-report"]')});
 await expect(card.getByText("INR 599",{exact:true})).toBeVisible();
 const dimensions=await box.evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));
 expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client+2);
 const link=card.getByRole("link",{name:"View details",exact:true});
 await expect(link).toHaveAttribute("aria-describedby","comparison-title-career-report");
 await page.screenshot({path:info.outputPath("report-comparison-keyboard.png"),animations:"disabled"});
 await link.focus();await expect(link).toBeFocused();await page.keyboard.press("Enter");
 await expect(page).toHaveURL(/\/reports\/career-report$/);
 console.log("A18_KEYBOARD_COMPARISON_PASS "+JSON.stringify({project:info.project.name,viewport:390,keyboardActivation:true,tabTraversal:browserName!=="webkit"}));
});

test("A42 all 15 report detail pages show exact price, fictional sample, requirements and mobile review action",async({page},info)=>{
 test.setTimeout(180000);
 await page.setViewportSize({width:390,height:844});
 const prices=[
 ["premium-kundli",799],["couple-kundli",699],["career-report",599],["wealth-report",599],["love-report",499],
 ["baby-name-report",399],["sade-sati-report",399],["manglik-kaal-sarp-report",499],["numerology-lo-shu-report",399],
 ["name-correction-report",399],["yearly-horoscope-report",999],["transit-report",449],["rahu-ketu-report",399],["jupiter-transit-report",399],["fortune-report",499]
 ] as const;
 for(const [slug,price] of prices){
  const response=await page.goto("/reports/"+slug,{waitUntil:"domcontentloaded"});expect(response?.ok(),slug).toBeTruthy();
  await expect(page.getByRole("heading",{level:1})).toHaveCount(1);
  const purchase=page.locator("#report-purchase");await expect(purchase.getByRole("button",{name:"Validate details INR "+price,exact:true})).toBeVisible();
  const sample=page.getByRole("link",{name:"View fictional sample PDF (English)",exact:true});
  await expect(sample).toHaveAttribute("href","/reports/"+slug+"/sample");
  await expect(sample).toHaveAttribute("target","_blank");
  await expect(page.getByText("Actual UTC offset at birth (including daylight saving where applicable)",{exact:true})).toBeVisible();
  if(slug==="couple-kundli")await expect(page.getByText("Permission to submit the other person's birth details",{exact:true})).toBeVisible();
  if(slug==="name-correction-report")await expect(page.getByText("Alternative name spellings (at least one)",{exact:true})).toBeVisible();
  if(slug==="numerology-lo-shu-report")await expect(page.getByText("Full name in Roman letters (for name numerology)",{exact:true})).toBeVisible();
  if(slug==="baby-name-report")await expect(page.getByText("Preferred names (optional)",{exact:true})).toBeVisible();
  const sticky=page.locator("[data-report-mobile-action]");await expect(sticky).toBeVisible();await expect(sticky.getByText("INR "+price,{exact:true})).toBeVisible();
  await expect(sticky.getByRole("link",{name:"Review & continue",exact:true})).toHaveAttribute("href","#report-purchase");
  const bounds=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));expect(bounds.scroll,slug+" overflow").toBeLessThanOrEqual(bounds.client+2);
 }
 // Confirm the existing anonymous CTA still preserves its exact chosen SKU.
 await page.goto("/reports/name-correction-report",{waitUntil:"domcontentloaded"});
 await page.locator("[data-report-mobile-action]").getByRole("link",{name:"Review & continue"}).click();
 await expect(page).toHaveURL(/#report-purchase$/);
 await page.locator("#report-purchase").getByRole("button",{name:"Validate details INR 399"}).click();
 await expect(page).toHaveURL(/\/login\?/);
 expect(new URL(page.url()).searchParams.get("redirectTo")).toBe("/report-request/new?reportSlug=name-correction-report&prepare=1");
 console.log("A42_ALL_REPORT_DETAIL_UI_PASS "+JSON.stringify({project:info.project.name,products:15,viewport:390,selectedReportReturn:true}));
});


test("A43 all authentication flows share the approved layout without overflow and retain localized interaction controls",async({page},info)=>{
 test.setTimeout(180000);
 const routes=["/login?role=user","/signup?role=user","/auth/login?role=user","/auth/signup?role=professional","/auth/astrologer-login","/forgot-password","/reset-password#token="+"a".repeat(43),"/verify-email"];
 for(const locale of ["en","hi","hinglish"]){
  await page.context().addCookies([{name:"naksharix-language",value:locale,url:"http://127.0.0.1:3000"}]);
  await page.setViewportSize({width:320,height:760});
  for(const path of routes){
   await page.goto(path,{waitUntil:"domcontentloaded"});
   const frame=page.locator("[data-auth-frame]");await expect(frame).toBeVisible();
   await expect(frame.getByRole("heading",{level:1})).toHaveCount(1);
   const dims=await frame.evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,viewport:document.documentElement.clientWidth}));
   expect(dims.scroll,path+" "+locale+" overflow").toBeLessThanOrEqual(dims.client+2);expect(dims.left).toBeGreaterThanOrEqual(-1);expect(dims.right).toBeLessThanOrEqual(dims.viewport+1);
   const fields=frame.locator("input:not([type=hidden]),select");
   const unlabelled=await fields.evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length>0&&!(n as HTMLInputElement).labels?.length&&!n.getAttribute("aria-label")&&!n.getAttribute("aria-labelledby")).length);
   expect(unlabelled,path+" "+locale+" missing labels").toBe(0);
   if(path.startsWith("/login")||path.startsWith("/signup")||path.startsWith("/auth/")){
    const password=frame.locator("#password"),toggle=frame.locator('button[aria-controls="password"]');
    await password.fill("Synthetic-Layout-QA-2026!");await toggle.click();await expect(password).toHaveAttribute("type","text");await expect(password).toHaveValue("Synthetic-Layout-QA-2026!");await toggle.click();await expect(password).toHaveAttribute("type","password");
   }
  }
 }
 console.log("A43_AUTH_LAYOUT_MATRIX_PASS "+JSON.stringify({project:info.project.name,routes:8,locales:3,width:320,layoutCases:24}));
});


test("A22 2027 annual guide supports all twelve rashi selections in both published languages on a narrow viewport",async({page},info)=>{
 test.setTimeout(120000);await page.setViewportSize({width:390,height:844});
 const signs=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"],hindi=["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुंभ","मीन"];
 // January independent reference: Jupiter Leo, Saturn Pisces.
 for(const locale of ["en","hi"]){
  await page.goto(locale==="hi"?"/hi/yearly-horoscope-2027":"/yearly-horoscope-2027",{waitUntil:"domcontentloaded"});
  const select=page.locator("#annual-rashi");await expect(select).toBeVisible();
  const months=page.locator('article').filter({has:page.locator("time[datetime]")});await expect(months).toHaveCount(12);
  const january=months.filter({has:page.locator('time[datetime="2027-01-01"]')});
  for(const [i,sign] of signs.entries()){
   await select.selectOption(sign);await expect(page.getByRole("status").filter({hasText:"2027"})).toHaveText((locale==="hi"?hindi[i]:sign)+" · 2027");
   await expect(january).toContainText((locale==="hi"?"भाव ":"House ")+((4-i+12)%12+1));
   await expect(january).toContainText((locale==="hi"?"भाव ":"House ")+((11-i+12)%12+1));
  }
  const size=await page.evaluate(()=>({w:document.documentElement.clientWidth,s:document.documentElement.scrollWidth}));expect(size.s).toBeLessThanOrEqual(size.w+2);
 }
 console.log("A22_ANNUAL_WEB_UI_PASS "+JSON.stringify({project:info.project.name,signs:12,locales:2,viewport:390,referenceYear:2027}));
});

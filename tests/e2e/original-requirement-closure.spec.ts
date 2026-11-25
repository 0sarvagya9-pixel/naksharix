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

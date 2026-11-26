import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import Module, { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";

const db = new URL(process.env.DATABASE_URL ?? "");
assert.equal(process.env.CI, "true");
assert.equal(db.hostname, "localhost");
assert.equal(db.port, "5432");
assert.equal(db.pathname, "/naksharix");
Object.assign(process.env, {
  NODE_ENV: "test", ASTROLOGY_PROVIDER:"own_engine", AUTO_REPORT_DELIVERY_ENABLED: "true", REPORT_STORAGE_DRIVER: "database",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000", EMAIL_PROVIDER: "smtp", SMTP_HOST: "smtp.resend.com",
  SMTP_USER: "resend", SMTP_PASS: "local-fixture-only", SMTP_FROM: "Fixture <fixture@example.invalid>"
});

const require = createRequire(import.meta.url);
const ts = require("typescript");
const resolve = Module._resolveFilename, load = Module._load;
let admin, currentUser;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.startsWith("@/") ? path.resolve(name.slice(2)) : name, ...args);
};
Module._load = function (name, ...args) {
  if (name === "@/lib/auth/jwt") return { getCurrentUser: async () => currentUser };
  if (name === "server-only") return {};
  if (name === "@/lib/auth/roles") return { getAdminApiUser: async () => admin };
  return load.call(this, name, ...args);
};
require.extensions[".ts"] = function (module, file) {
  const output = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true
  } });
  module._compile(output.outputText, file);
};

const { prisma } = require("@/lib/db");
const { POST: send } = require("@/app/api/admin/report-requests/[id]/deliver/route");
const { PATCH: patch } = require("@/app/api/admin/report-requests/route");
const { processAutomaticReport } = require("@/lib/reports/automatic-report-worker");
const { POST: propose } = require("@/app/api/report-requests/[id]/revisions/route");
const { POST: review } = require("@/app/api/admin/report-requests/[id]/revisions/[version]/route");
const { GET: download } = require("@/app/api/report-requests/[id]/revisions/[version]/route");
const requests = [];
let providerStatus = 200, providerBody={id:"local-only"}, suspend, entered;
globalThis.fetch = async (url, init) => {
  assert.equal(String(url), "https://api.resend.com/emails");
  requests.push({ body: JSON.parse(init.body), key: init.headers["Idempotency-Key"] });
  entered?.();
  if (suspend) await suspend;
  return Response.json(providerBody, { status: providerStatus });
};
const runId = randomUUID();
admin = await prisma.user.create({data: {name: "Fixture Admin", role:"ADMIN", email: "admin-" + runId + "@example.invalid"}});
const user = await prisma.user.create({ data: { name: "Synthetic User", email: runId + "@example.invalid", emailVerified: new Date() } });
const bytes = Buffer.from("%PDF-1.7\nsynthetic private test\n%%EOF");
const checksum = createHash("sha256").update(bytes).digest("hex");
const ids = [];
async function fixture(overrides = {}) {
  const payment = await prisma.payment.create({data: {
    userId: user.id, provider: "RAZORPAY", status: "PAID", purpose: "KUNDLI_REPORT", amount: 799,
    currency: "INR", providerPaymentId: "pay_" + randomUUID().replaceAll("-", ""), metadata: { reportId: "kundli-pro" }
  }});
  const row = await prisma.reportRequest.create({data: {
    userId: user.id, paymentId: payment.id, planType: "PREMIUM", reportSlug: "premium-kundli",
    paymentStatus: "PAID", status: "GENERATED", deliveryStatus: "auto_email_ready",
    fullName: user.name, deliveryEmail: user.email, dateOfBirth: "1990-01-31", timeOfBirth: "10:30",
    birthPlace: "Delhi", language: "hi", concern: require("@/lib/reports/automatic-report-input").encodeAutomaticReportInput("", { confirmed: true }),
    generatedPdfBytes: bytes, generatedPdfSize: bytes.length, generatedPdfChecksum: checksum,
    generatedPdfStorageDriver: "database", generatedAt: new Date(), ...overrides
  }});
  ids.push(row.id);
  return row.id;
}
const post = id => send(new Request("http://localhost/synthetic", { method: "POST" }), { params: Promise.resolve({id}) });
const cases = [];
async function check(name, fn) {
  try { await fn(); cases.push({ name, pass: true }); }
  catch(error) { cases.push({ name, pass:false, reason:error.message }); }
}
try {
  await check("concurrent admin delivery and workflow edit", async () => {
    const id = await fixture();
    const count = requests.length;
    let release;
    suspend = new Promise(r => {release = r;});
    const providerEntered = new Promise(r => {entered = r;});
    const first = post(id);
    let second, edit;
    try {
      await Promise.race([providerEntered, delay(3000).then(() => {throw Error("Provider never entered");})]);
      second = post(id);
      edit = patch(new Request("http://localhost/synthetic", {method:"PATCH", body:JSON.stringify({id, status:"IN_PROGRESS"})}));
      await delay(100);
    } finally { release(); suspend = undefined; entered = undefined; }
    const responses = await Promise.all([first,second,edit]);
    assert.deepEqual(responses.map(r => r.status), [200,409,409]);
    assert.equal(requests.length - count, 1);
    assert.equal((await post(id)).status, 200);
    assert.equal(requests.length - count, 1);
  });
  await check("ambiguous provider outcome past safe retry window", async () => {
    const id = await fixture({status:"READY_FOR_DELIVERY", deliveryStatus:"auto_email_uncertain", generatedAt:new Date(Date.now()-25*3600_000)});
    const count = requests.length;
    assert.equal((await post(id)).status,409);
    assert.equal(requests.length,count);
  });
  await check("automatic then admin retry uses identical message and key", async () => {
    const id = await fixture(), count = requests.length;
    providerStatus = 503;
    assert.equal(await processAutomaticReport(id),"pending");
    const failed = await prisma.reportRequest.findUniqueOrThrow({where:{id}});
    assert.equal(failed.deliveryStatus,"auto_email_uncertain");
    providerStatus = 200;
    assert.equal((await post(id)).status,200);
    assert.equal(requests.length-count,2);
    assert.deepEqual(requests[count+1],requests[count]);
  });
  await check("verified registered mailbox enforced on manual deliveries", async () => {
    providerStatus = 200;
    const id = await fixture({adminBypass:true, deliveryEmail:"different@example.invalid"});
    const count = requests.length;
    assert.equal((await post(id)).status,409);
    assert.equal(requests.length,count);
  });
  await check("confirmed provider rejection remains retryable", async () => {
    const id = await fixture();
    providerStatus = 422;
    assert.equal((await post(id)).status,503);
    const failed = await prisma.reportRequest.findUniqueOrThrow({where:{id}});
    assert.equal(failed.status,"READY_FOR_DELIVERY");
    providerStatus = 200;
    assert.equal((await post(id)).status,200);
  });
  await check("saved-chart and other-request entitlements cannot deliver a private report", async () => {
    const id=await fixture();
    const row=await prisma.reportRequest.findUniqueOrThrow({where:{id}});
    const count=requests.length;
    for (const mismatched of [{savedReportId:"other-saved-chart"},{reportRequestId:"different-request"}]) {
      await prisma.payment.update({where:{id:row.paymentId},data:{metadata:{reportId:"kundli-pro",...mismatched}}});
      assert.equal(await processAutomaticReport(id),"skipped");
      assert.equal((await post(id)).status,409);
    }
    assert.equal(requests.length,count);
  });
  await check("unconfirmed success without provider message ID remains unresolved", async () => {
    const id=await fixture();
    providerBody={};
    try {
      assert.equal((await post(id)).status,503);
      const row=await prisma.reportRequest.findUniqueOrThrow({where:{id}});
      assert.equal(row.emailSentAt,null);
      assert.equal(row.deliveryStatus,"admin_email_uncertain");
    } finally { providerBody={id:"local-only"}; }
  });
  await check("validated correction, duplicate suppression, reviewed version, private download, revocation", async () => {
    const id = await fixture();
    const request = data => new Request("http://localhost/synthetic", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    const params = {params:Promise.resolve({id})}, revision = {params:Promise.resolve({id,version:"2"})};
    const details = {birth:{name:"Asha Corrected",dateOfBirth:"1990-02-02",timeOfBirth:"10:00",birthPlace:"Delhi",latitude:28.61,longitude:77.21,timezone:5.5},
      extra:{confirmed:true,birthZone:"Asia/Kolkata"},question:"How should I approach planning?",language:"en"};
    const approve = {action:"approve",note:"Verified the corrected birth details and owner consent against the submitted request."};
    currentUser = {id:"other-account",role:"USER"};
    assert.equal((await propose(request(details),params)).status,404);
    currentUser=user;
    assert.equal((await propose(request({...details,extra:{confirmed:false}}),params)).status,422);
    const submissions=await Promise.all([propose(request(details),params),propose(request(details),params)]);
    assert.deepEqual(submissions.map(r=>r.status),[200,200]);
    assert.equal(await prisma.reportRevision.count({where:{reportRequestId:id}}),1);
    assert.equal((await propose(request({...details,question:"Different proposal"}),params)).status,409);
    assert.equal((await download(request({}),revision)).status,404);
    assert.equal((await review(request({...approve,note:"short"}),revision)).status,422);
    const beforeEmail=requests.length;
    providerStatus=503;
    const verdict=await review(request(approve),revision);
    assert.equal(verdict.status,200,await verdict.text());
    assert.equal(requests.length,beforeEmail+1);
    const sentVersion=requests[beforeEmail];
    assert.equal(sentVersion.key,"naksharix/report-delivery/"+id+"/v2");
    assert.deepEqual(sentVersion.body.to,[user.email]);
    assert.ok(sentVersion.body.html.includes("Version 2"));
    assert.ok(sentVersion.body.html.includes("/report-request/success?id="+id));
    const beforeRetry=await prisma.reportRevision.findFirstOrThrow({where:{reportRequestId:id}});
    assert.equal(beforeRetry.emailStatus,"UNCERTAIN");
    providerStatus=200;
    const notify=()=>review(request({action:"notify"}),revision);
    assert.equal((await notify()).status,200);
    assert.equal((await notify()).status,200);
    assert.equal(requests.length,beforeEmail+2);
    assert.deepEqual(requests[beforeEmail+1],sentVersion);
    const accepted=await prisma.reportRevision.findFirstOrThrow({where:{reportRequestId:id}});
    assert.equal(accepted.providerEmailId,"local-only");
    assert.ok(accepted.acceptedEmailAt);
    const result=await download(request({}),revision);
    assert.equal(result.status,200);
    const payload = Buffer.from(await result.arrayBuffer());
    const parsed = await require("pdf-lib").PDFDocument.load(payload);
    assert.ok(parsed.getPageCount()>1);
    assert.ok(parsed.getTitle().includes(id+"-v2"));
    const original=await prisma.reportRequest.findUniqueOrThrow({where:{id}});
    assert.deepEqual(Buffer.from(original.generatedPdfBytes),bytes);
    assert.equal(original.generatedPdfChecksum,checksum);
    const rerun=await review(request(approve),revision);
    assert.equal(rerun.status,200);
    const same = Buffer.from(await (await download(request({}),revision)).arrayBuffer());
    assert.deepEqual(same,payload);
    currentUser={id:"other-account",role:"USER"};
    assert.equal((await download(request({}),revision)).status,404);
    currentUser=user;
    await prisma.payment.update({where:{id:original.paymentId},data:{status:"REFUNDED"}});
    assert.equal((await download(request({}),revision)).status,403);
  });
} finally {
  await prisma.reportRequest.deleteMany({where:{id:{in:ids}}});
  await prisma.user.deleteMany({where:{id:{in:[user.id,admin.id]}}});
  await prisma.$disconnect();
}
console.log(JSON.stringify({cases, scope:"Actual route handlers, Prisma transactions, disposable PG. Email transport and authenticated admin identity are test doubles."},null,2));
if (cases.some(c => !c.pass)) process.exitCode=1;

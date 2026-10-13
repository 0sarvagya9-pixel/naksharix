import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const base = new URL(process.env.AUTH_E2E_BASE_URL || "http://127.0.0.1:3000");
const dbUrl = new URL(process.env.DATABASE_URL || "postgresql://none:none@invalid/none");
if (process.env.CI !== "true" || base.protocol !== "http:" ||
  !["localhost", "127.0.0.1"].includes(base.hostname) ||
  !["localhost", "127.0.0.1"].includes(dbUrl.hostname) ||
  dbUrl.pathname !== "/naksharix" || !process.env.JWT_SECRET) {
  throw new Error("AUTH_E2E_REFUSED: requires CI localhost app and disposable localhost DB");
}
const prisma = new PrismaClient();
const unique = randomUUID().slice(0, 12);
const email = "qa-user-" + unique + "@example.test";
const astroEmail = "qa-astro-" + unique + "@example.test";
const adminEmail = "qa-admin-" + unique + "@example.test";
const password = "E2e!" + randomUUID() + "abc";
const testCode = "734928";
const usersToClean = new Set();
let csrf, csrfCookie, userCookie, adminCookie, astroCookie;
let userId, astroId, adminId, astroProfileId, bookingId, reportId;
let passed = 0, failed = 0;
async function req(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try { return await fetch(new URL(path, base), { redirect: "manual", signal: controller.signal, ...options }); }
  finally { clearTimeout(timer); }
}
async function post(path, body, session = "", method = "POST") {
  return req(path, { method, headers: { "content-type": "application/json", "x-csrf-token": csrf, cookie: [csrfCookie, session].filter(Boolean).join("; ") }, body: JSON.stringify(body) });
}
async function check(name, action) {
  try { await action(); passed++; console.log("AUTH_ROLE_PASS " + name); }
  catch (e) { failed++; console.error("AUTH_ROLE_FAIL " + name + ": " + (e?.stack || e)); }
}
try {
  const tokenResponse = await req("/api/csrf");
  assert.equal(tokenResponse.status, 200);
  csrf = (await tokenResponse.json()).data.csrfToken;
  csrfCookie = (tokenResponse.headers.get("set-cookie") || "").split(";")[0];
  assert.ok(csrf && csrfCookie);

  await check("signup creates OTP and no login session", async () => {
    const res = await post("/api/auth/signup", { name: "QA User", email, password, role: "USER", locale: "en" });
    const body = await res.json();
    assert.equal(res.status, 201, JSON.stringify(body));
    assert.equal(body.data?.verificationRequired, true);
    assert.equal(body.data?.deliverySent, false, "CI intentionally disables real email");
    assert.doesNotMatch(res.headers.get("set-cookie") || "", /naksharix_session/);
    userId = body.data.user.id; usersToClean.add(userId);
    const otp = await prisma.otpToken.findFirst({ where: { userId, purpose: "EMAIL_VERIFY" } });
    assert.ok(otp && !otp.consumedAt && otp.expiresAt > new Date());
  });
  await check("unverified login denied", async () => {
    const res = await post("/api/auth/login", { email, password, roleIntent: "USER", loginMode: "USER" });
    const body = await res.json();
    assert.equal(res.status, 403, JSON.stringify(body));
    assert.equal(body.details?.code, "EMAIL_VERIFICATION_REQUIRED");
  });
  await check("wrong OTP rejected then test-only OTP hash injected in disposable DB", async () => {
    const res = await post("/api/auth/otp/verify", { email, code: "000000" });
    assert.equal(res.status, 400);
    const row = await prisma.otpToken.findFirstOrThrow({ where: { userId, purpose: "EMAIL_VERIFY", consumedAt: null } });
    assert.equal(row.attempts, 1);
    const digest = createHmac("sha256", process.env.JWT_SECRET)
      .update("EMAIL_VERIFY:" + email + ":" + testCode).digest("hex");
    await prisma.otpToken.update({ where: { id: row.id }, data: { codeHash: digest } });
  });
  await check("valid OTP consumed and authenticated session issued", async () => {
    const res = await post("/api/auth/otp/verify", { email, code: testCode });
    const body = await res.json();
    assert.equal(res.status, 200, JSON.stringify(body));
    assert.equal(body.data?.verified, true);
    userCookie = (res.headers.get("set-cookie") || "").split(";")[0];
    assert.match(userCookie, /naksharix_session=/);
    const u = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    assert.ok(u.emailVerifiedAt && u.emailVerified);
    const otp = await prisma.otpToken.findFirstOrThrow({ where: { userId, purpose: "EMAIL_VERIFY" } });
    assert.ok(otp.consumedAt);
    const me = await req("/api/auth/me", { headers: { cookie: userCookie } });
    assert.equal(me.status, 200);
    assert.equal((await me.json()).data.user.id, userId);
  });
  await check("OTP replay rejected", async () => {
    assert.equal((await post("/api/auth/otp/verify", { email, code: testCode })).status, 400);
  });
  await check("regular user denied admin API and astrologer management", async () => {
    for (const path of ["/api/admin/analytics", "/api/admin/report-requests", "/api/admin/bookings", "/api/admin/readiness"]) {
      const res = await req(path, { headers: { cookie: userCookie } });
      assert.ok([403, 404].includes(res.status), path + " returned " + res.status);
    }
    assert.equal((await post("/api/admin/astrologers/review", { profileId: "none", action: "APPROVE" }, userCookie)).status, 403);
    assert.equal((await post("/api/astrologer/availability", { dayOfWeek: 2, startTime: "11:00", endTime: "11:30" }, userCookie)).status, 403);
  });
  await check("admin has authenticated access to actual admin data", async () => {
    const hash = await bcrypt.hash(password, 12);
    const u = await prisma.user.create({ data: { email: adminEmail, name: "QA Admin", role: "ADMIN", passwordHash: hash, emailVerified: new Date(), emailVerifiedAt: new Date() } });
    adminId = u.id; usersToClean.add(adminId);
    const res = await post("/api/auth/login", { email: adminEmail, password, roleIntent: "USER", loginMode: "USER" });
    const body = await res.json();
    assert.equal(res.status, 200, JSON.stringify(body));
    adminCookie = (res.headers.get("set-cookie") || "").split(";")[0];
    for (const path of ["/api/admin/analytics", "/api/admin/bookings", "/api/admin/report-requests", "/api/admin/readiness"]) {
      const view = await req(path, { headers: { cookie: adminCookie } });
      assert.equal(view.status, 200, path + " HTTP " + view.status);
    }
  });
  await check("astrologer signup creates pending private profile", async () => {
    const res = await post("/api/auth/signup", { name: "QA Astrologer", email: astroEmail, password, role: "ASTROLOGER", locale: "en" });
    const body = await res.json();
    assert.equal(res.status, 201, JSON.stringify(body));
    astroId = body.data.user.id; usersToClean.add(astroId);
    const profile = await prisma.astrologerProfile.findUniqueOrThrow({ where: { userId: astroId } });
    astroProfileId = profile.id;
    assert.equal(profile.status, "PENDING_REVIEW");
    const view = await req("/astrologers");
    assert.equal(view.status, 200);
    assert.ok(!(await view.text()).includes("QA Astrologer"));
  });
  await check("admin approves profile and public listing includes it", async () => {
    const res = await post("/api/admin/astrologers/review", { profileId: astroProfileId, action: "APPROVE" }, adminCookie);
    const body = await res.json();
    assert.equal(res.status, 200, JSON.stringify(body));
    assert.equal(body.data.profile.status, "APPROVED");
    const view = await req("/astrologers");
    assert.equal(view.status, 200);
    assert.ok((await view.text()).includes("QA Astrologer"));
  });
  await check("verified astrologer login and availability slot creation", async () => {
    await prisma.user.update({ where: { id: astroId }, data: { emailVerified: new Date(), emailVerifiedAt: new Date() } });
    const login = await post("/api/auth/login", { email: astroEmail, password, roleIntent: "ASTROLOGER", loginMode: "ASTROLOGER" });
    const loginBody = await login.json();
    assert.equal(login.status, 200, JSON.stringify(loginBody));
    astroCookie = (login.headers.get("set-cookie") || "").split(";")[0];
    const slot = await post("/api/astrologer/availability", { dayOfWeek: 2, startTime: "11:00", endTime: "11:30", consultationType: "CHAT", isActive: true, status: "ONLINE" }, astroCookie);
    assert.equal(slot.status, 201, await slot.text());
  });
  await check("user booking persists correct IST time without payment bypass", async () => {
    const slot = await prisma.availabilitySlot.findFirstOrThrow({ where: { astrologerProfileId: astroProfileId } });
    const res = await post("/api/consultation-bookings", {
      astrologerProfileId: astroProfileId, slotId: slot.id, bookingDate: "2027-01-05",
      customerName: "QA User", customerEmail: email, question: "What should I understand before planning my career?"
    }, userCookie);
    const body = await res.json();
    assert.equal(res.status, 201, JSON.stringify(body));
    assert.equal(body.data.booking.paymentStatus, "PENDING");
    assert.equal(body.data.booking.status, "REQUESTED");
    assert.equal(body.data.booking.scheduledAt, "2027-01-05T05:30:00.000Z");
    bookingId = body.data.booking.id;
    const b = await prisma.consultationBooking.findUniqueOrThrow({ where: { id: bookingId } });
    assert.equal(b.userId, userId);
  });
  await check("unpaid booking cannot be accepted by astrologer", async () => {
    const res = await post("/api/astrologer/bookings/action", { bookingId, action: "ACCEPT" }, astroCookie);
    assert.equal(res.status, 409, "unpaid booking accepted: " + await res.text());
  });


  await check("verified consultation review appears only in its astrologer's private dashboard", async () => {
    const denied = await req("/astrologer/reviews", { headers: { cookie: userCookie } });
    const deniedHtml = await denied.text();
    assert.ok([302, 303, 307, 308].includes(denied.status) || (denied.status === 200 && deniedHtml.includes("NEXT_REDIRECT") && !deniedHtml.includes("Latest Client Reviews")), "role authorization response unexpected");
    const anonymous = await req("/astrologer/reviews");
    assert.ok([302, 303, 307, 308].includes(anonymous.status), "anonymous visitor accessed reviews");

    // Synthetic paid/completed fixture is confined to disposable CI PostgreSQL.
    await prisma.consultationBooking.update({
      where: { id: bookingId }, data: { status: "COMPLETED", paymentStatus: "PAID" }
    });
    const reviewText = "This completed consultation gave useful context for my decisions.";
    const review = await post("/api/consultation-bookings/review", {
      bookingId, rating: 5, body: reviewText
    }, userCookie);
    assert.equal(review.status, 200, await review.text());
    const ownerPage = await req("/astrologer/reviews", { headers: { cookie: astroCookie } });
    assert.equal(ownerPage.status, 200);
    const html = await ownerPage.text();
    assert.ok(html.includes(reviewText), "verified review body not rendered in private dashboard");
    assert.ok(html.includes("Reviews and Ratings"), "dashboard title absent");
  });

  await check("support tickets are owned by the user and triaged only by admin", async () => {
    const anonRead = await req("/api/support/tickets");
    assert.equal(anonRead.status, 401);
    const payload = { subject: "Account access assistance", message: "Please help with my account settings and access." };
    const created = await post("/api/support/tickets", payload, userCookie);
    const createBody = await created.json();
    assert.equal(created.status, 201, JSON.stringify(createBody));
    const ticketId = createBody.data.ticket.id;
    assert.equal(createBody.data.ticket.status, "OPEN");

    const owned = await req("/api/support/tickets", { headers: { cookie: userCookie } });
    const ownedBody = await owned.json();
    assert.equal(owned.status, 200);
    assert.ok(ownedBody.data.tickets.some((ticket) => ticket.id === ticketId));
    const forbiddenAdmin = await req("/api/admin/support", { headers: { cookie: userCookie } });
    assert.equal(forbiddenAdmin.status, 404);
    const invalid = await post("/api/support/tickets", { subject: "a", message: "x" }, userCookie);
    assert.equal(invalid.status, 422);

    const adminList = await req("/api/admin/support", { headers: { cookie: adminCookie } });
    const adminBody = await adminList.json();
    assert.equal(adminList.status, 200);
    assert.ok(adminBody.data.tickets.some((ticket) => ticket.id === ticketId));
    const unauthorizedUpdate = await post("/api/admin/support", {
      ticketId, status: "RESOLVED", priority: "HIGH"
    }, userCookie, "PATCH");
    assert.equal(unauthorizedUpdate.status, 404);
    const reviewed = await post("/api/admin/support", {
      ticketId, status: "IN_PROGRESS", priority: "HIGH"
    }, adminCookie, "PATCH");
    assert.equal(reviewed.status, 200, await reviewed.text());
    const saved = await prisma.supportTicket.findUniqueOrThrow({ where: { id: ticketId } });
    assert.equal(saved.status, "IN_PROGRESS");
    assert.equal(saved.priority, "HIGH");
    assert.equal(saved.userId, userId);
  });

  await check("Shop catalogue admin-only persistence and public deactivation", async () => {
    const anon = await req("/api/admin/shop-catalogue");
    assert.equal(anon.status, 403);
    const userDenied = await req("/api/admin/shop-catalogue", { headers: { cookie: userCookie } });
    assert.equal(userDenied.status, 403);
    const initial = await req("/api/admin/shop-catalogue", { headers: { cookie: adminCookie } });
    const initialBody = await initial.json();
    assert.equal(initial.status, 200, JSON.stringify(initialBody));
    assert.equal(initialBody.data.version, 0);
    const original = initialBody.data.products;
    assert.ok(original.length > 2);
    const target = original[0];
    const headingMarker = ">" + target.name.en + "</h2>";
    const beforePage = await req("/shop");
    assert.equal(beforePage.status, 200);
    assert.ok((await beforePage.text()).includes(headingMarker), "active product must render as a real Shop heading");
    const updated = original.map((p) => p.id === target.id ? { ...p, status: "inactive" } : p);
    const write = await post("/api/admin/shop-catalogue", { expectedVersion: 0, products: updated }, adminCookie, "PUT");
    const result = await write.json();
    assert.equal(write.status, 200, JSON.stringify(result));
    assert.equal(result.data.version, 1);
    const publicPage = await req("/shop");
    assert.equal(publicPage.status, 200);
    assert.ok(!(await publicPage.text()).includes(headingMarker), "deactivated product still rendered as a visible Shop heading");
    const adminRead = await req("/api/admin/shop-catalogue", { headers: { cookie: adminCookie } });
    const saved = await adminRead.json();
    assert.equal(saved.data.version, 1);
    assert.equal(saved.data.products.find((p) => p.id === target.id).status, "inactive");
    const race = await post("/api/admin/shop-catalogue", { expectedVersion: 0, products: original }, adminCookie, "PUT");
    assert.equal(race.status, 409, "concurrent stale edit must reject");
    const restore = await post("/api/admin/shop-catalogue", { expectedVersion: 1, products: original }, adminCookie, "PUT");
    assert.equal(restore.status, 200, await restore.text());
  });

  await check("unpaid paid-report request blocks PDF generation and email delivery", async () => {
    const report = await prisma.reportRequest.create({ data: {
      userId, planType: "PREMIUM", paymentStatus: "PENDING", status: "PENDING_REVIEW",
      reportSlug: "premium-kundli", deliveryEmail: email, fullName: "QA User",
      dateOfBirth: "1990-01-15", timeOfBirth: "10:30", birthPlace: "Delhi",
      latitude: 28.6139, longitude: 77.209, timezone: 5.5, language: "en"
    }});
    reportId = report.id;
    const pdf = await post("/api/admin/report-requests/" + reportId + "/generate-pdf", {}, adminCookie);
    assert.equal(pdf.status, 409, await pdf.text());
    const delivery = await post("/api/admin/report-requests/" + reportId + "/deliver", {}, adminCookie);
    assert.equal(delivery.status, 409, await delivery.text());
  });
  await check("synthetic paid-state fixture creates real PDF with owner-only download", async () => {
    await prisma.reportRequest.update({ where: { id: reportId }, data: { paymentStatus: "PAID" } });
    const pdf = await post("/api/admin/report-requests/" + reportId + "/generate-pdf", {}, adminCookie);
    const result = await pdf.json();
    assert.equal(pdf.status, 200, JSON.stringify(result).slice(0, 600));
    assert.ok(result.data.byteLength > 500, "PDF bytes unexpectedly small");
    const row = await prisma.reportRequest.findUniqueOrThrow({ where: { id: reportId } });
    assert.ok(row.generatedPdfSize > 500 && row.generatedPdfChecksum);
    const owned = await req("/api/report-requests/" + reportId + "/download", { headers: { cookie: userCookie } });
    assert.equal(owned.status, 200, "owner PDF unavailable");
    assert.equal(owned.headers.get("content-type"), "application/pdf");
    const magic = Buffer.from(await owned.arrayBuffer()).subarray(0, 5).toString("ascii");
    assert.equal(magic, "%PDF-");
    const anon = await req("/api/report-requests/" + reportId + "/download");
    assert.equal(anon.status, 401);
  });

} finally {
  try {
    if (adminId) await prisma.adminActionLog.deleteMany({ where: { adminId } });
    if (reportId) {
      await prisma.auditLog.deleteMany({ where: { targetId: reportId } });
      await prisma.reportRequest.delete({ where: { id: reportId } }).catch(() => {});
    }
    for (const id of usersToClean) await prisma.user.delete({ where: { id } }).catch(() => {});
  } finally { await prisma.$disconnect(); }
}
console.log("NAKSHARIX_AUTH_ROLE_E2E=" + passed + "/" + (passed + failed) + "_PASS;FAILED=" + failed);
if (failed) process.exit(1);
